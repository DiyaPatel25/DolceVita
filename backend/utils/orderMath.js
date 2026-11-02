// Mirrors the fallback list in frontend CustomizerModal so server prices match what the customer saw
const DEFAULT_TOPPINGS = [
  { name: "Nutella", price: 30 },
  { name: "Biscoff", price: 25 },
  { name: "Chocolate Shavings", price: 20 },
  { name: "Caramel Drizzle", price: 15 },
  { name: "Sprinkles", price: 10 },
];

// Never trust a client-sent addOnPrice: re-price the chosen options from the menu item
export const priceCustomizations = (menuItem, customizations = {}) => {
  const opts = menuItem?.customizationOptions || {};
  const toppings = opts.toppings || DEFAULT_TOPPINGS;
  const extraCream = Boolean(customizations?.extraCream && opts.hasExtraCream);
  const selectedToppings = (customizations?.selectedToppings || [])
    .map((t) => toppings.find((o) => o.name === t?.name))
    .filter(Boolean)
    .map((t) => ({ name: t.name, price: Number(t.price) || 0 }));
  const addOnPrice =
    (extraCream ? Number(opts.extraCreamPrice) || 50 : 0) +
    selectedToppings.reduce((sum, t) => sum + t.price, 0);
  return { extraCream, selectedToppings, addOnPrice };
};

// A business day runs 2 AM to 2 AM India time, so late-night sales count toward the evening they belong to.
// The server (Render) runs on UTC, so the offset is applied explicitly.
const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_START_HOUR = 2;
export const businessDate = (date = new Date()) =>
  new Date(new Date(date).getTime() + IST_OFFSET_MS - DAY_START_HOUR * 60 * 60 * 1000).toISOString().slice(0, 10);
export const businessDayStart = (dateString) => new Date(`${dateString}T0${DAY_START_HOUR}:00:00+05:30`);
export const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

// How much of a paid order came in as cash and as online. "Split" means the customer paid
// onlineAmount online and the rest in cash (e.g. ₹150 bill: ₹50 UPI + ₹100 cash).
export const paidAmounts = (order) => {
  const total = Number(order.totalAmount) || 0;
  if (order.paymentStatus !== "Paid") return { cash: 0, online: 0 };
  if (order.paymentMethod === "Online Payment") return { cash: 0, online: total };
  if (order.paymentMethod === "Split") {
    const online = Math.min(total, Math.max(0, Number(order.onlineAmount) || 0));
    return { cash: total - online, online };
  }
  return { cash: total, online: 0 };
};
