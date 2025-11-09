// frontend/src/api/user.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Obtener perfil
export const getProfile = () => client.get("/auth/profile");

// Actualizar perfil
export const updateProfile = (payload) =>
  client.put("/auth/profile", payload);
