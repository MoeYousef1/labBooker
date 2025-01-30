// controllers/dashboardController.js
class DashboardController {
    constructor() {
      this.getDashboardStats = this.getDashboardStats.bind(this);
      this.getAdminDashboard = this.getAdminDashboard.bind(this);
      this.getManagerDashboard = this.getManagerDashboard.bind(this);
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
          message: "You don't have permission to access the dashboard" 
        });
      } catch (error) {
        console.error('Dashboard stats error:', error);
        return res.status(500).json({ 
          message: "Failed to get dashboard stats", 
          error: error.message 
        });
      }
    }
  
    async getAdminDashboard(req, res) {
      try {
        const stats = {
          totalUsers: await User.countDocuments(),
          recentUsers: await User.find()
            .select('-verificationCode -verificationExpires')
            .sort({ createdAt: -1 })
            .limit(5),
          // Add more admin-specific stats
        };
  
        return res.status(200).json({
          message: "Admin dashboard stats retrieved successfully",
          stats
        });
      } catch (error) {
        throw error;
      }
    }
  
    async getManagerDashboard(req, res) {
      try {
        const stats = {
          totalUsers: await User.countDocuments(),
          usersByRole: await User.aggregate([
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 }
              }
            }
          ]),
          recentUsers: await User.find()
            .select('-verificationCode -verificationExpires')
            .sort({ createdAt: -1 })
            .limit(5),
          // Add more manager-specific stats
        };
  
        return res.status(200).json({
          message: "Manager dashboard stats retrieved successfully",
          stats
        });
      } catch (error) {
        throw error;
      }
    }
  }
  
  module.exports = new DashboardController();