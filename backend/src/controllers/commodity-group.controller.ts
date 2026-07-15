import { Request, Response } from "express";
import { commodityGroupService } from "../services/commodity-group.service";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class CommodityGroupController {

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await commodityGroupService.getAll();
            return ResponseHelper.success(res, list, "Lấy danh sách nhóm mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const saved = await commodityGroupService.create(req.body);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC NHÓM MẶT HÀNG",
                action: "THÊM MỚI",
                description: `Thêm mới nhóm mặt hàng thành công (chờ duyệt/ngừng hoạt động): ${saved.groupName} (${saved.groupCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo nhóm mặt hàng thành công! Trạng thái: Chờ duyệt & Ngừng hoạt động.", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const { saved, oldData } = await commodityGroupService.update(id, req.body, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC NHÓM MẶT HÀNG",
                action: "CẬP NHẬT",
                description: `Cập nhật nhóm mặt hàng thành công: ${saved.groupName} (${saved.groupCode})`,
                oldData,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Cập nhật nhóm mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const { group, oldData } = await commodityGroupService.softDelete(id, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC NHÓM MẶT HÀNG",
                action: "XÓA",
                description: `Xóa nhóm mặt hàng thành công: ${group.groupName} (${group.groupCode})`,
                oldData
            });

            return ResponseHelper.success(res, null, "Xóa nhóm mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async getTrash(req: Request, res: Response): Promise<Response> {
        try {
            const list = await commodityGroupService.getTrash();
            return ResponseHelper.success(res, list, "Lấy danh sách thùng rác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async restore(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const saved = await commodityGroupService.restore(id, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC NHÓM MẶT HÀNG",
                action: "KHÔI PHỤC",
                description: `Khôi phục nhóm mặt hàng thành công: ${saved.groupName} (${saved.groupCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Khôi phục nhóm mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const commodityGroupController = new CommodityGroupController();
