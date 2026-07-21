import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware as any);
router.use(requireRole(["ADMIN"]));

router.post("/", userController.create.bind(userController));
router.get("/", userController.getAll.bind(userController));
router.get("/:id", userController.getById.bind(userController));
router.put("/:id/role", userController.updateRole.bind(userController));
router.put("/:id/status", userController.toggleStatus.bind(userController));

export default router;
