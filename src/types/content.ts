export type ContentStatus = "pending" | "approved" | "rejected";

export interface ContentRow {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  status: ContentStatus;
  rejection_reason: string | null;
  approved_by: number | null;
  approved_at: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  rotation_duration_minutes: number | null;
  created_at: Date;
}

export interface ContentDto extends Omit<ContentRow, "file_path"> {
  file_path: string;
  file_url: string;
}
