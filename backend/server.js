const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { sessionMiddleware, passport } = require("./libs/session"); // Import session, cookieParser, and passport from lib/session
const accountsRouter = require("./accounts/login");
const signupRouter = require("./accounts/signup");
const logoutRouter = require("./accounts/logout"); // Import logout route
const decryptRouter = require("./routes/decryptFile");
const downloadRouter = require("./routes/downloadFile");
const checkSessionRouter = require("./routes/checkSession");
const decryptfileKey = require("./routes/decryptfileKey");

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all origins
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:5000",
    ],
    credentials: true,
  })
);

// Use session middleware

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/mydatabase', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('Could not connect to MongoDB', err));

// Import routes
const myRouter = require("./routes/myRouter");
const uploadRouter = require("./routes/uploadRouter");

// Use routes
app.use("/api", myRouter);
app.use("/api/upload", uploadRouter); // Corrected to specify the path for uploadRouter
app.use("/api/accounts", accountsRouter);
app.use("/accounts/logout", logoutRouter); // Use logout route
app.use("/api/decrypt", decryptRouter); // Corrected to specify the path for decryptRouter
app.use("/api/decryptfile", decryptfileKey); // Corrected to specify the path for decryptRouter
app.use("/api/downloads", downloadRouter);
app.use("/api/check-session", checkSessionRouter); // Use check-session route

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
