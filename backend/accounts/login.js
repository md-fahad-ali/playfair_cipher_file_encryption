const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; // Define LocalStrategy
const {
  sessionMiddleware,
} = require("../libs/session");
const Acc = require("../models/Acc"); // Import the Acc model

const router = express.Router();

// Use the imported passport configuration
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await Acc.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Acc.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware

router.use(sessionMiddleware);
router.use(passport.initialize());
router.use(passport.session());

// Routes
router.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "An error occurred during login." });
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: "Login failed. Incorrect email or password." });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "An error occurred during login." });
      }
      // Create session after successful login
      console.log(req.session);

      return res.status(200).json({ message: "Login successful." });
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  res.send("Logged out");
});

module.exports = router;
