const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          // Validate date format (YYYY-MM-DD)
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: props => `${props.value} is not a valid date format!`
      }
    },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          // Validate time format (HH:MM)
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format!`
      }
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          // Validate time format (HH:MM)
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format!`
      }
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Canceled"],
      default: "Pending",
    },
    additionalUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { 
    timestamps: true,
    // Add a pre-save hook for additional validation
    validateBeforeSave: true 
  }
);

// Add a pre-save validation hook
bookingSchema.pre('save', function(next) {
  // Validate start and end times
  const startTime = new Date(`1970-01-01T${this.startTime}:00`);
  const endTime = new Date(`1970-01-01T${this.endTime}:00`);

  if (endTime <= startTime) {
    return next(new Error('End time must be after start time'));
  }

  // Validate booking is for a future date
  const bookingDate = new Date(`${this.date}T00:00:00`); // Treat as local midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    return next(new Error('Booking date must be in the future'));
  }

  next();
});


module.exports = mongoose.model("Booking", bookingSchema);