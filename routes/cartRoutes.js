const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { validateBook } = require("../middlewares/validateIBook");
router
  .route("/")
  .get(cartController.viewCart)
  .post(validateBook, cartController.addToCart);

router.route("/:id").delete(cartController.removeFromCart);

module.exports = router;

/*
{
  "id":1
  "title": "Visit in the North",
  "vendor": "James Dylan",
  "format": "Audible Audiobook",
  "language": "Korean",
  "publicationDate": "2022-11-23",
  "price": 506.08,
  "image": "https://bookly-theme.myshopify.com/cdn/shop/products/shop-new-57.jpg",
  "stock": 1
}
*/
