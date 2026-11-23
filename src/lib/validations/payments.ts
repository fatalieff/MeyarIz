import { z } from "zod";

export const pauseSchema = z.object({
  studentId: z.string().uuid(),
  startsOn: z.string().date(),
  endsOn: z.string().optional(),
  kind: z.enum(["UNPAID", "COMPENSATED"]),
  reason: z.string().trim().min(3).max(500),
});

export type PauseInput = z.infer<typeof pauseSchema>;
