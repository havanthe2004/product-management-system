import { IsNull, Not } from "typeorm";
import { Unit } from "../entities/unit.entity";
import { UnitRepository } from "../repositories/unit.repository";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";
import { CreateUnitReqDto, UpdateUnitReqDto } from "../dto/unit.dto";

export class UnitService {
    private unitRepository = UnitRepository;

    async getAll(): Promise<Unit[]> {
        return this.unitRepository.find({
            order: { createdAt: "DESC" }
        });
    }

    async getTrash(): Promise<Unit[]> {
        return this.unitRepository.find({
            where: {
                deletedAt: Not(IsNull())
            },
            withDeleted: true,
            order: { deletedAt: "DESC" }
        });
    }

    async create(dto: CreateUnitReqDto): Promise<Unit> {
        const { unitCode, unitName, symbol, description } = dto;
        if (!unitName || !symbol) {
            throw new Error("Tên đơn vị và ký hiệu là bắt buộc.");
        }

        if (unitCode) {
            const existing = await this.unitRepository.findByCode(unitCode);
            if (existing) {
                throw new Error("Mã đơn vị tính này đã tồn tại.");
            }
        }

        const unit = new Unit();
        unit.unitCode = unitCode || "";
        unit.unitName = unitName;
        unit.symbol = symbol;
        unit.description = description || "";
        // Newly created units are forced to INACTIVE and PENDING approval
        unit.status = CommodityStatus.INACTIVE;
        unit.approvalStatus = ApprovalStatus.PENDING;

        return this.unitRepository.save(unit);
    }

    async update(
        id: number,
        dto: UpdateUnitReqDto,
        userRole?: string
    ): Promise<{ saved: Unit; oldData: Unit }> {
        const { unitCode, unitName, symbol, description, status, approvalStatus } = dto;

        const unit = await this.unitRepository.findOne({ where: { id } });
        if (!unit) {
            throw new Error("Không tìm thấy đơn vị tính cần cập nhật.");
        }

        const oldData = { ...unit } as Unit;

        // Check if basic information is being modified
        const isFieldsChanged =
            (unitCode !== undefined && unitCode !== unit.unitCode) ||
            (unitName !== undefined && unitName !== unit.unitName) ||
            (symbol !== undefined && symbol !== unit.symbol) ||
            (description !== undefined && (description || "") !== (unit.description || ""));

        // Rule 1: Khi đơn vị ở trạng thái hoạt động hoặc đã duyệt thì không cho cập nhật thông tin khác, chỉ có thể cập nhật trạng thái hoạt động thành ngừng hoạt động
        if (unit.status === CommodityStatus.ACTIVE && isFieldsChanged) {
            throw new Error("Không thể chỉnh sửa thông tin khi đơn vị tính đang ở trạng thái 'Hoạt động'.");
        }

        // Rule 3: Chỉ khi trạng thái phê duyệt khác 'Đã duyệt' mới được sửa thông tin
        if (unit.approvalStatus === ApprovalStatus.APPROVED && isFieldsChanged) {
            throw new Error("Không thể sửa đơn vị tính đã duyệt!");
        }

        // Rule 2: Chỉ khi ở trạng thái ngừng hoạt động mới có thể cập nhật trạng thái phê duyệt
        if (approvalStatus !== undefined && approvalStatus !== unit.approvalStatus) {
            const finalStatus = status !== undefined ? status : unit.status;
            if (finalStatus !== CommodityStatus.INACTIVE) {
                throw new Error("Chỉ có thể cập nhật trạng thái phê duyệt khi đơn vị tính ở trạng thái 'Ngừng hoạt động'.");
            }

            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền duyệt hoặc thay đổi trạng thái phê duyệt đơn vị tính.");
            }
            unit.approvalStatus = approvalStatus;
        }

        if (status !== undefined && status !== unit.status) {
            if (userRole !== "ADMIN" && userRole !== "MANAGER") {
                throw new Error("Bạn không có quyền thay đổi trạng thái hoạt động.");
            }
            unit.status = status;
        }

        // Enforce business rule: active status is only allowed when approved
        if (unit.status === CommodityStatus.ACTIVE && unit.approvalStatus !== ApprovalStatus.APPROVED) {
            throw new Error("Chỉ khi đơn vị tính ở trạng thái 'Đã duyệt' mới có thể chuyển trạng thái hoạt động thành 'Hoạt động'.");
        }

        if (unitCode && unitCode !== unit.unitCode) {
            const existing = await this.unitRepository.findByCode(unitCode);
            if (existing) {
                throw new Error("Mã đơn vị tính này đã tồn tại ở bản ghi khác.");
            }
            unit.unitCode = unitCode;
        }

        if (unitName) unit.unitName = unitName;
        if (symbol) unit.symbol = symbol;
        if (description !== undefined) unit.description = description;

        const saved = await this.unitRepository.save(unit);
        return { saved, oldData };
    }

    async softDelete(id: number, userRole?: string): Promise<{ unit: Unit; oldData: Unit }> {
        const unit = await this.unitRepository.findOne({ where: { id } });
        if (!unit) {
            throw new Error("Không tìm thấy đơn vị tính cần xóa.");
        }

        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền xóa đơn vị tính.");
        }

        const oldData = { ...unit } as Unit;
        await this.unitRepository.softRemove(unit);

        return { unit, oldData };
    }

    async restore(id: number, userRole?: string): Promise<Unit> {
        const unit = await this.unitRepository.findOne({
            where: { id },
            withDeleted: true
        });

        if (!unit) {
            throw new Error("Không tìm thấy đơn vị tính cần khôi phục.");
        }

        if (!unit.deletedAt) {
            throw new Error("Đơn vị tính này chưa bị xóa.");
        }

        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Bạn không có quyền khôi phục đơn vị tính.");
        }

        unit.deletedAt = null as any;
        return this.unitRepository.save(unit);
    }
}

export const unitService = new UnitService();
