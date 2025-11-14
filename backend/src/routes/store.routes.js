// backend/src/routes/store.routes.js
import { Router } from "express";
import { authRequired } from "../middlewares/authRequired.js";
import {
  // tiendas
  listPublicStores,
  getMyStore,
  saveMyStore,
  deleteMyStore,
  getStoreById,
  updateMyStore,

  // productos
  listStoreProductsPublic,
  listStoreProductsForOwner,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,

  // pedidos
  listStoreOrders,
  createStoreOrder,

  // agendamiento
  getStoreAvailability,
  updateStoreAvailability,
  listStoreAppointments,
  createAppointment,
  updateAppointmentStatus,
} from "../controllers/store.controller.js";

import {
  getProductInsightsForStore,
  getBookingInsightsForStore,
} from "../controllers/insights.controller.js";

const router = Router();

/**
 * 🔹 Tiendas públicas
 */
router.get("/public", listPublicStores);

/**
 * 🔹 Tiendas del usuario autenticado
 */
router.get("/my", authRequired, getMyStore);
router.post("/my", authRequired, saveMyStore);
router.put("/my", authRequired, saveMyStore);
router.delete("/my/:id", authRequired, deleteMyStore);

/**
 * 🔹 AGENDAMIENTO (tiendas modo "bookings")
 */
router.get("/:id/availability", getStoreAvailability);
router.put("/:id/availability", authRequired, updateStoreAvailability);

router.get("/:id/appointments", authRequired, listStoreAppointments);
router.post("/:id/appointments", createAppointment);

router.patch(
  "/:id/appointments/:bookingId/status",
  authRequired,
  updateAppointmentStatus
);

/**
 * 🔹 Productos
 */
router.get("/:id/public-products", listStoreProductsPublic);
router.get("/:id/products", authRequired, listStoreProductsForOwner);
router.post("/:id/products", authRequired, createStoreProduct);
router.put("/:id/products/:productId", authRequired, updateStoreProduct);
router.delete("/:id/products/:productId", authRequired, deleteStoreProduct);

/**
 * 🔹 Pedidos
 */
router.get("/:id/orders", authRequired, listStoreOrders);
router.post("/:id/orders", createStoreOrder);

/**
 * 🔹 INSIGHTS / ANÁLISIS INTELIGENTE
 */
router.get("/:id/insights/products", authRequired, getProductInsightsForStore);
router.get("/:id/insights/bookings", authRequired, getBookingInsightsForStore);

/**
 * 🔹 Detalle y actualización de tienda por ID
 */
router.put("/:id", authRequired, updateMyStore);
router.get("/:id", getStoreById);

export default router;
