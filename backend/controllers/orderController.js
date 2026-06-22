import DataAccess from "../config/dataAccess.js";
import { isMongoDBConnected } from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";

// Initialize data access for Order, Cart, Menu, and User
const orderDB = new DataAccess('Order');
const cartDB = new DataAccess('Cart');
const menuDB = new DataAccess('Menu');
const userDB = new DataAccess('User');

// Exported for future payment order/verification endpoints.
export { razorpay };

export const createPaymentOrder = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      return res.status(500).json({
        success: false,
        message: "Razorpay key is not configured on server",
      });
    }

    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount for payment",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return res.status(201).json({
      success: true,
      keyId,
      order,
    });
  } catch (error) {
    console.log("Razorpay create order error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

export const verifyPaymentSignature = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay verification fields",
      });
    }

    const secret = process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret is not configured on server",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.log("Razorpay verify error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { name, email, password, address, orderType = "Pickup", paymentMethod = "Pay at Counter", cartItems = [], paymentVerified = false } = req.body;
    const lowStockAlerts = [];
    const stockApplied = [];

    let userId = null;
    const cookies = req.cookies || {};
    const tokenCandidates = [cookies.userToken, cookies.token];
    let hasUserToken = false;

    for (const token of tokenCandidates) {
      if (!token) continue;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.role === "user" && decoded?.id) {
          userId = decoded.id;
          hasUserToken = true;
          break;
        }
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

    if (normalizedPaymentMethod === "Online Payment" && !paymentVerified) {
      return res.status(400).json({
        success: false,
        message: "Online payment must be verified before placing order",
      });
    }

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
      const searchId = hasUserToken ? userId : (guestId || userId);
    
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

    // Decrement stock by 1 per distinct menu item when an order is placed
    const stockChecks = resolvedItems.map((item) => {
      const currentStock = Number(item.menuItem.countInStock ?? 20);
      const threshold = Number(item.menuItem.lowStockThreshold ?? 5);
      return {
        menuItem: item.menuItem,
        quantity: Number(item.quantity),
        currentStock,
        threshold,
        // Per your request: subtract 1 from inventory for each ordered item (distinct)
        nextStock: Math.max(0, currentStock - 1),
      };
    });

    // Stock check removed - orders will always go through, stock still tracked

    for (const item of stockChecks) {
      const updatedMenuItem = await menuDB.findByIdAndUpdate(item.menuItem._id, {
        countInStock: item.nextStock,
        isAvailable: item.nextStock > 0,
      });

      stockApplied.push({
        menuItemId: item.menuItem._id,
        previousStock: item.currentStock,
        previousAvailability: item.menuItem.isAvailable !== undefined ? item.menuItem.isAvailable : true,
      });

      const effectiveMenuItem = updatedMenuItem || item.menuItem;
      // Send alert specifically when stock hits exactly 5
      if (item.nextStock === 5) {
        lowStockAlerts.push(item.menuItem.name);
      }
    }

    const orderTotalAmount = resolvedItems.reduce((sum, item) => {
      const basePrice = item.menuItem.price * item.quantity;
      const customizationPrice = (item.customizations?.addOnPrice || 0) * item.quantity;
      return sum + basePrice + customizationPrice;
    }, 0);

    let newOrder;
    try {
      newOrder = await orderDB.create({
        user: userId,
        items: resolvedItems.map((i) => ({
          menuItem: i.menuItem._id,
          quantity: i.quantity,
          customizations: i.customizations || {},
        })),
        totalAmount: orderTotalAmount,
        orderType: normalizedOrderType,
        address: finalAddress,
        paymentMethod: normalizedPaymentMethod,
        paymentStatus: normalizedPaymentMethod === "Online Payment" ? "Paid" : "Pending",
        status: "Pending",
      });
    } catch (orderError) {
      for (const appliedItem of stockApplied.reverse()) {
        await menuDB.findByIdAndUpdate(appliedItem.menuItemId, {
          countInStock: appliedItem.previousStock,
          isAvailable: appliedItem.previousAvailability,
        });
      }
      throw orderError;
    }

    // Clear cart
    if (cart?._id) {
      await cartDB.findByIdAndUpdate(cart._id, { items: [] });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
      lowStockAlerts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
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
