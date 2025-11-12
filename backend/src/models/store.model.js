import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    // Compatibilidad con documentos antiguos
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Propietario actual
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    name: { type: String, required: true, trim: true },

    mode: {
      type: String,
      enum: ["products", "bookings"],
      default: "products",
    },

    description: { type: String, default: "" },

    logoUrl: { type: String, default: "" },

    comuna: { type: String, trim: true },
    tipoNegocio: { type: String, trim: true },

    // Dirección
    direccion: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },

    // Activación suave
    isActive: { type: Boolean, default: true },

    // Disponibilidad de agendamiento
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
          slots: { type: [String], default: [] },
        },
      ],
      default: [],
    },

    // 🎨 Personalización visual
    primaryColor: { type: String, default: "#2563eb" },
    accentColor: { type: String, default: "#0f172a" },

    // Fondo
    bgMode: { type: String, enum: ["solid", "gradient", "image"], default: "gradient" },
    bgColorTop: { type: String, default: "#e8d7ff" },
    bgColorBottom: { type: String, default: "#ffffff" },
    bgPattern: { type: String, enum: ["none", "dots", "grid", "noise"], default: "none" },
    bgImageUrl: { type: String, default: "" },

    // Textos destacados
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    highlight1: { type: String, default: "" },
    highlight2: { type: String, default: "" },
    priceFrom: { type: String, default: "" },
  },
  { timestamps: true }
);

// Índices útiles
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
    if (error?.codeName !== "NamespaceNotFound") {
      console.error("Error asegurando índices de Store:", error);
    }
  }
}

export default Store;
