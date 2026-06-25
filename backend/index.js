import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { connectDB, isMongoDBConnected } from "./config/db.js";
import DataAccess from "./config/dataAccess.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

import connectCloudinary from "./config/cloudinary.js";
import Razorpay from "razorpay";
const app = express();

// Database connection
connectDB();
connectCloudinary();



// middlewares
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "https://resturant-app-peach.vercel.app",
      "https://dolce-vita.food",
      "https://www.dolce-vita.food",
      "https://dolce-vita-backend.onrender.com"
    ],
    credentials: true,
  })
);
app.use(cookieParser());

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many requests, please try again later." }
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many accounts created from this IP, please try again after 15 minutes" }
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { success: false, message: "Too many messages sent, please try again later." }
});

// Note: No order limiter per user request (admin uses POS).

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

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", registerLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/contact/send", contactLimiter);
app.use("/api/contact", contactRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
