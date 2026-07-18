import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AuditLog } from "../entities/audit-log.entity";
import { ResponseHelper } from "../utils/response.helper";
import { Like } from "typeorm";

export class AuditLogController {
    private auditLogRepository = AppDataSource.getRepository(AuditLog);

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { search, module, action, email, page, limit } = req.query;
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

            const pageNum = page ? Number(page) : undefined;
            const limitNum = limit ? Number(limit) : undefined;

            const buildFindOptions = (whereCond: any) => {
                const options: any = {
                    where: whereCond,
                    order: { createdAt: "DESC" }
                };
                if (pageNum && limitNum) {
                    options.skip = (pageNum - 1) * limitNum;
                    options.take = limitNum;
                } else {
                    options.take = 100;
                }
                return options;
            };

            if (search) {
                const searchPattern = `%${search}%`;
                const conditions = [
                    { ...where, email: Like(searchPattern) },
                    { ...where, module: Like(searchPattern) },
                    { ...where, action: Like(searchPattern) },
                    { ...where, description: Like(searchPattern) }
                ];

                if (pageNum && limitNum) {
                    const [items, total] = await this.auditLogRepository.findAndCount(buildFindOptions(conditions));
                    return ResponseHelper.success(res, { items, total }, "Lấy danh sách nhật ký hệ thống thành công!");
                } else {
                    const list = await this.auditLogRepository.find(buildFindOptions(conditions));
                    return ResponseHelper.success(res, list, "Lấy danh sách nhật ký hệ thống thành công!");
                }
            }

            if (pageNum && limitNum) {
                const [items, total] = await this.auditLogRepository.findAndCount(buildFindOptions(where));
                return ResponseHelper.success(res, { items, total }, "Lấy danh sách nhật ký hệ thống thành công!");
            } else {
                const list = await this.auditLogRepository.find(buildFindOptions(where));
                return ResponseHelper.success(res, list, "Lấy danh sách nhật ký hệ thống thành công!");
            }
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const auditLogController = new AuditLogController();
