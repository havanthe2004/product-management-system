import "reflect-metadata";
import * as dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./config/data-source";
import { seedAdmin } from "./config/seed";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Initialize database connection
AppDataSource.initialize()
    .then(async () => {
        console.log("🚀 Kết nối cơ sở dữ liệu thành công!");
        
        // Seed default admin account
        await seedAdmin();
        
        // Start express server
        app.listen(PORT, () => {
            console.log(`📡 Máy chủ đang chạy tại http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Lỗi trong quá trình khởi tạo Cơ sở dữ liệu:", error);
        process.exit(1);
    });
