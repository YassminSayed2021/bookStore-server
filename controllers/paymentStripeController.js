const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const Book = require("../models/booksModel");
const Order = require("../models/ordersModel");
const CartItem = require("../models/cartModel");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_EMAIL_PASSWORD,
  },
});

const sendUserEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: "BookStore 📚 <" + process.env.MY_EMAIL + ">",
    to,
    subject,
    html,
  });
};

const notifyAdmin = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const subject = "New Order Placed 📅";
  const html = `
    <h2>New Order Notification</h2>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>User:</strong> ${firstName}</p>
    <p><strong>Total:</strong> ${order.totalPrice} EGP</p>
      <p><strong>Status:</strong> ${order.status}</p>
    <p>View the order in the admin dashboard.</p>
  `;
  await sendUserEmail(adminEmail, subject, html);
};

exports.createCheckout = async (req, res) => {
  console.log("📥 Received body:", req.body);
  const { productId, quantity, amount, cartItems, language } = req.body;
  const userId = req.user.id;
  const email = req.user.email;

  if (!userId || !email) {
    return res.status(400).json({ error: "Unauthorized" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let lineItems = [];
    let totalAmount = 0;
    let orderBooks = [];
    let cart = cartItems;

    if (!cartItems || cartItems.length === 0) {
      const userCart = await CartItem.find({ user: userId }).lean();
      if (!userCart.length) {
        await session.abortTransaction();
        return res.status(400).json({ error: "Your cart is empty." });
      }
      cart = userCart;
    }

    if (cart && cart.length > 0) {
      for (const item of cart) {
        const productId = item.productId || item.book;
        const language = item.language;
        const quantity = item.quantity;

        const book = await Book.findById(productId).session(session);
        if (!book || book.stock[language] < quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            error: `Out of stock: ${book?.title || "Unknown"}`,
          });
        }

        lineItems.push({
          price_data: {
            currency: "EGP",
            product_data: { name: book.title },
            unit_amount: book.price * 100,
          },
          quantity,
        });

        totalAmount += book.price * quantity;
        orderBooks.push({
          book: productId,
          quantity,
          language,
          price: book.price,
        });
      }
    } else if (productId && quantity) {
      const book = await Book.findById(productId).session(session);

      if (!book || book.stock[language] < quantity) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ error: "Product out of stock or not found" });
      }

      lineItems.push({
        price_data: {
          currency: "EGP",
          product_data: { name: book.title },
          unit_amount: book.price * 100,
        },
        quantity,
      });

      totalAmount = book.price * quantity;
      orderBooks.push({
        book: productId,
        quantity,
        language,
        price: book.price,
      });
    } else {
      await session.abortTransaction();
      return res.status(400).json({ error: "Missing product or cart items" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: "EGP",
      payment_method_types: ["card"],
      metadata: { userId },
    });

    const [order] = await Order.create(
      [
        {
          user: userId,
          books: orderBooks,
          totalPrice: totalAmount,
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await notifyAdmin(order);

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    });
  } catch (error) {
    console.error("❌ Checkout error:", error);
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(500).json({ error: "Checkout failed" });
  } finally {
    session.endSession();
  }
};

exports.confirmPayment = async (req, res) => {
  const { paymentIntentId, orderId, mode } = req.body;

  if (!paymentIntentId || !orderId) {
    return res
      .status(400)
      .json({ error: "Missing paymentIntentId or orderId" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const confirmedPaymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    if (confirmedPaymentIntent.status !== "succeeded") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Payment not completed" });
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Order not found" });
    }

    for (const orderBook of order.books) {
      const book = await Book.findById(orderBook.book).session(session);
      if (
        !book ||
        book.stock[orderBook.language || "ar"] < orderBook.quantity
      ) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({
            error: `Stock no longer available for ${book?.title || "Unknown"}`,
          });
      }

      book.stock[orderBook.language || "ar"] -= orderBook.quantity;
      await book.save({ session });
    }

    order.status = "processing";
    order.paymentIntentId = paymentIntentId;
    order.statusHistory.push({ status: "processing", timestamp: new Date() });
    await order.save({ session });

    const userId = req.user.id;

    if (mode === "buyNow") {
      for (const orderBook of order.books) {
        await CartItem.deleteOne({
          user: userId,
          book: orderBook.book,
          language: orderBook.language,
        });
      }
    } else {
      await CartItem.deleteMany({ user: userId });
    }

    await session.commitTransaction();

    try {
      await notifyAdmin(order);
    } catch (emailError) {
      console.error(
        "❌ Admin email failed, but payment processed:",
        emailError
      );
    }

    await sendUserEmail(
      req.user.email,
     "Your Payment was Successful ✅",
  `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #2e6da4;">Thank you for your purchase, ${firstName}!</h2>
    <p>We have received your payment and your order has been processed successfully.</p>

    <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Total Paid:</strong> ${order.totalPrice} EGP</p>
    <p><strong>Payment Status:</strong> Completed ✅</p>

    <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

    <p>If you have any questions or concerns, feel free to reach out to us at <a href="mailto:${process.env.ADMIN_EMAIL}">${process.env.ADMIN_EMAIL}</a>.</p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>The Bookstore Team</strong></p>

    <p style="font-size: 12px; color: #999;">This message was sent to: <strong>${req.user.email}</strong></p>
  </div>
  `
    );

    res.json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    console.error("Payment confirmation error:", error);
    res.status(500).json({ error: "Payment confirmation failed" });
  } finally {
    session.endSession();
  }
};
// exports.cancelOrder = async (req, res) => {
//   const { orderId } = req.body;
//   const userId = req.user.id;

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const order = await Order.findById(orderId).session(session);
//     if (!order) {
//       await session.abortTransaction();
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     if (order.user.toString() !== userId) {
//       await session.abortTransaction();
//       return res.status(403).json({ error: 'Unauthorized to cancel this order' });
//     }

//     if (order.status !== 'completed') {
//       await session.abortTransaction();
//       return res.status(400).json({ error: 'Only completed orders can be cancelled' });
//     }

//     const orderDate = new Date(order.createdAt);
//     const now = new Date();
//     const hoursDiff = (now - orderDate) / (1000 * 60 * 60);

//     if (hoursDiff > 24) {
//       await session.abortTransaction();
//       return res.status(400).json({ error: 'Cannot cancel order after 24 hours' });
//     }

//     if (!order.paymentIntentId) {
//       await session.abortTransaction();
//       return res.status(400).json({ error: 'No payment information found for this order' });
//     }

//     const refund = await stripe.refunds.create({
//       payment_intent: order.paymentIntentId
//     });

//     for (const orderBook of order.books) {
//       const book = await Book.findById(orderBook.book).session(session);
//       if (book) {
//         book.stock[orderBook.language || 'ar'] += orderBook.quantity;
//         await book.save({ session });
//       }
//     }

//     order.status = 'cancelled';
//     order.statusHistory.push({
//       status: 'cancelled',
//       timestamp: new Date(),
//       refundStatus: refund.status === 'succeeded' ? 'completed' : 'pending'
//     });
//     await order.save({ session });
//     console.log("✅ Order saved as cancelled");
//     await session.commitTransaction();

//     await sendUserEmail(req.user.email, 'Your Order Has Been Cancelled', `
//       <h2>Order Cancellation Confirmation</h2>
//       <p>Your order <strong>${order._id}</strong> has been cancelled successfully.</p>
//       <p>Refund Status: ${refund.status === 'succeeded' ? 'Completed' : 'Pending'}</p>
//       <p>Total Refunded: ${order.totalPrice} EGP</p>
//     `);

//     await sendUserEmail(process.env.ADMIN_EMAIL, 'Order Cancelled Notification', `
//       <h2>Order Cancellation Notification</h2>
//       <p><strong>Order ID:</strong> ${order._id}</p>
//       <p><strong>User:</strong> ${order.user}</p>
//       <p><strong>Total Refunded:</strong> ${order.totalPrice} EGP</p>
//       <p><strong>Refund Status:</strong> ${refund.status}</p>
//     `);

//     res.json({ success: true, refundStatus: refund.status });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error('Order cancellation error:', error);
//     res.status(500).json({ error: 'Order cancellation failed' });
//   } finally {
//     session.endSession();
//   }
// };
