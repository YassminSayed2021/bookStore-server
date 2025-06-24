require("dotenv").config(); 

const express = require("express");
const connectDB = require("./config/database");
const morgan = require("morgan");
const cors = require("cors");


const app = express();

app.use(express.json()); 
app.use(morgan("dev"));
app.use(cors());

const userRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes")
const otpRoutes = require("./routes/otpRoutes")
const bookRoutes = require("./routes/booksRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/otp",otpRoutes);
app.use("/api/v1/book",bookRoutes);
app.use("/api/v1/review",reviewRoutes);


const PORT = process.env.DB_PORT || 3000;
//const host = process.env.HOST || "localhost";

app.listen(PORT,async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});



