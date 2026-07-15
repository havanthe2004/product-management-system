import { Router } from "express";
import { commodityTypeController } from "../controllers/commodity-type.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", commodityTypeController.getAll.bind(commodityTypeController));
router.get("/trash", requireRole(["ADMIN", "MANAGER"]), commodityTypeController.getTrash.bind(commodityTypeController));
router.post("/", commodityTypeController.create.bind(commodityTypeController));
router.post("/:id/restore", requireRole(["ADMIN", "MANAGER"]), commodityTypeController.restore.bind(commodityTypeController));
router.put("/:id", commodityTypeController.update.bind(commodityTypeController));
router.delete("/:id", commodityTypeController.delete.bind(commodityTypeController));

export default router;
