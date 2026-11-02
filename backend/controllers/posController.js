import DataAccess from "../config/dataAccess.js";
import { isMongoDBConnected } from "../config/db.js";
import Order from "../models/orderModel.js";
import { priceCustomizations, businessDate, businessDayStart, addDays, paidAmounts } from "../utils/orderMath.js";

const orderDB = new DataAccess('Order');
const menuDB = new DataAccess('Menu');

// Counter orders are marked by this address (kept for compatibility with existing data)
const POS_ADDRESS = "Stall Order";
const HISTORY_DAYS = 14;

const PAYMENT = {
  Cash: { paymentMethod: "Cash", paymentStatus: "Paid" },
  Online: { paymentMethod: "Online Payment", paymentStatus: "Paid" },
  Pending: { paymentMethod: "Pay at Counter", paymentStatus: "Pending" },
  Split: { paymentMethod: "Split", paymentStatus: "Paid" },
};

// Payment fields for an order of `total`, or an error message. Split needs the online part, the rest is cash.
const paymentFields = (payment, onlineAmount, total) => {
  if (!PAYMENT[payment]) return "Invalid payment type";
  if (payment !== "Split") return PAYMENT[payment];
  const online = Math.round(Number(onlineAmount));
  if (!Number.isFinite(online) || online <= 0 || online >= total) {
    return `For a split payment, enter an online amount between ₹1 and ₹${total - 1}`;
  }
  return { ...PAYMENT.Split, onlineAmount: online };
};

const findPosOrders = async (from, to) => {
  if (isMongoDBConnected()) {
    return Order.find({ address: POS_ADDRESS, createdAt: { $gte: from, $lt: to } })
      .populate("items.menuItem", "name price image")
      .sort({ createdAt: -1 })
      .lean();
  }
  const orders = (await orderDB.find({ address: POS_ADDRESS })).filter((o) => {
    const d = new Date(o.createdAt);
    return d >= from && d < to;
  });
  return Promise.all(
    orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(async (o) => ({
        ...o,
        items: await Promise.all(o.items.map(async (i) => ({ ...i, menuItem: await menuDB.findById(i.menuItem) }))),
      }))
  );
};

// One shape for the UI; older orders without a price snapshot fall back to the current menu
const toBill = (order) => ({
  _id: order._id,
  createdAt: order.createdAt,
  customerName: order.guestName || "Walk-in",
  status: order.status,
  payment: order.paymentStatus !== "Paid" ? "Pending" : order.paymentMethod === "Online Payment" ? "Online" : order.paymentMethod === "Split" ? "Split" : "Cash",
  ...paidAmounts(order), // cash, online
  discount: order.discount || 0,
  totalAmount: order.totalAmount,
  items: order.items.map((i) => {
    const price = Number(i.price ?? i.menuItem?.price ?? 0);
    const addOn = i.customizations?.addOnPrice || 0;
    return {
      name: i.name ?? i.menuItem?.name ?? "Deleted item",
      image: i.menuItem?.image,
      quantity: i.quantity,
      price,
      addOn,
      toppings: (i.customizations?.selectedToppings || []).map((t) => t.name),
      extraCream: Boolean(i.customizations?.extraCream),
      lineTotal: (price + addOn) * i.quantity,
    };
  }),
});

const summarize = (bills) => {
  const s = { orders: 0, cash: 0, online: 0, collected: 0, unpaid: 0, unpaidCount: 0, discount: 0, cancelled: 0, toServe: 0 };
  const items = {};
  for (const b of bills) {
    if (b.status === "Cancelled") { s.cancelled++; continue; }
    s.orders++;
    s.discount += b.discount;
    if (b.status !== "Delivered") s.toServe++;
    s.cash += b.cash;
    s.online += b.online;
    if (b.payment === "Pending") { s.unpaid += b.totalAmount; s.unpaidCount++; }
    for (const i of b.items) {
      items[i.name] ??= { name: i.name, quantity: 0, amount: 0 };
      items[i.name].quantity += i.quantity;
      items[i.name].amount += i.lineTotal;
    }
  }
  s.collected = s.cash + s.online;
  s.topItems = Object.values(items).sort((a, b) => b.quantity - a.quantity);
  return s;
};

export const placePosOrder = async (req, res) => {
  try {
    const { items = [], customerName = "", payment = "Pending", discount = 0, onlineAmount } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Add at least one item" });
    }
    if (!PAYMENT[payment]) {
      return res.status(400).json({ success: false, message: "Invalid payment type" });
    }

    const lines = [];
    for (const item of items) {
      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: "Invalid quantity" });
      }
      const menuItem = await menuDB.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ success: false, message: "An item in this order no longer exists. Remove it and try again." });
      }
      lines.push({ menuItem, quantity, customizations: priceCustomizations(menuItem, item.customizations) });
    }

    const subtotal = lines.reduce((sum, l) => sum + (Number(l.menuItem.price) + l.customizations.addOnPrice) * l.quantity, 0);
    const appliedDiscount = Math.min(Math.max(0, Math.round(Number(discount) || 0)), subtotal);
    const paid = paymentFields(payment, onlineAmount, subtotal - appliedDiscount);
    if (typeof paid === "string") return res.status(400).json({ success: false, message: paid });

    const order = await orderDB.create({
      guestName: customerName.trim() || null,
      items: lines.map((l) => ({
        menuItem: l.menuItem._id,
        name: l.menuItem.name,
        price: Number(l.menuItem.price),
        quantity: l.quantity,
        customizations: l.customizations,
      })),
      discount: appliedDiscount,
      totalAmount: subtotal - appliedDiscount,
      orderType: "Pickup",
      address: POS_ADDRESS,
      status: "Pending",
      ...paid,
    });

    // Same stock rule as website orders: 1 per distinct item, never below 0
    const seen = new Set();
    for (const l of lines) {
      const id = String(l.menuItem._id);
      if (seen.has(id)) continue;
      seen.add(id);
      const nextStock = Math.max(0, Number(l.menuItem.countInStock ?? 20) - 1);
      await menuDB.findByIdAndUpdate(id, { countInStock: nextStock, isAvailable: nextStock > 0 });
    }

    const plain = order.toObject ? order.toObject() : order;
    res.status(201).json({ success: true, message: "Order placed", order: toBill({ ...plain, items: plain.items.map((i) => ({ ...i, menuItem: null })) }) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Could not place order" });
  }
};

export const getPosOrders = async (req, res) => {
  try {
    const today = businessDate();
    const requested = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "") ? req.query.date : today;
    const date = requested > today ? today : requested;
    const dayStart = businessDayStart(date);
    const todayEnd = addDays(businessDayStart(today), 1);

    // shortcut: history is summed from raw orders each request; fine for a stall's volume, move to an aggregation if it gets slow
    const [dayOrders, historyOrders] = await Promise.all([
      findPosOrders(dayStart, addDays(dayStart, 1)),
      findPosOrders(addDays(todayEnd, -HISTORY_DAYS), todayEnd),
    ]);
    const dayBills = dayOrders.map(toBill);
    const bills = historyOrders.map(toBill);

    const history = [];
    for (let i = 0; i < HISTORY_DAYS; i++) {
      const d = businessDate(addDays(businessDayStart(today), -i));
      const { orders, cash, online, collected, unpaid } = summarize(bills.filter((b) => businessDate(b.createdAt) === d));
      history.push({ date: d, orders, cash, online, collected, unpaid });
    }

    res.json({ success: true, date, today, orders: dayBills, summary: summarize(dayBills), history });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Could not load counter orders" });
  }
};

// One endpoint for the counter screen: mark served, take payment, or cancel
export const updatePosOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment, onlineAmount } = req.body;
    const order = await orderDB.findById(id);
    if (!order || order.address !== POS_ADDRESS) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "This order is cancelled" });
    }

    const update = {};
    if (payment !== undefined) {
      const paid = paymentFields(payment, onlineAmount, order.totalAmount);
      if (typeof paid === "string") return res.status(400).json({ success: false, message: paid });
      Object.assign(update, paid);
    }
    if (status !== undefined) {
      if (!["Pending", "Delivered", "Cancelled"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      update.status = status;
    }

    if (update.status === "Cancelled") {
      // Give back the stock this order took
      const ids = [...new Set(order.items.map((i) => String(i.menuItem)))];
      for (const menuId of ids) {
        const menuItem = await menuDB.findById(menuId);
        if (menuItem) {
          await menuDB.findByIdAndUpdate(menuId, { countInStock: Number(menuItem.countInStock ?? 0) + 1, isAvailable: true });
        }
      }
    }

    await orderDB.findByIdAndUpdate(id, update);
    res.json({ success: true, message: "Order updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Could not update order" });
  }
};
