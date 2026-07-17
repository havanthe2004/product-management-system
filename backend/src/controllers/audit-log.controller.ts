import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AuditLog } from "../entities/audit-log.entity";
import { ResponseHelper } from "../utils/response.helper";
import { Like } from "typeorm";

export class AuditLogController {
    private auditLogRepository = AppDataSource.getRepository(AuditLog);

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { search, module, action, email } = req.query;
            const where: any = {};

            if (module && module !== "ALL") {
                where.module = module;
            }
            if (action && action !== "ALL") {
                where.action = action;
            }
            if (email && email !== "ALL") {
                where.email = email;
            }

            if (search) {
                const searchPattern = `%${search}%`;
                const list = await this.auditLogRepository.find({
                    where: [
                        { ...where, email: Like(searchPattern) },
                        { ...where, module: Like(searchPattern) },
                        { ...where, action: Like(searchPattern) },
                        { ...where, description: Like(searchPattern) }
                    ],
                    order: { createdAt: "DESC" },
                    take: 100
                });
                return ResponseHelper.success(res, list, "Lấy danh sách nhật ký hệ thống thành công!");
            }

            const list = await this.auditLogRepository.find({
                where,
                order: { createdAt: "DESC" },
                take: 100
            });
            return ResponseHelper.success(res, list, "Lấy danh sách nhật ký hệ thống thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const auditLogController = new AuditLogController();
