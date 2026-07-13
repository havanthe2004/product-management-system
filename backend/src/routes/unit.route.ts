import { Router } from "express";
import { unitController } from "../controllers/unit.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", unitController.getAll.bind(unitController));
router.post("/", unitController.create.bind(unitController));
router.put("/:id", unitController.update.bind(unitController));
router.delete("/:id", unitController.delete.bind(unitController));

export default router;
