// src/routes/store.routes.js
import { Router } from "express";
import { authRequired } from "../middlewares/authRequired.js"; // asumiendo que ya lo tienes
import { getMyStore, upsertMyStore } from "../controllers/store.controller.js";

const router = Router();

router.get("/me", authRequired, getMyStore);
router.post("/", authRequired, upsertMyStore);

export default router;
