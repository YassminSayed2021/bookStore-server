const Book = require("../models/booksModel");
const slugify = require("slugify");
const cloudinary = require("../utils/cloudinary");
const { extractTextFromImage } = require("../utils/vision");

const getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total books for pagination
    const totalBooks = await Book.countDocuments();

    // Get books with pagination
    const books = await Book.find()
      .populate("user", "name")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      page,
      totalPages: Math.ceil(totalBooks / limit),
      totalItems: totalBooks,
      results: books.length,
      data: books,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Error fetching books",
      error: err.message,
    });
  }
};

const createBook = async (req, res) => {
  try {
    const {
      title,
      category,
      author,
      authorDescription,
      price,
      description,
      stockAr,
      stockEn,
      stockFr,
    } = req.body;

    let imageUrl = null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "bookStore" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      imageUrl = result.secure_url;

      // ✅ Extract text using Google Vision API
      const ocrText = await extractTextFromImage(imageUrl);
      console.log("Extracted OCR Text:\n", ocrText);

      // ✅ Return extracted data without saving to DB
      if (!title || !price) {
        return res.status(200).json({
          status: "partial",
          message: "Cover image processed. Please confirm extracted data.",
          image: imageUrl,
          ocrText,
        });
      }
    }

    // ✅ Continue to save if required fields are present
    if (!title || !price) {
      return res.status(400).json({
        status: "fail",
        message: "Missing required fields: title or price.",
      });
    }

    const newBook = await Book.create({
      title,
      category,
      author,
      authorDescription,
      price,
      description,
      stock: {
        ar: parseInt(stockAr) || 0,
        en: parseInt(stockEn) || 0,
        fr: parseInt(stockFr) || 0,
      },
      image: imageUrl,
      slug: slugify(title, { lower: true }),
      user: req.user.id,
    });

    res.status(201).json({
      status: "success",
      message: "Book created successfully.",
      data: newBook,
    });
  } catch (err) {
    console.error("Book creation error:", err);
    res.status(500).json({
      status: "error",
      message: "Book creation failed.",
      error: err.message,
    });
  }
};

const updateBook = async (req, res) => {
  try {
    console.log("Decoded user from token:", req.user);

    const { id } = req.params;

    const {
      title,
      category,
      author,
      authorDescription,
      price,
      description,
      stockAr,
      stockEn,
      stockFr,
    } = req.body;

    if (!title || !price) {
      return res.status(400).json({
        status: "fail",
        message: "title and price are required.",
      });
    }

    const updatedData = {
      title,
      category,
      author,
      authorDescription,
      price: parseFloat(price),
      description,
      stock: {
        ar: parseInt(stockAr) || 0,
        en: parseInt(stockEn) || 0,
        fr: parseInt(stockFr) || 0,
      },
      slug: slugify(title, { lower: true }),
      user: req.user.id,
    };

    // ✅ If image file is uploaded, handle it
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "bookStore" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      updatedData.image = result.secure_url;
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({
        status: "fail",
        message: "Book not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Book updated successfully.",
      data: updatedBook,
    });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({
      status: "fail",
      message: "Book update failed",
      error: err.message,
    });
  }
};

// DELETE BOOK
const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({
        status: "fail",
        message: "Book not found.",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    console.error("DELETE failed:", err);
    res.status(500).json({
      status: "error",
      message: "Server error.",
    });
  }
};

module.exports = {
  updateBook,
  deleteBook,
  createBook,
  getAllBooks,
};
