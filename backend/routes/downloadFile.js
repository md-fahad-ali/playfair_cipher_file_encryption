const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const decryptDir = path.join(__dirname, "decrypt");
const uploadsDir = path.join(__dirname, "uploads");

router.get("/:filename", (req, res) => {
  const { filename } = req.params;

  if (!filename) {
    return res.status(400).send("Filename is required.");
  }

  const filePath = path.join(decryptDir, filename);
  console.log(filePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found.");
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      return res.status(500).send("Error downloading file.");
    }

    // Delete the file from the decrypt directory after download
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting file from decrypt directory:", unlinkErr);
      } else {
        console.log("File deleted successfully from decrypt directory.");
      }
    });

    // Delete the file from the uploads directory
    const uploadsFilePath = path.join(uploadsDir, filename);
    fs.unlink(uploadsFilePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting file from uploads directory:", unlinkErr);
      } else {
        console.log("File deleted successfully from uploads directory.");
      }
    });
  });
});

module.exports = router;
