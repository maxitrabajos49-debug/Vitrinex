// src/schemas/auth.schema.js
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string({ required_error: "El email es obligatorio" })
           .email("Email inválido"),
  password: z.string({ required_error: "La contraseña es obligatoria" })
             .min(6, "Mínimo 6 caracteres"),
});
