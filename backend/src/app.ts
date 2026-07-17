import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRouter from "./routes/auth.route";
import profileRouter from "./routes/profile.route";
import commodityGroupRouter from "./routes/commodity-group.route";
import commodityTypeRouter from "./routes/commodity-type.route";
import countryRouter from "./routes/country.route";
import qualityStandardRouter from "./routes/quality-standard.route";
import unitRouter from "./routes/unit.route";
import userRouter from "./routes/user.route";
import auditLogRouter from "./routes/audit-log.route";
import commodityRouter from "./routes/commodity.route";
import dashboardRouter from "./routes/dashboard.route";

const app = express();

// Middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve Static Files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/commodity-groups", commodityGroupRouter);
app.use("/api/commodity-types", commodityTypeRouter);
app.use("/api/countries", countryRouter);
app.use("/api/quality-standards", qualityStandardRouter);
app.use("/api/units", unitRouter);
app.use("/api/users", userRouter);
app.use("/api/audit-logs", auditLogRouter);
app.use("/api/commodities", commodityRouter);
app.use("/api/dashboard", dashboardRouter);

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
