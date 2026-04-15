import express from "express";
import {
  getProfile,
  isAuth,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
const authRoutes = express.Router();

authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.post("/logout", logoutUser);
authRoutes.get("/profile", protect, getProfile);
authRoutes.get("/is-auth", protect, isAuth);

export default authRoutes;
