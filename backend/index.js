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
import connectCloudinary from "./config/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Database connection
connectDB();
connectCloudinary();



// middlewares
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "https://resturant-app-peach.vercel.app"],
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

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
