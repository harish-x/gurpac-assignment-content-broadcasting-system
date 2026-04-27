import { query } from "@config/db";
import { ContentRow, ContentStatus } from "@src/types/content";

export interface CreateContentInput {
  title: string;
  description: string | null;
  subject: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
  startTime: Date | null;
  endTime: Date | null;
  rotationDurationMinutes: number | null;
}

export async function create(input: CreateContentInput): Promise<ContentRow> {
  const result = await query<ContentRow>(
    `INSERT INTO content
       (title, description, subject, file_path, file_type, file_size, uploaded_by,
        start_time, end_time, rotation_duration_minutes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      input.title,
      input.description,
      input.subject,
      input.filePath,
      input.fileType,
      input.fileSize,
      input.uploadedBy,
      input.startTime,
      input.endTime,
      input.rotationDurationMinutes,
    ],
  );
  return result.rows[0];
}

export async function findById(id: number): Promise<ContentRow | null> {
  const result = await query<ContentRow>(`SELECT * FROM content WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ?? null;
}

export async function approve(id: number, approvedBy: number): Promise<ContentRow | null> {
  const result = await query<ContentRow>(
    `UPDATE content
     SET status = 'approved', approved_by = $1, approved_at = NOW(), rejection_reason = NULL
     WHERE id = $2
     RETURNING *`,
    [approvedBy, id],
  );
  return result.rows[0] ?? null;
}

export async function reject(id: number, rejectionReason: string): Promise<ContentRow | null> {
  const result = await query<ContentRow>(
    `UPDATE content
     SET status = 'rejected', rejection_reason = $1, approved_by = NULL, approved_at = NULL
     WHERE id = $2
     RETURNING *`,
    [rejectionReason, id],
  );
  return result.rows[0] ?? null;
}

export interface ListFilters {
  uploadedBy?: number;
  status?: ContentStatus;
  subject?: string;
  limit: number;
  offset: number;
}

export interface ListResult {
  rows: ContentRow[];
  total: number;
}

export async function listActiveForTeacher(teacherId: number): Promise<ContentRow[]> {
  const result = await query<ContentRow>(
    `SELECT *
     FROM content
     WHERE uploaded_by = $1
       AND status = 'approved'
       AND start_time IS NOT NULL
       AND end_time IS NOT NULL
       AND start_time <= NOW()
       AND end_time >= NOW()
     ORDER BY subject ASC, id ASC`,
    [teacherId],
  );
  return result.rows;
}

export async function list(filters: ListFilters): Promise<ListResult> {
  const where: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];

  if (filters.uploadedBy !== undefined) {
    params.push(filters.uploadedBy);
    where.push(`uploaded_by = $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    where.push(`status = $${params.length}`);
  }
  if (filters.subject) {
    params.push(filters.subject.toLowerCase());
    where.push(`LOWER(subject) = $${params.length}`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM content ${whereSql}`, params);
  const total = Number(countResult.rows[0]?.count ?? 0);

  params.push(filters.limit);
  const limitIdx = params.length;
  params.push(filters.offset);
  const offsetIdx = params.length;

  const rowsResult = await query<ContentRow>(
    `SELECT * FROM content
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params,
  );

  return { rows: rowsResult.rows, total };
}
