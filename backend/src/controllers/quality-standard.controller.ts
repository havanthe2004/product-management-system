import { Request, Response } from "express";
import { qualityStandardService } from "../services/quality-standard.service";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class QualityStandardController {

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await qualityStandardService.getAll();
            return ResponseHelper.success(res, list, "Lấy danh sách tiêu chuẩn chất lượng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const saved = await qualityStandardService.create(req.body);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ TIÊU CHUẨN CHẤT LƯỢNG",
                action: "THÊM MỚI",
                description: `Thêm mới tiêu chuẩn kỹ thuật thành công (chờ duyệt/ngừng hoạt động): ${saved.standardName} (${saved.standardCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo tiêu chuẩn chất lượng thành công! Trạng thái: Chờ duyệt & Ngừng hoạt động.", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const { saved, oldData } = await qualityStandardService.update(id, req.body, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ TIÊU CHUẨN CHẤT LƯỢNG",
                action: "CẬP NHẬT",
                description: `Cập nhật tiêu chuẩn kỹ thuật thành công: ${saved.standardName} (${saved.standardCode})`,
                oldData,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Cập nhật tiêu chuẩn chất lượng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const { standard, oldData } = await qualityStandardService.softDelete(id, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ TIÊU CHUẨN CHẤT LƯỢNG",
                action: "XÓA",
                description: `Xóa tiêu chuẩn kỹ thuật thành công: ${standard.standardName} (${standard.standardCode})`,
                oldData
            });

            return ResponseHelper.success(res, null, "Xóa tiêu chuẩn chất lượng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async getTrash(req: Request, res: Response): Promise<Response> {
        try {
            const list = await qualityStandardService.getTrash();
            return ResponseHelper.success(res, list, "Lấy danh sách thùng rác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async restore(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const saved = await qualityStandardService.restore(id, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ TIÊU CHUẨN CHẤT LƯỢNG",
                action: "KHÔI PHỤC",
                description: `Khôi phục tiêu chuẩn kỹ thuật thành công: ${saved.standardName} (${saved.standardCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Khôi phục tiêu chuẩn chất lượng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const qualityStandardController = new QualityStandardController();
