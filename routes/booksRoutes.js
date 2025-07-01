const express = require("express");
const router = express.Router();
const bookController = require('../controllers/BooksController');
const { verifyToken } = require("../middlewares/verifyToken");
const { admin } = require("../middlewares/admin");



router.get('/', bookController.getAllBooks);
router.get('/:slug', bookController.getBookBySlug);
router.post('/', verifyToken,admin, bookController.createBook);

module.exports = router;

