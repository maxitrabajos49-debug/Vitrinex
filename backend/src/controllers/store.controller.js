// src/controllers/store.controller.js
import Store from "../models/store.model.js";

/**
 * 🔹 Público: lista de negocios para el mapa / home
 *    GET /api/stores
 */
export const listPublicStores = async (req, res) => {
  try {
    const { comuna, tipoNegocio, mode } = req.query || {};

    const filter = {};

    if (comuna) filter.comuna = comuna;
    if (tipoNegocio) filter.tipoNegocio = tipoNegocio;
    if (mode && ["products", "bookings"].includes(mode)) {
      filter.mode = mode;
    }

    const stores = await Store.find(filter)
      .populate("user", "username email") // 👈 traemos nombre del dueño
      .sort({ createdAt: -1 })
      .lean();

    return res.json(stores);
  } catch (error) {
    console.error("Error al listar tiendas públicas:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener los negocios." });
  }
};

/**
 * 🔹 Privado: lista SOLO mis tiendas
 *    GET /api/stores/my
 */
export const listMyStores = async (req, res) => {
  try {
    const stores = await Store.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(stores);
  } catch (error) {
    console.error("Error al listar tiendas:", error);
    res.status(500).json({ message: "Error al listar tiendas" });
  }
};

/**
 * 🔹 Privado: crear tienda
 *    POST /api/stores/my
 */
export const createMyStore = async (req, res) => {
  try {
    const store = new Store({
      ...req.body,
      user: req.user.id,
    });

    await store.save();
    res.status(201).json(store);
  } catch (error) {
    console.error("Error al crear tienda:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Ya existe un registro con estos datos.",
      });
    }

    res.status(500).json({ message: "Error al crear tienda" });
  }
};

/**
 * 🔹 Privado: actualizar tienda propia
 *    PUT /api/stores/my/:id
 */
export const updateMyStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    res.json(store);
  } catch (error) {
    console.error("Error al actualizar tienda:", error);
    res.status(500).json({ message: "Error al actualizar tienda" });
  }
};

/**
 * 🔹 Privado: eliminar tienda propia
 *    DELETE /api/stores/my/:id
 */
export const deleteMyStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    res.json({ message: "Tienda eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar tienda:", error);
    res.status(500).json({ message: "Error al eliminar tienda" });
  }
};
