// frontend/src/api/store.js
import axios from "axios";

// Puedes ajustar la URL si tu backend corre en otro puerto
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

/**
 * 🔹 TIENDAS PÚBLICAS (explorar / mapa)
 */
export const listPublicStores = async (params = {}) => {
  const res = await api.get("/stores/public", { params });
  return res; // <-- devolvemos el response completo
};

export const getStoreById = async (id) => {
  const res = await api.get(`/stores/${id}`);
  return res;
};

/**
 * 🔹 MIS TIENDAS (dueño)
 * OnboardingPage.jsx espera listMyStores 👇
 */
export const listMyStores = async () => {
  const res = await api.get("/stores/my");
  return res;
};

// Crear o actualizar una tienda del usuario logueado
export const saveMyStore = async (payload) => {
  const res = await api.post("/stores/my", payload);
  return res;
};

// 🔹 NUEVA: actualizar tienda existente usando el mismo endpoint
export const updateMyStore = async (id, payload) => {
  const res = await api.post("/stores/my", { ...payload, _id: id });
  return res;
};

/**
 * 🔹 AGENDAMIENTO (tiendas modo "bookings")
 */
export const getStoreAvailability = async (id) => {
  const res = await api.get(`/stores/${id}/availability`);
  return res;
};

export const updateStoreAvailability = async (id, availability) => {
  const res = await api.put(`/stores/${id}/availability`, {
    availability,
  });
  return res;
};

export const listStoreAppointments = async (id) => {
  const res = await api.get(`/stores/${id}/appointments`);
  return res;
};

export const createAppointment = async (id, payload) => {
  const res = await api.post(`/stores/${id}/appointments`, payload);
  return res;
};

export const updateAppointmentStatus = async (id, bookingId, status) => {
  const res = await api.patch(
    `/stores/${id}/appointments/${bookingId}/status`,
    { status }
  );
  return res;
};

/**
 * 🔹 PRODUCTOS (tiendas modo "products")
 *  - catálogo público (cliente)
 *  - administración (dueño)
 */

// Catálogo que ve el cliente
export const listStoreProductsPublic = async (id) => {
  const res = await api.get(`/stores/${id}/public-products`);
  return res;
};

// Compatibilidad con código antiguo: algunos componentes usan listStoreProducts
export const listStoreProducts = listStoreProductsPublic;

// Lista de productos para el dueño
export const listStoreProductsForOwner = async (id) => {
  const res = await api.get(`/stores/${id}/products`);
  return res;
};

export const createStoreProduct = async (id, payload) => {
  const res = await api.post(`/stores/${id}/products`, payload);
  return res;
};

export const updateStoreProduct = async (id, productId, payload) => {
  const res = await api.put(`/stores/${id}/products/${productId}`, payload);
  return res;
};

export const deleteStoreProduct = async (id, productId) => {
  const res = await api.delete(`/stores/${id}/products/${productId}`);
  return res;
};

/**
 * 🔹 PEDIDOS (para tiendas de productos)
 */
export const listStoreOrders = async (id) => {
  const res = await api.get(`/stores/${id}/orders`);
  return res;
};

export const createStoreOrder = async (id, payload) => {
  const res = await api.post(`/stores/${id}/orders`, payload);
  return res;
};

// Por si en algún sitio importas el cliente axios por defecto
export default api;
