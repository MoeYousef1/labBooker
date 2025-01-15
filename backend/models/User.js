const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    role: {
      type: String,
      default: "user",
    },
    verificationCode: {
      type: String,
      default: null, // Optional: Store verification code temporarily
    },
    verificationExpires: {
      type: Date,
      default: null, // Optional: Store expiration time for the code
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
