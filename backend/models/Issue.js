// models/Issue.js
const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    issueType: {
      type: String,
      required: [true, "Issue type is required"],
      enum: ["booking", "technical", "other"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    bookingReference: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Issue", issueSchema);
