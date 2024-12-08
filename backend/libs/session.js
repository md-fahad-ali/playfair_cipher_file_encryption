const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Acc = require("../models/Acc"); // Import the Acc model

// Passport configuration
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

const sessionMiddleware = session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // Note: secure should be true in production with HTTPS
});

module.exports = {
  sessionMiddleware,
  passport,
};
