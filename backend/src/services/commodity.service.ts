import { IsNull, Not, In, Like } from "typeorm";
import { Commodity } from "../entities/commodity.entity";
import { CommodityRepository } from "../repositories/commodity.repository";
import { CommodityGroupRepository } from "../repositories/commodity-group.repository";
import { CommodityTypeRepository } from "../repositories/commodity-type.repository";
import { UnitRepository } from "../repositories/unit.repository";
import { UserRepository } from "../repositories/user.repository";
import { CountryRepository } from "../repositories/country.repository";
import { QualityStandardRepository } from "../repositories/quality-standard.repository";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { CommodityApprovalStatus } from "../common/enums/commodity-approval-status.enum";
import { CreateCommodityReqDto, UpdateCommodityReqDto } from "../dto/commodity.dto";

export class CommodityService {
    private commodityRepository = CommodityRepository;
    private groupRepository = CommodityGroupRepository;
    private typeRepository = CommodityTypeRepository;
    private unitRepository = UnitRepository;
    private userRepository = UserRepository;
    private countryRepository = CountryRepository;
    private qualityStandardRepository = QualityStandardRepository;

    async getAll(filters?: {
        search?: string;
        status?: CommodityStatus;
        approvalStatus?: CommodityApprovalStatus;
        groupId?: number;
        typeId?: number;
        page?: number;
        limit?: number;
    }): Promise<Commodity[] | { items: Commodity[]; total: number }> {
        const where: any = {};
        if (filters) {
            if (filters.status) where.status = filters.status;
            if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;
            if (filters.groupId) where.group = { id: filters.groupId };
            if (filters.typeId) where.type = { id: filters.typeId };
        }

        const buildFindOptions = () => {
            const options: any = {
                relations: {
                    group: true,
                    type: true,
                    unit: true,
                    countries: true,
                    qualityStandards: true,
                    createdBy: true,
                    updatedBy: true,
                    approvedBy: true
                },
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
                { ...where, commodityName: Like(searchPattern) },
                { ...where, commodityCode: Like(searchPattern) },
                { ...where, description: Like(searchPattern) }
            ];

            if (filters?.page && filters?.limit) {
                const [items, total] = await this.commodityRepository.findAndCount({
                    where: conditions,
                    ...buildFindOptions()
                });
                return { items, total };
            } else {
                return this.commodityRepository.find({
                    where: conditions,
                    relations: {
                        group: true,
                        type: true,
                        unit: true,
                        countries: true,
                        qualityStandards: true,
                        createdBy: true,
                        updatedBy: true,
                        approvedBy: true
                    },
                    order: { createdAt: "DESC" }
                });
            }
        }

        if (filters?.page && filters?.limit) {
            const [items, total] = await this.commodityRepository.findAndCount({
                where,
                ...buildFindOptions()
            });
            return { items, total };
        } else {
            return this.commodityRepository.find({
                where,
                relations: {
                    group: true,
                    type: true,
                    unit: true,
                    countries: true,
                    qualityStandards: true,
                    createdBy: true,
                    updatedBy: true,
                    approvedBy: true
                },
                order: { createdAt: "DESC" }
            });
        }
    }

    async getTrash(filters?: {
        search?: string;
        status?: CommodityStatus;
        approvalStatus?: CommodityApprovalStatus;
        groupId?: number;
        typeId?: number;
        page?: number;
        limit?: number;
    }): Promise<Commodity[] | { items: Commodity[]; total: number }> {
        const where: any = {
            deletedAt: Not(IsNull())
        };
        if (filters) {
            if (filters.status) where.status = filters.status;
            if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;
            if (filters.groupId) where.group = { id: filters.groupId };
            if (filters.typeId) where.type = { id: filters.typeId };
        }

        const buildFindOptions = () => {
            const options: any = {
                relations: {
                    group: true,
                    type: true,
                    unit: true,
                    countries: true,
                    qualityStandards: true,
                    createdBy: true,
                    updatedBy: true,
                    approvedBy: true
                },
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
                { ...where, commodityName: Like(searchPattern) },
                { ...where, commodityCode: Like(searchPattern) },
                { ...where, description: Like(searchPattern) }
            ];

            if (filters?.page && filters?.limit) {
                const [items, total] = await this.commodityRepository.findAndCount({
                    where: conditions,
                    ...buildFindOptions()
                });
                return { items, total };
            } else {
                return this.commodityRepository.find({
                    where: conditions,
                    relations: {
                        group: true,
                        type: true,
                        unit: true,
                        countries: true,
                        qualityStandards: true,
                        createdBy: true,
                        updatedBy: true,
                        approvedBy: true
                    },
                    withDeleted: true,
                    order: { deletedAt: "DESC" }
                });
            }
        }

        if (filters?.page && filters?.limit) {
            const [items, total] = await this.commodityRepository.findAndCount({
                where,
                ...buildFindOptions()
            });
            return { items, total };
        } else {
            return this.commodityRepository.find({
                where,
                relations: {
                    group: true,
                    type: true,
                    unit: true,
                    countries: true,
                    qualityStandards: true,
                    createdBy: true,
                    updatedBy: true,
                    approvedBy: true
                },
                withDeleted: true,
                order: { deletedAt: "DESC" }
            });
        }
    }

    async create(dto: CreateCommodityReqDto, creatorId: number): Promise<Commodity> {
        const {
            commodityCode,
            commodityName,
            imageUrl,
            groupId,
            typeId,
            unitId,
            description,
            countryIds,
            qualityStandardIds
        } = dto;

        if (!commodityCode || !commodityName || !groupId || !typeId || !unitId) {
            throw new Error("Mã mặt hàng, tên mặt hàng, nhóm, loại và đơn vị tính là bắt buộc.");
        }

        const existing = await this.commodityRepository.findByCode(commodityCode);
        if (existing) {
            throw new Error("Mã mặt hàng này đã tồn tại.");
        }

        const group = await this.groupRepository.findOne({ where: { id: Number(groupId) } });
        if (!group) {
            throw new Error("Không tìm thấy nhóm mặt hàng tương ứng.");
        }

        const type = await this.typeRepository.findOne({ where: { id: Number(typeId) } });
        if (!type) {
            throw new Error("Không tìm thấy loại mặt hàng tương ứng.");
        }

        const unit = await this.unitRepository.findOne({ where: { id: Number(unitId) } });
        if (!unit) {
            throw new Error("Không tìm thấy đơn vị tính tương ứng.");
        }

        const creator = await this.userRepository.findOne({ where: { id: creatorId } });
        if (!creator) {
            throw new Error("Người tạo không hợp lệ.");
        }

        const commodity = new Commodity();
        commodity.commodityCode = commodityCode;
        commodity.commodityName = commodityName;
        commodity.imageUrl = imageUrl || "";
        commodity.description = description || "";
        commodity.status = CommodityStatus.INACTIVE;
        commodity.approvalStatus = CommodityApprovalStatus.PENDING;
        commodity.group = group;
        commodity.type = type;
        commodity.unit = unit;
        commodity.createdBy = creator;
        commodity.updatedBy = creator;

        if (countryIds && countryIds.length > 0) {
            const countries = await this.countryRepository.find({
                where: { id: In(countryIds.map(Number)) }
            });
            commodity.countries = countries;
        } else {
            commodity.countries = [];
        }

        if (qualityStandardIds && qualityStandardIds.length > 0) {
            const standards = await this.qualityStandardRepository.find({
                where: { id: In(qualityStandardIds.map(Number)) }
            });
            commodity.qualityStandards = standards;
        } else {
            commodity.qualityStandards = [];
        }

        return this.commodityRepository.save(commodity);
    }

    async update(
        id: number,
        dto: UpdateCommodityReqDto,
        userId: number,
        userRole?: string
    ): Promise<{ saved: Commodity; oldData: Commodity }> {
        const commodity = await this.commodityRepository.findOne({
            where: { id },
            relations: {
                group: true,
                type: true,
                unit: true,
                countries: true,
                qualityStandards: true,
                createdBy: true,
                updatedBy: true,
                approvedBy: true
            }
        });

        if (!commodity) {
            throw new Error("Không tìm thấy mặt hàng cần cập nhật.");
        }

        // Keep clone for oldData in audit log
        const oldData = {
            ...commodity,
            group: commodity.group ? { ...commodity.group } : null,
            type: commodity.type ? { ...commodity.type } : null,
            unit: commodity.unit ? { ...commodity.unit } : null,
            countries: commodity.countries ? [...commodity.countries] : [],
            qualityStandards: commodity.qualityStandards ? [...commodity.qualityStandards] : []
        } as unknown as Commodity;

        const currentGroupId = commodity.group?.id ? Number(commodity.group.id) : null;
        const newGroupId = dto.groupId !== undefined ? (dto.groupId ? Number(dto.groupId) : null) : currentGroupId;

        const currentTypeId = commodity.type?.id ? Number(commodity.type.id) : null;
        const newTypeId = dto.typeId !== undefined ? (dto.typeId ? Number(dto.typeId) : null) : currentTypeId;

        const currentUnitId = commodity.unit?.id ? Number(commodity.unit.id) : null;
        const newUnitId = dto.unitId !== undefined ? (dto.unitId ? Number(dto.unitId) : null) : currentUnitId;

        const currentCountryIds = (commodity.countries || []).map(c => Number(c.id)).sort();
        const newCountryIds = dto.countryIds !== undefined ? dto.countryIds.map(id => Number(id)).sort() : [...currentCountryIds];
        const isCountriesChanged = JSON.stringify(currentCountryIds) !== JSON.stringify(newCountryIds);

        const currentStandardIds = (commodity.qualityStandards || []).map(s => Number(s.id)).sort();
        const newStandardIds = dto.qualityStandardIds !== undefined ? dto.qualityStandardIds.map(id => Number(id)).sort() : [...currentStandardIds];
        const isStandardsChanged = JSON.stringify(currentStandardIds) !== JSON.stringify(newStandardIds);

        const isFieldsChanged =
            (dto.commodityCode !== undefined && dto.commodityCode !== commodity.commodityCode) ||
            (dto.commodityName !== undefined && dto.commodityName !== commodity.commodityName) ||
            (dto.imageUrl !== undefined && dto.imageUrl !== commodity.imageUrl) ||
            (dto.description !== undefined && dto.description !== commodity.description) ||
            (dto.groupId !== undefined && newGroupId !== currentGroupId) ||
            (dto.typeId !== undefined && newTypeId !== currentTypeId) ||
            (dto.unitId !== undefined && newUnitId !== currentUnitId) ||
            isCountriesChanged ||
            isStandardsChanged;

        // Rule 1: Khi mặt hàng ở trạng thái hoạt động hoặc đã duyệt thì không cho cập nhật thông tin khác, chỉ có thể cập nhật trạng thái hoạt động thành ngừng hoạt động
        if (commodity.status === CommodityStatus.ACTIVE && isFieldsChanged) {
            throw new Error("Không thể chỉnh sửa thông tin khi mặt hàng đang ở trạng thái 'Hoạt động'.");
        }

        // Rule 3: Chỉ khi trạng thái phê duyệt khác 'Đã duyệt' mới được sửa thông tin
        if (commodity.approvalStatus === CommodityApprovalStatus.APPROVED && isFieldsChanged) {
            throw new Error("Chỉ khi trạng thái phê duyệt khác 'Đã duyệt' mới được sửa đổi thông tin của mặt hàng.");
        }

        // Rule 2: Chỉ khi ở trạng thái ngừng hoạt động mới có thể cập nhật trạng thái phê duyệt
        if (dto.approvalStatus !== undefined && dto.approvalStatus !== commodity.approvalStatus) {
            const finalStatus = dto.status !== undefined ? dto.status : commodity.status;
            if (finalStatus !== CommodityStatus.INACTIVE) {
                throw new Error("Chỉ có thể cập nhật trạng thái phê duyệt khi mặt hàng ở trạng thái 'Ngừng hoạt động'.");
            }

            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền duyệt hoặc thay đổi trạng thái phê duyệt mặt hàng.");
            }
            commodity.approvalStatus = dto.approvalStatus;

            // Log approved info if approved
            if (dto.approvalStatus === CommodityApprovalStatus.APPROVED) {
                const approver = await this.userRepository.findOne({ where: { id: userId } });
                commodity.approvedBy = approver || null as any;
                commodity.approvedAt = new Date();
            } else {
                commodity.approvedBy = null as any;
                commodity.approvedAt = null as any;
            }
        }

        // Update status if provided
        if (dto.status !== undefined && dto.status !== commodity.status) {
            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền thay đổi trạng thái hoạt động.");
            }
            commodity.status = dto.status;
        }

        // Enforce business rule: active status is only allowed when approved
        if (commodity.status === CommodityStatus.ACTIVE && commodity.approvalStatus !== CommodityApprovalStatus.APPROVED) {
            throw new Error("Chỉ khi mặt hàng ở trạng thái 'Đã duyệt' mới có thể chuyển trạng thái hoạt động thành 'Hoạt động'.");
        }

        // Apply changes
        if (dto.groupId && Number(dto.groupId) !== Number(commodity.group?.id)) {
            const group = await this.groupRepository.findOne({ where: { id: Number(dto.groupId) } });
            if (!group) throw new Error("Không tìm thấy nhóm mặt hàng tương ứng.");
            commodity.group = group;
        }

        if (dto.typeId && Number(dto.typeId) !== Number(commodity.type?.id)) {
            const type = await this.typeRepository.findOne({ where: { id: Number(dto.typeId) } });
            if (!type) throw new Error("Không tìm thấy loại mặt hàng tương ứng.");
            commodity.type = type;
        }

        if (dto.unitId && Number(dto.unitId) !== Number(commodity.unit?.id)) {
            const unit = await this.unitRepository.findOne({ where: { id: Number(dto.unitId) } });
            if (!unit) throw new Error("Không tìm thấy đơn vị tính tương ứng.");
            commodity.unit = unit;
        }

        if (dto.commodityCode && dto.commodityCode !== commodity.commodityCode) {
            const existing = await this.commodityRepository.findByCode(dto.commodityCode);
            if (existing) {
                throw new Error("Mã mặt hàng này đã tồn tại ở bản ghi khác.");
            }
            commodity.commodityCode = dto.commodityCode;
        }

        if (dto.commodityName) commodity.commodityName = dto.commodityName;
        if (dto.imageUrl !== undefined) commodity.imageUrl = dto.imageUrl;
        if (dto.description !== undefined) commodity.description = dto.description;

        if (dto.countryIds !== undefined) {
            if (dto.countryIds.length > 0) {
                const countries = await this.countryRepository.find({
                    where: { id: In(dto.countryIds.map(Number)) }
                });
                commodity.countries = countries;
            } else {
                commodity.countries = [];
            }
        }

        if (dto.qualityStandardIds !== undefined) {
            if (dto.qualityStandardIds.length > 0) {
                const standards = await this.qualityStandardRepository.find({
                    where: { id: In(dto.qualityStandardIds.map(Number)) }
                });
                commodity.qualityStandards = standards;
            } else {
                commodity.qualityStandards = [];
            }
        }

        const updater = await this.userRepository.findOne({ where: { id: userId } });
        if (updater) {
            commodity.updatedBy = updater;
        }

        const saved = await this.commodityRepository.save(commodity);
        return { saved, oldData };
    }

    async softDelete(id: number, userId: number, userRole?: string): Promise<{ commodity: Commodity; oldData: Commodity }> {
        const commodity = await this.commodityRepository.findOne({ where: { id } });
        if (!commodity) {
            throw new Error("Không tìm thấy mặt hàng cần xóa.");
        }

        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền xóa mặt hàng.");
        }

        const oldData = { ...commodity } as Commodity;

        // Record who modified last
        const updater = await this.userRepository.findOne({ where: { id: userId } });
        if (updater) {
            commodity.updatedBy = updater;
            await this.commodityRepository.save(commodity);
        }

        await this.commodityRepository.softRemove(commodity);
        return { commodity, oldData };
    }

    async restore(id: number, userId: number, userRole?: string): Promise<Commodity> {
        const commodity = await this.commodityRepository.findOne({
            where: { id },
            withDeleted: true,
            relations: {
                group: true,
                type: true,
                unit: true,
                countries: true,
                qualityStandards: true
            }
        });

        if (!commodity) {
            throw new Error("Không tìm thấy mặt hàng cần khôi phục.");
        }

        if (!commodity.deletedAt) {
            throw new Error("Mặt hàng này chưa bị xóa.");
        }

        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền khôi phục mặt hàng.");
        }

        commodity.deletedAt = null as any;

        const updater = await this.userRepository.findOne({ where: { id: userId } });
        if (updater) {
            commodity.updatedBy = updater;
        }

        return this.commodityRepository.save(commodity);
    }
}

export const commodityService = new CommodityService();
