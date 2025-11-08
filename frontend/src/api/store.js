// src/api/store.js
import api from "./axios";

// 🔹 público: listado de negocios con filtros (para el mapa / home)
export const listPublicStores = (params = {}) =>
  api.get("/stores", { params });

// 🔹 privado: lista mis tiendas (vendedor)
export const listMyStores = () => api.get("/stores/my");

// 🔹 privado: crea una tienda nueva
export const saveMyStore = (payload) => api.post("/stores/my", payload);

// 🔹 privado: actualiza una tienda existente
export const updateMyStore = (id, payload) =>
  api.put(`/stores/my/${id}`, payload);
