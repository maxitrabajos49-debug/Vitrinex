import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(3, "Nombre de usuario demasiado corto").optional(),
  email: z.string().email("Correo inválido").optional(),
  rut: z
    .string()
    .regex(/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/, "RUT inválido")
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{8,15}$/, "Teléfono inválido")
    .optional(),
  address: z.string().max(150).optional(),
  bio: z.string().max(300).optional(),
});
