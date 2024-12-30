const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const roomRoutes = require("./routes/roomsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

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
    res.status(500).json({ message: "Database connection issue", error: error.message });
  }
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings/", settingsRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/book", bookingRoutes);
app.use("/api/upload", uploadRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
