import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },   // 👈 Date con D mayúscula
    done: { type: Boolean, default: false },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,                           // 👈 cada tarea pertenece a un usuario
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
