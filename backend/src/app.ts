import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRouter from "./routes/auth.route";
import commodityGroupRouter from "./routes/commodity-group.route";
import commodityTypeRouter from "./routes/commodity-type.route";
import countryRouter from "./routes/country.route";
import qualityStandardRouter from "./routes/quality-standard.route";
import unitRouter from "./routes/unit.route";
import userRouter from "./routes/user.route";
import auditLogRouter from "./routes/audit-log.route";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/commodity-groups", commodityGroupRouter);
app.use("/api/commodity-types", commodityTypeRouter);
app.use("/api/countries", countryRouter);
app.use("/api/quality-standards", qualityStandardRouter);
app.use("/api/units", unitRouter);
app.use("/api/users", userRouter);
app.use("/api/audit-logs", auditLogRouter);

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
