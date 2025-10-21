// src/config.js
export const PORT = process.env.PORT ?? 3000;
export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/merndb";
export const JWT_SECRET = process.env.JWT_SECRET ?? "change-me";
export const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
