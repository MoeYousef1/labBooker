const mongoose = require('mongoose');

const healthCheckSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['operational', 'degraded', 'outage'],
    required: true
  },
  services: {
    database: { status: String, latency: Number },
    redis: { status: String, latency: Number },
    externalApi: { status: String, latency: Number }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// TTL index to auto-delete records after 90 days
healthCheckSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('HealthCheck', healthCheckSchema);