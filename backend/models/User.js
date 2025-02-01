// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ["user", "admin", "manager"], 
    default: 'user'
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationExpires: {
    type: Date,
    default: null
  },
  emailChangeRequest: {
    newEmail: { type: String, default: null },
    verificationCode: { type: String, default: null },
    expiresAt: { type: Date, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);