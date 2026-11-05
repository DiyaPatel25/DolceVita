import mongoose from "mongoose";
const orderSchema=new mongoose.Schema({
   user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:false // POS (counter) orders have no customer account
  },
  guestName: {
    type: String,
    required: false
  },
   items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        // Snapshot at order time so old bills don't change when the menu price changes
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
        },
        customizations: {
          type: Object,
          default: {}
        }
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderType: {
      type: String,
      enum: ["Pickup", "Delivery"],
      default: "Pickup",
    },
    address: {
      type: String,
      required: true,
    },
    // Website pickup orders: how to reach the customer and when they'll come
    phone: String,
    pickupTime: String,
    note: String,
      status: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"],
      default: "Pending",
    },
     paymentMethod: {
      type: String,
      default: "Pay at Counter",
    },
    // Only for paymentMethod "Split": the part paid online; the rest of totalAmount was cash
    onlineAmount: Number,
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
},{timestamps:true});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ address: 1, createdAt: -1 });

const Order=mongoose.model("Order",orderSchema);
export default Order;