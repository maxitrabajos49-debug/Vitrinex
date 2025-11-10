// src/routes/store.routes.js
import { Router } from "express";
import {
  listPublicStores,
  getMyStore,
  saveMyStore,
  getStoreById,
  getStoreAvailability,
  updateStoreAvailability,
  listStoreAppointments,
  createAppointment,
  listStoreProductsForOwner,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  listStoreOrders,
  createStoreOrder,
  listStoreProductsPublic,
  updateAppointmentStatus,
} from "../controllers/store.controller.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = Router();

// 🔹 Tiendas públicas
router.get("/public", listPublicStores);   // <-- usado por frontend (/stores/public)
router.get("/", listPublicStores);        // opcional, por compatibilidad

// 🔹 Mis tiendas
router.get("/my", authRequired, getMyStore);
router.post("/my", authRequired, saveMyStore);

// 🔹 Disponibilidad / agendamiento
router.get("/:id/availability", getStoreAvailability);
router.put("/:id/availability", authRequired, updateStoreAvailability);

router.get("/:id/appointments", authRequired, listStoreAppointments);
router.post("/:id/appointments", createAppointment);

// 🔹 Productos públicos (vista cliente)
router.get("/:id/public-products", listStoreProductsPublic);

// 🔹 Cambiar estado de una cita
router.patch(
  "/:id/appointments/:bookingId/status",
  authRequired,
  updateAppointmentStatus
);

// 🔹 Productos (dueño)
router.get("/:id/products", authRequired, listStoreProductsForOwner);
router.post("/:id/products", authRequired, createStoreProduct);
router.put("/:id/products/:productId", authRequired, updateStoreProduct);
router.delete("/:id/products/:productId", authRequired, deleteStoreProduct);

// 🔹 Pedidos

// lo que usa el frontend para listar pedidos del dueño
router.get("/:id/orders", authRequired, listStoreOrders);

// si quieres, puedes dejar este alias extra para compatibilidad:
router.get("/:id/orders/manage", authRequired, listStoreOrders);

// crear pedido (lo usan los clientes desde la página pública)
router.post("/:id/orders", createStoreOrder);


// 🔹 Obtener tienda por id
router.get("/:id", getStoreById);

export default router;
