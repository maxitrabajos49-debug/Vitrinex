import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string({
      required_error: "El título es obligatorio",
      invalid_type_error: "El título debe ser un texto",
    })
    .trim()
    .min(1, { message: "El título es obligatorio" }),

  description: z
    .string({
      required_error: "La descripción es obligatoria",
      invalid_type_error: "La descripción debe ser un texto",
    })
    .trim()
    .min(1, { message: "La descripción es obligatoria" }),
}).strict(); // opcional pero recomendable
