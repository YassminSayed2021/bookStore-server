const express = require("express");
const router = express.Router();
const bookController = require("../controllers/searchController");

router.get("/books", bookController.searchBooks);

module.exports = router;
