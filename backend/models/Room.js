const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Open", "Small Seminar", "Large Seminar"],
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, "Capacity must be at least 1"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      validate: {
        validator: function(v) {
          // Optional URL validation
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    },
    amenities: [
      {
        name: {
          type: String,
          required: true,
        },
        icon: {
          type: String,
          enum: [
            "wifi", "tv", "projector", "coffee", "chargingstation", 
            "chair", "whiteboard", "ac", "printer", "speakers"
          ],
        },
      },
    ],
    occupiedTimeSlots: [
      {
        date: String,
        slot: String,
      },
    ],
    bookingConfirmationRequired: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true 
  }
);

// Method to check time slot availability
roomSchema.methods.isTimeSlotAvailable = function(date, startTime, endTime) {
  return !this.occupiedTimeSlots.some(
    slot => slot.date === date && 
            slot.slot === `${startTime}-${endTime}`
  );
};

// Method to add occupied time slot
roomSchema.methods.addOccupiedTimeSlot = function(date, startTime, endTime) {
  this.occupiedTimeSlots.push({
    date,
    slot: `${startTime}-${endTime}`
  });
  return this.save();
};

module.exports = mongoose.model("Room", roomSchema);