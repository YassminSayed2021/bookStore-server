const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  review: {
    type: String,
    required: true
  }

}, { timestamps: true });

reviewSchema.index({ user: 1, book: 1 }, { unique: true });


const Review = mongoose.model("Review",reviewSchema);
module.exports = Review;