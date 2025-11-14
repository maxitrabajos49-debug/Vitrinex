// src/middlewares/authRequired.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

// Versión real del middleware
export function authRequired(req, res, next) {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // acá guardamos el usuario dentro del request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error en authRequired:", err);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

// Export default para los archivos que lo importan sin llaves
export default authRequired;
