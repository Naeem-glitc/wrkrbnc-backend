
import mongoose from 'mongoose';

let isDBconnected = false;
const user_DB = async () => {
  if (isDBconnected) return;
  try {
      await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000,
    });
    isDBconnected = true;
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
user_DB().catch(console.error);
export default user_DB;

