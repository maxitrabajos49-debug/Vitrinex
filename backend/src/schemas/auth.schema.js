// backend/src/schemas/auth.schema.js
import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(72, "Máximo 72 caracteres"), // límite seguro para bcrypt
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
