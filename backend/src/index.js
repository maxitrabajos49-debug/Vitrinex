// src/index.js
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import storeRoutes from "./routes/store.routes.js";

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/stores", storeRoutes);

(async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI no está definido en el .env");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB conectado a Atlas");

    app.listen(PORT, () => {
      console.log(`✅ API escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err.message || err);
    process.exit(1);
  }
})();

process.on("unhandledRejection", (e) => {
  console.error("UNHANDLED REJECTION:", e);
});
process.on("uncaughtException", (e) => {
  console.error("UNCAUGHT EXCEPTION:", e);
});
