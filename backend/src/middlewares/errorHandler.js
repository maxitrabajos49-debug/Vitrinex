// src/middlewares/errorHandler.js
export const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ message: 'Error inesperado del servidor' });
};
