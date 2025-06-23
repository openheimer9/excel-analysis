const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for raw files (like Excel)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "excel_uploads", // Cloudinary folder name
    resource_type: "raw", // Required for non-image files
    format: "xlsx", // Optional: force .xlsx
    public_id: file.originalname.split(".")[0], // 👈 This now works
  }),
});

// Create multer upload middleware
const upload = multer({ storage });

module.exports = upload;
