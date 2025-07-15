const Book = require("../models/booksModel");
const Review = require("../models/reviewModel");
const User = require("../models/usersModel");
const Order = require("../models/ordersModel");
const { isValidObjectId } = require("mongoose");
const { validationResult, body } = require("express-validator");



const getReviews = async(req , res)=>{
try{
const reviews = await Review.find({},{review:1, rating:1, _id:0}) .populate({
        path: 'user',
        select: 'firstName lastName ' 
      }).populate({ path: 'book', select: 'title -_id' })
;
res.status(200).json({
    status:"success",
    message: "Reviews fetched successfully",
    data:reviews
})
}catch(err){
        res.status(500).json({
                    status: "Failure",
            message:"Internal Server Error",
            error: err
    });
}
}
//
const getBookReviews = async(req,res)=>{
try{
const {slug} = req.params;
   

    
    const existingBook = await Book.findOne({slug});
    if (!existingBook) {
      return res.status(404).json({
        status: "Failure",
        message: "Book not found",
      });
    }
    const bookId = existingBook._id;

     if (!isValidObjectId(bookId)) {
      return res.status(400).json({
        status: "Failure",
        message: "Invalid book ID format",
      });
    }

const BookReviews = await Review.find({book:bookId},{review:1, rating:1, _id:0}).populate({
    path: "user",
    select:"firstName lastName"
});
    if (BookReviews.length === 0) {
      return res.status(200).json({
        status: "Success",
        message: "No reviews yet for this book.",
        data: [],
        count: 0
      });
    }

res.status(200).json({
    status:"Success",
    message:"Book Reviews Fetched Successfully",
    data: BookReviews,
      count: BookReviews.length,

})
}catch(err){
    
        res.status(500).json({
                    status: "Failure",
            message:"Internal Server Error",
            error: err
    });

}
}
//
const submitReview = async(req, res)=>{


  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "Failure",
      message: "Validation Error",
      //errors: errors.array(), 
    message: errors.array()[0].msg

    });
  }

    try{
    const data = req.body;
    const { slug } = req.params;
const userData = await User.findOne({ email: req.user.email });

if (!userData) {
  return res.status(404).json({
    status: "Failure",
    message: "User not found"
  });
}

const userId = userData._id;

//const userId = req.user._id

   

        const bookExists = await Book.findOne({slug});
    if (!bookExists) {
      return res.status(404).json({
        status: "Failure",
        message: "Book not found",
      });
    }



    const bookId = bookExists._id;

    if (!isValidObjectId(bookId)) {
      return res.status(400).json({
        status: "Failure",
        message: "Invalid book ID format",
      });
    }


    const alreadyReviewed = await Review.findOne({user: userId, book: bookId});
    if(alreadyReviewed){
              return res.status(400).json({
        status: "Failure",
        message: "You have already commented on this book",
      });

    }

      const hasPurchased = await Order.findOne({
      user: userId,
      status: "delivered",
      "books.book": bookId
    });

    if (!hasPurchased) {
      return res.status(403).json({
        status: "Failure",
        message: "You can only submit a review for books you have purchased",
      });
    }

    const newReview = await Review.create({
      user: userId,
      book: bookId,
      rating:data.rating,
      review: data.review,

    });
        res.status(201).json({
      status: "Success",
      message: "Review submitted successfully",
      data: newReview,
        });


    }catch(err){
                res.status(500).json({
                    status: "Failure",
            message:"Internal Server Error",
            error: err
    });

    }
}
//

const updateReview = async(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "Failure",
      message: "Validation Error",
      //errors: errors.array(),
                     message: errors.array()[0].msg

    });
  }
try{
const {slug} = req.params;
const data = req.body;

    const userData = await User.findOne({ email: req.user.email });
    if (!userData) {
      return res.status(404).json({
        status: "Failure",
        message: "User not found",
      });
    }

    const userId = userData._id;



    const bookExists = await Book.findOne({ slug });
    if (!bookExists) {
      return res.status(404).json({
        status: "Failure",
        message: "Book not found",
      });
    }

    const bookId = bookExists._id;

    if (!isValidObjectId(bookId)) {
      return res.status(400).json({
        status: "Failure",
        message: "Invalid book ID format",
      });
    }


        const existingReview = await Review.findOne({ user: userId, book: bookId });
    if (!existingReview) {
      return res.status(404).json({
        status: "Failure",
        message: "You haven't submitted a review for this book yet",
      });
    }


        if (data.rating) existingReview.rating = data.rating;
    if (data.review) existingReview.review = data.review;

    await existingReview.save();

    res.status(200).json({
      status: "Success",
      message: "Review updated successfully",
      data: existingReview,
    });


}catch(err){
    res.status(500).json({
    status: "Failure",
    message:"Internal Server Error",
    error: err
    });

}
}

//

const deleteReview = async (req, res) => {
  try {
    const { slug } = req.params;


    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({
        status: "Failure",
        message: "User not found"
      });
    }

    
    const book = await Book.findOne({ slug });
    if (!book) {
      return res.status(404).json({
        status: "Failure",
        message: "Book not found"
      });
    }

    
    const review = await Review.findOne({ user: user._id, book: book._id });
    if (!review) {
      return res.status(404).json({
        status: "Failure",
        message: "Review not found for this user and book"
      });
    }

    
    await Review.deleteOne({ _id: review._id });

    res.status(200).json({
      status: "Success",
      message: "Review deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Internal server error",
      error: err.message
    });
  }
};


// Add these functions to the existing reviewController.js file

// Admin: Get all reviews with pagination
const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalReviews = await Review.countDocuments();
    const totalPages = Math.ceil(totalReviews / limit);
    
    const reviews = await Review.find()
      .populate({
        path: "user",
        select: "firstName lastName email"
      })
      .populate({
        path: "book",
        select: "title author image"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const formattedReviews = reviews.map(review => ({
      id: review._id,
      user: review.user ? `${review.user.firstName} ${review.user.lastName}` : "Unknown User",
      email: review.user ? review.user.email : "Unknown",
      book: review.book ? review.book.title : "Unknown Book",
      rating: review.rating,
      review: review.review,
      date: review.createdAt
    }));
    
    res.status(200).json({
      status: "Success",
      count: formattedReviews.length,
      totalPages,
      currentPage: page,
      data: formattedReviews
    });
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Error fetching reviews",
      error: err.message || err
    });
  }
};

// Admin: Get review by ID
const getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const review = await Review.findById(reviewId)
      .populate({
        path: "user",
        select: "firstName lastName email"
      })
      .populate({
        path: "book",
        select: "title author image"
      });
    
    if (!review) {
      return res.status(404).json({
        status: "Failure",
        message: "Review not found"
      });
    }
    
    const formattedReview = {
      id: review._id,
      user: review.user ? `${review.user.firstName} ${review.user.lastName}` : "Unknown User",
      email: review.user ? review.user.email : "Unknown",
      book: review.book ? review.book.title : "Unknown Book",
      rating: review.rating,
      review: review.review,
      date: review.createdAt
    };
    
    res.status(200).json({
      status: "Success",
      data: formattedReview
    });
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Error fetching review",
      error: err.message || err
    });
  }
};

// Admin: Update review status (e.g., approve/reject)
const updateReviewStatus = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: "Failure",
        message: "Invalid status value. Must be 'approved' or 'rejected'."
      });
    }
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({
        status: "Failure",
        message: "Review not found"
      });
    }
    
    res.status(200).json({
      status: "Success",
      message: `Review ${status} successfully`,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Error updating review status",
      error: err.message || err
    });
  }
};

// Admin: Delete review
const deleteReviewByAdmin = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const review = await Review.findByIdAndDelete(reviewId);
    
    if (!review) {
      return res.status(404).json({
        status: "Failure",
        message: "Review not found"
      });
    }
    
    res.status(200).json({
      status: "Success",
      message: "Review deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Error deleting review",
      error: err.message || err
    });
  }
};

// Export the new admin methods
module.exports = {
  getReviews,
  getBookReviews,
  submitReview,
  updateReview,
  deleteReview,
  // Admin methods
  getAllReviews,
  getReviewById,
  updateReviewStatus,
  deleteReviewByAdmin
};