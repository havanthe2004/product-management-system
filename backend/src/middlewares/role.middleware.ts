import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { ResponseHelper } from "../utils/response.helper";

export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return ResponseHelper.error(res, "Yêu cầu đăng nhập trước.", null, 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return ResponseHelper.error(res, "Bạn không có quyền truy cập chức năng này.", null, 403);
        }

        next();
    };
};
