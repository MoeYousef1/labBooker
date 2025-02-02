// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    // For example: "emailChange", "booking", "bookingConfirmed", etc.
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  // New field to store when a notification was marked as read
  readAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a TTL index on the readAt field: documents will be removed 3 days after readAt is set.
NotificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 259200 });

module.exports = mongoose.model("Notification", NotificationSchema);
