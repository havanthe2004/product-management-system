import { IsNull, Not, Like } from "typeorm";
import { CommodityType } from "../entities/commodity-type.entity";
import { CommodityTypeRepository } from "../repositories/commodity-type.repository";
import { CommodityGroupRepository } from "../repositories/commodity-group.repository";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";
import { CreateCommodityTypeReqDto, UpdateCommodityTypeReqDto } from "../dto/commodity-type.dto";

export class CommodityTypeService {
    private typeRepository = CommodityTypeRepository;
    private groupRepository = CommodityGroupRepository;

    async getAll(filters?: {
        search?: string;
        status?: CommodityStatus;
        approvalStatus?: ApprovalStatus;
        groupId?: number;
        page?: number;
        limit?: number;
    }): Promise<CommodityType[] | { items: CommodityType[]; total: number }> {
        const where: any = {};
        if (filters) {
            if (filters.status) where.status = filters.status;
            if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;
            if (filters.groupId) where.group = { id: filters.groupId };
        }

        const buildFindOptions = () => {
            const options: any = {
                relations: { group: true },
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
                { ...where, typeName: Like(searchPattern) },
                { ...where, typeCode: Like(searchPattern) },
                { ...where, description: Like(searchPattern) }
            ];

            if (filters?.page && filters?.limit) {
                const [items, total] = await this.typeRepository.findAndCount({
                    where: conditions,
                    ...buildFindOptions()
                });
                return { items, total };
            } else {
                return this.typeRepository.find({
                    where: conditions,
                    relations: { group: true },
                    order: { createdAt: "DESC" }
                });
            }
        }

        if (filters?.page && filters?.limit) {
            const [items, total] = await this.typeRepository.findAndCount({
                where,
                ...buildFindOptions()
            });
            return { items, total };
        } else {
            return this.typeRepository.find({
                where,
                relations: { group: true },
                order: { createdAt: "DESC" }
            });
        }
    }

    async getTrash(filters?: {
        search?: string;
        status?: CommodityStatus;
        approvalStatus?: ApprovalStatus;
        groupId?: number;
        page?: number;
        limit?: number;
    }): Promise<CommodityType[] | { items: CommodityType[]; total: number }> {
        const where: any = {
            deletedAt: Not(IsNull())
        };
        if (filters) {
            if (filters.status) where.status = filters.status;
            if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;
            if (filters.groupId) where.group = { id: filters.groupId };
        }

        const buildFindOptions = () => {
            const options: any = {
                relations: { group: true },
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
                { ...where, typeName: Like(searchPattern) },
                { ...where, typeCode: Like(searchPattern) },
                { ...where, description: Like(searchPattern) }
            ];

            if (filters?.page && filters?.limit) {
                const [items, total] = await this.typeRepository.findAndCount({
                    where: conditions,
                    ...buildFindOptions()
                });
                return { items, total };
            } else {
                return this.typeRepository.find({
                    where: conditions,
                    relations: { group: true },
                    withDeleted: true,
                    order: { deletedAt: "DESC" }
                });
            }
        }

        if (filters?.page && filters?.limit) {
            const [items, total] = await this.typeRepository.findAndCount({
                where,
                ...buildFindOptions()
            });
            return { items, total };
        } else {
            return this.typeRepository.find({
                where,
                relations: { group: true },
                withDeleted: true,
                order: { deletedAt: "DESC" }
            });
        }
    }

    async create(dto: CreateCommodityTypeReqDto): Promise<CommodityType> {
        const { typeCode, typeName, description, groupId } = dto;
        if (!typeCode || !typeName || !groupId) {
            throw new Error("Mã loại, tên loại và nhóm mặt hàng là bắt buộc.");
        }

        const group = await this.groupRepository.findOne({ where: { id: Number(groupId) } });
        if (!group) {
            throw new Error("Không tìm thấy nhóm mặt hàng tương ứng.");
        }

        const existing = await this.typeRepository.findByCode(typeCode);
        if (existing) {
            throw new Error("Mã loại mặt hàng này đã tồn tại.");
        }

        const type = new CommodityType();
        type.typeCode = typeCode;
        type.typeName = typeName;
        type.description = description || "";
        // Newly created types are forced to INACTIVE and PENDING approval
        type.status = CommodityStatus.INACTIVE;
        type.approvalStatus = ApprovalStatus.PENDING;
        type.group = group;

        return this.typeRepository.save(type);
    }

    async update(
        id: number,
        dto: UpdateCommodityTypeReqDto,
        userRole?: string
    ): Promise<{ saved: CommodityType; oldData: CommodityType }> {
        const { typeCode, typeName, description, status, approvalStatus, groupId } = dto;

        const type = await this.typeRepository.findOne({ where: { id }, relations: { group: true } });
        if (!type) {
            throw new Error("Không tìm thấy loại mặt hàng cần cập nhật.");
        }

        const oldData = { ...type } as CommodityType;

        const currentGroupId = type.group?.id ? Number(type.group.id) : null;
        const newGroupId = groupId !== undefined ? (groupId ? Number(groupId) : null) : currentGroupId;

        // Check if basic information is being modified
        const isFieldsChanged =
            (typeCode !== undefined && typeCode !== type.typeCode) ||
            (typeName !== undefined && typeName !== type.typeName) ||
            (description !== undefined && (description !== type.description)) ||
            (groupId !== undefined && newGroupId !== currentGroupId);

        console.log(isFieldsChanged)
        // Rule 3: Chỉ khi trạng thái phê duyệt khác 'Đã duyệt' mới được sửa thông tin
        if (type.approvalStatus === ApprovalStatus.APPROVED && isFieldsChanged) {
            throw new Error("Chỉ khi trạng thái phê duyệt khác 'Đã duyệt' mới được sửa đổi thông tin của loại mặt hàng.");
        }

        // Rule 1: Khi loại mặt hàng ở trạng thái hoạt động hoặc đã duyệt thì không cho cập nhật thông tin khác, chỉ có thể cập nhật trạng thái hoạt động thành ngừng hoạt động
        if (type.status === CommodityStatus.ACTIVE && isFieldsChanged) {
            throw new Error("Không thể chỉnh sửa thông tin khi loại mặt hàng đang ở trạng thái 'Hoạt động'.");
        }

        // Rule 2: Chỉ khi ở trạng thái ngừng hoạt động mới có thể cập nhật trạng thái phê duyệt
        if (approvalStatus !== undefined && approvalStatus !== type.approvalStatus) {
            const finalStatus = status !== undefined ? status : type.status;
            if (finalStatus !== CommodityStatus.INACTIVE) {
                throw new Error("Chỉ có thể cập nhật trạng thái phê duyệt khi loại mặt hàng ở trạng thái 'Ngừng hoạt động'.");
            }

            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền duyệt hoặc thay đổi trạng thái phê duyệt loại mặt hàng.");
            }
            type.approvalStatus = approvalStatus;
        }

        if (status !== undefined && status !== type.status) {
            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền thay đổi trạng thái hoạt động.");
            }
            type.status = status;
        }

        // Enforce business rule: active status is only allowed when approved
        if (type.status === CommodityStatus.ACTIVE && type.approvalStatus !== ApprovalStatus.APPROVED) {
            throw new Error("Chỉ khi loại mặt hàng ở trạng thái 'Đã duyệt' mới có thể chuyển trạng thái hoạt động thành 'Hoạt động'.");
        }

        if (groupId && Number(groupId) !== type.group?.id) {
            const group = await this.groupRepository.findOne({ where: { id: Number(groupId) } });
            if (!group) {
                throw new Error("Không tìm thấy nhóm mặt hàng tương ứng.");
            }
            type.group = group;
        }

        if (typeCode && typeCode !== type.typeCode) {
            const existing = await this.typeRepository.findByCode(typeCode);
            if (existing) {
                throw new Error("Mã loại mặt hàng này đã tồn tại ở bản ghi khác.");
            }
            type.typeCode = typeCode;
        }

        if (typeName) type.typeName = typeName;
        if (description !== undefined) type.description = description;

        const saved = await this.typeRepository.save(type);
        return { saved, oldData };
    }

    async softDelete(id: number, userRole?: string): Promise<{ type: CommodityType; oldData: CommodityType }> {
        const type = await this.typeRepository.findOne({ where: { id } });
        if (!type) {
            throw new Error("Không tìm thấy loại mặt hàng cần xóa.");
        }

        // Check authorization for deletion
        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền xóa loại mặt hàng.");
        }

        const oldData = { ...type } as CommodityType;
        await this.typeRepository.softRemove(type);

        return { type, oldData };
    }

    async restore(id: number, userRole?: string): Promise<CommodityType> {
        const type = await this.typeRepository.findOne({
            where: { id },
            withDeleted: true,
            relations: { group: true }
        });

        if (!type) {
            throw new Error("Không tìm thấy loại mặt hàng cần khôi phục.");
        }

        if (!type.deletedAt) {
            throw new Error("Loại mặt hàng này chưa bị xóa.");
        }

        // Check authorization
        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền khôi phục loại mặt hàng.");
        }

        type.deletedAt = null as any;
        return this.typeRepository.save(type);
    }
}

export const commodityTypeService = new CommodityTypeService();
