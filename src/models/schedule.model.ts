import { query } from "@config/db";

export interface ScheduleRow {
  id: number;
  content_id: number;
  slot_id: number;
  rotation_order: number;
  duration_minutes: number;
  created_at: Date;
}

export interface ScheduleWithContentRow extends ScheduleRow {
  title: string;
  subject: string;
  file_path: string;
  file_type: string;
  status: string;
  start_time: Date | null;
  end_time: Date | null;
  rotation_duration_minutes: number | null;
}

export async function assign(contentId: number, slotId: number, rotationOrder: number, durationMinutes: number): Promise<ScheduleRow> {
  const result = await query<ScheduleRow>(
    `INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration_minutes)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (content_id) DO UPDATE
       SET slot_id = EXCLUDED.slot_id,
           rotation_order = EXCLUDED.rotation_order,
           duration_minutes = EXCLUDED.duration_minutes
     RETURNING *`,
    [contentId, slotId, rotationOrder, durationMinutes],
  );
  return result.rows[0];
}

export async function removeByContentId(contentId: number): Promise<boolean> {
  const result = await query(`DELETE FROM content_schedule WHERE content_id = $1`, [contentId]);
  return (result.rowCount ?? 0) > 0;
}

export async function listBySlot(slotId: number): Promise<ScheduleWithContentRow[]> {
  const result = await query<ScheduleWithContentRow>(
    `SELECT cs.*, c.title, c.subject, c.file_path, c.file_type, c.status,
            c.start_time, c.end_time, c.rotation_duration_minutes
     FROM content_schedule cs
     JOIN content c ON c.id = cs.content_id
     WHERE cs.slot_id = $1
     ORDER BY cs.rotation_order ASC`,
    [slotId],
  );
  return result.rows;
}

export async function listActiveNow(): Promise<ScheduleWithContentRow[]> {
  const result = await query<ScheduleWithContentRow>(
    `SELECT cs.*, c.title, c.subject, c.file_path, c.file_type, c.status,
            c.start_time, c.end_time, c.rotation_duration_minutes
     FROM content_schedule cs
     JOIN content c ON c.id = cs.content_id
     WHERE c.status = 'approved'
       AND c.start_time IS NOT NULL
       AND c.end_time IS NOT NULL
       AND c.start_time <= NOW()
       AND c.end_time >= NOW()
     ORDER BY cs.slot_id ASC, cs.rotation_order ASC`,
  );
  return result.rows;
}
