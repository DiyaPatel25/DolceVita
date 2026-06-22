import express from "express";
import { sendContactMessage } from "../controllers/contactController.js";

const contactRoutes = express.Router();

contactRoutes.post("/send", sendContactMessage);

export default contactRoutes;
