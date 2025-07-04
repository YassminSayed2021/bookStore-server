require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const morgan = require("morgan");
const cors = require("cors");
//====================================
const cartRoutes = require("./routes/cartRoutes");
const wishListRoutes = require("./routes/wishListRoutes");
//====================================
const uploadRoute = require("./routes/upload");
const mongoose = require("mongoose");

// ===============================================
const app = express();

const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

app.use(requestLogger); // Log every request

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors({
  origin: ['http://localhost:4200'], 
  credentials: true
}));

const userRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRoutes");
const bookRoutes = require("./routes/booksRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bookMang = require("./routes/bookManagementRoutes"); // Changed from booksRoutes to bookManagementRoutes
const adminRoutes = require("./routes/adminRoutes");
//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/book", bookRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/bookmang", bookMang);
app.use("/api/v1/admin", adminRoutes);
//====================================
app.use("/api/cart", cartRoutes);
app.use("/api/wishList", wishListRoutes);
//====================================
app.use("/api/cloud", uploadRoute);
//====================================
app.use(errorHandler);

// ===========================
const PORT = process.env.DB_PORT || 3000;
//const host = process.env.HOST || "localhost";

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});