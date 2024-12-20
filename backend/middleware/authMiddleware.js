require('dotenv').config();
const jwt = require("jsonwebtoken");

// Middleware to verify JWT Token
const verifyToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1]; // Bearer token
    if (!token) {
      return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request
    
    next();
  } catch (error) {
    // Handle different JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Token is invalid" });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

module.exports = verifyToken;
