const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middlewares/verifyToken");

// Add to cart (body or params)
router.post("/add", cartController.addToCart); // { bookId, quantity, language }
router.post("/:bookId/:quantity/:language", cartController.addToCart); // Alternative URL params

// View cart
router.get("/", cartController.viewCart);

// Remove item
router.delete("/:id", cartController.removeFromCart);

// Merge guest cart
router.post("/merge", verifyToken, cartController.mergeGuestCart);

module.exports = router;
