import { Router } from "express";
import { countryController } from "../controllers/country.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", countryController.getAll.bind(countryController));
router.get("/trash", requireRole(["ADMIN", "MANAGER"]), countryController.getTrash.bind(countryController));
router.post("/", countryController.create.bind(countryController));
router.post("/:id/restore", requireRole(["ADMIN", "MANAGER"]), countryController.restore.bind(countryController));
router.put("/:id", countryController.update.bind(countryController));
router.delete("/:id", countryController.delete.bind(countryController));

export default router;
