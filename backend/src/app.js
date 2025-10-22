import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import { CLIENT_URL } from "./config.js";

const app = express();

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/api/auth", authRoutes);

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

export default app;
