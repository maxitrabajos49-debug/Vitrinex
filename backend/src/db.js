import mongoose from 'mongoose';
import { MONGO_URI } from './config.js';

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ DB CONNECTED');
  } catch (error) {
    console.error('❌ DB Connection Error:', error);
    process.exit(1);
  }
}
