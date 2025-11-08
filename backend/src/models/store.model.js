// src/models/store.model.js
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 👈 SOLO índice normal (NO unique)
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
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    comuna: {
      type: String,
      trim: true,
    },
    tipoNegocio: {
      type: String,
      trim: true,
    },
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Store", storeSchema);
