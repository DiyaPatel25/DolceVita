import multer from "multer";

// Photos are kept in memory and saved to the database; the admin pages shrink them before upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(Object.assign(new Error("Only image files can be uploaded"), { status: 400 })),
});
export default upload;
