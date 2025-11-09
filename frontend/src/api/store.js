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

export const saveMyStore = (data) => client.post("/stores/my", data);

export const updateMyStore = (id, data) =>
  client.post("/stores/my", { ...data, _id: id });

// NUEVO: obtener tienda por ID
export const getStoreById = (id) => client.get(`/stores/${id}`);
