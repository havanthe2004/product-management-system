import { Router } from "express";
import { commodityGroupController } from "../controllers/commodity-group.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", commodityGroupController.getAll.bind(commodityGroupController));
router.post("/", commodityGroupController.create.bind(commodityGroupController));
router.put("/:id", commodityGroupController.update.bind(commodityGroupController));
router.delete("/:id", commodityGroupController.delete.bind(commodityGroupController));

export default router;
