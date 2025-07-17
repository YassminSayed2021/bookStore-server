const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middlewares/verifyToken");

router
  .get("/", verifyToken, cartController.viewCart)
  .post("/add", verifyToken, cartController.addToCart)
  .delete("/", verifyToken, cartController.removeFromCart)
  .delete("/clear", verifyToken, cartController.clearCart);

module.exports = router;
