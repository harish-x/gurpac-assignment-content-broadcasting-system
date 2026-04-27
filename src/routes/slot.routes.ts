import { Router } from "express";
import * as SlotController from "@controllers/slot.controller";
import { requireAuth, requireRole } from "@middlewares/auth";
import { csrfGuard } from "@middlewares/csrf";
import { validateBody } from "@middlewares/validate";
import { createSlotSchema } from "@validators/slot.schema";

const router = Router();

router.get("/", requireAuth, requireRole("principal"), SlotController.listSlots);

router.post("/", requireAuth, requireRole("principal"), csrfGuard, validateBody(createSlotSchema), SlotController.createSlot);

router.delete("/:id", requireAuth, requireRole("principal"), csrfGuard, SlotController.deleteSlot);

export default router;
