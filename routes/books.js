const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const User = require("../models/User");



//middleware for admin panel
function adminOnly(req, res, next) {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect("/admin");
  }
}

// Browse all books (home page)
router.get("/", async (req, res) => {
  const books = await Book.find();
  const user = req.session.userId ? await User.findById(req.session.userId) : null;
  res.render("home", { books, user });
});


// Show rent page
router.get("/rent/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.send("Book not found");
  res.render("rentBook", { book, userId: req.session.userId });
});

// Rent a book
router.post("/rent/:id", async (req, res) => {
  if(!req.session.userId) return res.redirect("/login");

  const book = await Book.findById(req.params.id);
  if(!book.available) return res.send("Book not available");

  const duration = Number(req.body.duration); // Get selected duration from form
  const totalPrice = book.rentPrice * duration;

  // Calculate return date based on duration (weeks)
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + duration * 7);

  const user = await User.findById(req.session.userId);
  user.rentedBooks.push({ 
    book: book._id, 
    returnDate, 
    duration,       // store duration
    totalPrice      // store total price
  });
  await user.save();

  book.available = false;
  await book.save();

  res.redirect("/books/dashboard");
});

// Return a rented book
router.post("/return/:id", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const user = await User.findById(req.session.userId);
  const bookId = req.params.id;

  // Remove from user's rentedBooks
  user.rentedBooks = user.rentedBooks.filter(item => item.book.toString() !== bookId);
  await user.save();

  // Mark book as available again
  const book = await Book.findById(bookId);
  book.available = true;
  await book.save();

  res.redirect("/books/dashboard");
});


// Dashboard - show user's rented books
router.get("/dashboard", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const user = await User.findById(req.session.userId)
    .populate("rentedBooks.book"); // Populate book details

  res.render("dashboard", { user });
});



module.exports = router;
