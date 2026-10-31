// Loads the printed Dolce Vita menu into MongoDB (when MONGO_URL connects) and into the local JSON fallback.
// Safe to re-run: items are matched by name, so edit prices below and run `npm run seed:menu` again.
// Old items/categories not listed here are removed; past orders keep their item names and prices.
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDB, isMongoDBConnected } from "./config/db.js";
import Category from "./models/categoryModel.js";
import Menu from "./models/menuModel.js";
import Cart from "./models/cartModel.js";

const photo = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=70&auto=format&fit=crop`;
const EXTRAS = { hasExtraCream: false, toppings: [
  { name: "Any Chocolate", price: 30 },
  { name: "Nutella", price: 30 },
  { name: "Biscoff", price: 30 },
] };

// Item names repeat across sections ("Single Chocolate"), so each gets its section in the name
const MENU = [
  { category: "Cheesecakes", suffix: "Cheesecake", image: photo("1533134242443-d4fd215305ad"),
    description: "Creamy chilled cheesecake.", items: [
      ["Strawberry Bliss Burst", 119], ["Dark Cocoa", 129], ["Nutella Silk Swirl", 129], ["KitKat Break", 129],
      ["Oreo Frostbite", 129], ["Blueberry Velvet Bloom", 139], ["Golden Crunch Biscoff", 139],
      ["Choco Almond Crunch", 139], ["Kunafa Pistachio", 159],
    ] },
  { category: "Brownies", suffix: "Brownie", image: photo("1606313564200-e75d5e30476c"),
    description: "Fudgy chocolate brownie.", items: [
      ["Single Chocolate", 85], ["Double Chocolate", 109], ["Triple Chocolate", 119], ["Choco Almond Crunch", 119],
      ["Oreo Frostbite", 119], ["KitKat Break", 119], ["Golden Crunch Biscoff", 119], ["Nutella", 119],
      ["Dolce Vita Signature", 139],
    ] },
  { category: "Cake Bowls", suffix: "Cake Bowl", image: photo("1563805042-7684c019e1cb"),
    description: "Layered cake served in a bowl.", items: [
      ["Single Chocolate", 149], ["Double Chocolate", 149], ["Triple Chocolate", 149], ["Oreo Frostbite", 149],
      ["KitKat Break", 149], ["Choco Almond Crunch", 169], ["Strawberry Burst", 169], ["Dolce Vita Signature", 179],
    ] },
  { category: "Tub Cakes", suffix: "Tub Cake", image: photo("1571115177098-24ec42ed204d"),
    description: "Soft layered cake in a tub.", items: [
      ["KitKat Break", 129], ["Oreo Frostbite", 129], ["Nutella Silk Swirl", 129], ["Strawberry Choco Burst", 149],
      ["Dream Dark Cocoa", 149],
    ] },
  { category: "Waffles", suffix: "Waffle", image: photo("1562376552-0d160a2f238d"),
    description: "Fresh warm waffle.", items: [
      ["Single Chocolate", 129], ["Double Chocolate", 139], ["Triple Chocolate", 149], ["KitKat Break", 149],
      ["Oreo Frostbite", 149], ["Biscoff", 149], ["Nutella Silk Swirl", 149], ["Strawberry Choco Burst", 149],
    ] },
  { category: "London Chocolate Strawberry", suffix: "London Strawberry", image: photo("1488477181946-6428a0291777"),
    description: "Fresh strawberries with chocolate, packed in a glass. Add extras for ₹30 each.", options: EXTRAS, items: [
      ["Single Chocolate", 129], ["Double Chocolate", 139], ["Triple Chocolate", 149], ["Nutella", 169],
      ["With Brownie", 149], ["Pistachio", 179], ["Wafer Strawberry Chocolate", 149],
    ] },
];

const items = MENU.flatMap((section) =>
  section.items.map(([name, price]) => ({
    category: section.category,
    name: `${name} ${section.suffix}`,
    description: section.description,
    price,
    image: section.image,
    isCustomizable: Boolean(section.options),
    customizationOptions: section.options || {},
  }))
);
const names = new Set(items.map((i) => i.name));
if (names.size !== items.length) throw new Error("Duplicate item names in MENU");

const seedMongo = async () => {
  const db = mongoose.connection.db;

  // 1. Past orders: copy name/price from the menu they point at, before any old item is deleted
  const menuById = new Map((await Menu.find().lean()).map((m) => [String(m._id), m]));
  let backfilled = 0;
  for (const order of await db.collection("orders").find({ "items.name": { $exists: false } }).toArray()) {
    const orderItems = order.items.map((i) => {
      const m = menuById.get(String(i.menuItem));
      return i.name || !m ? i : { ...i, name: m.name, price: Number(m.price) };
    });
    await db.collection("orders").updateOne({ _id: order._id }, { $set: { items: orderItems } });
    backfilled++;
  }

  // 2. Categories and items (stock and availability of existing items are kept)
  const categoryIds = {};
  // The site lists newest first, so create in reverse to show the printed order
  for (const section of [...MENU].reverse()) {
    const cat = await Category.findOneAndUpdate(
      { name: section.category },
      { name: section.category, image: section.image },
      { upsert: true, new: true }
    );
    categoryIds[section.category] = cat._id;
  }
  for (const { category, ...item } of [...items].reverse()) {
    await Menu.updateOne({ name: item.name }, { $set: { ...item, category: categoryIds[category] } }, { upsert: true });
  }

  // 3. Remove what is no longer on the printed menu, and drop those items from open carts
  const removedMenus = await Menu.deleteMany({ name: { $nin: [...names] } });
  const removedCategories = await Category.deleteMany({ name: { $nin: MENU.map((s) => s.category) } });
  const liveIds = (await Menu.find({}, { _id: 1 }).lean()).map((m) => m._id);
  await Cart.updateMany({}, { $pull: { items: { menuItem: { $nin: liveIds } } } });

  console.log(`MongoDB: ${items.length} items in ${MENU.length} categories; removed ${removedMenus.deletedCount} old items and ${removedCategories.deletedCount} old categories; saved names/prices into ${backfilled} past orders.`);
};

const seedLocal = () => {
  const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
  const now = new Date().toISOString();
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const categories = MENU.map((s) => ({ _id: `cat-${slug(s.category)}`, name: s.category, image: s.image, createdAt: now, updatedAt: now }));
  const menus = items.map(({ category, ...item }) => ({
    _id: `menu-${slug(item.name)}`,
    ...item,
    category: `cat-${slug(category)}`,
    isAvailable: true,
    countInStock: 20,
    lowStockThreshold: 5,
    createdAt: now,
    updatedAt: now,
  }));
  fs.writeFileSync(path.join(dataDir, "categories.json"), JSON.stringify(categories, null, 2));
  fs.writeFileSync(path.join(dataDir, "menus.json"), JSON.stringify(menus, null, 2));
  console.log(`Local JSON: wrote ${menus.length} items in ${categories.length} categories.`);
};

seedLocal();
await connectDB();
if (isMongoDBConnected()) await seedMongo();
else console.log("MongoDB not connected: only the local JSON files were updated.");
await mongoose.disconnect();
