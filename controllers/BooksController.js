const Book = require("../models/booksModel");
const Review = require("../models/reviewModel");
const mongoose = require("mongoose");

exports.getBooks = async (req, res) => {
  try {
    let { page = 1, limit = 6 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) page = 1;
    if (limit < 1) limit = 6;

    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments();

    res.status(200).json({
      status: "success",
      page: 1,
      totalPages: 1,
      totalItems: books.length,
      status: "success",
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      results: books.length,
      data: books,
    });
  } catch (err) {
    console.error("Failed to fetch books:", err);
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

    const reviews = await Review.find({ book: book._id });
    const reviewsCount = reviews.length;
    const averageRating = reviewsCount
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount
      : 0;

    res.status(200).json({
      data: {
        ...book,
        reviewsCount,
        averageRating: Number(averageRating.toFixed(1)),
      },
    });
  } catch (err) {
    console.error("❌ Error in getBookById:", err.stack);
    res.status(500).json({ message: "Server error" });
  }
};
