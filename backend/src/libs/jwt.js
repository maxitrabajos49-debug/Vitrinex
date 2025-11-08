// src/libs/jwt.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";  // 👈 importa el secreto correcto

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,        // 👈 usa el secreto definido en config.js
      { expiresIn: "1d" },
      (err, token) => {
        if (err) return reject(err);
        resolve(token);
      }
    );
  });
}
