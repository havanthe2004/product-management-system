import { Router } from "express";
import { commodityTypeController } from "../controllers/commodity-type.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", commodityTypeController.getAll.bind(commodityTypeController));
router.post("/", commodityTypeController.create.bind(commodityTypeController));
router.put("/:id", commodityTypeController.update.bind(commodityTypeController));
router.delete("/:id", commodityTypeController.delete.bind(commodityTypeController));

export default router;
