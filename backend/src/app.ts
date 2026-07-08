import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get("/health", (req, res) => {
    res.json({
        status: "UP",
        timestamp: new Date(),
        message: "Máy chủ đang hoạt động ổn định"
    });
});

// Basic API route
app.get("/", (req, res) => {
    res.send("Chào mừng đến với API Hệ thống Quản lý Sản phẩm!");
});

export default app;
