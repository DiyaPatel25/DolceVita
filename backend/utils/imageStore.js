import DataAccess from "../config/dataAccess.js";

const imageDB = new DataAccess("Image");

// Photos live in our own database (no third-party image host) and are served from GET /api/menu/image/:id
export const saveUploadedImage = async (req) => {
  const doc = await imageDB.create({ data: req.file.buffer.toString("base64"), contentType: req.file.mimetype });
  // shortcut: the URL uses the host that received the upload, so uploading through a local server pointed at the live DB stores a localhost URL; use the live admin for real uploads
  return `${req.protocol}://${req.get("host")}/api/menu/image/${doc._id}`;
};

export const getImage = async (req, res) => {
  const image = await imageDB.findById(req.params.id);
  if (!image) return res.status(404).end();
  // Each upload gets a new id, so the browser can keep it forever
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.type(image.contentType).send(Buffer.from(image.data, "base64"));
};
