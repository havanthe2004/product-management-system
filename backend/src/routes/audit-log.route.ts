import { Router } from "express";
import { auditLogController } from "../controllers/audit-log.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware as any);
router.use(requireRole(["ADMIN"]));

router.get("/", auditLogController.getAll.bind(auditLogController));

export default router;
