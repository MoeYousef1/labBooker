const mongoose = require("mongoose");

// Define the booking schema
const bookingSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", // Reference to the Room model
      required: true, // Room must be specified for the booking
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true, // User must be specified for the booking
    },
    date: {
      type: String,
      required: true, // Date is required for the booking
    },
    startTime: {
      type: String,
      required: true, // Start time is required for the booking
    },
    endTime: {
      type: String,
      required: true, // End time is required for the booking
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Canceled"],
      default: "Pending", // Booking is initially pending
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create and export the Booking model based on the schema
module.exports = mongoose.model("Booking", bookingSchema);
