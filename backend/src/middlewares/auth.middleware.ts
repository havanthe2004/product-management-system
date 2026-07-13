import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";
import { UserStatus } from "../common/enums/user-status.enum";
import { ResponseHelper } from "../utils/response.helper";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return ResponseHelper.error(res, "Chưa đăng nhập. Vui lòng cung cấp mã xác thực.", null, 401);
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return ResponseHelper.error(res, "Mã xác thực không hợp lệ.", null, 401);
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return ResponseHelper.error(res, "Lỗi hệ thống: chưa khai báo biến môi trường JWT_SECRET", null, 500);
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, secret);
            // console.log("Token đã giải mã thành công:", decoded);
        } catch (err) {
            return ResponseHelper.error(res, "Mã xác thực không hợp lệ hoặc đã hết hạn.", null, 401);
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: decoded.id }
        });

        if (!user) {
            return ResponseHelper.error(res, "Tài khoản không tồn tại trên hệ thống.", null, 401);
        }

        if (user.status !== UserStatus.ACTIVE) {
            return ResponseHelper.error(res, "Tài khoản của bạn đã bị khóa.", null, 403);
        }

        req.user = {
            id: Number(user.id),
            email: user.email,
            role: user.role
        };
        next();
    } catch (error: any) {
        return ResponseHelper.error(res, error.message, null, 500);
    }
};
