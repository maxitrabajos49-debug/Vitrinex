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
  listStoreProducts,
  listStoreProductsForOwner,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  listStoreOrders,
  createStoreOrder,
} from "../controllers/store.controller.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = Router();

router.get("/", listPublicStores);
router.get("/my", authRequired, getMyStore);
router.post("/my", authRequired, saveMyStore);

router.get("/:id/availability", getStoreAvailability);
router.put("/:id/availability", authRequired, updateStoreAvailability);
router.get("/:id/appointments", authRequired, listStoreAppointments);
router.post("/:id/appointments", createAppointment);

router.get("/:id/products/manage", authRequired, listStoreProductsForOwner);
router.get("/:id/products", listStoreProducts);
router.post("/:id/products", authRequired, createStoreProduct);
router.put("/:id/products/:productId", authRequired, updateStoreProduct);
router.delete("/:id/products/:productId", authRequired, deleteStoreProduct);

router.get("/:id/orders/manage", authRequired, listStoreOrders);
router.post("/:id/orders", createStoreOrder);

router.get("/:id", getStoreById);

export default router;
