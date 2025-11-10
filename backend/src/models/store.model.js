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

// Indexes to speed up owner-based lookups without enforcing uniqueness
storeSchema.index({ owner: 1 });
storeSchema.index({ user: 1 });

const Store = mongoose.model("Store", storeSchema);

export async function ensureStoreIndexes() {
  try {
    const indexes = await Store.collection.indexes();
    const legacyUniqueOwner = indexes.find(
      (idx) => idx.name === "owner_1" && idx.unique
    );

    if (legacyUniqueOwner) {
      await Store.collection.dropIndex("owner_1");
      console.log("🛠️ Índice único legacy owner_1 eliminado de stores");
    }
  } catch (error) {
    // Si la colección aún no existe o no podemos obtener los índices, ignoramos el error
    if (error?.codeName !== "NamespaceNotFound") {
      console.error("Error asegurando índices de Store:", error);
    }
  }
}

export default Store;
