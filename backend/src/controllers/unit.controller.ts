import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Unit } from "../entities/unit.entity";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";

export class UnitController {
    private unitRepository = AppDataSource.getRepository(Unit);

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await this.unitRepository.find({
                order: { createdAt: "DESC" }
            });
            return ResponseHelper.success(res, list, "Lấy danh sách đơn vị đo lường thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { unitCode, unitName, symbol, description, status } = req.body;
            if (!unitName || !symbol) {
                throw new Error("Tên đơn vị và ký hiệu là bắt buộc.");
            }

            const unit = new Unit();
            unit.unitCode = unitCode || "";
            unit.unitName = unitName;
            unit.symbol = symbol;
            unit.description = description || "";
            unit.status = status;

            const saved = await this.unitRepository.save(unit);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ ĐƠN VỊ ĐO LƯỜNG",
                action: "THÊM MỚI",
                description: `Thêm mới đơn vị đo lường thành công: ${unitName} (${symbol})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo đơn vị đo lường thành công!", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const { unitCode, unitName, symbol, description, status } = req.body;

            const unit = await this.unitRepository.findOne({ where: { id } });
            if (!unit) {
                throw new Error("Không tìm thấy đơn vị cần cập nhật.");
            }

            const oldData = { ...unit };

            if (unitCode !== undefined) unit.unitCode = unitCode;
            if (unitName) unit.unitName = unitName;
            if (symbol) unit.symbol = symbol;
            if (description !== undefined) unit.description = description;
            if (status) unit.status = status;

            const saved = await this.unitRepository.save(unit);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ ĐƠN VỊ ĐO LƯỜNG",
                action: "CẬP NHẬT",
                description: `Cập nhật đơn vị đo lường thành công: ${unit.unitName} (${unit.symbol})`,
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
            const unit = await this.unitRepository.findOne({ where: { id } });
            if (!unit) {
                throw new Error("Không tìm thấy đơn vị cần xóa.");
            }

            const oldData = { ...unit };
            await this.unitRepository.remove(unit);

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
}

export const unitController = new UnitController();
