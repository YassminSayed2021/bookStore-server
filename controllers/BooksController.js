const Book = require("../models/booksModel");

exports.getBooks = async (req, res) => {
  try {
    const { after, limit = 6 } = req.query;

    const query = after ? { _id: { $gt: after } } : {};

    const books = await Book.find(query)
      .sort({ _id: 1 })
      .limit(parseInt(limit));

    res.json(books);
  } catch (err) {
    console.error("Failed to fetch books:", err);
    res.status(500).json({ message: err.message });
  }
};
