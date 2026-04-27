import { Router } from "express";
import * as ScheduleController from "@controllers/schedule.controller";
import { requireAuth, requireRole } from "@middlewares/auth";
import { csrfGuard } from "@middlewares/csrf";
import { validateBody } from "@middlewares/validate";
import { assignScheduleSchema } from "@validators/schedule.schema";

const router = Router();

router.get("/active", ScheduleController.getActiveNow);

router.post("/", requireAuth, requireRole("principal"), csrfGuard, validateBody(assignScheduleSchema), ScheduleController.assign);

router.delete("/:contentId", requireAuth, requireRole("principal"), csrfGuard, ScheduleController.unassign);

router.get("/slot/:slotId", requireAuth, requireRole("principal"), ScheduleController.listBySlot);

export default router;
