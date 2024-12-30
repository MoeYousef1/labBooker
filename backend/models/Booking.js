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
    slot: {
      type: String,
      required: true, // Slot is required for the booking (e.g., "09:00-12:00")
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Canceled"],
      default: "Pending", // Booking is initially pending
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt fields
);

// Create and export the Booking model based on the schema
module.exports = mongoose.model("Booking", bookingSchema);
