const Book = require("../models/booksModel");
const Review = require("../models/reviewModel");
const mongoose = require("mongoose");

exports.getBooks = async (req, res) => {
  try {
    const { after, limit = 6 } = req.query;

    const query = after ? { _id: { $gt: after } } : {};
    const books = await Book.find(query)
      .sort({ _id: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: "success",
      page: 1,
      totalPages: 1,
      totalItems: books.length,
      results: books.length,
      data: books,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getBookBySlug = async (req, res) => {
  try {
    const book = await Book.findOne({ slug: req.params.slug }).populate('reviews');

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};