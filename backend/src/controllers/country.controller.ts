import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Country } from "../entities/country.entity";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";

export class CountryController {
    private countryRepository = AppDataSource.getRepository(Country);

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await this.countryRepository.find({
                order: { createdAt: "DESC" }
            });
            return ResponseHelper.success(res, list, "Lấy danh sách quốc gia thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { isoCode, countryName, region, description, status } = req.body;
            if (!isoCode || !countryName) {
                throw new Error("Mã ISO và tên quốc gia là bắt buộc.");
            }

            const existing = await this.countryRepository.findOne({ where: { isoCode } });
            if (existing) {
                throw new Error("Mã ISO quốc gia này đã tồn tại.");
            }

            const country = new Country();
            country.isoCode = isoCode;
            country.countryName = countryName;
            country.region = region || "";
            country.description = description || "";
            country.status = status;

            const saved = await this.countryRepository.save(country);

            // Audit log
            await AuditLogService.log(req, {
                module: "CÁC NƯỚC HỢP TÁC",
                action: "THÊM MỚI",
                description: `Thêm mới quốc gia đối tác thành công: ${countryName} (${isoCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo quốc gia đối tác thành công!", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const { isoCode, countryName, region, description, status } = req.body;

            const country = await this.countryRepository.findOne({ where: { id } });
            if (!country) {
                throw new Error("Không tìm thấy quốc gia cần cập nhật.");
            }

            const oldData = { ...country };

            if (isoCode && isoCode !== country.isoCode) {
                const existing = await this.countryRepository.findOne({ where: { isoCode } });
                if (existing) {
                    throw new Error("Mã ISO quốc gia này đã tồn tại ở bản ghi khác.");
                }
                country.isoCode = isoCode;
            }

            if (countryName) country.countryName = countryName;
            if (region !== undefined) country.region = region;
            if (description !== undefined) country.description = description;
            if (status) country.status = status;

            const saved = await this.countryRepository.save(country);

            // Audit log
            await AuditLogService.log(req, {
                module: "CÁC NƯỚC HỢP TÁC",
                action: "CẬP NHẬT",
                description: `Cập nhật quốc gia đối tác thành công: ${country.countryName} (${country.isoCode})`,
                oldData,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Cập nhật quốc gia đối tác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const country = await this.countryRepository.findOne({ where: { id } });
            if (!country) {
                throw new Error("Không tìm thấy quốc gia cần xóa.");
            }

            const oldData = { ...country };
            await this.countryRepository.remove(country);

            // Audit log
            await AuditLogService.log(req, {
                module: "CÁC NƯỚC HỢP TÁC",
                action: "XÓA",
                description: `Xóa quốc gia đối tác thành công: ${country.countryName} (${country.isoCode})`,
                oldData
            });

            return ResponseHelper.success(res, null, "Xóa quốc gia đối tác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const countryController = new CountryController();
