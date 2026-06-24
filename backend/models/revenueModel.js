import mongoose from "mongoose";

const revenueSchema = new mongoose.Schema({
  date: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Format: YYYY-MM-DD
  totalRevenue: { 
    type: Number, 
    default: 0 
  },
  cashRevenue: { 
    type: Number, 
    default: 0 
  },
  onlineRevenue: { 
    type: Number, 
    default: 0 
  },
  ordersCount: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

const Revenue = mongoose.model("Revenue", revenueSchema);
export default Revenue;
