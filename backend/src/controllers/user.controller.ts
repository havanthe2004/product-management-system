import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";

export class UserController {

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const saved = await userService.create(req.body);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ THÀNH VIÊN",
                action: "TẠO MỚI",
                description: `Tạo tài khoản mới thành công: ${saved.email}`,
                newData: { email: saved.email, role: saved.role }
            });

            return ResponseHelper.success(res, {
                id: saved.id,
                email: saved.email,
                fullName: saved.fullName,
                role: saved.role,
                status: saved.status
            }, "Tạo thành viên thành công!", 201);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await userService.getAll();

            // Map list to omit password
            const mappedList = list.map(u => ({
                id: u.id,
                fullName: u.fullName,
                email: u.email,
                phone: u.phone,
                avatar: u.avatar,
                status: u.status,
                role: u.role,
                dateOfBirth: u.dateOfBirth,
                gender: u.gender,
                createdAt: u.createdAt
            }));

            return ResponseHelper.success(res, mappedList, "Lấy danh sách thành viên thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async updateRole(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const { roleName } = req.body;

            const { saved, oldData } = await userService.updateRole(id, roleName);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ THÀNH VIÊN",
                action: "CẬP NHẬT VAI TRÒ",
                description: `Cập nhật vai trò người dùng thành công: ${saved.email} sang ${roleName}`,
                oldData,
                newData: { email: saved.email, role: roleName }
            });

            return ResponseHelper.success(res, {
                id: saved.id,
                email: saved.email,
                fullName: saved.fullName,
                role: roleName,
                status: saved.status
            }, "Cập nhật vai trò thành viên thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }

    async toggleStatus(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const { status } = req.body;

            const { saved, oldData } = await userService.toggleStatus(id, status);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ THÀNH VIÊN",
                action: "CẬP NHẬT TRẠNG THÁI",
                description: `Thay đổi trạng thái tài khoản thành công: ${saved.email} sang ${status}`,
                oldData,
                newData: { email: saved.email, status }
            });

            return ResponseHelper.success(res, {
                id: saved.id,
                email: saved.email,
                fullName: saved.fullName,
                role: saved.role,
                status: saved.status
            }, "Cập nhật trạng thái thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const userController = new UserController();
