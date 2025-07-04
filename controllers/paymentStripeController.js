// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const mongoose = require('mongoose');
// const Book = require('../models/booksModel');
// const Order = require('../models/ordersModel');


// exports.createCheckout = async (req, res) => {
//   console.log("Received body:", req.body);
// const { productId, quantity, amount, cartItems, language } = req.body;
// const userId = req.user.id;
// const email = req.user.email;

// if (!userId || !email) {
//   return res.status(400).json({ error: 'Unauthorized' });
// }


//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     let lineItems = [];
//     let totalAmount = 0;
//     let orderBooks = [];

//     if (cartItems && cartItems.length > 0) {
//       // الدفع من السلة
//       for (const item of cartItems) {
//         const book = await Book.findById(item.productId).session(session);
//         if (!book || book.stock[item.language] < item.quantity) {
//           await session.abortTransaction();
//           return res.status(400).json({ error: `Out of stock: ${book?.title || 'Unknown'}` });
//         }

//         lineItems.push({
//           price_data: {
//             currency: 'EGP',
//             product_data: {
//               name: book.title,
//             },
//             unit_amount: book.price * 100,
//           },
//           quantity: item.quantity,
//         });

//         totalAmount += book.price * item.quantity;
//         orderBooks.push({ book: item.productId, quantity: item.quantity });
//       }
//     } else if (productId && quantity) {
//       const book = await Book.findById(productId).session(session);
//       if (!book || book.stock[language] < quantity) {
//         await session.abortTransaction();
//         return res.status(400).json({ error: 'Product out of stock or not found' });
//       }

//       lineItems.push({
//         price_data: {
//           currency: 'EGP',
//           product_data: {
//             name: book.title,
//           },
//           unit_amount: book.price * 100,
//         },
//         quantity,
//       });

//       totalAmount = book.price * quantity;
//       orderBooks.push({ book: productId, quantity });
//     } else {
//       await session.abortTransaction();
//       return res.status(400).json({ error: 'Missing product or cart items' });
//     }
// if (totalAmount < 25) {
//   await session.abortTransaction();
//   return res.status(400).json({
//     error: 'Stripe requires a minimum amount of 50 cents (about EGP 25). Please add more items.',
//   });
// }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: totalAmount * 100,
//       currency: 'EGP',
//       payment_method_types: ['card'],
//       metadata: { userId },
//     });

//     const order = await Order.create(
//       [
//         {
//           user: userId,
//           books: orderBooks,
//           totalPrice: totalAmount,
//           status: 'pending',
//         },
//       ],
//       { session }
//     );

//     await session.commitTransaction();

//     res.json({
//       clientSecret: paymentIntent.client_secret,
//       orderId: order[0]._id,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error('Checkout error:', error);
//     res.status(500).json({ error: 'Checkout failed' });
//   } finally {
//     session.endSession();
//   }
// };
//  exports.confirmPayment = async (req, res) => {
//    const { paymentIntentId, orderId } = req.body;

//    if (!paymentIntentId || !orderId) {
//      return res.status(400).json({ error: 'Missing paymentIntentId or orderId' });
//    }

//    const session = await mongoose.startSession();
//    session.startTransaction();

//    try {
//     // Verify payment with Stripe
//      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//      if (paymentIntent.status !== 'succeeded') {
//        await session.abortTransaction();
//        return res.status(400).json({ error: 'Payment not completed' });
//     }

//      // Find order
//      const order = await Order.findById(orderId).session(session);
//     if (!order) {
//        await session.abortTransaction();
//        return res.status(404).json({ error: 'Order not found' });
//      }

//      // Deduct stock
//      const book = await Book.findById(order.books[0].book).session(session);
//      if (!book || book.stock.ar < order.books[0].quantity) {
//       await session.abortTransaction();
//       return res.status(400).json({ error: 'Stock no longer available' });
//      }

//     book.stock.ar -= order.books[0].quantity;
//      await book.save({ session });

//      // Update order status
//     order.status = 'completed';
//     await order.save({ session });

//      await session.commitTransaction();
//     res.json({ success: true });
//   } catch (error) {
//      await session.abortTransaction();
//     console.error('Payment confirmation error:', error);
//     res.status(500).json({ error: 'Payment confirmation failed' });
//   } finally {
//     session.endSession();
//   }
// //  };
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const mongoose = require("mongoose");
// const Book = require("../models/booksModel");
// const Order = require("../models/ordersModel");
// // Connect to MongoDB (move to a separate config file in production)
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log("Connected to MongoDB");
// }).catch((err) => {
//   console.error("MongoDB connection error:", err);
// });

// exports.createCheckoutSession = async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       ui_mode: "custom",
//       line_items: [
//         {
//           price: "prod_ScCUwt4SaF86xT", // Replace with actual Price ID
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       return_url: `http://localhost:4242/return.html?session_id={CHECKOUT_SESSION_ID}`,
//     });

//     res.send({ clientSecret: session.client_secret });
//   } catch (error) {
//     console.error("Create checkout session error:", error);
//     res.status(500).json({ error: "Failed to create checkout session" });
//   }
// };

// exports.getSessionStatus = async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

//     res.send({
//       status: session.status,
//       customer_email: session.customer_details.email,
//     });
//   } catch (error) {
//     console.error("Session status error:", error);
//     res.status(500).json({ error: "Failed to retrieve session status" });
//   }
// };

// exports.createCheckout = async (req, res) => {
//   console.log("📥 Received body:", req.body);

//   const { productId, quantity, amount, cartItems, language } = req.body;
//   const userId = req.user.id;
//   const email = req.user.email;

//   if (!userId || !email) {
//     return res.status(400).json({ error: "Unauthorized" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     let lineItems = [];
//     let totalAmount = 0;
//     let orderBooks = [];

//     if (cartItems && cartItems.length > 0) {
//       // سلة
//       for (const item of cartItems) {
//         const book = await Book.findById(item.productId).session(session);
//         console.log("🛒 Book in cart:", book);
//         console.log("📦 Full stock object:", book?.stock);
//         console.log("🔤 Requested language:", item.language);
//         console.log("📦 Stock for language:", book?.stock?.[item.language]);

//         if (!book || book.stock[item.language] < item.quantity) {
//           await session.abortTransaction();
//           return res.status(400).json({
//             error: `Out of stock: ${book?.title || "Unknown"}`,
//           });
//         }

//         lineItems.push({
//           price_data: {
//             currency: "EGP",
//             product_data: { name: book.title },
//             unit_amount: book.price * 100,
//           },
//           quantity: item.quantity,
//         });

//         totalAmount += book.price * item.quantity;
//         orderBooks.push({ book: item.productId, quantity: item.quantity });
//       }
//     } else if (productId && quantity) {
//       const book = await Book.findById(productId).session(session);
//       console.log("📚 Book found:", book);
//       console.log("📦 Full stock object:", book?.stock);
//       console.log("🔤 Requested language:", language);
//       console.log("📦 Stock for language:", book?.stock?.[language]);

//       if (!book || book.stock[language] < quantity) {
//         await session.abortTransaction();
//         return res.status(400).json({ error: "Product out of stock or not found" });
//       }

//       lineItems.push({
//         price_data: {
//           currency: "EGP",
//           product_data: { name: book.title },
//           unit_amount: book.price * 100,
//         },
//         quantity,
//       });

//       totalAmount = book.price * quantity;
//       orderBooks.push({ book: productId, quantity });
//     } else {
//       await session.abortTransaction();
//       return res.status(400).json({ error: "Missing product or cart items" });
//     }

//     if (totalAmount < 25) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         error:
//           "Stripe requires a minimum amount of 50 cents (about EGP 25). Please add more items.",
//       });
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: totalAmount * 100,
//       currency: "EGP",
//       payment_method_types: ["card"],
//       metadata: { userId },
//     });

//     const order = await Order.create(
//       [
//         {
//           user: userId,
//           books: orderBooks,
//           totalPrice: totalAmount,
//           status: "pending",
//         },
//       ],
//       { session }
//     );

//     await session.commitTransaction();

//     res.json({
//       clientSecret: paymentIntent.client_secret,
//       orderId: order[0]._id,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error("❌ Checkout error:", error);
//     res.status(500).json({ error: "Checkout failed" });
//   } finally {
//     session.endSession();
//   }
// };


// exports.confirmPayment = async (req, res) => {
//   const { paymentIntentId, orderId } = req.body;

//   if (!paymentIntentId || !orderId) {
//     return res.status(400).json({ error: "Missing paymentIntentId or orderId" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     if (paymentIntent.status !== "succeeded") {
//       await session.abortTransaction();
//       return res.status(400).json({ error: "Payment not completed" });
//     }

//     const order = await Order.findById(orderId).session(session);
//     if (!order) {
//       await session.abortTransaction();
//       return res.status(404).json({ error: "Order not found" });
//     }

//     const book = await Book.findById(order.books[0].book).session(session);
//     if (!book || book.stock.ar < order.books[0].quantity) {
//       await session.abortTransaction();
//       return res.status(400).json({ error: "Stock no longer available" });
//     }

//     book.stock.ar -= order.books[0].quantity;
//     await book.save({ session });

//     order.status = "completed";
//     await order.save({ session });

//     await session.commitTransaction();
//     res.json({ success: true });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error("Payment confirmation error:", error);
//     res.status(500).json({ error: "Payment confirmation failed" });
//   } finally {
//     session.endSession();
//   }
// };
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const Book = require("../models/booksModel");
const Order = require("../models/ordersModel");

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

    if (cartItems && cartItems.length > 0) {
      for (const item of cartItems) {
        const book = await Book.findById(item.productId).session(session);
        console.log("🛒 Book in cart:", book);
        console.log("📦 Full stock object:", book?.stock);
        console.log("🔤 Requested language:", item.language);
        console.log("📦 Stock for language:", book?.stock?.[item.language]);

        if (!book || book.stock[item.language] < item.quantity) {
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
          quantity: item.quantity,
        });

        totalAmount += book.price * item.quantity;
        orderBooks.push({ book: item.productId, quantity: item.quantity, language: item.language });
      }
    } else if (productId && quantity) {
      const book = await Book.findById(productId).session(session);
      console.log("📚 Book found:", book);
      console.log("📦 Full stock object:", book?.stock);
      console.log("🔤 Requested language:", language);
      console.log("📦 Stock for language:", book?.stock?.[language]);

      if (!book || book.stock[language] < quantity) {
        await session.abortTransaction();
        return res.status(400).json({ error: "Product out of stock or not found" });
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
      orderBooks.push({ book: productId, quantity, language });
    } else {
      await session.abortTransaction();
      return res.status(400).json({ error: "Missing product or cart items" });
    }

    if (totalAmount < 25) {
      await session.abortTransaction();
      return res.status(400).json({
        error: "Stripe requires a minimum amount of 50 cents (about EGP 25). Please add more items.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: "EGP",
      payment_method_types: ["card"],
      metadata: { userId },
    });

    const order = await Order.create(
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

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order[0]._id,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Checkout error:", error);
    res.status(500).json({ error: "Checkout failed" });
  } finally {
    session.endSession();
  }
};

exports.confirmPayment = async (req, res) => {
  const { paymentIntentId, orderId } = req.body;

  console.log("📩 Received confirmation request");
  console.log("👉 paymentIntentId:", paymentIntentId);
  console.log("👉 orderId:", orderId);

  if (!paymentIntentId || !orderId) {
    console.log("❌ Missing paymentIntentId or orderId");
    return res.status(400).json({ error: "Missing paymentIntentId or orderId" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
       console.log("💳 Retrieved paymentIntent:", paymentIntent.id, "status:", paymentIntent.status);
    if (paymentIntent.status !== "succeeded") {
      await session.abortTransaction();
      console.log("❌ Payment not completed");
      return res.status(400).json({ error: "Payment not completed" });
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      console.log("❌ Order not found:", orderId)
      return res.status(404).json({ error: "Order not found" });
    }
console.log("📦 Order found, processing stock...");

    for (const orderBook of order.books) {
      const book = await Book.findById(orderBook.book).session(session);
       console.log("📚 Checking book stock for:", {
    title: book?.title,
    stock: book?.stock,
    requestedLang: orderBook.language,
    quantity: orderBook.quantity
  });
      console.log("🧾 Order being confirmed:", order);

      if (!book || book.stock[orderBook.language || 'ar'] < orderBook.quantity) {
        await session.abortTransaction();
         console.log("❌ Book not found:", orderBook.book);
        return res.status(400).json({ error: `Stock no longer available for ${book?.title || 'Unknown'}` });
      }
      book.stock[orderBook.language || 'ar'] -= orderBook.quantity;
      await book.save({ session });
    }

    order.status = "completed";
    await order.save({ session });

    await session.commitTransaction();
    res.json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    console.error("Payment confirmation error:", error);
    res.status(500).json({ error: "Payment confirmation failed" });
  } finally {
    session.endSession();
  }
};