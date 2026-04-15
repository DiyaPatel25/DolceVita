import DataAccess from "../config/dataAccess.js";
import { v2 as cloudinary } from "cloudinary";
import { isMongoDBConnected } from "../config/db.js";

// Initialize data access for Menu and Category
const menuDB = new DataAccess('Menu');
const categoryDB = new DataAccess('Category');

export const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    if (!name || !description || !price || !category || !req.file) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    const result = await cloudinary.uploader.upload(req.file.path);

    const newMenuItem = await menuDB.create({
      name,
      description,
      price,
      category,
      image: result.secure_url
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
    let menuItems = await menuDB.find();
    
    // Handle category population based on storage type
    if (isMongoDBConnected()) {
      // MongoDB will handle populate automatically in the model
      const Menu = (await import("../models/menuModel.js")).default;
      menuItems = await Menu.find().populate("category", "name").sort({ createdAt: -1 });
    } else {
      // Manual population for local storage
      for (let item of menuItems) {
        if (item.category) {
          const category = await categoryDB.findById(item.category);
          item.category = category ? { _id: category._id, name: category.name } : null;
        }
      }
      // Sort by createdAt if available
      if (menuItems.length > 0 && menuItems[0].createdAt) {
        menuItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
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
    const { name, description, price, category, isAvailable } = req.body;

    const menuItem = await menuDB.findById(id);
    if (!menuItem)
      return res
        .status(404)
        .json({ message: "Menu item not found", success: false });

    const updateData = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.image = result.secure_url;
    }
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (category) updateData.category = category;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

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
    res.status(200).json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};