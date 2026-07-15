import { Request, Response } from "express";
import { unitService } from "../services/unit.service";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class UnitController {

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await unitService.getAll();
            return ResponseHelper.success(res, list, "Lấy danh sách đơn vị đo lường thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const saved = await unitService.create(req.body);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ ĐƠN VỊ ĐO LƯỜNG",
                action: "THÊM MỚI",
                description: `Thêm mới đơn vị đo lường thành công (chờ duyệt/ngừng hoạt động): ${saved.unitName} (${saved.symbol})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo đơn vị đo lường thành công! Trạng thái: Chờ duyệt & Ngừng hoạt động.", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const { saved, oldData } = await unitService.update(id, req.body, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ ĐƠN VỊ ĐO LƯỜNG",
                action: "CẬP NHẬT",
                description: `Cập nhật đơn vị đo lường thành công: ${saved.unitName} (${saved.symbol})`,
                oldData,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Cập nhật đơn vị đo lường thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const { unit, oldData } = await unitService.softDelete(id, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ ĐƠN VỊ ĐO LƯỜNG",
                action: "XÓA",
                description: `Xóa đơn vị đo lường thành công: ${unit.unitName} (${unit.symbol})`,
                oldData
            });

            return ResponseHelper.success(res, null, "Xóa đơn vị đo lường thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async getTrash(req: Request, res: Response): Promise<Response> {
        try {
            const list = await unitService.getTrash();
            return ResponseHelper.success(res, list, "Lấy danh sách thùng rác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async restore(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const saved = await unitService.restore(id, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ ĐƠN VỊ ĐO LƯỜNG",
                action: "KHÔI PHỤC",
                description: `Khôi phục đơn vị đo lường thành công: ${saved.unitName} (${saved.symbol})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Khôi phục đơn vị đo lường thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const unitController = new UnitController();
