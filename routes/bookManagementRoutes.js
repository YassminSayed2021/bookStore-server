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
} = require("../controllers/bookManagementController");

// Create a new book
router.post("/", verifyToken, admin, upload.single("image"), createBook);

// Update a book
router.put("/:id", verifyToken, admin, upload.single("image"), updateBook);

// Delete a book
router.delete("/:id", verifyToken, admin, deleteBook);

// Get all books
router.get("/", getAllBooks);

module.exports = router;
