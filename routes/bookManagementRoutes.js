// routes/bookRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { verifyToken } = require("../middlewares/verifyToken");
const { admin } = require("../middlewares/admin");
const {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getBookById,
  getBookBySlug
} = require("../controllers/bookManagementController");

// Create a new book
router.post("/", verifyToken, admin, upload.single("image"), createBook);

// Update a book - support both ID and slug
router.put("/:id", verifyToken, admin, upload.single("image"), updateBook);

// Delete a book - support both ID and slug
router.delete("/:id", verifyToken, admin, deleteBook);

// Get all books
router.get("/", getAllBooks);

// Get book by slug - more specific route first
router.get("/slug/:slug", getBookBySlug);

// Get book by ID (or slug as fallback)
router.get("/:id", getBookById);

module.exports = router;
