import { AppDataSource } from "./data-source";
import { User } from "../entities/user.entity";
import { UserRole } from "../common/enums/user-role.enum";
import bcrypt from "bcrypt";

export async function seedAdmin(): Promise<void> {
    try {
        const userRepository = AppDataSource.getRepository(User);

        // Check if admin user already exists (by username)
        const adminUsername = process.env.ADMIN_USERNAME || "admin";
        const existingAdmin = await userRepository.findOne({
            where: { username: adminUsername }
        });

        if (existingAdmin) {
            console.log("ℹ️ Tài khoản ADMIN mặc định đã tồn tại.");
            return;
        }

        // Create default ADMIN account
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = new User();
        admin.username = adminUsername;
        admin.password = hashedPassword;
        admin.fullName = "System Administrator";
        admin.email = "admin@example.com";
        admin.role = UserRole.ADMIN;
        admin.isActive = true;

        await userRepository.save(admin);
        console.log(`👑 Tài khoản ADMIN mặc định đã được tạo thành công!`);
        console.log(`   Tên đăng nhập: ${adminUsername}`);
        console.log(`   Mật khẩu: ${adminPassword}`);
    } catch (error) {
        console.error("❌ Lỗi khi khởi tạo tài khoản ADMIN mặc định:", error);
    }
}
