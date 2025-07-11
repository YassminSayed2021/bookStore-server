const mongoose = require("mongoose");
const CartItem = require("../models/cartModel");
const Book = require("../models/booksModel");
const Order = require("../models/ordersModel");
const User = require("../models/usersModel");
const OrderConfirmationEmail = require("../utils/orderConfirmationEmail");

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
    // await OrderConfirmationEmail(user.email, user.firstName, newOrder[0]._id, totalPrice);
    const orderedBooks = cartItems.map((item) => ({
  title: item.book.title,
  quantity: item.quantity,
}));

await OrderConfirmationEmail(
  user.email,
  user.firstName,
  newOrder[0]._id,
  totalPrice,
  orderedBooks
);


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



const getOrderHistory = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const orders = await Order.find()
      .populate({
        path: "user",
        match: { email: userEmail }, 
        select: "firstName email",   
      })
      .populate({
        path: "books.book",
        select: "title price image", 
      })
      .sort({ createdAt: -1 });

    const userOrders = orders.filter(order => order.user);

    const formatted = userOrders.map(order => ({
      id: order._id,
      createdAt: order.createdAt,
      status: order.status,
      totalPrice: order.totalPrice,
      books: order.books.map(item => ({
        title: item.book?.title || "Deleted Book",
        image: item.book?.image || "",
        price: item.book?.price || 0,
        quantity: item.quantity,
      })),
    }));

    res.status(200).json({
      status: "Success",
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Error fetching order history",
      error: err.message || err,
    });
  }
};
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstName email")
      .populate("books.book", "title price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🛡 أمان: لازم يكون نفس المستخدم هو صاحب الطلب
    if (order.user.email !== req.user.email) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({ status: "Success", data: order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {placeOrder,getOrderHistory ,getOrderById};
    