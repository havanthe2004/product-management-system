import { Router } from "express";
import { qualityStandardController } from "../controllers/quality-standard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", qualityStandardController.getAll.bind(qualityStandardController));
router.post("/", qualityStandardController.create.bind(qualityStandardController));
router.put("/:id", qualityStandardController.update.bind(qualityStandardController));
router.delete("/:id", qualityStandardController.delete.bind(qualityStandardController));

export default router;
