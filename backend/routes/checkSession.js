const express = require("express");
const {
  sessionMiddleware,
  passport,
} = require("../libs/session");
const router = express.Router();


router.use(sessionMiddleware);

router.get("/", (req, res) => {
  console.log(req.session);
  if (req.isAuthenticated()) {
    res.status(200).json({ authenticated: true, user: req.user });
  } else {
    res
      .status(401)
      .json({ authenticated: false, message: "User not authenticated" });
  }
});

module.exports = router;
