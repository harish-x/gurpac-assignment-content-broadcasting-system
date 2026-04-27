import { z } from "zod";

export const createSlotSchema = z.object({
  subject: z.string().trim().min(1).max(80),
});

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
