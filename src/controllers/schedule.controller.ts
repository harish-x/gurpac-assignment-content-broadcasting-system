import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as ScheduleService from "@services/schedule.service";
import catchAsyncError from "@middlewares/catchAsyncError";
import ErrorHandler from "@utils/errorhandler";
import { AssignScheduleInput } from "@validators/schedule.schema";

export const assign = catchAsyncError(async (req: Request, res: Response) => {
  const { content_id, slot_id, rotation_order, duration_minutes } = req.body as AssignScheduleInput;
  const entry = await ScheduleService.assign({
    contentId: content_id,
    slotId: slot_id,
    rotationOrder: rotation_order,
    durationMinutes: duration_minutes,
  });
  return res.status(StatusCodes.CREATED).json({ success: true, schedule: entry });
});

export const unassign = catchAsyncError(async (req: Request, res: Response) => {
  const contentId = Number(req.params.contentId);
  if (!Number.isInteger(contentId) || contentId <= 0) {
    throw new ErrorHandler("Invalid content id", StatusCodes.BAD_REQUEST);
  }
  await ScheduleService.unassign(contentId);
  return res.status(StatusCodes.OK).json({ success: true });
});

export const listBySlot = catchAsyncError(async (req: Request, res: Response) => {
  const slotId = Number(req.params.slotId);
  if (!Number.isInteger(slotId) || slotId <= 0) {
    throw new ErrorHandler("Invalid slot id", StatusCodes.BAD_REQUEST);
  }
  const result = await ScheduleService.listBySlot(slotId);
  return res.status(StatusCodes.OK).json({ success: true, ...result });
});

export const getActiveNow = catchAsyncError(async (_req: Request, res: Response) => {
  const bySlot = await ScheduleService.getActiveNow();
  return res.status(StatusCodes.OK).json({ success: true, activeContent: bySlot });
});
