import { Router } from "express";
import { commodityController } from "../controllers/commodity.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", commodityController.getAll.bind(commodityController));
router.get("/trash", requireRole(["ADMIN", "MANAGER"]), commodityController.getTrash.bind(commodityController));
router.post("/", commodityController.create.bind(commodityController));
router.post("/:id/restore", requireRole(["ADMIN", "MANAGER"]), commodityController.restore.bind(commodityController));
router.put("/:id", commodityController.update.bind(commodityController));
router.delete("/:id", commodityController.delete.bind(commodityController));

export default router;
