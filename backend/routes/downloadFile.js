const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const decryptDir = path.join(__dirname, "decrypt");
const uploadsDir = path.join(__dirname, "uploads");

router.get("/:filename", (req, res) => {
  const { filename } = req.params;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required." });
  }

  const filePath = path.join(decryptDir, filename);

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return res.status(404).json({ error: "File not found." });
  }

  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.setHeader("Content-Type", "application/octet-stream");

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);

  readStream.on("close", () => {
    // Delete files after sending
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting file from decrypt directory:", unlinkErr);
      } else {
        console.log("File deleted successfully from decrypt directory.");
      }
    });

    const uploadsFilePath = path.join(uploadsDir, filename);
    fs.unlink(uploadsFilePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting file from uploads directory:", unlinkErr);
      } else {
        console.log("File deleted successfully from uploads directory.");
      }
    });
  });

  readStream.on("error", (err) => {
    console.error("Error reading file:", err);
    return res.status(500).json({ error: "Error reading file." });
  });
});

module.exports = router;
