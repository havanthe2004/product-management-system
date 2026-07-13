import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { QualityStandard } from "../entities/quality-standard.entity";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";

export class QualityStandardController {
    private standardRepository = AppDataSource.getRepository(QualityStandard);

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await this.standardRepository.find({
                order: { createdAt: "DESC" }
            });
            return ResponseHelper.success(res, list, "Lấy danh sách tiêu chuẩn chất lượng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { standardCode, standardName, description, status } = req.body;
            if (!standardCode || !standardName) {
                throw new Error("Mã tiêu chuẩn và tên tiêu chuẩn là bắt buộc.");
            }

            const existing = await this.standardRepository.findOne({ where: { standardCode } });
            if (existing) {
                throw new Error("Mã tiêu chuẩn chất lượng này đã tồn tại.");
            }

            const standard = new QualityStandard();
            standard.standardCode = standardCode;
            standard.standardName = standardName;
            standard.description = description || "";
            standard.status = status;

            const saved = await this.standardRepository.save(standard);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ TIÊU CHUẨN CHẤT LƯỢNG",
                action: "THÊM MỚI",
                description: `Thêm mới tiêu chuẩn kỹ thuật thành công: ${standardName} (${standardCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo tiêu chuẩn chất lượng thành công!", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const { standardCode, standardName, description, status } = req.body;

            const standard = await this.standardRepository.findOne({ where: { id } });
            if (!standard) {
                throw new Error("Không tìm thấy tiêu chuẩn chất lượng cần cập nhật.");
            }

            const oldData = { ...standard };

            if (standardCode && standardCode !== standard.standardCode) {
                const existing = await this.standardRepository.findOne({ where: { standardCode } });
                if (existing) {
                    throw new Error("Mã tiêu chuẩn chất lượng này đã tồn tại ở bản ghi khác.");
                }
                standard.standardCode = standardCode;
            }

            if (standardName) standard.standardName = standardName;
            if (description !== undefined) standard.description = description;
            if (status) standard.status = status;

            const saved = await this.standardRepository.save(standard);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ TIÊU CHUẨN CHẤT LƯỢNG",
                action: "CẬP NHẬT",
                description: `Cập nhật tiêu chuẩn kỹ thuật thành công: ${standard.standardName} (${standard.standardCode})`,
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
            const standard = await this.standardRepository.findOne({ where: { id } });
            if (!standard) {
                throw new Error("Không tìm thấy tiêu chuẩn chất lượng cần xóa.");
            }

            const oldData = { ...standard };
            await this.standardRepository.remove(standard);

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
}

export const qualityStandardController = new QualityStandardController();
