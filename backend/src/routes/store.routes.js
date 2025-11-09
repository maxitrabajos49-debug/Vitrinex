// src/routes/store.routes.js
import { Router } from "express";
import {
  listPublicStores,
  getMyStore,
  saveMyStore,
  getStoreById,
} from "../controllers/store.controller.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = Router();

router.get("/", listPublicStores);
router.get("/my", authRequired, getMyStore);
router.post("/my", authRequired, saveMyStore);

// NUEVA RUTA PÚBLICA
router.get("/:id", getStoreById);

export default router;
