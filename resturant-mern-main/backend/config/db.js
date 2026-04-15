import mongoose from "mongoose";

let isMongoConnected = false;

export const connectDB = async () => {
  try {
    if (process.env.MONGO_URL) {
      await mongoose.connect(process.env.MONGO_URL);
      isMongoConnected = true;
      console.log("Database connected");
    } else {
      console.log("No MongoDB URL provided, using local storage");
      isMongoConnected = false;
    }
  } catch (error) {
    console.log(`Error connecting to database: ${error}`);
    console.log("Falling back to local storage");
    isMongoConnected = false;
  }
};

export const isMongoDBConnected = () => {
  return isMongoConnected;
};

// Listen for connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, switching to local storage');
  isMongoConnected = false;
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
  isMongoConnected = true;
});