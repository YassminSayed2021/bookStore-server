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

// exports.getFilteredBooks = async (req, res) => {
//   try {
//     const { genre, language, priceMin, priceMax } = req.query;

//     const query = {};

//     // Category filter
//     if (genre) {
//       if (Array.isArray(genre)) {
//         query.category = { $in: genre };
//       } else {
//         query.category = genre;
//       }
//     }

//     // Price filter
//     if (priceMin || priceMax) {
//       query.price = {};
//       if (priceMin) query.price.$gte = Number(priceMin);
//       if (priceMax) query.price.$lte = Number(priceMax);
//     }

//     // Language stock filter
//     if (language) {
//       // Map language name to stock key
//       const stockFieldMap = {
//         Arabic: "ar",
//         English: "en",
//         French: "fr",
//       };

//       const langKeys = Array.isArray(language) ? language : [language];

//       // Build $or to match any selected language with stock > 0
//       query.$or = langKeys
//         .map((lang) => {
//           const key = stockFieldMap[lang];
//           if (!key) return null;
//           return { [`stock.${key}`]: { $gt: 0 } };
//         })
//         .filter(Boolean);
//     }

//     const books = await Book.find(query).sort({ createdAt: -1 });

//     res.status(200).json({
//       status: "success",
//       results: books.length,
//       data: books,
//     });
//   } catch (err) {
//     console.error("❌ Error in getFilteredBooks:", err.stack);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// =====================================================

exports.getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log("ID received:", bookId);

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      console.log("Invalid ObjectId format");
      return res.status(400).json({ message: "Invalid book ID" });
    }

exports.getBookBySlug = async (req, res) => {
  try {
    const book = await Book.findOne({ slug: req.params.slug }).populate('reviews');

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, data: book });
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
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};