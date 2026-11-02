import mongoose from "mongoose";
const categorySchema=new mongoose.Schema({
   name:{
      type:String,
      required:true,
      unique:true,
      trim:true
   },
   image:{
      type:String,
      required:true
   },
   // Counter-only section (e.g. Beverages); hidden from the website
   counterOnly:{
      type:Boolean,
      default:false
   }
},{timestamps:true});

const Category=mongoose.model("Category",categorySchema);
export default Category;