// routes/bookRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { verifyToken } = require("../middlewares/verifyToken");
const { admin } = require("../middlewares/admin");

const {
  updateBook,
  deleteBook,
  getAllBooks,
  createBook,
} = require("../controllers/bookManagementController");

router.put("/:id", verifyToken, admin, upload.single("image"), updateBook);
router.post("/", verifyToken, admin, upload.single("image"), createBook);
router.delete("/:id", deleteBook);

router.get("/", getAllBooks);

// Admin only: create new book with image upload

module.exports = router;
