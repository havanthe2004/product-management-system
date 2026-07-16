import { Request, Response } from "express";
import { commodityService } from "../services/commodity.service";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import fs from "fs";
import path from "path";

export class CommodityController {

    private saveBase64Image(base64Str: string, commodityCode: string): string {
        const matches = base64Str.match(/^data:image\/([A-Za-z+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error("Định dạng hình ảnh không hợp lệ.");
        }

        const ext = (matches[1] === "jpeg" ? "jpg" : matches[1]) || "png";
        const base64Data = matches[2];
        if (!base64Data) {
            throw new Error("Không thể trích xuất dữ liệu hình ảnh.");
        }
        const buffer = Buffer.from(base64Data, "base64");

        const uploadDir = path.join(__dirname, "../../uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const cleanCode = commodityCode.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
        const filename = `commodity-${cleanCode}-${Date.now()}.${ext}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);

        return `/uploads/${filename}`;
    }

    private deleteImageFile(imageUrl: string) {
        if (imageUrl && imageUrl.startsWith("/uploads/")) {
            const filepath = path.join(__dirname, "../..", imageUrl);
            if (fs.existsSync(filepath)) {
                try {
                    fs.unlinkSync(filepath);
                } catch (err) {
                    console.error("Error deleting commodity image file:", err);
                }
            }
        }
    }

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await commodityService.getAll();
            return ResponseHelper.success(res, list, "Lấy danh sách mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async getTrash(req: Request, res: Response): Promise<Response> {
        try {
            const list = await commodityService.getTrash();
            return ResponseHelper.success(res, list, "Lấy danh sách thùng rác thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                return ResponseHelper.error(res, "Người dùng chưa xác thực.", null, 401);
            }

            const dto = { ...req.body };
            
            // Handle image upload if in base64 format
            if (dto.imageUrl && dto.imageUrl.startsWith("data:image/")) {
                dto.imageUrl = this.saveBase64Image(dto.imageUrl, dto.commodityCode || "unknown");
            }

            const saved = await commodityService.create(dto, userId);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC MẶT HÀNG",
                action: "THÊM MỚI",
                description: `Thêm mới mặt hàng thành công (chờ duyệt/ngừng hoạt động): ${saved.commodityName} (${saved.commodityCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Tạo mặt hàng thành công! Trạng thái: Chờ duyệt & Ngừng hoạt động.", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userId = (req as AuthenticatedRequest).user?.id;
            const userRole = (req as AuthenticatedRequest).user?.role;

            if (!userId) {
                return ResponseHelper.error(res, "Người dùng chưa xác thực.", null, 401);
            }

            const dto = { ...req.body };

            // Fetch current commodity to know code or handle image deletion
            const list = await commodityService.getAll();
            const commodity = list.find(c => Number(c.id) === id);
            if (!commodity) {
                return ResponseHelper.error(res, "Không tìm thấy mặt hàng cần cập nhật.", null, 404);
            }

            let oldImageToDelete: string | null = null;
            // Handle image upload if in base64 format
            if (dto.imageUrl && dto.imageUrl.startsWith("data:image/")) {
                const code = dto.commodityCode || commodity.commodityCode;
                dto.imageUrl = this.saveBase64Image(dto.imageUrl, code);
                if (commodity.imageUrl) {
                    oldImageToDelete = commodity.imageUrl;
                }
            } else if (dto.imageUrl === null || dto.imageUrl === "") {
                if (commodity.imageUrl) {
                    oldImageToDelete = commodity.imageUrl;
                }
                dto.imageUrl = "";
            }

            const { saved, oldData } = await commodityService.update(id, dto, userId, userRole);

            // Delete old image if update succeeded and a new one was uploaded
            if (oldImageToDelete) {
                this.deleteImageFile(oldImageToDelete);
            }

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC MẶT HÀNG",
                action: "CẬP NHẬT",
                description: `Cập nhật thông tin mặt hàng thành công: ${saved.commodityName} (${saved.commodityCode})`,
                oldData,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Cập nhật mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userId = (req as AuthenticatedRequest).user?.id;
            const userRole = (req as AuthenticatedRequest).user?.role;

            if (!userId) {
                return ResponseHelper.error(res, "Người dùng chưa xác thực.", null, 401);
            }

            const { commodity, oldData } = await commodityService.softDelete(id, userId, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC MẶT HÀNG",
                action: "XÓA",
                description: `Xóa tạm thời mặt hàng thành công: ${commodity.commodityName} (${commodity.commodityCode})`,
                oldData
            });

            return ResponseHelper.success(res, null, "Xóa mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async restore(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const userId = (req as AuthenticatedRequest).user?.id;
            const userRole = (req as AuthenticatedRequest).user?.role;

            if (!userId) {
                return ResponseHelper.error(res, "Người dùng chưa xác thực.", null, 401);
            }

            const saved = await commodityService.restore(id, userId, userRole);

            // Audit log
            await AuditLogService.log(req, {
                module: "DANH MỤC MẶT HÀNG",
                action: "KHÔI PHỤC",
                description: `Khôi phục mặt hàng thành công: ${saved.commodityName} (${saved.commodityCode})`,
                newData: saved
            });

            return ResponseHelper.success(res, saved, "Khôi phục mặt hàng thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const commodityController = new CommodityController();
