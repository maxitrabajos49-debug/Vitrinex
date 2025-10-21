// src/app.js
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import { CLIENT_URL } from "./config.js";

const app = express();

app.use(cors({
  origin: CLIENT_URL,   // << debe coincidir con tu frontend
  credentials: true,    // << MUY IMPORTANTE para cookies
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// rutas
app.use("/api/auth", authRoutes);

// healthcheck opcional
app.get("/api/health", (_req, res) => res.json({ ok: true }));

export default app;
