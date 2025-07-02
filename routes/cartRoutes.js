const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router
  .get("/", cartController.viewCart)
  .post("/add", cartController.addToCart)
  .delete("/", cartController.removeFromCart)
  .delete("/clear", cartController.clearCart);

module.exports = router;
