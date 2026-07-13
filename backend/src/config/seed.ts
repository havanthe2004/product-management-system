import { UserRepository } from "../repositories/user.repository";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { UserStatus } from "../common/enums/user-status.enum";
import { AppDataSource } from "./data-source";
import bcrypt from "bcrypt";

export async function seedAdmin(): Promise<void> {
    try {
        const userRepository = UserRepository;
        const roleRepository = AppDataSource.getRepository(Role);

        // 1. Ensure ADMIN and OFFICER roles exist
        let adminRole = await roleRepository.findOne({ where: { roleName: "ADMIN" } });
        if (!adminRole) {
            adminRole = new Role();
            adminRole.roleName = "ADMIN";
            adminRole.description = "System Administrator role with full privileges";
            await roleRepository.save(adminRole);
        }

        let officerRole = await roleRepository.findOne({ where: { roleName: "OFFICER" } });
        if (!officerRole) {
            officerRole = new Role();
            officerRole.roleName = "OFFICER";
            officerRole.description = "Officer role with standard privileges";
            await roleRepository.save(officerRole);
        }

        // Check if admin user already exists (by email)
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            throw new Error("ADMIN_EMAIL chưa được cấu hình");
        }
        const existingAdmin = await userRepository.findByEmail(adminEmail);

        if (existingAdmin) {
            console.log("Tài khoản ADMIN mặc định đã tồn tại.");
            return;
        }

        // Create default ADMIN account
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
            throw new Error("ADMIN_PASSWORD không được cấu hình");
        }
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = new User();
        admin.password = hashedPassword;
        admin.fullName = "System Administrator";
        admin.email = adminEmail;
        admin.role = adminRole;
        admin.status = UserStatus.ACTIVE;

        await userRepository.save(admin);
        console.log(`👑 Tài khoản ADMIN mặc định đã được tạo thành công!`);
        console.log(`   Email đăng nhập: ${admin.email}`);
        console.log(`   Mật khẩu: ${adminPassword}`);
    } catch (error) {
        console.error("❌ Lỗi khi khởi tạo tài khoản ADMIN mặc định:", error);
    }
}
