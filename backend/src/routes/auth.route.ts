import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router = Router();


// POST /api/auth/login
router.post("/login", authController.login.bind(authController));

// POST /api/auth/forgot-password
router.post("/forgot-password", authController.forgotPassword.bind(authController));

// POST /api/auth/reset-password
router.post("/reset-password", authController.resetPassword.bind(authController));

export default router;
