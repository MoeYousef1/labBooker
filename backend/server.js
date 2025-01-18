const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require('express-rate-limit');
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const roomRoutes = require("./routes/roomsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const configRoutes = require("./routes/configRoutes");

const app = express();

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

app.use(express.json());
app.use(morgan("dev"));

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many login attempts, please try again later'
});
app.use('/api/auth/', authLimiter);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/health", async (req, res) => {
  try {
    await mongoose.connection.db.command({ ping: 1 });
    res.status(200).json({ message: "Server is healthy!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Database connection issue", error: error.message });
  }
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings/", settingsRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/book", bookingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/config", configRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  const statusCode = err.status || 500;
  const errorResponse = {
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.toString() 
    })
  };

  res.status(statusCode).json(errorResponse);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing server and database connection...');
  
  try {
    await mongoose.connection.close(false);
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));