const express = require("express");
const router = express.Router();
const { getBooks, getBookById } = require("../controllers/BooksController");

router.get("/", getBooks);
router.get("/:id", getBookById);
router.get("/", bookController.getBooks);
router.get('/:slug', bookController.getBookBySlug);

module.exports = router;
