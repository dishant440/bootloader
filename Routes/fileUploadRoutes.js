

const express = require("express");
const router = express.Router();
const { fileUpload } = require("../controllers/fileController");
const multer = require("multer");
const { authMiddleware } = require("../middleware/authMiddleware");
const path = require("path");

// Use memory storage for multer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Get the file extension and MIME type
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (fileExtension === ".bin" && mimeType === "application/octet-stream") {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only .bin files are allowed!")); // Reject the file
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.post("/upload", upload.single("file"), authMiddleware, fileUpload);

module.exports = router;
