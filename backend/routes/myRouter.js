const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log(req.session);

  res.send("Welcome to the API!");
});

module.exports = router;
