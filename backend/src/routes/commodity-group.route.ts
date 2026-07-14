import { Router } from "express";
import { commodityGroupController } from "../controllers/commodity-group.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", commodityGroupController.getAll.bind(commodityGroupController));
router.get("/trash", requireRole(["ADMIN", "MANAGER"]), commodityGroupController.getTrash.bind(commodityGroupController));
router.post("/", commodityGroupController.create.bind(commodityGroupController));
router.post("/:id/restore", requireRole(["ADMIN", "MANAGER"]), commodityGroupController.restore.bind(commodityGroupController));
router.put("/:id", commodityGroupController.update.bind(commodityGroupController));
router.delete("/:id", commodityGroupController.delete.bind(commodityGroupController));

export default router;
