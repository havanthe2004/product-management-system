import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AuditLog } from "../entities/audit-log.entity";
import { ResponseHelper } from "../utils/response.helper";

export class AuditLogController {
    private auditLogRepository = AppDataSource.getRepository(AuditLog);

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await this.auditLogRepository.find({
                order: { createdAt: "DESC" },
                take: 100 // Limit to 100 most recent logs
            });
            return ResponseHelper.success(res, list, "Lấy danh sách nhật ký hệ thống thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const auditLogController = new AuditLogController();
