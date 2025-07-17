const Book = require("../models/booksModel");
const Review = require("../models/reviewModel");
const mongoose = require("mongoose");

exports.getBooks = async (req, res) => {
  try {
    const {
      sort,
      page = 1,
      limit = 6,
      genre,
      language,
      priceMin,
      priceMax,
    } = req.query;

    // Build sort option
    let sortOption;
    switch (sort) {
      case "title_asc":
        sortOption = { title: 1 };
        break;
      case "title_desc":
        sortOption = { title: -1 };
        break;
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Build query with filters
    const query = {};

    // FIX: Correctly query the nested 'category.name' field with case-insensitivity
    if (genre) {
      const fieldToQuery = "category.name";
      if (Array.isArray(genre)) {
        const genreRegexes = genre.map(g => new RegExp(`^${g}$`, 'i'));
        query[fieldToQuery] = { $in: genreRegexes };
      } else {
        query[fieldToQuery] = { $regex: new RegExp(`^${genre}$`, 'i') };
      }

      //query.category = Array.isArray(genre) ? { $in: genre } : genre;

    }

    // Price filter
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // Language stock filter
    if (language) {
      const stockFieldMap = {
        Arabic: "ar",
        English: "en",
        French: "fr",
      };

      const langKeys = Array.isArray(language) ? language : [language];

      query.$or = langKeys
        .map((lang) => {
          const key = stockFieldMap[lang];
          return key ? { [`stock.${key}`]: { $gt: 0 } } : null;
        })
        .filter(Boolean);
    }

    let books;
    let total;

    // If sorting is requested, return all sorted without pagination
    if (sort) {
      books = await Book.find(query).sort(sortOption);
      total = books.length;
    } else {
      const pageNum = Math.max(parseInt(page), 1);
      const limitNum = Math.max(parseInt(limit), 1);
      const skip = (pageNum - 1) * limitNum;

      books = await Book.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

      total = await Book.countDocuments(query);
    }

    res.status(200).json({
      status: "success",
      sort,
      page: sort ? 1 : parseInt(page),
      limit: sort ? total : parseInt(limit),
      totalItems: total,
      totalPages: sort ? 1 : Math.ceil(total / limit),
      results: books.length,
      data: books,
    });
  } catch (err) {
    console.error("Failed to fetch books:", err);
    res.status(500).json({ message: err.message });
  }
};

// =====================================================

exports.getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log("ID received:", bookId);

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      console.log("Invalid ObjectId format");
      return res.status(400).json({ message: "Invalid book ID" });
    }
    // Note: This function doesn't do anything with the ID yet.
    // You would typically fetch and return a book here.
    res.status(200).json({ message: "Book ID is valid." });

  } catch (err) {
    console.error("Error in getBookById:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getBookBySlug = async (req, res) => {
  try {
    const book = await Book.findOne({ slug: req.params.slug }).populate(
      "reviews"
    ).lean(); // Use .lean() for a plain JS object to allow modification

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    // FIX: The original code sent two responses, which causes a crash.
    // This has been fixed by calculating review data and sending one combined response.
    const reviews = await Review.find({ book: book._id });
    const reviewsCount = reviews.length;
    const averageRating = reviewsCount
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount
      : 0;

    // Combine book data with calculated review data
    const responseData = {
      ...book,
      reviewsCount,
      averageRating: Number(averageRating.toFixed(1)),
    };

    res.status(200).json({
        success: true,
        data: responseData
    });

  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
