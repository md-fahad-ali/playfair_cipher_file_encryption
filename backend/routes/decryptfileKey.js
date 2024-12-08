const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { decryptFile } = require("./encryption_make");
const User = require("../models/User");

const uploadDir = path.join(__dirname, "uploads");
const decryptDir = path.join(__dirname, "decrypt");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(decryptDir)) {
  fs.mkdirSync(decryptDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const newFileName = `decrypted-${timestamp}-${file.originalname}`;
    cb(null, newFileName);
  },
});

const upload = multer({ storage: storage }).single("file");

router.post("/", (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(500).send("File upload error.");
    } else if (err) {
      console.error("Unknown upload error:", err);
      return res.status(500).send("Unknown upload error.");
    }

    const key = req.body.key;
    const file = req.file;

    console.log(key, file);

    if (!file || !key) {
      return res.status(400).send("Decryption key and file are required.");
    }

    const inputFilePath = path.join(uploadDir, file.filename);
    const decryptedFilePath = path.join(decryptDir, file.filename);

    try {
      const user = await User.findOne({
        filename: file.originalname,
        key: key,
      });
      console.log(user);
      if (!user) {
        return res
          .status(403)
          .send("Invalid decryption key for the specified file.");
      }

      const encryptedData = JSON.parse(fs.readFileSync(inputFilePath, "utf8"));
      const { encrypted, nonAlphaMap } = encryptedData;

      const decryptedContent = decryptFile(key, encrypted, nonAlphaMap);
      fs.writeFileSync(decryptedFilePath, decryptedContent);

      res.status(200).send({
        message: "File decrypted successfully!",
        downloadLink: `${req.protocol}://${req.get("host")}/api/downloads/${
          file.filename
        }`,
      });
    } catch (decryptionError) {
      console.error("Decryption error:", decryptionError);
      return res.status(500).send("Error during decryption.");
    }
  });
});

module.exports = router;
