import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { warning } from "@utils/logger";
import * as ContentService from "@services/content.service";
import catchAsyncError from "@middlewares/catchAsyncError";
import ErrorHandler from "@utils/errorhandler";
import { ListMineQuery, ListAllQuery, RejectContentInput } from "@validators/content.schema";

export const upload = catchAsyncError(async (req: Request, res: Response) => {
  if (!req.file) {
    warning("Upload attempt without file");
    throw new ErrorHandler("File is required", StatusCodes.BAD_REQUEST);
  }
  const { title, description, subject, start_time, end_time, rotation_duration_minutes } = req.body;
  warning(`Upload attempt: "${title}" by user ${req.user?.sub}`);
  const dto = await ContentService.create({
    title,
    description,
    subject,
    startTime: start_time ?? null,
    endTime: end_time ?? null,
    rotationDurationMinutes: rotation_duration_minutes ?? null,
    uploadedBy: req.user!.sub,
    file: req.file,
  });
  return res.status(StatusCodes.CREATED).json({ success: true, content: dto });
});

export const listMine = catchAsyncError(async (req: Request, res: Response) => {
  const q = (req as unknown as { validatedQuery: ListMineQuery }).validatedQuery;
  const result = await ContentService.list({
    uploadedBy: req.user!.sub,
    status: q.status,
    subject: q.subject,
    page: q.page,
    limit: q.limit,
  });
  return res.status(StatusCodes.OK).json({ success: true, ...result });
});

export const listAll = catchAsyncError(async (req: Request, res: Response) => {
  const q = (req as unknown as { validatedQuery: ListAllQuery }).validatedQuery;
  const result = await ContentService.list({
    uploadedBy: q.uploaded_by,
    status: q.status,
    subject: q.subject,
    page: q.page,
    limit: q.limit,
  });
  return res.status(StatusCodes.OK).json({ success: true, ...result });
});

export const approveContent = catchAsyncError(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorHandler("Invalid content id", StatusCodes.BAD_REQUEST);
  }
  const dto = await ContentService.approveContent(id, req.user!.sub);
  return res.status(StatusCodes.OK).json({ success: true, content: dto });
});

export const rejectContent = catchAsyncError(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorHandler("Invalid content id", StatusCodes.BAD_REQUEST);
  }
  const { rejection_reason } = req.body as RejectContentInput;
  const dto = await ContentService.rejectContent(id, rejection_reason);
  return res.status(StatusCodes.OK).json({ success: true, content: dto });
});

export const getLive = catchAsyncError(async (req: Request, res: Response) => {
  const teacherId = Number(req.params.teacherId);
  if (!Number.isInteger(teacherId) || teacherId <= 0) {
    return res.status(StatusCodes.OK).json({ success: true, message: "No content available", live: {} });
  }

  const { teacher, live } = await ContentService.getLiveForTeacher(teacherId);
  const hasContent = Object.keys(live).length > 0;

  return res.status(StatusCodes.OK).json({
    success: true,
    ...(hasContent ? {} : { message: "No content available" }),
    ...(teacher ? { teacher } : {}),
    live,
  });
});
