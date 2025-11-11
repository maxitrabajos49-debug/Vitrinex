// src/routes/upload.routes.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { authRequired } from "../middlewares/authRequired.js";
import User from "../models/user.model.js";
import Store from "../models/store.model.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegura directorios
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const baseUploadDir = path.join(__dirname, "..", "..", "uploads");
ensureDir(baseUploadDir);

function createStorage(subfolder) {
  const dir = path.join(baseUploadDir, subfolder);
  ensureDir(dir);

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${ext}`);
    },
  });
}

const avatarUpload = multer({ storage: createStorage("avatars") });
const storeLogoUpload = multer({ storage: createStorage("stores") });
// 👇 nuevo: carpeta para imágenes de productos
const productImageUpload = multer({ storage: createStorage("products") });

const getBaseUrl = () => process.env.API_PUBLIC_URL || "http://localhost:3000";

/**
 * Avatar de usuario
 */
router.post(
  "/avatar",
  authRequired,
  avatarUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No se recibió ningún archivo" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const baseUrl = getBaseUrl();
      const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

      user.avatarUrl = avatarUrl;
      await user.save();

      return res.json({ message: "Avatar actualizado", avatarUrl });
    } catch (err) {
      console.error("Error subiendo avatar:", err);
      return res
        .status(500)
        .json({ message: "Error al subir la imagen de perfil" });
    }
  }
);

/**
 * Logo de tienda
 */
router.post(
  "/store-logo",
  authRequired,
  storeLogoUpload.single("file"),
  async (req, res) => {
    try {
      const { storeId } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No se recibió ningún archivo" });
      }

      if (!storeId) {
        return res.status(400).json({ message: "Falta el storeId" });
      }

      const store = await Store.findOne({
        _id: storeId,
        owner: req.user.id,
      });

      if (!store) {
        return res.status(404).json({
          message: "Tienda no encontrada o no eres el dueño",
        });
      }

      const baseUrl = getBaseUrl();
      const logoUrl = `${baseUrl}/uploads/stores/${req.file.filename}`;

      store.logoUrl = logoUrl;
      await store.save();

      return res.json({ message: "Logo actualizado", logoUrl });
    } catch (err) {
      console.error("Error subiendo logo de tienda:", err);
      return res
        .status(500)
        .json({ message: "Error al subir el logo de la tienda" });
    }
  }
);

/**
 * Imagen de producto
 */
router.post(
  "/product-image",
  authRequired,
  productImageUpload.single("file"),
  async (req, res) => {
    try {
      const { storeId } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No se recibió ningún archivo" });
      }

      if (!storeId) {
        return res.status(400).json({ message: "Falta el storeId" });
      }

      const store = await Store.findOne({
        _id: storeId,
        owner: req.user.id,
      });

      if (!store) {
        return res.status(404).json({
          message: "Tienda no encontrada o no eres el dueño",
        });
      }

      const baseUrl = getBaseUrl();
      const imageUrl = `${baseUrl}/uploads/products/${req.file.filename}`;

      return res.json({
        message: "Imagen de producto subida",
        imageUrl,
      });
    } catch (err) {
      console.error("Error subiendo imagen de producto:", err);
      return res
        .status(500)
        .json({ message: "Error al subir la imagen de producto" });
    }
  }
);

export default router;
