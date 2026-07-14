import { Request, Response } from "express";
import { IsNull, Not } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { CommodityGroup } from "../entities/commodity-group.entity";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";

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
            // Newly created groups are always in INACTIVE status and PENDING approval
            group.status = CommodityStatus.INACTIVE;
            group.approvalStatus = ApprovalStatus.PENDING;

            const saved = await this.groupRepository.save(group);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC NHÓM MẶT HÀNG",
                action: "THÊM MỚI",
                description: `Thêm mới nhóm mặt hàng thành công (chờ duyệt/ngừng hoạt động): ${groupName} (${groupCode})`,
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
            const { groupCode, groupName, description, status, approvalStatus } = req.body;

            const group = await this.groupRepository.findOne({ where: { id } });
            if (!group) {
                throw new Error("Không tìm thấy nhóm mặt hàng cần cập nhật.");
            }

            const oldData = { ...group };

            // Check authorization for changing approval status
            const userRole = (req as AuthenticatedRequest).user?.role;
            if (approvalStatus !== undefined && approvalStatus !== group.approvalStatus) {
                if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                    return ResponseHelper.error(res, "Bạn không có quyền duyệt hoặc thay đổi trạng thái phê duyệt nhóm mặt hàng.", null, 403);
                }
                group.approvalStatus = approvalStatus;
            }

            if (status !== undefined) {
                group.status = status;
            }

            // Enforce business rule: active status is only allowed when approved
            if (group.status === CommodityStatus.ACTIVE && group.approvalStatus !== ApprovalStatus.APPROVED) {
                throw new Error("Chỉ khi nhóm mặt hàng ở trạng thái 'Đã duyệt' mới có thể chuyển trạng thái hoạt động thành 'Hoạt động'.");
            }

            if (groupCode && groupCode !== group.groupCode) {
                const existing = await this.groupRepository.findOne({ where: { groupCode } });
                if (existing) {
                    throw new Error("Mã nhóm mặt hàng này đã tồn tại ở bản ghi khác.");
                }
                group.groupCode = groupCode;
            }

            if (groupName) group.groupName = groupName;
            if (description !== undefined) group.description = description;

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

            // Check authorization for deletion
            const userRole = (req as AuthenticatedRequest).user?.role;
            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                return ResponseHelper.error(res, "Bạn không có quyền xóa nhóm mặt hàng.", null, 403);
            }

            const oldData = { ...group };
            await this.groupRepository.softRemove(group);

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
            const list = await this.groupRepository.find({
                where: {
                    deletedAt: Not(IsNull())
                },
                withDeleted: true,
                order: { deletedAt: "DESC" }
            });
            return ResponseHelper.success(res, list, "Lấy danh sách thùng rác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async restore(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const group = await this.groupRepository.findOne({
                where: { id },
                withDeleted: true
            });
            
            if (!group) {
                throw new Error("Không tìm thấy nhóm mặt hàng cần khôi phục.");
            }

            if (!group.deletedAt) {
                throw new Error("Nhóm mặt hàng này chưa bị xóa.");
            }

            // Check authorization
            const userRole = (req as AuthenticatedRequest).user?.role;
            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                return ResponseHelper.error(res, "Bạn không có quyền khôi phục nhóm mặt hàng.", null, 403);
            }

            group.deletedAt = null as any;
            const saved = await this.groupRepository.save(group);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC NHÓM MẶT HÀNG",
                action: "KHÔI PHỤC",
                description: `Khôi phục nhóm mặt hàng thành công: ${group.groupName} (${group.groupCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Khôi phục nhóm mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const commodityGroupController = new CommodityGroupController();
