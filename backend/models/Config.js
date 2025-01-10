const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    booking: {
      openDaysBefore: {
        type: Number,
        default: 3,
      },
      slotDurationHours: {
        type: Number,
        default: 3,
      },
      maxBookingsPerWeek: {
        type: Number,
        default: 2,
      },
      minBookingTimeBeforeHours: {
        type: Number,
        default: 2,
      },
    },
    cancellation: {
      minCancellationTimeBeforeMinutes: {
        type: Number,
        default: 30,
      },
    },
    penalty: {
      maxMissedBookingsPerMonth: {
        type: Number,
        default: 2,
      },
      blockDurationWeeks: {
        type: Number,
        default: 2,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Config", configSchema);
