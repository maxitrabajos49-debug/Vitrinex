// src/controllers/store.controller.js
import Store from "../models/store.model.js";

// 🔹 Listar tiendas públicas (home / mapa)
export const listPublicStores = async (req, res) => {
  try {
    const { comuna, tipoNegocio, mode } = req.query;

    const query = { isActive: true };
    if (comuna) query.comuna = comuna;
    if (tipoNegocio) query.tipoNegocio = tipoNegocio;
    if (mode) query.mode = mode;

    const stores = await Store.find(query)
      .populate("owner", "username avatarUrl")
      .lean();

    res.json(
      stores.map((s) => ({
        _id: s._id,
        name: s.name,
        description: s.description,
        logoUrl: s.logoUrl,
        comuna: s.comuna,
        tipoNegocio: s.tipoNegocio,
        mode: s.mode,
        lat: s.lat,
        lng: s.lng,
        direccion: s.direccion,
        isActive: s.isActive,
        ownerName: s.owner?.username || null,
        ownerAvatar: s.owner?.avatarUrl || null,
      }))
    );
  } catch (err) {
    console.error("Error listando tiendas públicas:", err);
    res.status(500).json({ message: "Error al listar las tiendas" });
  }
};

// 🔹 Obtener tiendas del usuario logueado
export const getMyStore = async (req, res) => {
  try {
    const userId = req.user.id;

    const stores = await Store.find({
      $or: [{ owner: userId }, { user: userId }],
    }).lean();

    if (!stores || stores.length === 0) {
      return res.status(404).json({ message: "Aún no has creado tiendas" });
    }

    res.json(stores);
  } catch (err) {
    console.error("Error al obtener tiendas:", err);
    res.status(500).json({ message: "Error al obtener tus tiendas" });
  }
};

// 🔹 Crear / actualizar tienda del usuario
export const saveMyStore = async (req, res) => {
  const {
    _id,
    name,
    mode,
    description,
    logoUrl,
    comuna,
    tipoNegocio,
    lat,
    lng,
    direccion,
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: "El nombre es obligatorio" });
  }

  const userId = req.user.id;

  try {
    let store;

    if (_id) {
      store = await Store.findOneAndUpdate(
        {
          _id,
          $or: [{ owner: userId }, { user: userId }],
        },
        {
          name,
          mode: mode === "bookings" ? "bookings" : "products",
          description,
          logoUrl,
          comuna,
          tipoNegocio,
          lat,
          lng,
          direccion,
          isActive: true,
          owner: userId,
          user: userId,
        },
        { new: true }
      );

      if (!store) {
        return res.status(404).json({ message: "Tienda no encontrada" });
      }

      return res.status(200).json(store);
    }

    store = await Store.create({
      owner: userId,
      user: userId,
      name,
      mode: mode === "bookings" ? "bookings" : "products",
      description,
      logoUrl,
      comuna,
      tipoNegocio,
      lat,
      lng,
      direccion,
      isActive: true,
    });

    return res.status(201).json(store);
  } catch (err) {
    console.error("Error al guardar tienda:", err);
    res.status(500).json({ message: "Error al guardar la tienda" });
  }
};

// 🔹 Obtener una tienda por ID (perfil público / edición)
export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id)
      .populate("owner", "username avatarUrl email")
      .lean();

    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    res.json({
      _id: store._id,
      name: store.name,
      description: store.description,
      logoUrl: store.logoUrl,
      comuna: store.comuna,
      tipoNegocio: store.tipoNegocio,
      mode: store.mode,
      direccion: store.direccion,
      lat: store.lat,
      lng: store.lng,
      ownerName: store.owner?.username || null,
      ownerAvatar: store.owner?.avatarUrl || null,
      ownerEmail: store.owner?.email || null,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    });
  } catch (err) {
    console.error("Error al obtener tienda:", err);
    res.status(500).json({ message: "Error al obtener la tienda" });
  }
};
