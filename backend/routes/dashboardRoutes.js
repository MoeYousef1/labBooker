// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const roleMiddleware = require('../middleware/roleMiddleware');

 

// Dashboard routes
router.get('/stats', 
  roleMiddleware.checkRole('admin', 'manager'), 
  dashboardController.getDashboardStats
);

module.exports = router;