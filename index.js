require("dotenv").config();
require('./jobs/clearPendingOrders');

const express = require("express");


const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');


const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

// Custom Modules
const connectDB = require("./config/database");
const requestLogger = require("./middlewares/requestLogger");
const errorHandler = require("./middlewares/errorHandler");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const otpRoutes = require("./routes/otpRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bookManagementRoutes = require("./routes/bookManagementRoutes");
const booksRoutes = require("./routes/booksRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminReviewRoutes = require("./routes/adminReviewRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const paypalRoutes = require("./routes/paypalRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishListRoutes = require("./routes/wishListRoutes");
// const uploadRoutes = require("./routes/upload");
const searchRoutes = require("./routes/searchRoutes");
const paymentStripe = require("./routes/paymentStripeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

// Initialize Express App
const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ======= MIDDLEWARES =======
app.use(requestLogger); // Custom request logger
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(
  cors({
    origin: ["http://localhost:4200"],
    credentials: true,
  })
);


// User and Auth
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/otp", otpRoutes);

//Admin
app.use("/api/v1/admin/orders", adminOrderRoutes);
app.use("/api/v1/admin/reviews", adminReviewRoutes);
app.use("/api/v1/admin/settings", settingsRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/bookmang", bookManagementRoutes);

// Book, Review & Category
app.use("/api/v1/books", booksRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Orders, Payment
app.use("/api/v1/orders", ordersRoutes);
app.use("/api/v1/paypal", paypalRoutes);
app.use("/api/payment", paymentStripe); // Uncomment when needed

// Cart, Wishlist, Upload
app.use("/api/v1/cart", cartRoutes);
app.use("/api/wishList", wishListRoutes);
// app.use("/api/cloud", uploadRoute);
// ===================
const bestsellersRoutes = require("./routes/bestsellersRoutes");
app.use("/api/v1/bestsellers", bestsellersRoutes);

//---------------------------
//chatbot

// const chatbotRoutes = require("./routes/chatbotRoutes");

app.use(express.json());

// app.use("/chatbot", chatbotRoutes);

//---------------------------
//chatbot

// const chatbotRoutes = require("./routes/chatbotRoutes");
app.use(express.json());
// app.use("/chatbot", chatbotRoutes);

// Search
app.use("/api/v1", searchRoutes);

// Global Error Handler
app.use(errorHandler);

// ======= SERVER =======
const PORT = process.env.DB_PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  await connectDB();
});
