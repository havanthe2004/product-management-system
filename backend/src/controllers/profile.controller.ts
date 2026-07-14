import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

export class ProfileController {
    private userRepository = AppDataSource.getRepository(User);

    async getProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ResponseHelper.error(res, "Người dùng chưa xác thực.", null, 401);
            }

            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return ResponseHelper.error(res, "Tài khoản không tồn tại.", null, 404);
            }

            // Mapped user data to omit password
            const result = {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                status: user.status,
                idCardNumber: user.idCardNumber,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                phone: user.phone,
                avatar: user.avatar,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };

            return ResponseHelper.success(res, result, "Lấy thông tin cá nhân thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ResponseHelper.error(res, "Người dùng chưa xác thực.", null, 401);
            }

            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return ResponseHelper.error(res, "Tài khoản không tồn tại.", null, 404);
            }

            const { fullName, dateOfBirth, dob, gender, phone, avatar } = req.body;

            const oldData = {
                fullName: user.fullName,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                phone: user.phone,
                avatar: user.avatar
            };

            // Update fullName if provided
            if (fullName !== undefined) {
                if (!fullName.trim()) {
                    return ResponseHelper.error(res, "Họ và tên không được để trống.", null, 400);
                }
                user.fullName = fullName.trim();
            }

            // Update dateOfBirth
            const dobValue = dateOfBirth || dob;
            if (dobValue !== undefined) {
                user.dateOfBirth = dobValue ? new Date(dobValue) : null as any;
            }

            // Update gender
            if (gender !== undefined) {
                user.gender = gender;
            }

            // Update phone
            if (phone !== undefined) {
                user.phone = phone;
            }

            // Handle base64 image upload for avatar
            let oldAvatarToDelete: string | null = null;
            if (avatar && avatar.startsWith("data:image/")) {
                const matches = avatar.match(/^data:image\/([A-Za-z+]+);base64,(.+)$/);
                if (!matches || matches.length !== 3) {
                    return ResponseHelper.error(res, "Định dạng hình ảnh avatar không hợp lệ.", null, 400);
                }

                const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, "base64");

                // Ensure uploads directory exists
                const uploadDir = path.join(__dirname, "../../uploads");
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const filename = `avatar-${userId}-${Date.now()}.${ext}`;
                const filepath = path.join(uploadDir, filename);
                fs.writeFileSync(filepath, buffer);

                if (user.avatar && user.avatar.startsWith("/uploads/")) {
                    oldAvatarToDelete = user.avatar;
                }

                user.avatar = `/uploads/${filename}`;
            } else if (avatar === null || avatar === "") {
                if (user.avatar && user.avatar.startsWith("/uploads/")) {
                    oldAvatarToDelete = user.avatar;
                }
                user.avatar = null as any;
            }

            const saved = await this.userRepository.save(user);

            // Delete old avatar file if a new one was uploaded or the avatar was cleared
            if (oldAvatarToDelete) {
                const oldAvatarPath = path.join(__dirname, "../..", oldAvatarToDelete);
                if (fs.existsSync(oldAvatarPath)) {
                    try {
                        fs.unlinkSync(oldAvatarPath);
                    } catch (err) {
                        console.error("Error deleting old avatar file:", err);
                    }
                }
            }

            const result = {
                id: saved.id,
                email: saved.email,
                fullName: saved.fullName,
                role: saved.role,
                status: saved.status,
                idCardNumber: saved.idCardNumber,
                dateOfBirth: saved.dateOfBirth,
                gender: saved.gender,
                phone: saved.phone,
                avatar: saved.avatar,
                createdAt: saved.createdAt,
                updatedAt: saved.updatedAt
            };

            // Audit log
            await AuditLogService.log(req, {
                module: "CÁ NHÂN",
                action: "CẬP NHẬT THÔNG TIN",
                description: `Người dùng ${saved.fullName} (${saved.email}) cập nhật thông tin cá nhân.`,
                oldData,
                newData: {
                    fullName: saved.fullName,
                    dateOfBirth: saved.dateOfBirth,
                    gender: saved.gender,
                    phone: saved.phone,
                    avatar: saved.avatar
                }
            });

            return ResponseHelper.success(res, result, "Cập nhật thông tin cá nhân thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async changePassword(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ResponseHelper.error(res, "Người dùng chưa xác thực.", null, 401);
            }

            const { oldPassword, newPassword, confirmPassword } = req.body;

            if (!oldPassword || !newPassword || !confirmPassword) {
                return ResponseHelper.error(res, "Vui lòng nhập đầy đủ thông tin mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.", null, 400);
            }

            if (newPassword !== confirmPassword) {
                return ResponseHelper.error(res, "Mật khẩu xác nhận không khớp với mật khẩu mới.", null, 400);
            }

            if (newPassword.length < 6) {
                return ResponseHelper.error(res, "Mật khẩu mới phải từ 6 ký tự trở lên.", null, 400);
            }

            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return ResponseHelper.error(res, "Tài khoản không tồn tại.", null, 404);
            }

            // Verify old password
            const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordMatch) {
                return ResponseHelper.error(res, "Mật khẩu cũ không chính xác.", null, 400);
            }

            // Hash and save new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await this.userRepository.save(user);

            // Audit log
            await AuditLogService.log(req, {
                module: "CÁ NHÂN",
                action: "ĐỔI MẬT KHẨU",
                description: `Người dùng ${user.fullName} (${user.email}) đổi mật khẩu thành công.`,
            });

            return ResponseHelper.success(res, null, "Đổi mật khẩu thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const profileController = new ProfileController();
