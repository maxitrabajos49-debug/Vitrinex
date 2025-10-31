import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  description: z.string().optional(),
  done: z.boolean().optional(),
});
