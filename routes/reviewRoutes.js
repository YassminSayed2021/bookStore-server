const express = require("express");
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const {ratingValidation,reviewTextValidation} = require('../middlewares/reviewValidation');
const { verifyToken } = require("../middlewares/verifyToken");

router.get("/",reviewController.getReviews);
router.get("/:slug",verifyToken,reviewController.getBookReviews);
 router.post("/:slug",verifyToken,ratingValidation,reviewTextValidation,reviewController.submitReview);
 router.patch("/:slug",verifyToken,ratingValidation.optional(),reviewTextValidation.optional(),reviewController.updateReview);
 router.delete("/:slug",verifyToken,reviewController.deleteReview);

module.exports = router;