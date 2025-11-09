// src/api/auth.js
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const registerRequest = (data) =>
  api.post("/auth/register", data);

export const loginRequest = (data) =>
  api.post("/auth/login", data);

export const logoutRequest = () =>
  api.post("/auth/logout");

export const profileRequest = () =>
  api.get("/auth/profile");

// Solo úsalo si creas la ruta /auth/verify en el backend
export const verifyRequest = () =>
  api.get("/auth/verify");
