// backend/src/routes/auth.routes.js
import { Router } from "express";
import multer from "multer";
import path from "path";

import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
} from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = Router();

// 📂 Storage para avatar de usuario
const storageAvatar = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const safeName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.\-]/g, "");
    cb(null, Date.now() + "-" + safeName.replace(ext, "") + ext);
  },
});

const uploadAvatar = multer({
  storage: storageAvatar,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Rutas de auth
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", authRequired, getProfile);
router.put("/profile", authRequired, updateProfile);

// 🔥 NUEVA ruta: subir avatar
router.post(
  "/avatar",
  authRequired,
  uploadAvatar.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    const baseUrl = process.env.PUBLIC_URL || "http://localhost:3000";
    const url = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    return res.json({ url });
  }
);

export default router;
