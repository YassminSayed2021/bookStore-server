const Book = require("../models/booksModel");
const Review = require("../models/reviewModel");
const User = require("../models/usersModel");
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

module.exports= {getReviews,getBookReviews,submitReview, updateReview,deleteReview};