// src/routes/auth.routes.js
import { Router } from "express";
import { register, login, profile, logout } from "../controllers/auth.controllers.js";
import authRequired from "../middlewares/authRequired.js"; // <— sin llaves

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authRequired, profile);
router.post("/logout", logout);

export default router;
