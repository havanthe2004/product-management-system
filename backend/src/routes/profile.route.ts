import { Router } from "express";
import { profileController } from "../controllers/profile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Tất cả các tuyến đường liên quan đến hồ sơ cá nhân đều yêu cầu đăng nhập
router.use(authMiddleware as any);

router.get("/", profileController.getProfile.bind(profileController));
router.put("/", profileController.updateProfile.bind(profileController));
router.put("/change-password", profileController.changePassword.bind(profileController));

export default router;
