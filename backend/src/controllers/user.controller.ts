import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { ResponseHelper } from "../utils/response.helper";
import { AuditLogService } from "../services/audit-log.service";

export class UserController {
    private userRepository = AppDataSource.getRepository(User);
    private roleRepository = AppDataSource.getRepository(Role);

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const list = await this.userRepository.find({
                relations: { role: true },
                order: { createdAt: "DESC" }
            });
            
            // Map list to omit password
            const mappedList = list.map(u => ({
                id: u.id,
                fullName: u.fullName,
                email: u.email,
                phone: u.phone,
                avatar: u.avatar,
                status: u.status,
                role: u.role?.roleName || "OFFICER",
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
            const { roleName } = req.body; // "ADMIN" or "OFFICER"
            if (!roleName) {
                throw new Error("Tên vai trò là bắt buộc.");
            }

            const user = await this.userRepository.findOne({ where: { id }, relations: { role: true } });
            if (!user) {
                throw new Error("Không tìm thấy thành viên.");
            }

            const oldData = { email: user.email, role: user.role?.roleName };

            let role = await this.roleRepository.findOne({ where: { roleName } });
            if (!role) {
                role = new Role();
                role.roleName = roleName;
                role.description = `${roleName} role`;
                await this.roleRepository.save(role);
            }

            user.role = role;
            const saved = await this.userRepository.save(user);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ THÀNH VIÊN",
                action: "CẬP NHẬT VAI TRÒ",
                description: `Cập nhật vai trò người dùng thành công: ${user.email} sang ${roleName}`,
                oldData,
                newData: { email: user.email, role: roleName }
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
            const { status } = req.body; // "ACTIVE" or "LOCKED"

            const user = await this.userRepository.findOne({ where: { id }, relations: { role: true } });
            if (!user) {
                throw new Error("Không tìm thấy thành viên.");
            }

            const oldData = { email: user.email, status: user.status };

            user.status = status;
            const saved = await this.userRepository.save(user);

            // Audit log
            await AuditLogService.log(req, {
                module: "QUẢN LÝ THÀNH VIÊN",
                action: "CẬP NHẬT TRẠNG THÁI",
                description: `Thay đổi trạng thái tài khoản thành công: ${user.email} sang ${status}`,
                oldData,
                newData: { email: user.email, status }
            });

            return ResponseHelper.success(res, {
                id: saved.id,
                email: saved.email,
                fullName: saved.fullName,
                role: saved.role?.roleName || "OFFICER",
                status: saved.status
            }, "Cập nhật trạng thái thành công!");
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, null, 400);
        }
    }
}

export const userController = new UserController();
