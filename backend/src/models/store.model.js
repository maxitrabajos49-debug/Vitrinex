// src/models/store.model.js
import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    name: { type: String, required: true, trim: true },
    mode: { type: String, enum: ["products", "bookings"], required: true },
    description: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    slug: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Store", StoreSchema);
