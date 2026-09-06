import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log("⚠ MONGODB_URI not set. Running in demo mode.");
      return;
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ MongoDB connected successfully");
  } catch (error) {
    console.warn("✗ MongoDB connection failed:", error instanceof Error ? error.message : error);
    console.log("⚠ Continuing in demo mode without database");
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState > 0) {
      await mongoose.disconnect();
      console.log("✓ MongoDB disconnected");
    }
  } catch (error) {
    console.error("✗ MongoDB disconnection failed:", error);
  }
};
