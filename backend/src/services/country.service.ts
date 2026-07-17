import { IsNull, Not, Like } from "typeorm";
import { Country } from "../entities/country.entity";
import { CountryRepository } from "../repositories/country.repository";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";
import { CreateCountryReqDto, UpdateCountryReqDto } from "../dto/country.dto";

export class CountryService {
    private countryRepository = CountryRepository;

    async getAll(filters?: { search?: string; status?: CommodityStatus; approvalStatus?: ApprovalStatus }): Promise<Country[]> {
        const where: any = {};
        if (filters) {
            if (filters.status) where.status = filters.status;
            if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;

            if (filters.search) {
                const searchPattern = `%${filters.search}%`;
                return this.countryRepository.find({
                    where: [
                        { ...where, countryName: Like(searchPattern) },
                        { ...where, isoCode: Like(searchPattern) },
                        { ...where, description: Like(searchPattern) }
                    ],
                    order: { createdAt: "DESC" }
                });
            }
        }
        return this.countryRepository.find({
            where,
            order: { createdAt: "DESC" }
        });
    }

    async getTrash(filters?: { search?: string; status?: CommodityStatus; approvalStatus?: ApprovalStatus }): Promise<Country[]> {
        const where: any = {
            deletedAt: Not(IsNull())
        };
        if (filters) {
            if (filters.status) where.status = filters.status;
            if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;

            if (filters.search) {
                const searchPattern = `%${filters.search}%`;
                return this.countryRepository.find({
                    where: [
                        { ...where, countryName: Like(searchPattern) },
                        { ...where, isoCode: Like(searchPattern) },
                        { ...where, description: Like(searchPattern) }
                    ],
                    withDeleted: true,
                    order: { deletedAt: "DESC" }
                });
            }
        }
        return this.countryRepository.find({
            where,
            withDeleted: true,
            order: { deletedAt: "DESC" }
        });
    }

    async create(dto: CreateCountryReqDto): Promise<Country> {
        const { isoCode, countryName, description } = dto;
        if (!isoCode || !countryName) {
            throw new Error("Mã ISO và tên quốc gia là bắt buộc.");
        }

        const existing = await this.countryRepository.findByCode(isoCode);
        if (existing) {
            throw new Error("Mã ISO quốc gia này đã tồn tại.");
        }

        const country = new Country();
        country.isoCode = isoCode;
        country.countryName = countryName;
        country.description = description || "";
        // Newly created countries are forced to INACTIVE and PENDING approval
        country.status = CommodityStatus.INACTIVE;
        country.approvalStatus = ApprovalStatus.PENDING;

        return this.countryRepository.save(country);
    }

    async update(
        id: number,
        dto: UpdateCountryReqDto,
        userRole?: string
    ): Promise<{ saved: Country; oldData: Country }> {
        const { isoCode, countryName, description, status, approvalStatus } = dto;

        const country = await this.countryRepository.findOne({ where: { id } });
        if (!country) {
            throw new Error("Không tìm thấy quốc gia cần cập nhật.");
        }

        const oldData = { ...country } as Country;

        // Check if basic information is being modified
        const isFieldsChanged =
            (isoCode !== undefined && isoCode !== country.isoCode) ||
            (countryName !== undefined && countryName !== country.countryName) ||
            (description !== undefined && (description || "") !== (country.description || ""));

        // Rule 1: Khi quốc gia ở trạng thái hoạt động hoặc đã duyệt thì không cho cập nhật thông tin khác, chỉ có thể cập nhật trạng thái hoạt động thành ngừng hoạt động
        if (country.status === CommodityStatus.ACTIVE && isFieldsChanged) {
            throw new Error("Không thể chỉnh sửa thông tin khi quốc gia đang ở trạng thái 'Hoạt động'.");
        }

        // Rule 3: Chỉ khi trạng thái phê duyệt khác 'Đã duyệt' mới được sửa thông tin
        if (country.approvalStatus === ApprovalStatus.APPROVED && isFieldsChanged) {
            throw new Error("Không thể sửa quốc gia đã duyệt!");
        }

        // Rule 2: Chỉ khi ở trạng thái ngừng hoạt động mới có thể cập nhật trạng thái phê duyệt
        if (approvalStatus !== undefined && approvalStatus !== country.approvalStatus) {
            const finalStatus = status !== undefined ? status : country.status;
            if (finalStatus !== CommodityStatus.INACTIVE) {
                throw new Error("Chỉ có thể cập nhật trạng thái phê duyệt khi quốc gia ở trạng thái 'Ngừng hoạt động'.");
            }

            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền duyệt hoặc thay đổi trạng thái phê duyệt quốc gia.");
            }
            country.approvalStatus = approvalStatus;
        }

        if (status !== undefined && status !== country.status) {
            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền thay đổi trạng thái hoạt động.");
            }
            country.status = status;
        }

        // Enforce business rule: active status is only allowed when approved
        if (country.status === CommodityStatus.ACTIVE && country.approvalStatus !== ApprovalStatus.APPROVED) {
            throw new Error("Chỉ khi quốc gia ở trạng thái 'Đã duyệt' mới có thể chuyển trạng thái hoạt động thành 'Hoạt động'.");
        }

        if (isoCode && isoCode !== country.isoCode) {
            const existing = await this.countryRepository.findByCode(isoCode);
            if (existing) {
                throw new Error("Mã ISO quốc gia này đã tồn tại ở bản ghi khác.");
            }
            country.isoCode = isoCode;
        }

        if (countryName) country.countryName = countryName;
        if (description !== undefined) country.description = description;

        const saved = await this.countryRepository.save(country);
        return { saved, oldData };
    }

    async softDelete(id: number, userRole?: string): Promise<{ country: Country; oldData: Country }> {
        const country = await this.countryRepository.findOne({ where: { id } });
        if (!country) {
            throw new Error("Không tìm thấy quốc gia cần xóa.");
        }

        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền xóa quốc gia.");
        }

        const oldData = { ...country } as Country;
        await this.countryRepository.softRemove(country);

        return { country, oldData };
    }

    async restore(id: number, userRole?: string): Promise<Country> {
        const country = await this.countryRepository.findOne({
            where: { id },
            withDeleted: true
        });

        if (!country) {
            throw new Error("Không tìm thấy quốc gia cần khôi phục.");
        }

        if (!country.deletedAt) {
            throw new Error("Quốc gia này chưa bị xóa.");
        }

        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền khôi phục quốc gia.");
        }

        country.deletedAt = null as any;
        return this.countryRepository.save(country);
    }
}

export const countryService = new CountryService();
