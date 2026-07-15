import { Router } from "express";
import { qualityStandardController } from "../controllers/quality-standard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", qualityStandardController.getAll.bind(qualityStandardController));
router.get("/trash", requireRole(["ADMIN", "MANAGER"]), qualityStandardController.getTrash.bind(qualityStandardController));
router.post("/", qualityStandardController.create.bind(qualityStandardController));
router.post("/:id/restore", requireRole(["ADMIN", "MANAGER"]), qualityStandardController.restore.bind(qualityStandardController));
router.put("/:id", qualityStandardController.update.bind(qualityStandardController));
router.delete("/:id", qualityStandardController.delete.bind(qualityStandardController));

export default router;
