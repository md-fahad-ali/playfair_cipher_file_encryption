const express = require("express");
const router = express.Router();
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

router.post("/", async (req, res) => {
  console.log(req.body);
  const { key, filename } = req.body;

  if (!key || !filename) {
    return res.status(400).send("Decryption key and filename are required.");
  }

  const inputFilePath = path.join(uploadDir, filename);
  if (!fs.existsSync(inputFilePath)) {
    return res.status(404).send("File not found.");
  }

  try {
    const user = await User.findOne({ filename: filename, key: key });
    if (!user) {
      return res
        .status(403)
        .send("Invalid decryption key for the specified file.");
    }

    const encryptedData = JSON.parse(fs.readFileSync(inputFilePath, "utf8"));
    const { encrypted, nonAlphaMap } = encryptedData;

    const decryptedContent = decryptFile(key, encrypted, nonAlphaMap);
    const decryptedFilePath = path.join(decryptDir, filename);
    fs.writeFileSync(decryptedFilePath, decryptedContent);

    console.log(decryptedContent);

    res.status(200).send({
      message: "File decrypted successfully!",
      downloadLink: `${req.protocol}://${req.get(
        "host"
      )}/api/downloads/${filename}`,
    });
  } catch (decryptionError) {
    console.error("Decryption error:", decryptionError);
    return res.status(500).send("Error during decryption.");
  }
});

module.exports = router;
