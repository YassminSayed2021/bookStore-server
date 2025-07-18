require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");             
const socketIo = require("socket.io");      


// Custom Modules
const connectDB = require("./config/database");
const requestLogger = require("./middlewares/requestLogger");
const errorHandler = require("./middlewares/errorHandler");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/usersRoutes");
const otpRoutes = require("./routes/otpRoutes");
const bookRoutes = require("./routes/booksRoutes");
const bookManagementRoutes = require("./routes/bookManagementRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/ordersRoutes");
const paypalRoutes = require("./routes/paypalRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishListRoutes = require("./routes/wishListRoutes");
const uploadRoute = require("./routes/upload");
const searchRoutes = require("./routes/searchRoutes");
const paymentStripe = require("./routes/paymentStripeRoutes"); // Uncomment if used

// Initialize Express App

// const app = express();
const app = express();
//socket
const server = http.createServer(app);
const io = socketIo(server,{
  cors: {
    origin: "http://localhost:4200",
    methods:["GET","POST"],
    credentials:true
  }

});

app.locals.io = io;

// ======= MIDDLEWARES =======
app.use(requestLogger); // Custom request logger
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors({
  origin: ["http://localhost:4200"],
  credentials: true,
}));

// ======= ROUTES =======

// User and Auth
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/otp", otpRoutes);

//Admin
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/bookmang", bookManagementRoutes);

// Book & Review
app.use("/api/v1/book", bookRoutes);
app.use("/api/v1/review", reviewRoutes);

// Orders, Payment
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/paypal", paypalRoutes);
app.use("/api/payment", paymentStripe); // Uncomment when needed

// Cart, Wishlist, Upload
app.use("/api/cart", cartRoutes);
app.use("/api/wishList", wishListRoutes);
app.use("/api/cloud", uploadRoute);


//chatbot
const chatbotRoutes = require("./routes/chatbotRoutes");
app.use("/chatbot", chatbotRoutes);


// Search
app.use("/api/v1", searchRoutes);

//test socket
app.get('/test-socket', (req, res)=> {
  const io = req.app.locals.io;
console.log("🔥 Sending test WebSocket notification");
io.emit('newOrderNotification',{
  test: 'This is a test notification',
  timestamp: new Date().toISOString()
});
  res.send('Test WebSocket notification sent');
})


// Global Error Handler
app.use(errorHandler);

//========== WebSocket Events ==============

io.on("connection", (socket) => {
    console.log("✅ Admin connected via WebSocket:", socket.id);

socket.on("disconnect", ()=>{
    console.log("❌ Admin disconnected:", socket.id);
});

});

// ======= SERVER =======
const PORT = process.env.DB_PORT || 3000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await connectDB();
});

