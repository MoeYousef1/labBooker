const mongoose = require("mongoose");

// Define the room schema
const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Room name is required
      unique: true, // Room name should be unique
    },
    type: {
      type: String,
      enum: ["Open", "Small Seminar", "Large Seminar"], // Types of rooms available
      required: true,
    },
    capacity: {
      type: Number,
      required: true, // Room capacity is required
      min: 1, // Minimum capacity of 1
    },
    description: {
      type: String,
      required: false, // Description is optional
    },
    imageUrl: {
      type: String,
      required: false, // Image URL is optional
    },
    amenities: [
      {
        name: {
          type: String,
          required: true, // Amenity name is required
        },
        icon: {
          type: String,
          enum: [
            "wifi",
            "tv",
            "projector",
            "coffee",
            "chargingstation",
            "chair",
            "whiteboard",
            "ac",
            "printer",
            "speakers",
          ], // Predefined list of allowed icons
          required: false, // Icon class is optional, use if you want to show icons in the UI
        },
      },
    ], // Array to store multiple amenities
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt fields
);

// Create and export the Room model based on the schema
module.exports = mongoose.model("Room", roomSchema);
