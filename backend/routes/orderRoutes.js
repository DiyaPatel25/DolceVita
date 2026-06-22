import express from "express";

import {adminOnly,protect} from "../middlewares/authMiddleware.js"
import { createPaymentOrder, getAllOrders, getUserOrders, placeOrder, updateOrderStatus, verifyPaymentSignature } from "../controllers/orderController.js";
const orderRoutes=express.Router();
orderRoutes.post("/create-payment-order", createPaymentOrder);
orderRoutes.post("/verify-payment", verifyPaymentSignature);
orderRoutes.post("/place",placeOrder);
orderRoutes.get("/my-orders",protect,getUserOrders);
orderRoutes.get("/orders",adminOnly,getAllOrders);
orderRoutes.put("/update-status/:orderId",adminOnly,updateOrderStatus);


export default orderRoutes;