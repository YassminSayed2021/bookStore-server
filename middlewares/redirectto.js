const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if header exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "Failure",
      message: "Token not provided or malformed",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: "Failure",
        message: "Invalid or expired token",
      });
    }

    req.user = decoded; // optional: store user data
    next();
  });
};

module.exports = verifyToken;
