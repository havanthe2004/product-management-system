import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/stats", dashboardController.getStats.bind(dashboardController));

export default router;
