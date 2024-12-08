const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  encryptWithPlaceholders,
  createPlayfairMatrix,
  encryptPlayfair,
  prepareTextForEncryption,
} = require("./encryption_make");

const router = express.Router();
const db = require("../db");
const User = require("../models/User");
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const newFileName = `encrypted-${timestamp}-${file.originalname}`;
    cb(null, newFileName);
  },
});

const upload = multer({ storage: storage }).single("file");

router.post("/", (req, res) => {
  upload(req, res, async function (err) {
    console.log(req.file?.originalname);
    const key = req?.body?.key;
    console.log(key);

    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(500).send("File upload error.");
    } else if (err) {
      console.error("Unknown upload error:", err);
      return res.status(500).send("Unknown upload error.");
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const filePath = req.file.path;
    const encryptedFilePath = path.join(uploadDir, req.file.filename);

    try {
      const fileContent = fs.readFileSync(filePath, "utf8");

      const encryptedData = encryptWithPlaceholders(key, fileContent);

      const encryptedOutput = {
        encrypted: encryptedData.encrypted,
        nonAlphaMap: encryptedData.nonAlphaMap,
      };
      fs.writeFileSync(encryptedFilePath, JSON.stringify(encryptedOutput));

      const newUser = new User({
        key: key,
        filename: req.file.filename,
        fileurl: `/uploads/${req.file.filename}`,
      });

      await newUser.save();

      const downloadUrl = `${req.protocol}://${req.get("host")}/api/upload/${
        req.file.filename
      }`;

      res.status(200).send({
        message: "File uploaded and encrypted successfully!",
        fileName: req.file.filename,
        filePath: `/uploads/${req.file.filename}`,
        downloadUrl: downloadUrl,
      });
    } catch (encryptionError) {
      console.error("Encryption error:", encryptionError);
      return res.status(500).send("Error during encryption.");
    }
  });
});

router.get("/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found.");
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      return res.status(500).send("Error downloading file.");
    }
  });
});

module.exports = router;
