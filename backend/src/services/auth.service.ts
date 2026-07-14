import { User } from "../entities/user.entity";
import { RefreshToken } from "../entities/refresh-token.entity";
import { PasswordResetOtp } from "../entities/password-reset-otp.entity";
import { UserStatus } from "../common/enums/user-status.enum";
import { OtpStatus } from "../common/enums/otp-status.enum";
import { LoginReqDto, ForgotPasswordReqDto, ResetPasswordReqDto } from "../dto/auth.req.dto";
import { LoginResDto } from "../dto/auth.res.dto";
import { EmailHelper } from "../utils/email.helper";
import { UserRepository } from "../repositories/user.repository";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { AppDataSource } from "../config/data-source";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
    private userRepository = UserRepository;
    private refreshTokenRepository = RefreshTokenRepository;
    private otpRepository = AppDataSource.getRepository(PasswordResetOtp);

    private readonly JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
    private readonly JWT_ACCESS_EXPIRATION = "15m";
    private readonly JWT_REFRESH_EXPIRATION = "7d";

    /**
     * Authenticate user and return tokens
     */
    async login(dto: LoginReqDto): Promise<LoginResDto> {
        const { email, password } = dto;

        if (!email || !password) {
            throw new Error("Vui lòng điền đầy đủ email và mật khẩu.");
        }

        // 1. Find user by email using custom UserRepository method
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Tài khoản email này không tồn tại trong hệ thống.");
        }

        // 2. Check if user is active
        if (user.status !== UserStatus.ACTIVE) {
            throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        // 3. Compare passwords
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new Error("Mật khẩu không chính xác.");
        }

        // 4. Generate Access Token (contains user identity)
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role || "OFFICER" },
            this.JWT_SECRET,
            { expiresIn: this.JWT_ACCESS_EXPIRATION }
        );

        // 5. Generate Refresh Token
        const refreshTokenVal = jwt.sign(
            { id: user.id },
            this.JWT_SECRET,
            { expiresIn: this.JWT_REFRESH_EXPIRATION }
        );

        // 6. Save Refresh Token in database for security & revocation capability
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

        const refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.token = refreshTokenVal;
        refreshTokenEntity.user = user;
        refreshTokenEntity.expiresAt = expiresAt;
        refreshTokenEntity.isRevoked = false;

        await this.refreshTokenRepository.save(refreshTokenEntity);

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role || "OFFICER",
                isActive: user.status === UserStatus.ACTIVE,
                avatar: user.avatar
            },
            accessToken,
            refreshToken: refreshTokenVal
        };
    }

    /**
     * Request a password reset OTP code
     */
    async forgotPassword(dto: ForgotPasswordReqDto): Promise<{
        message: string;
    }> {
        const { email } = dto;
        if (!email) {
            throw new Error("Vui lòng cung cấp email.");
        }

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Email này không tồn tại trong hệ thống.");
        }

        // 1. Disable all previous pending OTP codes for this user
        const previousOtps = await this.otpRepository.find({
            where: {
                user: { id: user.id },
                status: OtpStatus.PENDING
            }
        });
        if (previousOtps.length > 0) {
            for (const oldOtp of previousOtps) {
                oldOtp.status = OtpStatus.DISABLED;
            }
            await this.otpRepository.save(previousOtps);
        }

        // 2. Generate new 6-digit OTP code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 10); // 10 minutes expiry

        const otpRecord = new PasswordResetOtp();
        otpRecord.user = user;
        otpRecord.otpCode = otp;
        otpRecord.attempts = 0;
        otpRecord.status = OtpStatus.PENDING;
        otpRecord.expiresAt = expires;

        await this.otpRepository.save(otpRecord);

        // Send OTP using EmailHelper (logs to console/sends real email)
        await EmailHelper.sendOTP(email, otp);

        return {
            message: "Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn."
        };
    }

    /**
     * Reset password using a valid OTP
     */
    async resetPassword(dto: ResetPasswordReqDto): Promise<{ message: string }> {
        const { email, otp, newPassword, confirmPassword } = dto;
        if (!email || !otp || !newPassword) {
            throw new Error("Email, mã OTP và mật khẩu mới là bắt buộc.");
        }

        if (newPassword.length < 6) {
            throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            throw new Error("Mật khẩu xác nhận không khớp.");
        }

        // 1. Find user by email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Email này không tồn tại trong hệ thống.");
        }

        // 2. Find the latest PENDING OTP code for this user
        const otpRecord = await this.otpRepository.findOne({
            where: {
                user: { id: user.id },
                status: OtpStatus.PENDING
            },
            order: { createdAt: "DESC" }
        });

        if (!otpRecord) {
            throw new Error("Yêu cầu khôi phục mật khẩu không tồn tại hoặc mã OTP đã bị vô hiệu hóa.");
        }

        // 3. Check expiration
        if (otpRecord.expiresAt < new Date()) {
            otpRecord.status = OtpStatus.DISABLED;
            await this.otpRepository.save(otpRecord);
            throw new Error("Mã OTP đã hết hạn.");
        }

        // 4. Verify OTP Code
        if (otpRecord.otpCode !== otp) {
            otpRecord.attempts += 1;
            if (otpRecord.attempts >= 4) {
                otpRecord.status = OtpStatus.DISABLED;
                await this.otpRepository.save(otpRecord);
                throw new Error("Mã OTP đã bị vô hiệu hóa do nhập sai quá 4 lần.");
            }
            await this.otpRepository.save(otpRecord);
            throw new Error(`Mã OTP không chính xác. Bạn còn ${4 - otpRecord.attempts} lần thử.`);
        }

        // 5. Hash new password and save user
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await this.userRepository.save(user);

        // 6. Mark OTP as USED
        otpRecord.status = OtpStatus.USED;
        await this.otpRepository.save(otpRecord);

        return {
            message: "Đặt lại mật khẩu thành công!"
        };
    }

    /**
     * Verify refresh token and issue new token pair
     */
    async refreshToken(dto: { refreshToken: string }): Promise<{ accessToken: string; refreshToken: string }> {
        const { refreshToken } = dto;
        if (!refreshToken) {
            throw new Error("Vui lòng cung cấp mã Refresh Token.");
        }

        // 1. Verify token signature
        let decoded: any;
        try {
            decoded = jwt.verify(refreshToken, this.JWT_SECRET);
        } catch (error) {
            throw new Error("Refresh Token không hợp lệ hoặc đã hết hạn.");
        }

        // 2. Find token in database
        const savedToken = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken },
            relations: { user: true }
        });

        if (!savedToken || savedToken.isRevoked || new Date() > savedToken.expiresAt) {
            throw new Error("Refresh Token đã hết hạn hoặc không còn hiệu lực.");
        }

        const user = savedToken.user;
        if (!user || user.status !== UserStatus.ACTIVE) {
            throw new Error("Tài khoản người dùng đã bị khóa hoặc không tồn tại.");
        }

        // 3. Revoke the old refresh token
        savedToken.isRevoked = true;
        await this.refreshTokenRepository.save(savedToken);

        // 4. Generate new tokens
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role || "OFFICER" },
            this.JWT_SECRET,
            { expiresIn: this.JWT_ACCESS_EXPIRATION }
        );

        const newRefreshTokenVal = jwt.sign(
            { id: user.id },
            this.JWT_SECRET,
            { expiresIn: this.JWT_REFRESH_EXPIRATION }
        );

        // 5. Save the new refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newRefreshTokenEntity = new RefreshToken();
        newRefreshTokenEntity.token = newRefreshTokenVal;
        newRefreshTokenEntity.user = user;
        newRefreshTokenEntity.expiresAt = expiresAt;
        newRefreshTokenEntity.isRevoked = false;

        await this.refreshTokenRepository.save(newRefreshTokenEntity);

        return {
            accessToken,
            refreshToken: newRefreshTokenVal
        };
    }
}
export const authService = new AuthService();
