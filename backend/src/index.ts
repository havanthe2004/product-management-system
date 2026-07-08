import "reflect-metadata";
import dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./config/data-source";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Initialize database connection
AppDataSource.initialize()
    .then(() => {
        console.log("🚀 Database connected successfully!");
        
        // Start express server
        app.listen(PORT, () => {
            console.log(`📡 Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Error during Database initialization:", error);
        process.exit(1);
    });
