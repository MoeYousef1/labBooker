const redisClient = require("../utils/redisClient");
const HealthCheck = require("../models/HealthCheck");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;

// Database health check
const checkDatabase = async () => {
  const start = Date.now();
  try {
    // Test both connection and query performance
    const [pingResult, sampleQuery] = await Promise.all([
      mongoose.connection.db.admin().ping(),
      mongoose.connection.db.collection("healthchecks").findOne(),
    ]);

    return {
      status: pingResult?.ok === 1 ? "operational" : "degraded",
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "outage",
      error: error.message,
      latency: Date.now() - start,
    };
  }
};

// Redis health check
const checkRedis = async () => {
  const start = Date.now();
  try {
    const { success, latency, error } = await redisClient.ping();
    return success
      ? {
          status: "operational",
          latency,
        }
      : {
          status: "outage",
          error,
          latency,
        };
  } catch (error) {
    return {
      status: "outage",
      error: error.message,
      latency: Date.now() - start,
    };
  }
};

// Cloudinary health check
const checkCloudinary = async () => {
  const start = Date.now();
  try {
    await cloudinary.api.ping();
    return {
      status: "operational",
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "outage",
      error: error.message,
      latency: Date.now() - start,
    };
  }
};

// Internal health check function
const getSystemHealthInternal = async () => {
  try {
    const checks = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkCloudinary(),
    ]);

    const serviceNames = ["database", "redis", "cloudinary"];
    const services = Object.fromEntries(
      serviceNames.map((name, index) => [name, checks[index]]),
    );

    const operationalCount = Object.values(services).filter(
      (s) => s.status === "operational",
    ).length;

    return {
      status:
        operationalCount === serviceNames.length
          ? "operational"
          : operationalCount > 0
            ? "degraded"
            : "outage",
      services,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "outage",
      services: {},
      timestamp: new Date().toISOString(),
    };
  }
};

// Public health endpoint
exports.getSystemHealth = async (req, res) => {
  try {
    const healthData = await getSystemHealthInternal();
    res.json({
      ...healthData,
      uptime: process.uptime(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    res.status(503).json({
      status: "outage",
      timestamp: new Date().toISOString(),
      error: "Failed to complete health checks",
    });
  }
};

// Log health status to database
exports.logStatus = async () => {
  try {
    const { status, services, timestamp } = await getSystemHealthInternal();
    await HealthCheck.create({ status, services, timestamp });
    console.log(`[HEALTH] Status logged: ${status}`);
  } catch (error) {
    console.error("[HEALTH] Failed to log status:", error);
  }
};

// Get historical health data
exports.getHistoricalStatus = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalData = await HealthCheck.find({
      timestamp: { $gte: thirtyDaysAgo },
    }).sort({ timestamp: -1 });

    const totalChecks = historicalData.length;
    const operationalChecks = historicalData.filter(
      (check) => check.status === "operational",
    ).length;

    const incidents = historicalData.filter(
      (check) => check.status !== "operational",
    );

    // In your health check controller
    res.json({
      uptime30d:
        totalChecks > 0
          ? `${((operationalChecks / totalChecks) * 100).toFixed(2)}%`
          : "No data",
      lastIncident:
        incidents.length > 0 ? incidents[incidents.length - 1].timestamp : null,
      incidentsLastMonth: incidents.length,
      dailyBreakdown: calculateDailyBreakdown(historicalData),
      history: historicalData, // Add this line to include the raw data
    });
  } catch (error) {
    console.error("[HEALTH] Failed to get historical data:", error);
    res.status(500).json({ error: "Failed to retrieve historical data" });
  }
};

// Helper function for daily breakdown
const calculateDailyBreakdown = (checks) => {
  const dailyData = {};

  checks.forEach((check) => {
    const date = check.timestamp.toISOString().split("T")[0];
    dailyData[date] = dailyData[date] || { operational: 0, total: 0 };
    dailyData[date].total++;
    if (check.status === "operational") dailyData[date].operational++;
  });

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    uptime:
      data.total > 0 ? ((data.operational / data.total) * 100).toFixed(2) : 0,
  }));
};
