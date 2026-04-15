import express from "express";

import { adminOnly, protect } from "../middlewares/authMiddleware.js";

import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controllers/cartController.js";

const cartRoutes = express.Router();

cartRoutes.post("/add", addToCart);
cartRoutes.get("/get", getCart);
cartRoutes.delete("/remove/:menuId", removeFromCart);
export default cartRoutes;
