import { IsNull, Not, Like } from "typeorm";
import { CommodityGroup } from "../entities/commodity-group.entity";
import { CommodityGroupRepository } from "../repositories/commodity-group.repository";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";

export class CommodityGroupService {
    private groupRepository = CommodityGroupRepository;

    async getAll(filters?: {
        search?: string;
        status?: CommodityStatus;
        approvalStatus?: ApprovalStatus;
        page?: number;
        limit?: number;
    }): Promise<CommodityGroup[] | { items: CommodityGroup[]; total: number }> {
        const where: any = {};
        if (filters) {
            if (filters.status) where.status = filters.status;
            if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;
        }

        const buildFindOptions = () => {
            const options: any = {
                order: { createdAt: "DESC" }
            };
            if (filters?.page && filters?.limit) {
                options.skip = (filters.page - 1) * filters.limit;
                options.take = filters.limit;
            }
            return options;
        };

        if (filters?.search) {
            const searchPattern = `%${filters.search}%`;
            const conditions = [
                { ...where, groupName: Like(searchPattern) },
                { ...where, groupCode: Like(searchPattern) },
                { ...where, description: Like(searchPattern) }
            ];

            if (filters?.page && filters?.limit) {
                const [items, total] = await this.groupRepository.findAndCount({
                    where: conditions,
                    ...buildFindOptions()
                });
                return { items, total };
            } else {
                return this.groupRepository.find({
                    where: conditions,
                    order: { createdAt: "DESC" }
                });
            }
        }

        if (filters?.page && filters?.limit) {
            const [items, total] = await this.groupRepository.findAndCount({
                where,
                ...buildFindOptions()
            });
            return { items, total };
        } else {
            return this.groupRepository.find({
                where,
                order: { createdAt: "DESC" }
            });
        }
    }

    async getTrash(filters?: {
        search?: string;
        status?: CommodityStatus;
        approvalStatus?: ApprovalStatus;
        page?: number;
        limit?: number;
    }): Promise<CommodityGroup[] | { items: CommodityGroup[]; total: number }> {
        const where: any = {
            deletedAt: Not(IsNull())
        };
        if (filters) {
            if (filters.status) where.status = filters.status;
            if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;
        }

        const buildFindOptions = () => {
            const options: any = {
                withDeleted: true,
                order: { deletedAt: "DESC" }
            };
            if (filters?.page && filters?.limit) {
                options.skip = (filters.page - 1) * filters.limit;
                options.take = filters.limit;
            }
            return options;
        };

        if (filters?.search) {
            const searchPattern = `%${filters.search}%`;
            const conditions = [
                { ...where, groupName: Like(searchPattern) },
                { ...where, groupCode: Like(searchPattern) },
                { ...where, description: Like(searchPattern) }
            ];

            if (filters?.page && filters?.limit) {
                const [items, total] = await this.groupRepository.findAndCount({
                    where: conditions,
                    ...buildFindOptions()
                });
                return { items, total };
            } else {
                return this.groupRepository.find({
                    where: conditions,
                    withDeleted: true,
                    order: { deletedAt: "DESC" }
                });
            }
        }

        if (filters?.page && filters?.limit) {
            const [items, total] = await this.groupRepository.findAndCount({
                where,
                ...buildFindOptions()
            });
            return { items, total };
        } else {
            return this.groupRepository.find({
                where,
                withDeleted: true,
                order: { deletedAt: "DESC" }
            });
        }
    }

    async create(dto: { groupCode: string; groupName: string; description?: string }): Promise<CommodityGroup> {
        const { groupCode, groupName, description } = dto;
        if (!groupCode || !groupName) {
            throw new Error("Mã nhóm và tên nhóm là bắt buộc.");
        }

        const existing = await this.groupRepository.findByCode(groupCode);
        if (existing) {
            throw new Error("Mã nhóm mặt hàng này đã tồn tại.");
        }

        const group = new CommodityGroup();
        group.groupCode = groupCode;
        group.groupName = groupName;
        group.description = description || "";
        // Newly created groups are forced to INACTIVE and PENDING approval
        group.status = CommodityStatus.INACTIVE;
        group.approvalStatus = ApprovalStatus.PENDING;

        return this.groupRepository.save(group);
    }

    async update(
        id: number,
        dto: { groupCode?: string; groupName?: string; description?: string; status?: CommodityStatus; approvalStatus?: ApprovalStatus },
        userRole?: string
    ): Promise<{ saved: CommodityGroup; oldData: CommodityGroup }> {
        const { groupCode, groupName, description, status, approvalStatus } = dto;

        const group = await this.groupRepository.findOne({ where: { id } });
        if (!group) {
            throw new Error("Không tìm thấy nhóm mặt hàng cần cập nhật.");
        }

        const oldData = { ...group } as CommodityGroup;

        // Check if basic information is being modified
        const isFieldsChanged =
            (groupCode !== undefined && groupCode !== group.groupCode) ||
            (groupName !== undefined && groupName !== group.groupName) ||
            (description !== undefined && description !== group.description);

        // Rule 1: Khi nhóm mặt hàng ở trạng thái hoạt động hoặc đã duyệt thì không cho cập nhật thông tin khác, chỉ có thể cập nhật trạng thái hoạt động thành ngừng hoạt động
        if (group.status === CommodityStatus.ACTIVE && isFieldsChanged) {
            throw new Error("Không thể chỉnh sửa thông tin khi nhóm mặt hàng đang ở trạng thái 'Hoạt động'.");
        }

        // Rule 3: Chỉ khi trạng thái phê duyệt khác 'Đã duyệt' mới được sửa thông tin
        if (group.approvalStatus === ApprovalStatus.APPROVED && isFieldsChanged) {
            throw new Error("Không thể sửa nhóm mặt hàng đã duyệt!");
        }


        // Rule 2: Chỉ khi ở trạng thái ngừng hoạt động mới có thể cập nhật trạng thái phê duyệt
        if (approvalStatus !== undefined && approvalStatus !== group.approvalStatus) {
            const finalStatus = status !== undefined ? status : group.status;
            if (finalStatus !== CommodityStatus.INACTIVE) {
                throw new Error("Chỉ có thể cập nhật trạng thái phê duyệt khi nhóm mặt hàng ở trạng thái 'Ngừng hoạt động'.");
            }

            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền duyệt hoặc thay đổi trạng thái phê duyệt nhóm mặt hàng.");
            }
            group.approvalStatus = approvalStatus;
        }

        if (status !== undefined && status !== group.status) {
            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền thay đổi trạng thái hoạt động.");
            }
            group.status = status;
        }

        // Enforce business rule: active status is only allowed when approved
        if (group.status === CommodityStatus.ACTIVE && group.approvalStatus !== ApprovalStatus.APPROVED) {
            throw new Error("Chỉ khi nhóm mặt hàng ở trạng thái 'Đã duyệt' mới có thể chuyển trạng thái hoạt động thành 'Hoạt động'.");
        }

        if (groupCode && groupCode !== group.groupCode) {
            const existing = await this.groupRepository.findByCode(groupCode);
            if (existing) {
                throw new Error("Mã nhóm mặt hàng này đã tồn tại ở bản ghi khác.");
            }
            group.groupCode = groupCode;
        }

        if (groupName) group.groupName = groupName;
        if (description !== undefined) group.description = description;

        const saved = await this.groupRepository.save(group);
        return { saved, oldData };
    }

    async softDelete(id: number, userRole?: string): Promise<{ group: CommodityGroup; oldData: CommodityGroup }> {
        const group = await this.groupRepository.findOne({ where: { id } });
        if (!group) {
            throw new Error("Không tìm thấy nhóm mặt hàng cần xóa.");
        }

        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền xóa nhóm mặt hàng.");
        }

        const oldData = { ...group } as CommodityGroup;
        await this.groupRepository.softRemove(group);

        return { group, oldData };
    }

    async restore(id: number, userRole?: string): Promise<CommodityGroup> {
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

        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền khôi phục nhóm mặt hàng.");
        }

        group.deletedAt = null as any;
        return this.groupRepository.save(group);
    }
}

export const commodityGroupService = new CommodityGroupService();
