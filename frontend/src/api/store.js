// src/api/store.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const listPublicStores = (filters = {}) =>
  client.get("/stores", { params: filters });

export const listMyStores = () => client.get("/stores/my");
export const getMyStores = () => listMyStores();
export const getMyStore = () => listMyStores();

export const saveMyStore = (data) => client.post("/stores/my", data);

export const updateMyStore = (id, data) =>
  client.post("/stores/my", { ...data, _id: id });

// NUEVO: obtener tienda por ID
export const getStoreById = (id) => client.get(`/stores/${id}`);

export const getStoreAvailability = (id) =>
  client.get(`/stores/${id}/availability`);

export const updateStoreAvailability = (id, availability) =>
  client.put(`/stores/${id}/availability`, { availability });

export const listStoreAppointments = (id) =>
  client.get(`/stores/${id}/appointments`);

export const createAppointment = (id, data) =>
  client.post(`/stores/${id}/appointments`, data);

export const listStoreProductsPublic = (id) =>
  client.get(`/stores/${id}/public-products`);

export const listStoreProducts = (id) => listStoreProductsPublic(id);

export const listStoreProductsForOwner = (id) =>
  client.get(`/stores/${id}/products/manage`);

export const createStoreProduct = (id, data) =>
  client.post(`/stores/${id}/products`, data);

export const updateStoreProduct = (id, productId, data) =>
  client.put(`/stores/${id}/products/${productId}`, data);

export const deleteStoreProduct = (id, productId) =>
  client.delete(`/stores/${id}/products/${productId}`);

export const createStoreOrder = (id, data) =>
  client.post(`/stores/${id}/orders`, data);

export const listStoreOrders = (id) =>
  client.get(`/stores/${id}/orders/manage`);
