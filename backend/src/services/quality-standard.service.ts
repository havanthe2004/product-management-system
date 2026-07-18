import { IsNull, Not, Like } from "typeorm";
import { QualityStandard } from "../entities/quality-standard.entity";
import { QualityStandardRepository } from "../repositories/quality-standard.repository";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";
import { CreateQualityStandardReqDto, UpdateQualityStandardReqDto } from "../dto/quality-standard.dto";

export class QualityStandardService {
    private standardRepository = QualityStandardRepository;

    async getAll(filters?: {
        search?: string;
        status?: CommodityStatus;
        approvalStatus?: ApprovalStatus;
        page?: number;
        limit?: number;
    }): Promise<QualityStandard[] | { items: QualityStandard[]; total: number }> {
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
                { ...where, standardName: Like(searchPattern) },
                { ...where, standardCode: Like(searchPattern) },
                { ...where, description: Like(searchPattern) }
            ];

            if (filters?.page && filters?.limit) {
                const [items, total] = await this.standardRepository.findAndCount({
                    where: conditions,
                    ...buildFindOptions()
                });
                return { items, total };
            } else {
                return this.standardRepository.find({
                    where: conditions,
                    order: { createdAt: "DESC" }
                });
            }
        }

        if (filters?.page && filters?.limit) {
            const [items, total] = await this.standardRepository.findAndCount({
                where,
                ...buildFindOptions()
            });
            return { items, total };
        } else {
            return this.standardRepository.find({
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
    }): Promise<QualityStandard[] | { items: QualityStandard[]; total: number }> {
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
                { ...where, standardName: Like(searchPattern) },
                { ...where, standardCode: Like(searchPattern) },
                { ...where, description: Like(searchPattern) }
            ];

            if (filters?.page && filters?.limit) {
                const [items, total] = await this.standardRepository.findAndCount({
                    where: conditions,
                    ...buildFindOptions()
                });
                return { items, total };
            } else {
                return this.standardRepository.find({
                    where: conditions,
                    withDeleted: true,
                    order: { deletedAt: "DESC" }
                });
            }
        }

        if (filters?.page && filters?.limit) {
            const [items, total] = await this.standardRepository.findAndCount({
                where,
                ...buildFindOptions()
            });
            return { items, total };
        } else {
            return this.standardRepository.find({
                where,
                withDeleted: true,
                order: { deletedAt: "DESC" }
            });
        }
    }

    async create(dto: CreateQualityStandardReqDto): Promise<QualityStandard> {
        const { standardCode, standardName, description } = dto;
        if (!standardCode || !standardName) {
            throw new Error("Mã tiêu chuẩn và tên tiêu chuẩn là bắt buộc.");
        }

        const existing = await this.standardRepository.findByCode(standardCode);
        if (existing) {
            throw new Error("Mã tiêu chuẩn chất lượng này đã tồn tại.");
        }

        const standard = new QualityStandard();
        standard.standardCode = standardCode;
        standard.standardName = standardName;
        standard.description = description || "";
        // Newly created standards are forced to INACTIVE and PENDING approval
        standard.status = CommodityStatus.INACTIVE;
        standard.approvalStatus = ApprovalStatus.PENDING;

        return this.standardRepository.save(standard);
    }

    async update(
        id: number,
        dto: UpdateQualityStandardReqDto,
        userRole?: string
    ): Promise<{ saved: QualityStandard; oldData: QualityStandard }> {
        const { standardCode, standardName, description, status, approvalStatus } = dto;

        const standard = await this.standardRepository.findOne({ where: { id } });
        if (!standard) {
            throw new Error("Không tìm thấy tiêu chuẩn chất lượng cần cập nhật.");
        }

        const oldData = { ...standard } as QualityStandard;

        // Check if basic information is being modified
        const isFieldsChanged =
            (standardCode !== undefined && standardCode !== standard.standardCode) ||
            (standardName !== undefined && standardName !== standard.standardName) ||
            (description !== undefined && (description || "") !== (standard.description || ""));

        // Rule 1: Khi tiêu chuẩn ở trạng thái hoạt động hoặc đã duyệt thì không cho cập nhật thông tin khác, chỉ có thể cập nhật trạng thái hoạt động thành ngừng hoạt động
        if (standard.status === CommodityStatus.ACTIVE && isFieldsChanged) {
            throw new Error("Không thể chỉnh sửa thông tin khi tiêu chuẩn đang ở trạng thái 'Hoạt động'.");
        }

        // Rule 3: Chỉ khi trạng thái phê duyệt khác 'Đã duyệt' mới được sửa thông tin
        if (standard.approvalStatus === ApprovalStatus.APPROVED && isFieldsChanged) {
            throw new Error("Không thể sửa tiêu chuẩn đã duyệt!");
        }

        // Rule 2: Chỉ khi ở trạng thái ngừng hoạt động mới có thể cập nhật trạng thái phê duyệt
        if (approvalStatus !== undefined && approvalStatus !== standard.approvalStatus) {
            const finalStatus = status !== undefined ? status : standard.status;
            if (finalStatus !== CommodityStatus.INACTIVE) {
                throw new Error("Chỉ có thể cập nhật trạng thái phê duyệt khi tiêu chuẩn ở trạng thái 'Ngừng hoạt động'.");
            }

            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền duyệt hoặc thay đổi trạng thái phê duyệt tiêu chuẩn.");
            }
            standard.approvalStatus = approvalStatus;
        }

        if (status !== undefined && status !== standard.status) {
            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền thay đổi trạng thái hoạt động.");
            }
            standard.status = status;
        }

        // Enforce business rule: active status is only allowed when approved
        if (standard.status === CommodityStatus.ACTIVE && standard.approvalStatus !== ApprovalStatus.APPROVED) {
            throw new Error("Chỉ khi tiêu chuẩn ở trạng thái 'Đã duyệt' mới có thể chuyển trạng thái hoạt động thành 'Hoạt động'.");
        }

        if (standardCode && standardCode !== standard.standardCode) {
            const existing = await this.standardRepository.findByCode(standardCode);
            if (existing) {
                throw new Error("Mã tiêu chuẩn chất lượng này đã tồn tại ở bản ghi khác.");
            }
            standard.standardCode = standardCode;
        }

        if (standardName) standard.standardName = standardName;
        if (description !== undefined) standard.description = description;

        const saved = await this.standardRepository.save(standard);
        return { saved, oldData };
    }

    async softDelete(id: number, userRole?: string): Promise<{ standard: QualityStandard; oldData: QualityStandard }> {
        const standard = await this.standardRepository.findOne({ where: { id } });
        if (!standard) {
            throw new Error("Không tìm thấy tiêu chuẩn chất lượng cần xóa.");
        }

        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền xóa tiêu chuẩn.");
        }

        const oldData = { ...standard } as QualityStandard;
        await this.standardRepository.softRemove(standard);

        return { standard, oldData };
    }

    async restore(id: number, userRole?: string): Promise<QualityStandard> {
        const standard = await this.standardRepository.findOne({
            where: { id },
            withDeleted: true
        });

        if (!standard) {
            throw new Error("Không tìm thấy tiêu chuẩn chất lượng cần khôi phục.");
        }

        if (!standard.deletedAt) {
            throw new Error("Tiêu chuẩn này chưa bị xóa.");
        }

        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền khôi phục tiêu chuẩn.");
        }

        standard.deletedAt = null as any;
        return this.standardRepository.save(standard);
    }
}

export const qualityStandardService = new QualityStandardService();
