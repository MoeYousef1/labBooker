// routes/healthRoutes.js
const express = require("express");
const router = express.Router();
const healthController = require("../controllers/healthController");
const rateLimit = require("express-rate-limit");

const healthLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
});

router.get("/healthy", healthLimiter, healthController.getSystemHealth);
router.get("/healthy/history", healthController.getHistoricalStatus);

module.exports = router;
