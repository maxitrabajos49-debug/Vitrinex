// src/models/store.model.js
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    // Compatibilidad con documentos antiguos
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Propietario oficial actual
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

    // Dirección textual
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

    // Para poder desactivar locales sin borrarlos
    isActive: {
      type: Boolean,
      default: true,
    },

    // Disponibilidad de agendamiento (por día + slots)
    bookingAvailability: {
      type: [
        {
          dayOfWeek: {
            type: String,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
            required: true,
          },
          slots: {
            type: [String],
            default: [],
          },
        },
      ],
      default: [],
    },

    // 🎨 Personalización visual y textos destacados
    primaryColor: {
      type: String,
      default: "#2563eb", // azul por defecto
    },
    accentColor: {
      type: String,
      default: "#0f172a", // casi negro
    },
    heroTitle: {
      type: String,
      default: "",
    },
    heroSubtitle: {
      type: String,
      default: "",
    },
    highlight1: {
      type: String,
      default: "",
    },
    highlight2: {
      type: String,
      default: "",
    },
    priceFrom: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes para acelerar búsquedas por owner / user
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
