// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authenticate = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Use the route handler as a function
router.get(
  "/stats",
  authenticate.requireAuth,
  roleMiddleware.checkRole(["admin", "manager"]),
  (req, res) => dashboardController.getDashboardStats(req, res),
);

module.exports = router;
