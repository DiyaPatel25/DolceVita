import DataAccess from "../config/dataAccess.js";
import { isMongoDBConnected } from "../config/db.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Initialize data access for Order, Cart, Menu, and User
const orderDB = new DataAccess('Order');
const cartDB = new DataAccess('Cart');
const menuDB = new DataAccess('Menu');
const userDB = new DataAccess('User');

export const placeOrder = async (req, res) => {
  try {
    const { address, paymentMethod, name, email, password, cartItems = [] } = req.body;

    let userId = req.user?.id || null;

    if (!userId && password && name && email) {
      const existingUser = await userDB.findOne({ email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userDB.create({ name, email, password: hashedPassword });
        userId = user._id;
      } else {
        return res.status(400).json({ message: "Email already registered. Please login.", success: false });
      }
    } else if (!userId) {
      const guestName = "Guest Customer";
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

    if (!address)
      return res
        .status(400)
        .json({ message: "Delivery address is required", success: false });

    let cart = await cartDB.findOne({ user: userId });

    // Handle population based on storage type
    if (isMongoDBConnected()) {
      const Cart = (await import("../models/cartModel.js")).default;
      cart = await Cart.findOne({ user: userId }).populate("items.menuItem");
    } else {
      // Manual population for local storage
      if (cart && cart.items) {
        for (let item of cart.items) {
          const menuItem = await menuDB.findById(item.menuItem);
          item.menuItem = menuItem;
        }
      }
    }

    if ((!cart || cart.items.length === 0) && (!Array.isArray(cartItems) || cartItems.length === 0))
      return res.status(400).json({ message: "Your cart is empty" });

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

    const totalAmount = resolvedItems.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );

    const newOrder = await orderDB.create({
      user: userId,
      items: resolvedItems.map((i) => ({
        menuItem: i.menuItem._id,
        quantity: i.quantity,
      })),
      totalAmount,
      address,
      paymentMethod,
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

          const guestId = req.cookies && req.cookies.guestId;
          const searchId = token ? userId : (guestId || userId);
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
