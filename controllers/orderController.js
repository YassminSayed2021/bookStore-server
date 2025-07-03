const mongoose = require("mongoose");
const CartItem = require("../models/cartModel");
const Book = require("../models/booksModel");
const Order = require("../models/orderModel");
const mailSender = require("../utils/mailSender");

const placeOrder = async(req,res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        status: "Failure",
        message: "User not found",
      });
    }

        const cartItems = await CartItem.find({ user: user._id }).populate("book");
    if (cartItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "Failure",
        message: "Cart is empty",
      });
    }

    let totalPrice = 0;
    const orderBooks = [];

    


    }catch(err){
await session.abortTransaction();
session.endSession();
    res.status(500).json({
    status: "Failure",
    message:"Internal Server Error",
    error: err
    });

    }
}
    