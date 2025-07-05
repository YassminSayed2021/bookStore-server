const express = require("express");
const router = express.Router();
const bookController = require("../controllers/BooksController");

router.get("/", bookController.getBooks);
router.get('/:slug', bookController.getBookBySlug);


module.exports = router;
