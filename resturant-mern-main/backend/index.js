import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB, isMongoDBConnected } from "./config/db.js";
import DataAccess from "./config/dataAccess.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import dotenv from "dotenv";
import connectCloudinary from "./config/cloudinary.js";

dotenv.config();
const app = express();

// Database connection
connectDB().then(() => {
  if (isMongoDBConnected()) {
    console.log("MongoDB connected - database operations will use MongoDB");
    // Optionally trigger data migration from local storage to MongoDB
    migrateLocalDataToMongoDB();
  } else {
    console.log("Using local file storage for data persistence");
  }
});

connectCloudinary();

// Function to migrate local data to MongoDB when connection is available
const migrateLocalDataToMongoDB = async () => {
  try {
    const models = ['User', 'Category', 'Menu', 'Cart', 'Order', 'Booking'];
    for (const model of models) {
      const dataAccess = new DataAccess(model);
      await dataAccess.migrateToMongoDB();
    }
  } catch (error) {
    console.log('Error during data migration:', error);
  }
};

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: "https://resturant-app-peach.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello from server");
});

// Add endpoint to check storage type
app.get("/api/storage-info", (req, res) => {
  res.json({
    usingMongoDB: isMongoDBConnected(),
    storageType: isMongoDBConnected() ? "MongoDB" : "Local File Storage"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/booking", bookingRoutes);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
