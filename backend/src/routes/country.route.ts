import { Router } from "express";
import { countryController } from "../controllers/country.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware as any);

router.get("/", countryController.getAll.bind(countryController));
router.post("/", countryController.create.bind(countryController));
router.put("/:id", countryController.update.bind(countryController));
router.delete("/:id", countryController.delete.bind(countryController));

export default router;
