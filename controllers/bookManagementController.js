const Book = require("../models/booksModel");
const slugify = require("slugify");
const cloudinary = require("../utils/cloudinary");

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!updatedData.title || !updatedData.price) {
      return res.status(400).json({
        status: "fail",
        message: "title and price are required.",
      });
    }

    updatedData.slug = slugify(updatedData.title, { lower: true });

    updatedData.user = req.user.id;

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
  } catch (error) {
    console.error("PUT update failed:", error);
    res.status(500).json({
      status: "error",
      message: "Server error.",
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
};
