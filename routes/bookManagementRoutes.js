// routes/bookRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { verifyToken } = require("../middlewares/verifyToken");
const { admin } = require("../middlewares/admin");
const {
  getAllBooks,
  createBook,
} = require("../controllers/bookManagementController");
const {
  updateBook,
  deleteBook,
} = require("../controllers/bookManagementController");

router.put("/:id", verifyToken, admin, updateBook);
router.delete("/:id", deleteBook);

router.get("/", getAllBooks);

// Admin only: create new book with image upload
router.post("/", verifyToken, admin, upload.single("image"), createBook);

module.exports = router;
