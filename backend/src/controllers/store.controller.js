// src/controllers/store.controller.js
import Store from "../models/store.model.js";

export const getMyStore = async (req, res) => {
  const store = await Store.findOne({ user: req.user.id }).lean();
  if (!store) return res.json({}); // sin tienda aún
  res.json(store);
};

export const upsertMyStore = async (req, res) => {
  const { name, mode, description = "", logoUrl = "" } = req.body || {};
  if (!name || !mode) return res.status(400).json({ message: "name y mode son obligatorios" });
  if (!["products", "bookings"].includes(mode))
    return res.status(400).json({ message: "mode inválido" });

  const payload = {
    name,
    mode,
    description,
    logoUrl,
  };

  const store = await Store.findOneAndUpdate(
    { user: req.user.id },
    { $set: payload, $setOnInsert: { user: req.user.id } },
    { upsert: true, new: true }
  );

  res.status(200).json(store);
};
