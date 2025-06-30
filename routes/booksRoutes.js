const express = require("express");
const router = express.Router();
const bookController = require("../controllers/BooksController");

router.get("/", bookController.getBooks);

module.exports = router;
