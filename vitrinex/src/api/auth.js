// src/api/auth.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// Opcional: si el backend responde 401, podrías redirigir:
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // window.location.assign("/login"); // o manejarlo en el contexto
    }
    return Promise.reject(err);
  }
);

export const registerRequest = (data) => api.post("/auth/register", data);
export const loginRequest    = (data) => api.post("/auth/login", data);
export const profileRequest  = ()    => api.get("/auth/profile");
export const logoutRequest   = ()    => api.post("/auth/logout");
