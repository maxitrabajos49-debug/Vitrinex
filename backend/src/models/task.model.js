import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["product", "service"], default: "product" },
    price: { type: Number, min: 0 },            // solo aplica a product
    imageUrl: { type: String },                 // /uploads/archivo.jpg
  },
  { timestamps: true }
);

export default mongoose.model("Task", TaskSchema);
