import { Request, Response } from "express";
import { commodityTypeService } from "../services/commodity-type.service";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class CommodityTypeController {

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { search, status, approvalStatus, groupId } = req.query;
            const filters = {
                search: search ? String(search) : undefined,
                status: status ? status as any : undefined,
                approvalStatus: approvalStatus ? approvalStatus as any : undefined,
                groupId: groupId ? Number(groupId) : undefined
            };
            const list = await commodityTypeService.getAll(filters);
            return ResponseHelper.success(res, list, "Lấy danh sách loại mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const saved = await commodityTypeService.create(req.body);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC LOẠI MẶT HÀNG",
                action: "THÊM MỚI",
                description: `Thêm mới loại mặt hàng thành công (chờ duyệt/ngừng hoạt động): ${saved.typeName} (${saved.typeCode}) thuộc nhóm ${saved.group?.groupName}`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo loại mặt hàng thành công! Trạng thái: Chờ duyệt & Ngừng hoạt động.", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const { saved, oldData } = await commodityTypeService.update(id, req.body, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC LOẠI MẶT HÀNG",
                action: "CẬP NHẬT",
                description: `Cập nhật loại mặt hàng thành công: ${saved.typeName} (${saved.typeCode})`,
                oldData,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Cập nhật loại mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const { type, oldData } = await commodityTypeService.softDelete(id, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC LOẠI MẶT HÀNG",
                action: "XÓA",
                description: `Xóa loại mặt hàng thành công: ${type.typeName} (${type.typeCode})`,
                oldData
            });

            return ResponseHelper.success(res, null, "Xóa loại mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async getTrash(req: Request, res: Response): Promise<Response> {
        try {
            const { search, status, approvalStatus, groupId } = req.query;
            const filters = {
                search: search ? String(search) : undefined,
                status: status ? status as any : undefined,
                approvalStatus: approvalStatus ? approvalStatus as any : undefined,
                groupId: groupId ? Number(groupId) : undefined
            };
            const list = await commodityTypeService.getTrash(filters);
            return ResponseHelper.success(res, list, "Lấy danh sách thùng rác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async restore(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const saved = await commodityTypeService.restore(id, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC LOẠI MẶT HÀNG",
                action: "KHÔI PHỤC",
                description: `Khôi phục loại mặt hàng thành công: ${saved.typeName} (${saved.typeCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Khôi phục loại mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const commodityTypeController = new CommodityTypeController();
