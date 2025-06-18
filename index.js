const express = require("express");
const connectDB = require("./config/database");
const morgan = require("morgan");
const cors = require("cors");


const app = express();

app.use(express.json()); 
app.use(morgan("dev"));
app.use(cors());

const userRoutes = require("./routes/usersRoutes");

//routes
//app.use("/api/users", userRoutes);

const PORT = process.env.DB_PORT || 3000;
//const host = process.env.HOST || "localhost";

app.listen(PORT,async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});

