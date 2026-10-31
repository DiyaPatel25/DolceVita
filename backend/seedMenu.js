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

// Item names repeat across sections ("Single Chocolate"), so each gets its section in the name.
// Each item is [name, price, Unsplash photo id]; the section image is used for the category tile.
const MENU = [
  { category: "Cheesecakes", suffix: "Cheesecake", image: photo("1533134242443-d4fd215305ad"),
    description: "Creamy chilled cheesecake.", items: [
      ["Strawberry Bliss Burst", 119, "1622621746668-59fb299bc4d7"], ["Dark Cocoa", 129, "1683654974368-23a8b4386b41"], ["Nutella Silk Swirl", 129, "1708175313814-679cb8e90d2e"], ["KitKat Break", 129, "1695886855883-d7162c1e3b09"],
      ["Oreo Frostbite", 129, "1623548694299-c3eb13a26c5b"], ["Blueberry Velvet Bloom", 139, "1695088957420-c3b97d1f1138"], ["Golden Crunch Biscoff", 139, "1771220433638-173b9579d199"],
      ["Choco Almond Crunch", 139, "1782839757699-52f9e3607bb5"], ["Kunafa Pistachio", 159, "1716579862099-acd0967de37b"],
    ] },
  { category: "Brownies", suffix: "Brownie", image: photo("1606313564200-e75d5e30476c"),
    description: "Fudgy chocolate brownie.", items: [
      ["Single Chocolate", 85, "1605190557072-1fe6a230ee65"], ["Double Chocolate", 109, "1636743715220-d8f8dd900b87"], ["Triple Chocolate", 119, "1606313564573-104197cf8f91"], ["Choco Almond Crunch", 119, "1608732221156-40cb3ed65b9b"],
      ["Oreo Frostbite", 119, "1588258382591-5725de4bb861"], ["KitKat Break", 119, "1611060516311-84aab2454de8"], ["Golden Crunch Biscoff", 119, "1599743527873-5930a502cfc4"], ["Nutella", 119, "1587825180295-71aeff48feed"],
      ["Dolce Vita Signature", 139, "1624353365286-3f8d62daad51"],
    ] },
  { category: "Cake Bowls", suffix: "Cake Bowl", image: photo("1563805042-7684c019e1cb"),
    description: "Layered cake served in a bowl.", items: [
      ["Single Chocolate", 149, "1590080874810-8180c3eb1016"], ["Double Chocolate", 149, "1673551494277-92204546b504"], ["Triple Chocolate", 149, "1678436655716-3f33818e5311"], ["Oreo Frostbite", 149, "1616534052904-a8093e507360"],
      ["KitKat Break", 149, "1628585352636-f4a24c2e17d5"], ["Choco Almond Crunch", 169, "1737700087822-0dfbb754db30"], ["Strawberry Burst", 169, "1749280446205-93b204271142"], ["Dolce Vita Signature", 179, "1629980173135-9b01683515f5"],
    ] },
  { category: "Tub Cakes", suffix: "Tub Cake", image: photo("1571115177098-24ec42ed204d"),
    description: "Soft layered cake in a tub.", items: [
      ["KitKat Break", 129, "1584818676673-f034ea74ccfc"], ["Oreo Frostbite", 129, "1626263468007-a9e0cf83f1ac"], ["Nutella Silk Swirl", 129, "1673874500167-17ca5ed1cf17"], ["Strawberry Choco Burst", 149, "1733590109295-7b69a44781ab"],
      ["Dream Dark Cocoa", 149, "1709195902163-7eee13e78970"],
    ] },
  { category: "Waffles", suffix: "Waffle", image: photo("1562376552-0d160a2f238d"),
    description: "Fresh warm waffle.", items: [
      ["Single Chocolate", 129, "1613483515012-8879be29b578"], ["Double Chocolate", 139, "1721078917681-40f74d16d7b7"], ["Triple Chocolate", 149, "1652101898564-034889096be4"], ["KitKat Break", 149, "1680457759468-53634c550489"],
      ["Oreo Frostbite", 149, "1675194588436-9c76aa85795d"], ["Biscoff", 149, "1625860927329-df5602da7729"], ["Nutella Silk Swirl", 149, "1634215751955-5bdb12db6c0c"], ["Strawberry Choco Burst", 149, "1701694472041-fc7faca1bdb6"],
    ] },
  { category: "London Chocolate Strawberry", suffix: "London Strawberry", image: photo("1488477181946-6428a0291777"),
    description: "Fresh strawberries with chocolate, packed in a glass. Add extras for ₹30 each.", options: EXTRAS, items: [
      ["Single Chocolate", 129, "1621792907526-e69888069079"], ["Double Chocolate", 139, "1503624280608-6b79dc9ab03d"], ["Triple Chocolate", 149, "1646902823849-1aa943a17f46"], ["Nutella", 169, "1749767138185-793f09915dc3"],
      ["With Brownie", 149, "1589734836710-b40d84375687"], ["Pistachio", 179, "1630859885680-8f780e2e65a9"], ["Wafer Strawberry Chocolate", 149, "1622219768619-58b9d2937049"],
    ] },
];

const items = MENU.flatMap((section) =>
  section.items.map(([name, price, photoId]) => ({
    category: section.category,
    name: `${name} ${section.suffix}`,
    description: section.description,
    price,
    image: photo(photoId),
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
    // Keep a photo the owner uploaded in admin; only stock photos are replaced
    const existing = await Menu.findOne({ name: item.name }, { image: 1 }).lean();
    const image = existing?.image && !existing.image.startsWith("https://images.unsplash.com/") ? existing.image : item.image;
    await Menu.updateOne({ name: item.name }, { $set: { ...item, image, category: categoryIds[category] } }, { upsert: true });
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
