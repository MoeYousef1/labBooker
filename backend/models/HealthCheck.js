const mongoose = require("mongoose");
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

const healthCheckSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["operational", "degraded", "outage"],
    required: true,
  },
  services: {
    database: { status: String, latency: Number },
    redis: { status: String, latency: Number },
    cloudinary: { status: String, latency: Number },
    server: { status: String, latency: Number },
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// TTL index to auto-delete records after 90 days
healthCheckSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: THIRTY_DAYS_IN_SECONDS },
);

module.exports = mongoose.model("HealthCheck", healthCheckSchema);
