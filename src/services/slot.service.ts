import { StatusCodes } from "http-status-codes";
import * as SlotModel from "@models/slot.model";
import ErrorHandler from "@utils/errorhandler";
import { SlotRow } from "@models/slot.model";

export type SlotDto = SlotRow;

export async function createSlot(subject: string): Promise<SlotDto> {
  const existing = await SlotModel.findBySubject(subject);
  if (existing) throw new ErrorHandler(`Slot for subject "${subject}" already exists`, StatusCodes.CONFLICT);
  return SlotModel.create(subject);
}

export async function listSlots(): Promise<SlotDto[]> {
  return SlotModel.listAll();
}

export async function deleteSlot(id: number): Promise<void> {
  const deleted = await SlotModel.remove(id);
  if (!deleted) throw new ErrorHandler("Slot not found", StatusCodes.NOT_FOUND);
}
