const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middlewares/verifyToken");

router.post("/add", verifyToken, cartController.addToCart);

router.get("/", verifyToken, cartController.viewCart);

router.delete("/", verifyToken, cartController.removeFromCart);

router.post("/merge", verifyToken, cartController.mergeGuestCart);

module.exports = router;
