const express = require("express");
const router = express.Router();
const path = require("path");
const xlsx = require("xlsx");
const { protect } = require("../middleware/auth");
const File = require("../models/File");
const axios = require("axios");
const upload = require("../lib/cloudinary");

// Upload file
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const file = await File.create({
      filename: req.file.filename, // cloudinary unique ID
      originalName: req.file.originalname || req.file.filename || "",
      path: req.file.path || req.file.url || req.file.secure_url, // <-- safer
      size: req.file.size || 0,
      mimetype: req.file.mimetype || "",
      user: req.user.id,
    });

    res.status(201).json(file);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get user's files - place BEFORE any /:id routes
router.get("/my-files", protect, async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id });
    res.status(200).json(files);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get file data (Excel JSON)
router.get("/:id/data", protect, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const response = await axios.get(file.path, {
      responseType: "arraybuffer",
    });
    const workbook = xlsx.read(response.data, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    res.status(200).json({
      headers: Object.keys(data[0]),
      data: data,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Download file
router.get("/:id/download", protect, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const response = await axios.get(file.path, {
      responseType: "arraybuffer",
    });

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${file.originalName}`
    );

    res.send(response.data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get file metadata - place AFTER more specific routes
router.get("/:id", protect, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json(file);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete file
router.delete("/:id", protect, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    await File.findByIdAndDelete(req.params.id);

    const { logActivity } = require("../middleware/auth");
    logActivity(req.user, "deleted_file", {
      fileId: req.params.id,
      fileName: file.originalName,
    });

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
