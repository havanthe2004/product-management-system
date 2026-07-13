import { UserRepository } from "../repositories/user.repository";
import { User } from "../entities/user.entity";
import { UserStatus } from "../common/enums/user-status.enum";
import { UserRole } from "../common/enums/user-role.enum";
import bcrypt from "bcrypt";

export async function seedAdmin(): Promise<void> {
    try {
        const userRepository = UserRepository;

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
        admin.role = UserRole.ADMIN;
        admin.status = UserStatus.ACTIVE;
        admin.idCardNumber = "000000000000"; // default value for required field

        await userRepository.save(admin);
        console.log(`👑 Tài khoản ADMIN mặc định đã được tạo thành công!`);
        console.log(`   Email đăng nhập: ${admin.email}`);
        console.log(`   Mật khẩu: ${adminPassword}`);
    } catch (error) {
        console.error("❌ Lỗi khi khởi tạo tài khoản ADMIN mặc định:", error);
    }
}
