// src/controllers/store.controller.js
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import Booking from "../models/booking.model.js";
import Order from "../models/order.model.js";

/* =================== Helpers =================== */

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_FROM_INDEX = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

const SLOT_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const normalizeAvailability = (availability = []) => {
  if (!Array.isArray(availability)) return [];
  const map = new Map();

  availability.forEach((entry) => {
    const day = entry?.dayOfWeek;
    const slots = Array.isArray(entry?.slots) ? entry.slots : [];
    if (!DAY_ORDER.includes(day)) return;

    const cleanSlots = Array.from(
      new Set(
        slots
          .filter((slot) => typeof slot === "string" && SLOT_REGEX.test(slot.trim()))
          .map((slot) => slot.trim())
      )
    ).sort();

    map.set(day, cleanSlots);
  });

  return DAY_ORDER.filter((day) => map.has(day)).map((day) => ({
    dayOfWeek: day,
    slots: map.get(day),
  }));
};

const normalizeDateOnly = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const findStoreForOwner = async (storeId, userId) => {
  const store = await Store.findById(storeId);
  if (!store) return { error: { status: 404, message: "Tienda no encontrada" } };

  if (userId) {
    const ownerId = store.owner?.toString();
    const legacyOwnerId = store.user?.toString();
    if (ownerId !== userId && legacyOwnerId !== userId) {
      return { error: { status: 403, message: "No tienes permisos sobre esta tienda" } };
    }
  }
  return { store };
};

const parseImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images
      .filter((img) => typeof img === "string" && img.trim().length > 0)
      .map((img) => img.trim());
  }
  if (typeof images === "string" && images.trim()) {
    return images
      .split(/[\n,]+/)
      .map((img) => img.trim())
      .filter((img) => img.length > 0);
  }
  return [];
};

const mapProductResponse = (product) => ({
  _id: product._id,
  name: product.name,
  description: product.description,
  price: product.price,
  images: product.images || [],
  stock: product.stock,
  isActive: product.isActive,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

/* =============== PUBLIC STORES (MAP) =============== */

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

/* =============== MY STORES (OWNER) =============== */

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

// Crear/actualizar (por body con _id). SÍ exportada:
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
    primaryColor,
    accentColor,
    heroTitle,
    heroSubtitle,
    highlight1,
    highlight2,
    priceFrom,
    bgMode,
    bgColorTop,
    bgColorBottom,
    bgPattern,
    bgImageUrl,
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: "El nombre es obligatorio" });
  }

  const userId = req.user.id;

  try {
    let store;

    const base = {
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
      primaryColor: primaryColor || "#2563eb",
      accentColor: accentColor || "#0f172a",
      heroTitle: heroTitle || "",
      heroSubtitle: heroSubtitle || "",
      highlight1: highlight1 || "",
      highlight2: highlight2 || "",
      priceFrom: priceFrom || "",
      bgMode: ["solid", "gradient", "image"].includes(bgMode) ? bgMode : "gradient",
      bgColorTop: bgColorTop || "#e8d7ff",
      bgColorBottom: bgColorBottom || "#ffffff",
      bgPattern: ["none", "dots", "grid", "noise"].includes(bgPattern) ? bgPattern : "none",
      bgImageUrl: bgImageUrl || "",
    };

    if (_id) {
      store = await Store.findOneAndUpdate(
        { _id, $or: [{ owner: userId }, { user: userId }] },
        base,
        { new: true }
      );
      if (!store) return res.status(404).json({ message: "Tienda no encontrada" });
      return res.status(200).json(store);
    }

    store = await Store.create(base);
    return res.status(201).json(store);
  } catch (err) {
    console.error("Error al guardar tienda:", err);
    res.status(500).json({ message: "Error al guardar la tienda" });
  }
};

// Update REST por :id. SÍ exportada:
export const updateMyStore = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    mode,
    description,
    logoUrl,
    comuna,
    tipoNegocio,
    lat,
    lng,
    direccion,
    primaryColor,
    accentColor,
    heroTitle,
    heroSubtitle,
    highlight1,
    highlight2,
    priceFrom,
    bgMode,
    bgColorTop,
    bgColorBottom,
    bgPattern,
    bgImageUrl,
  } = req.body;

  if (!name) return res.status(400).json({ message: "El nombre es obligatorio" });

  const userId = req.user.id;

  try {
    const baseUpdate = {
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
      primaryColor: primaryColor || "#2563eb",
      accentColor: accentColor || "#0f172a",
      heroTitle: heroTitle || "",
      heroSubtitle: heroSubtitle || "",
      highlight1: highlight1 || "",
      highlight2: highlight2 || "",
      priceFrom: priceFrom || "",
      bgMode: ["solid", "gradient", "image"].includes(bgMode) ? bgMode : "gradient",
      bgColorTop: bgColorTop || "#e8d7ff",
      bgColorBottom: bgColorBottom || "#ffffff",
      bgPattern: ["none", "dots", "grid", "noise"].includes(bgPattern) ? bgPattern : "none",
      bgImageUrl: bgImageUrl || "",
    };

    const store = await Store.findOneAndUpdate(
      { _id: id, $or: [{ owner: userId }, { user: userId }] },
      baseUpdate,
      { new: true }
    );

    if (!store) return res.status(404).json({ message: "Tienda no encontrada" });
    return res.status(200).json(store);
  } catch (err) {
    console.error("Error al actualizar tienda:", err);
    return res.status(500).json({ message: "Error al actualizar la tienda" });
  }
};

export const deleteMyStore = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    await Product.deleteMany({ store: store._id });
    await Booking.deleteMany({ store: store._id });
    await Order.deleteMany({ store: store._id });
    await Store.deleteOne({ _id: store._id });

    return res.json({ success: true, message: "Tienda eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar tienda:", err);
    return res.status(500).json({ message: "Error al eliminar la tienda" });
  }
};

/* =============== PUBLIC / EDIT: GET STORE BY ID =============== */

export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id)
      .populate("owner", "username avatarUrl email")
      .lean();

    if (!store) return res.status(404).json({ message: "Tienda no encontrada" });

    res.json({
      _id: store._id,
      name: store.name,
      description: store.description,
      logoUrl: store.logoUrl,
      comuna: store.comuna,
      tipoNegocio: store.tipoNegocio,
      mode: store.mode,
      bookingAvailability: store.bookingAvailability || [],
      direccion: store.direccion,
      lat: store.lat,
      lng: store.lng,
      primaryColor: store.primaryColor || "#2563eb",
      accentColor: store.accentColor || "#0f172a",
      heroTitle: store.heroTitle || "",
      heroSubtitle: store.heroSubtitle || "",
      highlight1: store.highlight1 || "",
      highlight2: store.highlight2 || "",
      priceFrom: store.priceFrom || "",
      // nuevos campos de personalización
      bgMode: store.bgMode || "gradient",
      bgColorTop: store.bgColorTop || "#e8d7ff",
      bgColorBottom: store.bgColorBottom || "#ffffff",
      bgPattern: store.bgPattern || "none",
      bgImageUrl: store.bgImageUrl || "",
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

/* =============== BOOKINGS =============== */

export const getStoreAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id).lean();
    if (!store) return res.status(404).json({ message: "Tienda no encontrada" });
    if (store.mode !== "bookings")
      return res.status(400).json({ message: "Esta tienda no permite agendar citas" });

    res.json({ availability: store.bookingAvailability || [] });
  } catch (err) {
    console.error("Error obteniendo disponibilidad:", err);
    res.status(500).json({ message: "Error al obtener la disponibilidad" });
  }
};

export const updateStoreAvailability = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "bookings")
      return res.status(400).json({ message: "Esta tienda no es de agendamiento" });

    const normalized = normalizeAvailability(req.body?.availability);
    store.bookingAvailability = normalized;
    await store.save();

    res.json({ availability: store.bookingAvailability });
  } catch (err) {
    console.error("Error al actualizar disponibilidad:", err);
    res.status(500).json({ message: "Error al actualizar la disponibilidad" });
  }
};

export const listStoreAppointments = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "bookings")
      return res.status(400).json({ message: "Esta tienda no es de agendamiento" });

    const bookings = await Booking.find({ store: store._id })
      .sort({ date: 1, slot: 1 })
      .lean();

    res.json(
      bookings.map((booking) => ({
        _id: booking._id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        date: booking.date,
        slot: booking.slot,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,
      }))
    );
  } catch (err) {
    console.error("Error al listar reservas:", err);
    res.status(500).json({ message: "Error al obtener las reservas" });
  }
};

export const createAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const store = await Store.findById(id).lean();
    if (!store) return res.status(404).json({ message: "Tienda no encontrada" });
    if (store.mode !== "bookings")
      return res.status(400).json({ message: "Esta tienda no permite agendar citas" });

    const { customerName, customerEmail, customerPhone, date, slot, notes } = req.body || {};
    if (!customerName || !date || !slot) {
      return res.status(400).json({ message: "Nombre del cliente, fecha y horario son obligatorios" });
    }

    const normalizedDate = normalizeDateOnly(date);
    if (!normalizedDate) return res.status(400).json({ message: "La fecha proporcionada no es válida" });
    if (!SLOT_REGEX.test(slot)) return res.status(400).json({ message: "El horario no es válido" });

    const dayKey = DAY_FROM_INDEX[normalizedDate.getUTCDay()];
    const dayAvailability = (store.bookingAvailability || []).find((e) => e.dayOfWeek === dayKey);

    if (!dayAvailability || !dayAvailability.slots.includes(slot)) {
      return res.status(400).json({ message: "El horario seleccionado no está disponible" });
    }

    try {
      const booking = await Booking.create({
        store: store._id,
        customerName,
        customerEmail,
        customerPhone,
        date: normalizedDate,
        slot,
        notes: notes || "",
      });

      res.status(201).json({
        _id: booking._id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        date: booking.date,
        slot: booking.slot,
        status: booking.status,
        notes: booking.notes,
      });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ message: "Ese horario ya fue reservado. Elige otro." });
      }
      throw err;
    }
  } catch (err) {
    console.error("Error al crear reserva:", err);
    res.status(500).json({ message: "Error al reservar la cita" });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  const { id, bookingId } = req.params;
  const userId = req.user.id;
  const { status } = req.body;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "bookings")
      return res.status(400).json({ message: "Esta tienda no es de agendamiento" });

    const allowed = ["pending", "confirmed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Estado inválido. Usa: pending, confirmed o cancelled" });
    }

    const booking = await Booking.findOne({ _id: bookingId, store: store._id });
    if (!booking) return res.status(404).json({ message: "Reserva no encontrada" });

    booking.status = status;
    await booking.save();

    return res.json({
      _id: booking._id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      date: booking.date,
      slot: booking.slot,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt,
    });
  } catch (err) {
    console.error("Error al actualizar estado de reserva:", err);
    return res.status(500).json({ message: "Error al actualizar el estado de la reserva" });
  }
};

/* =============== PRODUCTS =============== */

// Catálogo público (robusto contra distintos campos)
export const listStoreProductsPublic = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await Product.find({
      $and: [
        { $or: [{ store: id }, { storeId: id }] },
        { $or: [{ isActive: { $ne: false } }, { active: true }] },
        { isDeleted: { $ne: true } },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.json(products);
  } catch (err) {
    console.error("Error al listar productos públicos:", err);
    return res
      .status(500)
      .json({ message: "No se pudo cargar el catálogo de productos." });
  }
};

// Catálogo público simple (lo usa tu StorePublic.jsx)
export const listStoreProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.find({ store: id, isActive: { $ne: false } })
      .select("name description price imageUrl images")
      .lean();

    return res.json(
      (products || []).map((p) => ({
        _id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl || p.images?.[0] || "",
      }))
    );
  } catch (error) {
    console.error("Error al listar productos públicos", error);
    return res.status(500).json({ message: "No se pudo cargar el catálogo de productos" });
  }
};

export const listStoreProductsForOwner = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "products")
      return res.status(400).json({ message: "Esta tienda no vende productos" });

    const products = await Product.find({ store: store._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(products.map(mapProductResponse));
  } catch (err) {
    console.error("Error al listar productos (dueño):", err);
    res.status(500).json({ message: "Error al obtener los productos" });
  }
};

export const createStoreProduct = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "products")
      return res.status(400).json({ message: "Esta tienda no vende productos" });

    const { name, description, price, images, isActive, stock } = req.body || {};

    if (!name || typeof price === "undefined") {
      return res.status(400).json({ message: "Nombre y precio del producto son obligatorios" });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: "El precio debe ser un número válido" });
    }

    const product = await Product.create({
      store: store._id,
      name,
      description: description || "",
      price: numericPrice,
      images: parseImages(images),
      isActive: typeof isActive === "boolean" ? isActive : true,
      stock: typeof stock === "number" ? stock : 0,
    });

    res.status(201).json(mapProductResponse(product));
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({ message: "Error al crear el producto" });
  }
};

export const updateStoreProduct = async (req, res) => {
  const { id, productId } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "products")
      return res.status(400).json({ message: "Esta tienda no vende productos" });

    const { name, description, price, images, isActive } = req.body || {};

    const update = {};
    
    if (typeof name !== "undefined") update.name = name;
    if (typeof description !== "undefined") update.description = description;
    if (typeof price !== "undefined") {
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: "El precio debe ser un número válido" });
      }
      update.price = numericPrice;
    }
    if (typeof images !== "undefined") update.images = parseImages(images);
    if (typeof isActive !== "undefined") update.isActive = Boolean(isActive);
    if (typeof stock !== "undefined") {
  const numericStock = Number(stock);
  if (Number.isNaN(numericStock) || numericStock < 0) {
    return res.status(400).json({ message: "El stock debe ser válido" });
  }
  update.stock = numericStock;
}


    const product = await Product.findOneAndUpdate(
      { _id: productId, store: store._id },
      update,
      { new: true }
    ).lean();

    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(mapProductResponse(product));
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
};

export const deleteStoreProduct = async (req, res) => {
  const { id, productId } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "products")
      return res.status(400).json({ message: "Esta tienda no vende productos" });

    const deleted = await Product.findOneAndDelete({ _id: productId, store: store._id });
    if (!deleted) return res.status(404).json({ message: "Producto no encontrado" });

    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
};

/* =============== ORDERS =============== */

export const listStoreOrders = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "products")
      return res.status(400).json({ message: "Esta tienda no vende productos" });

    const orders = await Order.find({ store: store._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      orders.map((order) => ({
        _id: order._id,
        items: order.items,
        total: order.total,
        status: order.status,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        notes: order.notes,
        createdAt: order.createdAt,
      }))
    );
  } catch (err) {
    console.error("Error al obtener pedidos:", err);
    res.status(500).json({ message: "Error al obtener los pedidos" });
  }
};

export const createStoreOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const store = await Store.findById(id).lean();
    if (!store) return res.status(404).json({ message: "Tienda no encontrada" });

    if (store.mode !== "products")
      return res.status(400).json({ message: "Esta tienda no vende productos" });

    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      notes,
    } = req.body || {};

    if (!customerName) return res.status(400).json({ message: "El nombre del cliente es obligatorio" });
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Debes seleccionar al menos un producto" });

    const cleanedItems = items
      .map((item) => ({
        productId: item?.productId || item?.product,
        quantity: Math.max(1, Math.floor(Number(item?.quantity) || 0)),
      }))
      .filter((item) => item.productId && item.quantity > 0);

    if (cleanedItems.length === 0) {
      return res.status(400).json({ message: "Los productos seleccionados no son válidos" });
    }

    const productIds = cleanedItems.map((i) => i.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      store: store._id,
      isActive: true,
    }).lean();

    if (products.length !== cleanedItems.length) {
      return res.status(400).json({ message: "Uno o más productos ya no están disponibles" });
    }

    const orderItems = cleanedItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId.toString());
      const quantity = item.quantity;
      const unitPrice = product.price;
      const subtotal = Math.round(unitPrice * quantity * 100) / 100;
      return {
        product: product._id,
        productName: product.name,
        unitPrice,
        quantity,
        subtotal,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await Order.create({
      store: store._id,
      items: orderItems,
      total,
      customerName,
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
      customerAddress: customerAddress || "",
      notes: notes || "",
    });

    res.status(201).json({
      _id: order._id,
      items: order.items,
      total: order.total,
      status: order.status,
      customerName: order.customerName,
    });
  } catch (err) {
    console.error("Error al crear pedido:", err);
    res.status(500).json({ message: "Error al crear el pedido" });
  }
};
