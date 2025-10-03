const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Book = require("../models/Book");
const bcrypt = require("bcryptjs");


// Root route - homepage
router.get("/", async (req, res) => {
  try {
    // Fetch all books from the database
    const books = await Book.find();

    // Render home.ejs with books
    res.render("home", { books });
  } catch (err) {
    console.error("Error fetching books:", err);

    // Render home.ejs with empty array if DB fails
    res.render("home", { books: [] });
  }
});

// Register
router.get("/register", (req, res) => res.render("register"));
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    res.send("Error: " + err);
  }
});

// Login
router.get("/login", (req, res) => res.render("login"));
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.send("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("Wrong password");

  // ← Set session here
  req.session.userId = user._id;

  res.redirect("/books"); // or redirect to dashboard
});

//logout
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if(err) return res.send("Error logging out");
    res.redirect("/login");
  });
});

///////////ADMIN PANNEL/////////////
// Admin login page
router.get("/admin", (req, res) => {
  res.render("adminLogin");
});

router.post("/admin", (req, res) => {
  const { username, password } = req.body;

  // Hardcoded admin credentials (for testing)
  if (username === "admin" && password === "admin1234") {
    req.session.isAdmin = true;
    return res.redirect("/admin/dashboard");
  }

  res.send("Invalid admin credentials");
});

// Admin logout
router.get("/admin/logout", (req, res) => {
  req.session.isAdmin = false;
  res.redirect("/admin");
});



module.exports = router;
