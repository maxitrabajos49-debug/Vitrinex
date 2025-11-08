// src/middlewares/authRequired.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export function authRequired(req, res, next) {
  const { token } = req.cookies || {};

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET); // 👈 misma clave que para firmar
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
