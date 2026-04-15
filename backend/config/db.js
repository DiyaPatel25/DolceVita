import mongoose from "mongoose";

let isMongoConnected = false;

export const connectDB = async () => {
  try {
    if (process.env.MONGO_URL) {
      await mongoose.connect(process.env.MONGO_URL);
      isMongoConnected = true;
      console.log("MongoDB connected ✅");
    } else {
      console.log("No MONGO_URL in .env — using local JSON storage");
      isMongoConnected = false;
    }
  } catch (error) {
    console.log(`MongoDB connection error: ${error.message}`);
    console.log("Falling back to local JSON storage");
    isMongoConnected = false;
  }
};

export const isMongoDBConnected = () => isMongoConnected;

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
  isMongoConnected = false;
});

mongoose.connection.on("connected", () => {
  isMongoConnected = true;
});