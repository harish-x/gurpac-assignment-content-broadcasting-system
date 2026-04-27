import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as SlotService from "@services/slot.service";
import catchAsyncError from "@middlewares/catchAsyncError";
import ErrorHandler from "@utils/errorhandler";

export const createSlot = catchAsyncError(async (req: Request, res: Response) => {
  const { subject } = req.body as { subject: string };
  const slot = await SlotService.createSlot(subject);
  return res.status(StatusCodes.CREATED).json({ success: true, slot });
});

export const listSlots = catchAsyncError(async (_req: Request, res: Response) => {
  const slots = await SlotService.listSlots();
  return res.status(StatusCodes.OK).json({ success: true, slots });
});

export const deleteSlot = catchAsyncError(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorHandler("Invalid slot id", StatusCodes.BAD_REQUEST);
  }
  await SlotService.deleteSlot(id);
  return res.status(StatusCodes.OK).json({ success: true });
});
