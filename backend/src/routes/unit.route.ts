import { Router } from "express";
import { unitController } from "../controllers/unit.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", unitController.getAll.bind(unitController));
router.get("/trash", requireRole(["ADMIN", "MANAGER"]), unitController.getTrash.bind(unitController));
router.post("/", unitController.create.bind(unitController));
router.post("/:id/restore", requireRole(["ADMIN", "MANAGER"]), unitController.restore.bind(unitController));
router.put("/:id", unitController.update.bind(unitController));
router.delete("/:id", unitController.delete.bind(unitController));

export default router;
