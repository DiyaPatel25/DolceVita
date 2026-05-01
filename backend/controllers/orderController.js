import DataAccess from "../config/dataAccess.js";
import { isMongoDBConnected } from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Initialize data access for Order, Cart, Menu, and User
const orderDB = new DataAccess('Order');
const cartDB = new DataAccess('Cart');
const menuDB = new DataAccess('Menu');
const userDB = new DataAccess('User');

export const placeOrder = async (req, res) => {
  try {
    const { name, email, password, address, orderType = "Pickup", paymentMethod = "Pay at Counter", cartItems = [] } = req.body;

    let userId = null;
    const token = req.cookies && req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        console.log("Invalid token ignored for order");
      }
    }

    if (!userId && password && name && email) {
      const existingUser = await userDB.findOne({ email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userDB.create({ name, email, password: hashedPassword });
        userId = user._id;
        const newToken = jwt.sign({ id: user._id, role: user.isAdmin ? "admin" : "user" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000,
        });
      } else {
        return res.status(400).json({ message: "Email already registered. Please login.", success: false });
      }
    } else if (!userId) {
      const guestName = name?.trim() || "Guest Customer";
      const guestEmailSeed = (req.cookies && req.cookies.guestId) || new mongoose.Types.ObjectId().toString();
      const guestEmail = `guest_${guestEmailSeed}@guest.local`;
      const guestPassword = await bcrypt.hash(guestEmailSeed, 10);

      let guestUser = await userDB.findOne({ email: guestEmail });
      if (!guestUser) {
        guestUser = await userDB.create({
          name: guestName,
          email: guestEmail,
          password: guestPassword,
          isAdmin: false,
        });
      }

      userId = guestUser._id;
    }

    const normalizedOrderType = orderType === "Delivery" ? "Delivery" : "Pickup";
    const normalizedPaymentMethod = paymentMethod === "Online Payment" ? "Online Payment" : "Pay at Counter";

    if (normalizedOrderType === "Delivery" && normalizedPaymentMethod !== "Online Payment") {
      return res.status(400).json({
        success: false,
        message: "Delivery orders must be paid online. Counter payment is only available for pickup.",
      });
    }

    const finalAddress = normalizedOrderType === "Delivery" ? address?.trim() : "Pickup";
    if (normalizedOrderType === "Delivery" && !finalAddress) {
      return res.status(400).json({ success: false, message: "Delivery address is required." });
    }

      const guestId = req.cookies && req.cookies.guestId;
      const searchId = token ? userId : (guestId || userId);
    
    let cart = await cartDB.findOne({ user: searchId });

    // Handle population based on storage type
    if (isMongoDBConnected()) {
      const Cart = (await import("../models/cartModel.js")).default;
      cart = await Cart.findOne({ user: searchId }).populate("items.menuItem");
    } else {
      // Manual population for local storage
      if (cart && cart.items) {
        for (let item of cart.items) {
          const menuItem = await menuDB.findById(item.menuItem);
          item.menuItem = menuItem;
        }
      }
    }

    if ((!cart || cart.items.length === 0) && (!Array.isArray(cartItems) || cartItems.length === 0)) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const resolvedItems = (cart && cart.items.length > 0)
      ? cart.items
      : await Promise.all(
          cartItems.map(async (item) => ({
            menuItem: await menuDB.findById(item.menuItem),
            quantity: item.quantity,
          }))
        );

    if (resolvedItems.some((item) => !item.menuItem)) {
      return res.status(400).json({ message: "One or more cart items could not be found", success: false });
    }

    const orderTotalAmount = resolvedItems.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );

    const newOrder = await orderDB.create({
      user: userId,
      items: resolvedItems.map((i) => ({
        menuItem: i.menuItem._id,
        quantity: i.quantity,
      })),
      totalAmount: orderTotalAmount,
      orderType: normalizedOrderType,
      address: finalAddress,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: normalizedPaymentMethod === "Online Payment" ? "Paid" : "Pending",
      status: "Pending",
    });

    // Clear cart
    if (cart?._id) {
      await cartDB.findByIdAndUpdate(cart._id, { items: [] });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { id } = req.user;
    let orders = await orderDB.find({ user: id });
    
    // Sort by createdAt if available
    if (orders.length > 0 && orders[0].createdAt) {
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    res.status(200).json({ orders, success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    let orders = await orderDB.find();

    // Handle population based on storage type
    if (isMongoDBConnected()) {
      const Order = (await import("../models/orderModel.js")).default;
      orders = await Order.find()
        .populate("user")
        .populate("items.menuItem")
        .sort({ createdAt: -1 });
    } else {
      // Manual population for local storage
      for (let order of orders) {
        // Populate user
        if (order.user) {
          const user = await userDB.findById(order.user);
          order.user = user;
        }
        // Populate menu items
        if (order.items) {
          for (let item of order.items) {
            const menuItem = await menuDB.findById(item.menuItem);
            item.menuItem = menuItem;
          }
        }
      }
      // Sort by createdAt if available
      if (orders.length > 0 && orders[0].createdAt) {
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    res.status(200).json({ orders, success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await orderDB.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await orderDB.findByIdAndUpdate(orderId, { status });

    res.json({ message: "order status updated", success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};
