import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";

export class AuthController {

    /**
     * Handle user registration request
     */
    async register(req: Request, res: Response): Promise<Response> {
        try {
            const result = await authService.register(req.body);

            // Ghi nhận lịch sử Đăng ký tài khoản
            await AuditLogService.log(req, {
                email: result.email,
                module: "NGƯỜI DÙNG",
                action: "ĐĂNG KÝ TÀI KHOẢN",
                description: `Đăng ký tài khoản mới thành công cho người dùng: ${result.fullName} (${result.email})`,
                newData: { email: result.email, fullName: result.fullName }
            });

            return ResponseHelper.success(
                res,
                result,
                "Đăng ký tài khoản thành công!",
                201
            );
        } catch (error: any) {
            return ResponseHelper.error(
                res,
                error.message,
                null,
                400
            );
        }
    }


    async login(req: Request, res: Response): Promise<Response> {
        try {
            const result = await authService.login(req.body);

            // Ghi nhận lịch sử Đăng nhập
            await AuditLogService.log(req, {
                email: result.user.email,
                module: "NGƯỜI DÙNG",
                action: "ĐĂNG NHẬP",
                description: `Người dùng ${result.user.fullName} (${result.user.email}) đăng nhập thành công vào hệ thống.`,
                newData: { email: result.user.email, fullName: result.user.fullName }
            });

            return ResponseHelper.success(
                res,
                result,
                "Đăng nhập thành công!"
            );
        } catch (error: any) {
            // Determine proper status code based on error message
            let statusCode = 400;
            if (error.message.includes("không tồn tại") || error.message.includes("không chính xác")) {
                statusCode = 401; // Unauthorized
            } else if (error.message.includes("bị khóa")) {
                statusCode = 403; // Forbidden
            }

            return ResponseHelper.error(
                res,
                error.message,
                null,
                statusCode
            );
        }
    }

    /**
     * Handle request to get password reset OTP
     */
    async forgotPassword(req: Request, res: Response): Promise<Response> {
        try {
            const result = await authService.forgotPassword(req.body);

            // Ghi nhận lịch sử Yêu cầu OTP khôi phục mật khẩu
            await AuditLogService.log(req, {
                email: req.body.email,
                module: "NGƯỜI DÙNG",
                action: "YÊU CẦU KHÔI PHỤC MẬT KHẨU",
                description: `Yêu cầu gửi mã OTP khôi phục mật khẩu tới email: ${req.body.email}`,
                newData: { email: req.body.email }
            });

            return ResponseHelper.success(
                res,
                result,
                "Yêu cầu khôi phục mật khẩu thành công!"
            );
        } catch (error: any) {
            return ResponseHelper.error(
                res,
                error.message,
                null,
                400
            );
        }
    }

    /**
     * Handle request to reset password using OTP
     */
    async resetPassword(req: Request, res: Response): Promise<Response> {
        try {
            const result = await authService.resetPassword(req.body);

            // Ghi nhận lịch sử Đặt lại mật khẩu
            await AuditLogService.log(req, {
                email: req.body.email,
                module: "NGƯỜI DÙNG",
                action: "ĐẶT LẠI MẬT KHẨU",
                description: `Khôi phục và đặt lại mật khẩu mới thành công cho tài khoản: ${req.body.email}`,
                newData: { email: req.body.email, message: result.message }
            });

            return ResponseHelper.success(
                res,
                result,
                "Đặt lại mật khẩu thành công!"
            );
        } catch (error: any) {
            return ResponseHelper.error(
                res,
                error.message,
                null,
                400
            );
        }
    }
}

export const authController = new AuthController();
