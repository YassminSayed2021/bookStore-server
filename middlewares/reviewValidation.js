const {body} = require("express-validator");
const Review = require("../models/reviewModel");

const ratingValidation = body("rating").isInt({min:1 , max:5}).withMessage("Rating must be a number between 1 and 5");
const reviewTextValidation = body("review").trim().notEmpty().isLength({max:500}).withMessage("Review text is required");

module.exports = {
  ratingValidation,
  reviewTextValidation,
};
