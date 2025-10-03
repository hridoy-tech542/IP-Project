// app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/User");
const adminRoutes = require("./routes/admin");

const app = express();

// MongoDB Atlas connection

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

//Session middleware
app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  next();
});

//Middleware
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      res.locals.user = user; // available in all EJS templates
    } catch (err) {
      console.log(err);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

// Routes
app.use("/", require("./routes/auth"));
app.use("/books", require("./routes/books"));
app.use("/", adminRoutes);

// Start server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
