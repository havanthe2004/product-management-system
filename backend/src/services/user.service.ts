import { User } from "../entities/user.entity";
import { UserStatus } from "../common/enums/user-status.enum";
import { UserRole } from "../common/enums/user-role.enum";
import { CreateUserReqDto } from "../dto/user.req.dto";
import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcrypt";
import { Like } from "typeorm";

export class UserService {
    private userRepository = UserRepository;

    async create(dto: CreateUserReqDto): Promise<User> {
        if (!dto.email || !dto.password || !dto.fullName || !dto.idCardNumber || !dto.roleName) {
            throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc.");
        }

        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new Error("Email này đã được sử dụng.");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = new User();
        user.email = dto.email;
        user.password = hashedPassword;
        user.fullName = dto.fullName;
        user.idCardNumber = dto.idCardNumber;
        
        // Handle dateOfBirth mapping from dob or dateOfBirth
        const birthDateStr = dto.dateOfBirth || dto.dob;
        if (birthDateStr) {
            user.dateOfBirth = new Date(birthDateStr);
        }
        
        if (dto.gender) user.gender = dto.gender;
        if (dto.phone) user.phone = dto.phone;
        if (dto.avatar) user.avatar = dto.avatar;
        user.role = dto.roleName as UserRole;
        user.status = UserStatus.ACTIVE;

        return this.userRepository.save(user);
    }

    async getAll(filters?: { search?: string; status?: UserStatus; role?: UserRole }): Promise<User[]> {
        const where: any = {};
        if (filters) {
            if (filters.status) where.status = filters.status;
            if (filters.role) where.role = filters.role;

            if (filters.search) {
                const searchPattern = `%${filters.search}%`;
                return this.userRepository.find({
                    where: [
                        { ...where, fullName: Like(searchPattern) },
                        { ...where, email: Like(searchPattern) },
                        { ...where, phone: Like(searchPattern) },
                        { ...where, idCardNumber: Like(searchPattern) }
                    ],
                    order: { createdAt: "DESC" }
                });
            }
        }
        return this.userRepository.find({
            where,
            order: { createdAt: "DESC" }
        });
    }

    async updateRole(id: number, roleName: string): Promise<{ saved: User; oldData: { email: string; role?: UserRole } }> {
        if (!roleName) {
            throw new Error("Tên vai trò là bắt buộc.");
        }

        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error("Không tìm thấy thành viên.");
        }

        const oldData = { email: user.email, role: user.role };

        user.role = roleName as UserRole;
        const saved = await this.userRepository.save(user);

        return { saved, oldData };
    }

    async toggleStatus(id: number, status: UserStatus): Promise<{ saved: User; oldData: { email: string; status: UserStatus } }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error("Không tìm thấy thành viên.");
        }

        const oldData = { email: user.email, status: user.status };

        user.status = status;
        const saved = await this.userRepository.save(user);

        return { saved, oldData };
    }
}

export const userService = new UserService();
