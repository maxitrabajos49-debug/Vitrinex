// src/routes/store.routes.js
import { Router } from "express";
import { authRequired } from "../middlewares/authRequired.js";
import {
  listPublicStores,
  listMyStores,
  createMyStore,
  updateMyStore,
  deleteMyStore,
} from "../controllers/store.controller.js";

const router = Router();

// 🔹 Público: listado de negocios para el mapa
router.get("/", listPublicStores);

// 🔹 Privado: rutas del vendedor (requieren estar logueado)
router.get("/my", authRequired, listMyStores);
router.post("/my", authRequired, createMyStore);
router.put("/my/:id", authRequired, updateMyStore);
router.delete("/my/:id", authRequired, deleteMyStore);

export default router;
