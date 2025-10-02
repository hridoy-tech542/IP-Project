// routes/admin.js
const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const multer = require("multer");
const path = require("path");

// Admin middleware
function adminOnly(req, res, next) {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect("/admin");
  }
}

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/"); // save in public/images folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage: storage });

// Admin login page
router.get("/admin", (req, res) => {
  res.render("adminLogin");
});

router.post("/admin", (req, res) => {
  const { username, password } = req.body;

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

// Admin dashboard
router.get("/admin/dashboard", adminOnly, async (req, res) => {
  const books = await Book.find();
  res.render("adminDashboard", { books });
});

// Add new book WITH image upload
router.post("/admin/add", adminOnly, upload.single("coverImage"), async (req, res) => {
  const { title, author, description, rentPrice } = req.body;

  // Default cover image
  let coverImagePath = "/images/default-cover.jpg";

  if (req.file) {
    coverImagePath = "/images/" + req.file.filename;
  }

  await Book.create({
    title,
    author,
    rentPrice,
    coverImage: coverImagePath,
    available: true,
  });

  res.redirect("/admin/dashboard");
});

// Delete book
router.post("/admin/delete/:id", adminOnly, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect("/admin/dashboard");
});

// Update book
router.post("/admin/update/:id", adminOnly, async (req, res) => {
  const { title, author, description, rentPrice } = req.body;
  await Book.findByIdAndUpdate(req.params.id, { title, author, description, rentPrice });
  res.redirect("/admin/dashboard");
});

module.exports = router;

