import DataAccess from "../config/dataAccess.js";
import { v2 as cloudinary } from "cloudinary";


// Initialize data access for Category
const categoryDB = new DataAccess('Category');

const uploadImageToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "restaurant",
  });
  return result.secure_url;
};

export const addCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const uploadedImage = req.file ? await uploadImageToCloudinary(req.file.path) : image;

    if (!name || !uploadedImage) {
      return res
        .status(400)
        .json({ message: "Name and image are required", success: false });
    }

    const alreadyExists = await categoryDB.findOne({ name });
    if (alreadyExists) {
      return res
        .status(400)
        .json({ message: "Category already exists", success: false });
    }

    const newCategory = await categoryDB.create({
      name,
      image: uploadedImage,
    });
    res.status(201).json({
      message: "Category added",
      success: true,
      category: newCategory,
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryDB.find();
    // Sort by createdAt if available
    if (categories.length > 0 && categories[0].createdAt) {
      categories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;
    const category = await categoryDB.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }
    
    const updateData = {};
    if (req.file) {
      updateData.image = await uploadImageToCloudinary(req.file.path);
    } else if (image) {
      updateData.image = image;
    }
    if (name) updateData.name = name;
    
    const updatedCategory = await categoryDB.findByIdAndUpdate(id, updateData);
    res
      .status(200)
      .json({ message: "Category updated", success: true, category: updatedCategory });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryDB.findByIdAndDelete(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    return res.json({ message: "Internal server error", success: false });
  }
};
