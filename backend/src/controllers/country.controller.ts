import { Request, Response } from "express";
import { countryService } from "../services/country.service";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class CountryController {

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { search, status, approvalStatus, page, limit } = req.query;
            const filters = {
                search: search ? String(search) : undefined,
                status: status ? status as any : undefined,
                approvalStatus: approvalStatus ? approvalStatus as any : undefined,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined
            };
            const result = await countryService.getAll(filters);
            return ResponseHelper.success(res, result, "Lấy danh sách quốc gia thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const saved = await countryService.create(req.body);

            // Audit log
            await AuditLogService.log(req, {
                module: "CÁC NƯỚC HỢP TÁC",
                action: "THÊM MỚI",
                description: `Thêm mới quốc gia đối tác thành công (chờ duyệt/ngừng hoạt động): ${saved.countryName} (${saved.isoCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo quốc gia đối tác thành công! Trạng thái: Chờ duyệt & Ngừng hoạt động.", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const { saved, oldData } = await countryService.update(id, req.body, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "CÁC NƯỚC HỢP TÁC",
                action: "CẬP NHẬT",
                description: `Cập nhật quốc gia đối tác thành công: ${saved.countryName} (${saved.isoCode})`,
                oldData,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Cập nhật quốc gia đối tác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const { country, oldData } = await countryService.softDelete(id, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "CÁC NƯỚC HỢP TÁC",
                action: "XÓA",
                description: `Xóa quốc gia đối tác thành công: ${country.countryName} (${country.isoCode})`,
                oldData
            });

            return ResponseHelper.success(res, null, "Xóa quốc gia đối tác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async getTrash(req: Request, res: Response): Promise<Response> {
        try {
            const { search, status, approvalStatus, page, limit } = req.query;
            const filters = {
                search: search ? String(search) : undefined,
                status: status ? status as any : undefined,
                approvalStatus: approvalStatus ? approvalStatus as any : undefined,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined
            };
            const result = await countryService.getTrash(filters);
            return ResponseHelper.success(res, result, "Lấy danh sách thùng rác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async restore(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userRole = (req as AuthenticatedRequest).user?.role;
            const saved = await countryService.restore(id, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "CÁC NƯỚC HỢP TÁC",
                action: "KHÔI PHỤC",
                description: `Khôi phục quốc gia đối tác thành công: ${saved.countryName} (${saved.isoCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Khôi phục quốc gia đối tác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const countryController = new CountryController();
