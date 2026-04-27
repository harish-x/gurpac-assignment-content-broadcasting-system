import { query } from "@config/db";

export interface SlotRow {
  id: number;
  subject: string;
  created_at: Date;
}

export async function create(subject: string): Promise<SlotRow> {
  const result = await query<SlotRow>(
    `INSERT INTO content_slots (subject) VALUES ($1) RETURNING *`,
    [subject.toLowerCase()],
  );
  return result.rows[0];
}

export async function findById(id: number): Promise<SlotRow | null> {
  const result = await query<SlotRow>(`SELECT * FROM content_slots WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ?? null;
}

export async function findBySubject(subject: string): Promise<SlotRow | null> {
  const result = await query<SlotRow>(`SELECT * FROM content_slots WHERE subject = $1 LIMIT 1`, [subject.toLowerCase()]);
  return result.rows[0] ?? null;
}

export async function listAll(): Promise<SlotRow[]> {
  const result = await query<SlotRow>(`SELECT * FROM content_slots ORDER BY subject ASC`);
  return result.rows;
}

export async function remove(id: number): Promise<boolean> {
  const result = await query(`DELETE FROM content_slots WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
