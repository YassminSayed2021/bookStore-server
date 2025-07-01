const Book = require("../models/booksModel");
const Review = require("../models/reviewModel");
const User = require("../models/usersModel");
const { isValidObjectId } = require("mongoose");
const { validationResult, body } = require("express-validator");


// GET /api/v1/books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('reviews');
    res.status(200).json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// GET /api/v1/books/:slug
const getBookBySlug = async (req, res) => {
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


// controllers/bookController.js

const createBook = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const book = new Book({
      ...req.body,
      image: req.file?.path || req.body.image,
      user: user._id 
    });

    const saved = await book.save();
    res.status(201).json({ message: 'Book created', data: saved });

  } catch (error) {
    res.status(500).json({ message: 'Failed to create book', error: error.message });
  }
};


module.exports={getAllBooks,getBookBySlug,createBook};



