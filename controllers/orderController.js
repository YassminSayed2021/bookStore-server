const mongoose = require("mongoose");
const CartItem = require("../models/cartModel");
const Book = require("../models/booksModel");
const Order = require("../models/ordersModel");
const User = require("../models/usersModel");
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

        for (const item of cartItems) {
      const { book, quantity, language } = item;

      const stock = book.stock?.[language];

            if (stock === undefined) {
        await session.abortTransaction();
        return res.status(400).json({
          status: "Failure",
          message: `Language '${language}' not available for ${book.title}`,
        });
      }

            if (quantity > stock) {
        await session.abortTransaction();
        return res.status(400).json({
          status: "Failure",
          message: `Only ${stock} left in stock for ${book.title}`,
        });
      }

            book.stock[language] -= quantity;
      await book.save({ session });
      totalPrice += book.price * quantity;
orderBooks.push({
  book: book._id,
  quantity,
  language,
  price: book.price
});
    }
    const newOrder = await Order.create(
      [
        {
          user: user._id,
          books: orderBooks,
          totalPrice,
        },
      ],
      { session }
    );
    await CartItem.deleteMany({ user: user._id }, { session });
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "Success",
      message: "Order placed successfully",
      data: newOrder[0],
    });



    }catch(err){
await session.abortTransaction();
session.endSession();
    res.status(500).json({
    status: "Failure",
    message:"Internal Server Error",
  error: err.message || err,
    });

    }
}

module.exports = {placeOrder}
    