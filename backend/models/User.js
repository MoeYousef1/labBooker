const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensures no two users have the same username
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no two users have the same email
      match: /.+\@.+\..+/ // Ensures email has a valid format
    },
    password: {
      type: String,
      required: true, // Password must be provided
    },
    role: { 
      type: String, 
      required: false, 
      default: "user", // Optional: Set a default role
    }
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create and export the User model based on the schema
module.exports = mongoose.model('User', userSchema);
