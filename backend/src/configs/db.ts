import mongoose from "mongoose";

const URI = process.env.MONGODB_URI;

export const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};
