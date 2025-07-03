const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishListController");
const { verifyToken } = require("../middlewares/verifyToken");

router
  .get("/view", verifyToken, wishlistController.viewWishlist)
  .post("/add", verifyToken, wishlistController.addToWishlist)
  .delete("/remove", verifyToken, wishlistController.removeFromWishlist);

module.exports = router;
