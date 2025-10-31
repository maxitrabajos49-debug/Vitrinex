import api from "./axios";

export const listTasks = () => api.get("/tasks");
export const createTask = (formData) =>
  api.post("/tasks", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const getTask = (id) => api.get(`/tasks/${id}`);
export const updateTask = (id, formData) =>
  api.put(`/tasks/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });

export const removeTask = (id) => api.delete(`/tasks/${id}`);
