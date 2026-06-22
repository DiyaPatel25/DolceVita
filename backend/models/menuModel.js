import mongoose from "mongoose";
const menuSchema=new mongoose.Schema({
  name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
 price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Category",
      required:true
    },
    isAvailable:{
      type:Boolean,
      default:true
    },
    countInStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    isCustomizable: {
      type: Boolean,
      default: false
    },
    customizationOptions: {
      type: Object,
      default: {}
    }

},{timestamps:true});

menuSchema.methods.isLowStock = function () {
  return this.countInStock <= this.lowStockThreshold;
};

menuSchema.methods.getAvailableToppings = function () {
  return this.customizationOptions?.toppings || [];
};

menuSchema.methods.hasExtraCreamOption = function () {
  return this.customizationOptions?.hasExtraCream === true;
};

menuSchema.methods.getExtraCreamPrice = function () {
  return this.customizationOptions?.extraCreamPrice || 50;
};

const Menu=mongoose.model("Menu",menuSchema);
export default Menu;