const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const Acc = require('../models/Acc'); // Import the Acc model

const router = express.Router();

// Passport configuration
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await Acc.findOne({ email: email });
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

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

router.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Note: secure should be true in production with HTTPS
}));
router.use(passport.initialize());
router.use(passport.session());

// Signup route
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  try {
    // Check if user with the same email or username already exists
    const existingUser = await Acc.findOne({ $or: [{ email: email }, { username: username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with the same email or username already exists.' });
    }

    // Create a new user
    const newUser = new Acc({ firstName, lastName, email, username, password });
    await newUser.save();

    // Log the user in
    req.logIn(newUser, (err) => {
      if (err) {
        return res.status(500).json({ message: 'An error occurred during signup.' });
      }
      return res.status(200).json({ message: 'Signup successful.' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred during signup.' });
  }
});

// Routes
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'An error occurred during login.' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Login failed. Incorrect email or password.' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'An error occurred during login.' });
      }
      return res.status(200).json({ message: 'Login successful.' });
    });
  })(req, res, next);
});

router.get('/login-success', (req, res) => {
  res.send('Login successful');
});

router.get('/login-failure', (req, res) => {
  res.send('Login failed');
});

router.get('/logout', (req, res) => {
  req.logout();
  res.send('Logged out');
});

module.exports = router;
