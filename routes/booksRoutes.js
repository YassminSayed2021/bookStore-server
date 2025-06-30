const express = require("express");
const router = express.Router();
const Product = require("../models/booksModel");

// Get all books

router.get("/", async (req, res) => {
  try {
    const books = await Product.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
