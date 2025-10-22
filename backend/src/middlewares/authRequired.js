// src/middlewares/authRequired.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export function authRequired(req, res, next) {
  const { token } = req.cookies || {};
  if (!token) return res.status(401).json({ message: "No autorizado" });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user; // { id: '...' }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
