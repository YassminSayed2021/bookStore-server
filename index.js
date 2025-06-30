require("dotenv").config();

const express = require("express");
// const connectDB = require("./config/database");
const morgan = require("morgan");
const cors = require("cors");
//====================================
const cartRoutes = require("./routes/cartRoutes");
//====================================
const uploadRoute = require("./routes/upload");
const mongoose = require("mongoose");

// ===============================================
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

const userRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRoutes");
const bookRoutes = require("./routes/booksRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
//====================================

mongoose
  .connect(
    "mongodb+srv://yassminsayed868:WwK39ktVNFzG0oGi@bookstore.zdgm989.mongodb.net/bookStore"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

//====================================
//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/book", bookRoutes);
app.use("/api/v1/review", reviewRoutes);
//====================================
app.use("/api/cart", cartRoutes);
/*https://bookly-theme.myshopify.com/*/
//====================================
app.use("/api/cloud", uploadRoute);

// ===========================
const PORT = process.env.DB_PORT || 3000;
//const host = process.env.HOST || "localhost";

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // await connectDB();
});
