require("dotenv").config();

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  console.log("🔍 Authorization header:", authorization);
  
  if (!authorization) {
    console.log("❌ No authorization header found");
    return res.status(401).json({
      status: "Failure",
      message: "You must login first. No authorization header found."
    });
  }
  
  // Extract token more robustly - handle both "Bearer token" and just "token" formats
  let token;
  if (authorization.startsWith('Bearer ')) {
    token = authorization.split(" ")[1];
  } else {
    token = authorization;
  }
  
  console.log("🔍 Extracted token:", token ? token.substring(0, 20) + "..." : "none");

  if (!token) {
    console.log("❌ No token extracted from authorization header");
    return res.status(401).json({
      status: "Failure",
      message: "You must login first. No token provided.",
    });
  }
  
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log("❌ Token verification failed:", err.message);
      return res.status(401).json({
        status: "Failure",
        message: `You must login first. Token verification failed: ${err.message}`,
      });
    }
    console.log("✅ Decoded Token User:", user);

    req.user = user;
    next();
  });
};

module.exports = { verifyToken };
