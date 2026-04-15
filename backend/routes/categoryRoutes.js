import express from "express";

import {adminOnly} from "../middlewares/authMiddleware.js"
import { addCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/categoryController.js";
const categoryRoutes=express.Router();

categoryRoutes.post("/add",adminOnly,addCategory);
categoryRoutes.put("/update/:id",adminOnly,updateCategory);
categoryRoutes.delete("/delete/:id",adminOnly,deleteCategory);
categoryRoutes.get("/all",getAllCategories);


export default categoryRoutes;