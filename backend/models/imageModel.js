import mongoose from "mongoose";

// Uploaded photos (menu items, categories), stored as base64 so the local JSON fallback can hold them too
const imageSchema = new mongoose.Schema({
  data: { type: String, required: true },
  contentType: { type: String, required: true },
}, { timestamps: true });

const Image = mongoose.model("Image", imageSchema);
export default Image;
