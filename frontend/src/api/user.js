// frontend/src/api/user.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Obtener perfil
export const getProfile = () => client.get("/auth/profile");

// Actualizar perfil (username, email, bio, avatarUrl si quieres seguir usando URL)
export const updateProfile = (payload) =>
  client.put("/auth/profile", payload);

// 🔹 NUEVO: subir avatar (file)
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return client.post("/upload/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
