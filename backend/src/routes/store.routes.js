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

  // productos
  listStoreProductsPublic,
  listStoreProductsForOwner,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,

  // pedidos
  listStoreOrders,
  createStoreOrder,

  // agendamiento (bookings)
  getStoreAvailability,
  updateStoreAvailability,
  listStoreAppointments,
  createAppointment,
  updateAppointmentStatus,
} from "../controllers/store.controller.js";

const router = Router();

/**
 * 🔹 Tiendas públicas
 *  - GET /api/stores/public       → listado para el mapa / exploración
 *  - GET /api/stores/:id          → detalle público de tienda
 *
 *  👀 IMPORTANTE:
 *  La ruta "/public" va ANTES que "/:id" para que "public" no se trate como un id.
 */
router.get("/public", listPublicStores);

/**
 * 🔹 Tiendas del usuario autenticado
 *  - GET    /api/stores/my        → listar mis tiendas
 *  - POST   /api/stores/my        → crear / actualizar tienda (usa body._id)
 *  - PUT    /api/stores/my        → idem (por compatibilidad con el front)
 *  - DELETE /api/stores/my/:id    → marcar tienda como eliminada
 */
router.get("/my", authRequired, getMyStore);
router.post("/my", authRequired, saveMyStore);
router.put("/my", authRequired, saveMyStore);
router.delete("/my/:id", authRequired, deleteMyStore);

/**
 * 🔹 AGENDAMIENTO (tiendas modo "bookings")
 *
 *  - GET    /api/stores/:id/availability              → ver disponibilidad pública
 *  - PUT    /api/stores/:id/availability              → guardar disponibilidad (dueño)
 *  - GET    /api/stores/:id/appointments              → listar citas (dueño)
 *  - POST   /api/stores/:id/appointments              → crear cita (cliente)
 *  - PATCH  /api/stores/:id/appointments/:bookingId…  → cambiar estado de cita (dueño)
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
 *  - GET    /api/stores/:id/public-products      → catálogo público
 *  - GET    /api/stores/:id/products            → productos del dueño
 *  - POST   /api/stores/:id/products            → crear producto
 *  - PUT    /api/stores/:id/products/:productId → actualizar producto
 *  - DELETE /api/stores/:id/products/:productId → eliminar producto
 */
router.get("/:id/public-products", listStoreProductsPublic);
router.get("/:id/products", authRequired, listStoreProductsForOwner);
router.post("/:id/products", authRequired, createStoreProduct);
router.put("/:id/products/:productId", authRequired, updateStoreProduct);
router.delete("/:id/products/:productId", authRequired, deleteStoreProduct);

/**
 * 🔹 Pedidos
 *  - GET  /api/stores/:id/orders → pedidos de esa tienda (solo dueño)
 *  - POST /api/stores/:id/orders → crear pedido
 */
router.get("/:id/orders", authRequired, listStoreOrders);
router.post("/:id/orders", createStoreOrder);

/**
 * 🔹 Detalle público (esta va al final para no pisar las anteriores)
 *  - GET /api/stores/:id
 */
router.get("/:id", getStoreById);

export default router;
