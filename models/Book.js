// models/Book.js
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  rentPrice: Number,
  available: { type: Boolean, default: true },
  coverImage: { type: String, default: "/images/default-cover.jpg" } // path to default image
});

module.exports = mongoose.model("Book", bookSchema);
