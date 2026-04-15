import DataAccess from "../config/dataAccess.js";
import { isMongoDBConnected } from "../config/db.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Initialize data access for Cart and Menu
const cartDB = new DataAccess('Cart');
const menuDB = new DataAccess('Menu');

const getUserId = (req, res) => {
  let userId = null;
  const token = req.cookies && req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch(e) {}
  }
  if (!userId) {
    userId = req.cookies && req.cookies.guestId;
    if (!userId) {
      userId = new mongoose.Types.ObjectId().toString();
      res.cookie("guestId", userId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
  }
  return userId;
};

export const addToCart = async (req, res) => {
  try {
    const { menuId, quantity } = req.body;
    const id = getUserId(req, res);
    
    const menuItem = await menuDB.findById(menuId);
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });

    let cart = await cartDB.findOne({ user: id });
    if (!cart) {
      cart = await cartDB.create({ user: id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.menuItem.toString() === menuId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      // Remove if quantity drops to 0 or below
      if (cart.items[existingItemIndex].quantity <= 0) {
        cart.items.splice(existingItemIndex, 1);
      }
    } else if (quantity > 0) {
      cart.items.push({ menuItem: menuId, quantity });
    }

    const updatedCart = await cartDB.findByIdAndUpdate(cart._id, { items: cart.items });
    res
      .status(200)
      .json({ message: "Item added to cart", success: true, cart: updatedCart });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const id = getUserId(req, res);
    let cart = await cartDB.findOne({ user: id });
    
    if (!cart) return res.status(200).json({ items: [] });

    // Handle population based on storage type
    if (isMongoDBConnected()) {
      const Cart = (await import("../models/cartModel.js")).default;
      cart = await Cart.findOne({ user: id }).populate("items.menuItem");
    } else {
      // Manual population for local storage
      for (let item of cart.items) {
        const menuItem = await menuDB.findById(item.menuItem);
        item.menuItem = menuItem;
      }
    }

    res.status(200).json({ cart, success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const id = getUserId(req, res);
    const { menuId } = req.params;

    const cart = await cartDB.findOne({ user: id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    
    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== menuId
    );
    
    await cartDB.findByIdAndUpdate(cart._id, { items: cart.items });
    res.status(200).json({ message: "Item removed from cart", success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};
