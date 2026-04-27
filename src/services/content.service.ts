import { StatusCodes } from "http-status-codes";
import * as ContentModel from "@models/content.model";
import * as UserModel from "@models/user.model";
import { ALLOWED_MIME } from "@middlewares/upload";
import { buildContentKey, deleteObject, signedUrlFor, uploadBuffer } from "@utils/s3";
import ErrorHandler from "@utils/errorhandler";
import { ContentDto, ContentRow, ContentStatus } from "@src/types/content";

export async function toDto(row: ContentRow): Promise<ContentDto> {
  return {
    ...row,
    file_url: await signedUrlFor(row.file_path),
  };
}

export interface CreateContentParams {
  title: string;
  description?: string | null;
  subject: string;
  startTime?: Date | null;
  endTime?: Date | null;
  rotationDurationMinutes?: number | null;
  uploadedBy: number;
  file: Express.Multer.File;
}

export async function create(params: CreateContentParams): Promise<ContentDto> {
  if (!ALLOWED_MIME.has(params.file.mimetype)) {
    throw new ErrorHandler(`Unsupported file type: ${params.file.mimetype}`, StatusCodes.BAD_REQUEST);
  }
  const key = buildContentKey(params.file.mimetype);
  await uploadBuffer(key, params.file.buffer, params.file.mimetype);

  try {
    const row = await ContentModel.create({
      title: params.title,
      description: params.description ?? null,
      subject: params.subject.toLowerCase(),
      filePath: key,
      fileType: params.file.mimetype,
      fileSize: params.file.size,
      uploadedBy: params.uploadedBy,
      startTime: params.startTime ?? null,
      endTime: params.endTime ?? null,
      rotationDurationMinutes: params.rotationDurationMinutes ?? null,
    });
    return toDto(row);
  } catch (err) {
    deleteObject(key).catch((e) => console.error("Failed to clean up S3 object", key, e));
    throw err;
  }
}

export async function approveContent(id: number, approvedBy: number): Promise<ContentDto> {
  const row = await ContentModel.approve(id, approvedBy);
  if (!row) throw new ErrorHandler("Content not found", StatusCodes.NOT_FOUND);
  return toDto(row);
}

export async function rejectContent(id: number, rejectionReason: string): Promise<ContentDto> {
  const row = await ContentModel.reject(id, rejectionReason);
  if (!row) throw new ErrorHandler("Content not found", StatusCodes.NOT_FOUND);
  return toDto(row);
}

function pickByRotation(items: ContentRow[]): ContentRow {
  if (items.length === 1) return items[0];
  const totalMinutes = items.reduce((sum, item) => sum + (item.rotation_duration_minutes ?? 5), 0);
  const nowMinutes = Math.floor(Date.now() / 60000);
  let position = nowMinutes % totalMinutes;
  for (const item of items) {
    const duration = item.rotation_duration_minutes ?? 5;
    if (position < duration) return item;
    position -= duration;
  }
  return items[items.length - 1];
}

export async function getLiveForTeacher(teacherId: number) {
  const teacher = await UserModel.findById(teacherId);
  if (!teacher || teacher.role !== "teacher") {
    return { teacher: null, live: {} as Record<string, ContentDto> };
  }

  const rows = await ContentModel.listActiveForTeacher(teacherId);

  const bySubject = new Map<string, ContentRow[]>();
  for (const row of rows) {
    const items = bySubject.get(row.subject) ?? [];
    items.push(row);
    bySubject.set(row.subject, items);
  }

  const live: Record<string, ContentDto> = {};
  for (const [subject, items] of bySubject.entries()) {
    live[subject] = await toDto(pickByRotation(items));
  }

  return { teacher: { id: teacher.id, name: teacher.name }, live };
}

export interface ListParams {
  uploadedBy?: number;
  status?: ContentStatus;
  subject?: string;
  page: number;
  limit: number;
}

export async function list(params: ListParams) {
  const offset = (params.page - 1) * params.limit;
  const { rows, total } = await ContentModel.list({
    uploadedBy: params.uploadedBy,
    status: params.status,
    subject: params.subject,
    limit: params.limit,
    offset,
  });
  return {
    items: await Promise.all(rows.map(toDto)),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      pages: Math.max(1, Math.ceil(total / params.limit)),
    },
  };
}
