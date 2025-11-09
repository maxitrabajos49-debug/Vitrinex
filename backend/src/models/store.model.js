// src/models/store.model.js
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    // NUEVO: compatibilidad con documentos antiguos
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Propietario "oficial" actual
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      enum: ["products", "bookings"],
      default: "products",
    },

    description: {
      type: String,
      default: "",
    },

    logoUrl: {
      type: String,
      default: "",
    },

    comuna: {
      type: String,
      trim: true,
    },

    tipoNegocio: {
      type: String,
      trim: true,
    },

    // NUEVO: dirección textual
    direccion: {
      type: String,
      trim: true,
    },

    lat: {
      type: Number,
    },

    lng: {
      type: Number,
    },

    // NUEVO: para poder desactivar locales sin borrarlos
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Store", storeSchema);
