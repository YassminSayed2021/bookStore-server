
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
      status: 'success',
      page: 1,
      totalPages: 1,
      totalItems: books.length,
      results: books.length,
      data: books // 👈 ده هو المفتاح اللي Angular بتدور عليه
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log("ID received:", bookId);

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      console.log("Invalid ObjectId format");
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findById(bookId);
    console.log("Book found:", book);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ data: book });

  } catch (err) {
    console.error("❌ Error in getBookById:", err.stack); // مهم نطبع stack
    res.status(500).json({ message: "Server error" });
  }
};
