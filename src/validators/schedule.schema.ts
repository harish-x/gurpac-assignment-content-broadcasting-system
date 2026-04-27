import { z } from "zod";

export const assignScheduleSchema = z.object({
  content_id: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .pipe(z.number().int().positive()),
  slot_id: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .pipe(z.number().int().positive()),
  rotation_order: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .pipe(z.number().int().min(0))
    .default(0),
  duration_minutes: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .pipe(z.number().int().min(1).max(24 * 60))
    .default(5),
});

export type AssignScheduleInput = z.infer<typeof assignScheduleSchema>;
