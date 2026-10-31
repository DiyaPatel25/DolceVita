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

// The shop runs on India time; the server (Render) runs on UTC
const IST_OFFSET_MS = 330 * 60 * 1000;
export const istDateString = (date = new Date()) =>
  new Date(new Date(date).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
export const istDayStart = (dateString) => new Date(`${dateString}T00:00:00+05:30`);
export const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
