// controllers/bookManagementController.js
const Book = require("../models/booksModel");

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
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      results: books.length,
      data: books,
    });
  } catch (err) {
    console.error("Failed to fetch books:", err);
    res.status(500).json({ message: "Server error." });
  }
};
