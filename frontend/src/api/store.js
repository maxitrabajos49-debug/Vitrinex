// src/api/store.js
import api from "./axios";

export const getMyStore = () => api.get("/stores/me");

// Crea o actualiza la “tienda” del usuario autenticado (upsert en el backend)
export const saveMyStore = (payload) => api.post("/stores", payload);
/*
payload esperado:
{
  name: "Mi tienda",
  mode: "products" | "bookings",
  description?: "…",
  logoUrl?: "https://…"
}
*/
