require("dotenv").config();
const express = require("express");
// const connectDB = require("./config/database");
const morgan = require("morgan");
const cors = require("cors");
//====================================
const cartRoutes = require("./routes/cartRoutes");
const wishListRoutes = require("./routes/wishListRoutes");
//====================================
const uploadRoute = require("./routes/upload");
const mongoose = require("mongoose");
const bookManagementRoute = require("./routes/bookManagementRoutes");
// ===============================================
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

const userRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRoutes");
const bookRoutes = require("./routes/booksRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bookMang = require("./routes/bookManagementRoutes"); // Changed from booksRoutes to bookManagementRoutes
const adminRoutes = require("./routes/adminRoutes");
//====================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

//====================================
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
app.use("/api/v1/booksmang", bookManagementRoute);

// ===========================
const PORT = process.env.DB_PORT || 3000;
//const host = process.env.HOST || "localhost";

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // await connectDB();
});
