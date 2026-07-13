import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { CommodityType } from "../entities/commodity-type.entity";
import { CommodityGroup } from "../entities/commodity-group.entity";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";

export class CommodityTypeController {
    private typeRepository = AppDataSource.getRepository(CommodityType);
    private groupRepository = AppDataSource.getRepository(CommodityGroup);

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await this.typeRepository.find({
                relations: { group: true },
                order: { createdAt: "DESC" }
            });
            return ResponseHelper.success(res, list, "Lấy danh sách loại mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { typeCode, typeName, description, status, groupId } = req.body;
            if (!typeCode || !typeName || !groupId) {
                throw new Error("Mã loại, tên loại và nhóm mặt hàng là bắt buộc.");
            }

            const group = await this.groupRepository.findOne({ where: { id: Number(groupId) } });
            if (!group) {
                throw new Error("Không tìm thấy nhóm mặt hàng tương ứng.");
            }

            const existing = await this.typeRepository.findOne({ where: { typeCode } });
            if (existing) {
                throw new Error("Mã loại mặt hàng này đã tồn tại.");
            }

            const type = new CommodityType();
            type.typeCode = typeCode;
            type.typeName = typeName;
            type.description = description || "";
            type.status = status;
            type.group = group;

            const saved = await this.typeRepository.save(type);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC LOẠI MẶT HÀNG",
                action: "THÊM MỚI",
                description: `Thêm mới loại mặt hàng thành công: ${typeName} (${typeCode}) thuộc nhóm ${group.groupName}`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo loại mặt hàng thành công!", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const { typeCode, typeName, description, status, groupId } = req.body;

            const type = await this.typeRepository.findOne({ where: { id }, relations: { group: true } });
            if (!type) {
                throw new Error("Không tìm thấy loại mặt hàng cần cập nhật.");
            }

            const oldData = { ...type };

            if (groupId && Number(groupId) !== type.group.id) {
                const group = await this.groupRepository.findOne({ where: { id: Number(groupId) } });
                if (!group) {
                    throw new Error("Không tìm thấy nhóm mặt hàng tương ứng.");
                }
                type.group = group;
            }

            if (typeCode && typeCode !== type.typeCode) {
                const existing = await this.typeRepository.findOne({ where: { typeCode } });
                if (existing) {
                    throw new Error("Mã loại mặt hàng này đã tồn tại ở bản ghi khác.");
                }
                type.typeCode = typeCode;
            }

            if (typeName) type.typeName = typeName;
            if (description !== undefined) type.description = description;
            if (status) type.status = status;

            const saved = await this.typeRepository.save(type);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC LOẠI MẶT HÀNG",
                action: "CẬP NHẬT",
                description: `Cập nhật loại mặt hàng thành công: ${type.typeName} (${type.typeCode})`,
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
            const type = await this.typeRepository.findOne({ where: { id } });
            if (!type) {
                throw new Error("Không tìm thấy loại mặt hàng cần xóa.");
            }

            const oldData = { ...type };
            await this.typeRepository.remove(type);

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
}

export const commodityTypeController = new CommodityTypeController();
