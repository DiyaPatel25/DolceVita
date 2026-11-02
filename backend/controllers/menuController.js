import DataAccess from "../config/dataAccess.js";
import { saveUploadedImage } from "../utils/imageStore.js";
import { isMongoDBConnected } from "../config/db.js";

// Initialize data access for Menu and Category
const menuDB = new DataAccess('Menu');
const categoryDB = new DataAccess('Category');

export const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image, countInStock, lowStockThreshold } = req.body;
    const uploadedImage = req.file ? await saveUploadedImage(req) : image;

    if (!name || !description || !price || !category || !uploadedImage) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const newMenuItem = await menuDB.create({
      name,
      description,
      price,
      category,
      image: uploadedImage,
      isAvailable: true,
      countInStock: countInStock !== undefined ? Number(countInStock) : 20,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5,
    });
    res.status(201).json({
      message: "Menu item added",
      success: true,
      menuItem: newMenuItem,
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getAllMenuItems = async (req, res) => {
  try {
    let menuItems;
    if (isMongoDBConnected()) {
      const Menu = (await import("../models/menuModel.js")).default;
      menuItems = await Menu.find().populate("category", "name").sort({ createdAt: -1 }).lean();
    } else {
      menuItems = await menuDB.find();
      // Manual population for local storage
      for (let item of menuItems) {
        if (item.category && typeof item.category === 'string') {
          const category = await categoryDB.findById(item.category);
          item.category = category ? { _id: category._id, name: category.name } : null;
        }
      }
      // Sort by createdAt if available
      if (menuItems.length > 0 && menuItems[0].createdAt) {
        menuItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      // Map missing Mongoose defaults for legacy local items
      menuItems = menuItems.map(item => ({
        ...item,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        countInStock: item.countInStock !== undefined ? item.countInStock : 20,
        lowStockThreshold: item.lowStockThreshold !== undefined ? item.lowStockThreshold : 5,
      }));
    }

    res.status(200).json({ success: true, menuItems });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, isAvailable, image, countInStock, lowStockThreshold } = req.body;

    const menuItem = await menuDB.findById(id);
    if (!menuItem)
      return res
        .status(404)
        .json({ message: "Menu item not found", success: false });

    const updateData = {};
    if (req.file) {
      updateData.image = await saveUploadedImage(req);
    } else if (image) {
      updateData.image = image;
    }
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (category) updateData.category = category;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (countInStock !== undefined) updateData.countInStock = Number(countInStock);
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = Number(lowStockThreshold);

    const updatedMenuItem = await menuDB.findByIdAndUpdate(id, updateData);
    res
      .status(200)
      .json({ message: "Menu item updated", success: true, menuItem: updatedMenuItem });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await menuDB.findByIdAndDelete(id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    res.status(200).json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};