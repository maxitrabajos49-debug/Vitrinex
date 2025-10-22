// src/libs/jwt.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => (err ? reject(err) : resolve(token))
    );
  });
}
