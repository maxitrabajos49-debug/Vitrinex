import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { MONGODB_URI, PORT } from "./config.js";

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ DB CONNECTED");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server on port ${PORT}`);
    });

    server.on("error", (err) => console.error("Server error:", err));
  } catch (err) {
    console.error("Init error:", err);
    process.exit(1);
  }
}

startServer();
