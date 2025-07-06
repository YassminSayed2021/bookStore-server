require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const morgan = require("morgan");
const cors = require("cors");

// Middlewares

const mongoose = require("mongoose");
const bookManagementRoute = require("./routes/bookManagementRoutes");
// ===============================================
const app = express();

const requestLogger = require("./middlewares/requestLogger");
const errorHandler = require("./middlewares/errorHandler");

app.use(requestLogger); // Log every request

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:4200"],
    credentials: true,
  })
);

// Routes
const cartRoutes = require("./routes/cartRoutes");
const wishListRoutes = require("./routes/wishListRoutes");
const uploadRoute = require("./routes/upload");

const userRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRoutes");
const bookRoutes = require("./routes/booksRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const bookMang = require("./routes/booksRoutes"); // أو booksManagementRoutes لو عندك فعلاً مسار جديد
const paymentStripe = require("./routes/paymentStripeRoutes");

const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/ordersRoutes");
const paypalRoutes = require("./routes/paypalRoutes");

const searchRoutes = require("./routes/searchRoutes");

//routes

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/book", bookRoutes);
app.use("/api/v1/review", reviewRoutes);
// app.use("/api/v1/bookmang", bookMang);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/paypal", paypalRoutes);

app.use("/api/cart", cartRoutes);
app.use("/api/wishList", wishListRoutes);
app.use("/api/cloud", uploadRoute);

//app.use("/api/payment", paymentStripe);

// Global error handler

// app.use("/api/v1/booksmang", bookManagementRoute);

app.use("/api/v1/booksmang", bookManagementRoute);
app.use("/api/v1", searchRoutes);

app.use(errorHandler);

// Server Listen
const PORT = process.env.DB_PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});
