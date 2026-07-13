import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { CommodityGroup } from "../entities/commodity-group.entity";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";

export class CommodityGroupController {
    private groupRepository = AppDataSource.getRepository(CommodityGroup);

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await this.groupRepository.find({
                order: { createdAt: "DESC" }
            });
            return ResponseHelper.success(res, list, "Lấy danh sách nhóm mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { groupCode, groupName, description, status } = req.body;
            if (!groupCode || !groupName) {
                throw new Error("Mã nhóm và tên nhóm là bắt buộc.");
            }

            const existing = await this.groupRepository.findOne({ where: { groupCode } });
            if (existing) {
                throw new Error("Mã nhóm mặt hàng này đã tồn tại.");
            }

            const group = new CommodityGroup();
            group.groupCode = groupCode;
            group.groupName = groupName;
            group.description = description || "";
            group.status = status;

            const saved = await this.groupRepository.save(group);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC NHÓM MẶT HÀNG",
                action: "THÊM MỚI",
                description: `Thêm mới nhóm mặt hàng thành công: ${groupName} (${groupCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo nhóm mặt hàng thành công!", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const { groupCode, groupName, description, status } = req.body;

            const group = await this.groupRepository.findOne({ where: { id } });
            if (!group) {
                throw new Error("Không tìm thấy nhóm mặt hàng cần cập nhật.");
            }

            const oldData = { ...group };

            if (groupCode && groupCode !== group.groupCode) {
                const existing = await this.groupRepository.findOne({ where: { groupCode } });
                if (existing) {
                    throw new Error("Mã nhóm mặt hàng này đã tồn tại ở bản ghi khác.");
                }
                group.groupCode = groupCode;
            }

            if (groupName) group.groupName = groupName;
            if (description !== undefined) group.description = description;
            if (status) group.status = status;

            const saved = await this.groupRepository.save(group);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC NHÓM MẶT HÀNG",
                action: "CẬP NHẬT",
                description: `Cập nhật nhóm mặt hàng thành công: ${group.groupName} (${group.groupCode})`,
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
            const group = await this.groupRepository.findOne({ where: { id } });
            if (!group) {
                throw new Error("Không tìm thấy nhóm mặt hàng cần xóa.");
            }

            const oldData = { ...group };
            await this.groupRepository.remove(group); // This performs hard delete or soft delete depending on TypeORM config. With @DeleteDateColumn, it soft deletes!

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
}

export const commodityGroupController = new CommodityGroupController();
