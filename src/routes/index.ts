import { Router } from "express";
import authRoutes from "./auth.routes";
import contentRoutes from "./content.routes";
import slotRoutes from "./slot.routes";
import scheduleRoutes from "./schedule.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/content", contentRoutes);
router.use("/slots", slotRoutes);
router.use("/schedule", scheduleRoutes);

export default router;
