// backend/src/routes/auth.routes.js
import { Router } from "express";
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getPublicProfile,
} from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = Router();

// Rutas de autenticación
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Perfil privado (usuario logueado)
router.get("/profile", authRequired, getProfile);
router.put("/profile", authRequired, updateProfile);

// Perfil público de un usuario por ID (sin auth)
// 👉 Esto es lo que está usando CustomerPublicPage: /api/auth/users/:id
router.get("/users/:id", getPublicProfile);

export default router;
