import { StatusCodes } from "http-status-codes";
import * as ScheduleModel from "@models/schedule.model";
import * as ContentModel from "@models/content.model";
import * as SlotModel from "@models/slot.model";
import ErrorHandler from "@utils/errorhandler";
import { signedUrlFor } from "@utils/s3";

export interface AssignParams {
  contentId: number;
  slotId: number;
  rotationOrder: number;
  durationMinutes: number;
}

async function toScheduleDto(row: ScheduleModel.ScheduleWithContentRow) {
  return {
    ...row,
    file_url: await signedUrlFor(row.file_path),
  };
}

export async function assign(params: AssignParams) {
  const content = await ContentModel.findById(params.contentId);
  if (!content) throw new ErrorHandler("Content not found", StatusCodes.NOT_FOUND);
  if (content.status !== "approved") {
    throw new ErrorHandler("Only approved content can be scheduled", StatusCodes.BAD_REQUEST);
  }

  const slot = await SlotModel.findById(params.slotId);
  if (!slot) throw new ErrorHandler("Slot not found", StatusCodes.NOT_FOUND);

  return ScheduleModel.assign(params.contentId, params.slotId, params.rotationOrder, params.durationMinutes);
}

export async function unassign(contentId: number): Promise<void> {
  const removed = await ScheduleModel.removeByContentId(contentId);
  if (!removed) throw new ErrorHandler("Schedule entry not found", StatusCodes.NOT_FOUND);
}

export async function listBySlot(slotId: number) {
  const slot = await SlotModel.findById(slotId);
  if (!slot) throw new ErrorHandler("Slot not found", StatusCodes.NOT_FOUND);
  const rows = await ScheduleModel.listBySlot(slotId);
  return { slot, items: await Promise.all(rows.map(toScheduleDto)) };
}

export async function getActiveNow() {
  const rows = await ScheduleModel.listActiveNow();

  const bySlot = new Map<number, ScheduleModel.ScheduleWithContentRow[]>();
  for (const row of rows) {
    const items = bySlot.get(row.slot_id) ?? [];
    items.push(row);
    bySlot.set(row.slot_id, items);
  }
  const activeContent: Record<number, Awaited<ReturnType<typeof toScheduleDto>>> = {};
  for (const [slotId, items] of bySlot.entries()) {
    const totalMinutes = items.reduce((sum, item) => sum + item.duration_minutes, 0);
    const nowMinutes = Math.floor(Date.now() / 60000);
    let position = nowMinutes % totalMinutes;

    let active = items[items.length - 1];
    for (const item of items) {
      if (position < item.duration_minutes) {
        active = item;
        break;
      }
      position -= item.duration_minutes;
    }

    activeContent[slotId] = await toScheduleDto(active);
  }

  return activeContent;
}
