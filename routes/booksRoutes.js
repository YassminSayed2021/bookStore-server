const express = require("express");
const router = express.Router();
bookController = require("../controllers/BooksController");

router.get("/", bookController.getBooks);
// router.get("/:id", bookController.getBookById);
router.get("/:slug", bookController.getBookBySlug);

module.exports = router;
