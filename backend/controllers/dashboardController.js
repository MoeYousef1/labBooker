// controllers/dashboardController.js
const User = require("../models/User");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const moment = require("moment");

class DashboardController {
  // Helper method to calculate growth percentage
  calculateGrowth(current, previous) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous * 100).toFixed(1);
  }

  // New method to get growth statistics
  async getGrowthStats() {
    try {
      const currentMonthStart = moment().startOf('month');
      const prevMonthStart = moment().subtract(1, 'month').startOf('month');

      // User growth calculation
      const [currentUsers, previousUsers] = await Promise.all([
        User.countDocuments({
          createdAt: { 
            $gte: currentMonthStart.toDate(),
            $lt: moment().endOf('month').toDate()
          }
        }),
        User.countDocuments({
          createdAt: { 
            $gte: prevMonthStart.toDate(),
            $lt: moment(prevMonthStart).endOf('month').toDate()
          }
        })
      ]);

      // Booking growth calculation (excluding canceled bookings)
      const [currentBookings, previousBookings] = await Promise.all([
        Booking.countDocuments({
          createdAt: { 
            $gte: currentMonthStart.toDate(),
            $lt: moment().endOf('month').toDate()
          },
          status: { $ne: "Canceled" }
        }),
        Booking.countDocuments({
          createdAt: { 
            $gte: prevMonthStart.toDate(),
            $lt: moment(prevMonthStart).endOf('month').toDate()
          },
          status: { $ne: "Canceled" }
        })
      ]);

      return {
        userGrowth: this.calculateGrowth(currentUsers, previousUsers),
        bookingGrowth: this.calculateGrowth(currentBookings, previousBookings),
        currentMonth: currentMonthStart.format('MMMM YYYY'),
        previousMonth: prevMonthStart.format('MMMM YYYY')
      };
    } catch (error) {
      console.error('Growth stats error:', error);
      return {
        userGrowth: 0,
        bookingGrowth: 0,
        error: "Failed to calculate growth statistics"
      };
    }
  }

  async getAdminDashboard(req, res) {
    try {
      const [totalUsers, recentUsers, usersByRole, growthStats] = await Promise.all([
        User.countDocuments(),
        User.find()
          .select('username email name profilePicture role createdAt')
          .sort({ createdAt: -1 })
          .limit(5),
        User.aggregate([
          { $group: { _id: "$role", count: { $sum: 1 } } }
        ]),
        this.getGrowthStats()
      ]);

      const stats = {
        totalUsers,
        recentUsers,
        usersByRole,
        growthStats,
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
      const [totalUsers, recentUsers, usersByRole, growthStats] = await Promise.all([
        User.countDocuments(),
        User.find()
          .select('username email name profilePicture role createdAt')
          .sort({ createdAt: -1 })
          .limit(5),
        User.aggregate([
          { $group: { _id: "$role", count: { $sum: 1 } } }
        ]),
        this.getGrowthStats()
      ]);

      const stats = {
        totalUsers,
        usersByRole,
        recentUsers,
        growthStats,
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
}

const dashboardController = new DashboardController();
module.exports = dashboardController;