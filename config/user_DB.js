
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
let isDBconnected = false;
const user_DB = async () => {
  if (isDBconnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
export default user_DB;

