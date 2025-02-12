// controllers/dashboardController.js
const User = require("../models/User");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

class DashboardController {
  async getDashboardStats(req, res) {
      try {
          const { role } = req.user;

          if (role === 'manager') {
              return await this.getManagerDashboard(req, res);
          } else if (role === 'admin') {
              return await this.getAdminDashboard(req, res);
          }

          return res.status(403).json({
              success: false,
              message: "You don't have permission to access the dashboard"
          });
      } catch (error) {
          console.error('Dashboard stats error:', error);
          return res.status(500).json({
              success: false,
              message: "Failed to get dashboard stats",
              error: error.message
          });
      }
  }

  async getAdminDashboard(req, res) {
      try {
          const [totalUsers, recentUsers, usersByRole] = await Promise.all([
              User.countDocuments(),
              User.find()
                  .select('username email name profilePicture role createdAt')
                  .sort({ createdAt: -1 })
                  .limit(5),
              User.aggregate([
                  {
                      $group: {
                          _id: "$role",
                          count: { $sum: 1 }
                      }
                  }
              ])
          ]);

          const stats = {
              totalUsers,
              recentUsers,
              usersByRole,
              lastUpdated: new Date()
          };

          return res.status(200).json({
              success: true,
              message: "Admin dashboard stats retrieved successfully",
              stats
          });
      } catch (error) {
          console.error('Admin dashboard error:', error);
          return res.status(500).json({
              success: false,
              message: "Failed to get admin dashboard stats",
              error: error.message
          });
      }
  }

  async getManagerDashboard(req, res) {
      try {
          const [totalUsers, recentUsers, usersByRole] = await Promise.all([
              User.countDocuments(),
              User.find()
                  .select('username email name profilePicture role createdAt')
                  .sort({ createdAt: -1 })
                  .limit(5),
              User.aggregate([
                  {
                      $group: {
                          _id: "$role",
                          count: { $sum: 1 }
                      }
                  }
              ])
          ]);

          const stats = {
              totalUsers,
              usersByRole,
              recentUsers,
              lastUpdated: new Date()
          };

          return res.status(200).json({
              success: true,
              message: "Manager dashboard stats retrieved successfully",
              stats
          });
      } catch (error) {
          console.error('Manager dashboard error:', error);
          return res.status(500).json({
              success: false,
              message: "Failed to get manager dashboard stats",
              error: error.message
          });
      }
  }
}

// Export a single instance
const dashboardController = new DashboardController();
module.exports = dashboardController;