import { z } from "zod";

const isoDate = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime())
  .transform((s) => new Date(s));

export const createContentSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional().nullable(),
    subject: z.string().trim().min(1).max(80).transform((s) => s.toLowerCase()),
    start_time: isoDate.optional(),
    end_time: isoDate.optional(),
    rotation_duration_minutes: z
      .union([z.string(), z.number()])
      .transform((v) => Number(v))
      .pipe(z.number().int().min(1).max(24 * 60))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.start_time && data.end_time && data.start_time >= data.end_time) {
      ctx.addIssue({
        code: "custom",
        path: ["end_time"],
        message: "end_time must be after start_time",
      });
    }
  });

export const listMineQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  subject: z.string().trim().min(1).max(80).optional(),
  page: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .pipe(z.number().int().min(1))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .pipe(z.number().int().min(1).max(100))
    .default(20),
});

export const approveContentSchema = z.object({});

export const rejectContentSchema = z.object({
  rejection_reason: z.string().trim().min(1).max(500),
});

export const listAllQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  subject: z.string().trim().min(1).max(80).optional(),
  uploaded_by: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .pipe(z.number().int().positive())
    .optional(),
  page: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .pipe(z.number().int().min(1))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .pipe(z.number().int().min(1).max(100))
    .default(20),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type ListMineQuery = z.infer<typeof listMineQuerySchema>;
export type ListAllQuery = z.infer<typeof listAllQuerySchema>;
export type RejectContentInput = z.infer<typeof rejectContentSchema>;
