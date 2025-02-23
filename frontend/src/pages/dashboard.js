import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SidebarLayout } from "../components/SidebarLayout";
import { TbClockX } from "react-icons/tb";
import SystemStatusBanner from "../components/SystemStatusBanner";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  UserPlus, 
  AlertTriangle,
  CheckCircle2,
  XOctagon,
  AlertCircle,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DashBoard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ email: "", username: "" });
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    recentUsers: [],
    usersByRole: []
  });
  const [bookingCounts, setBookingCounts] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    canceled: 0,
    missed: 0,
  });
  const [issues, setIssues] = useState([]);
  const [issueStats, setIssueStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) navigate("/login");
    else {
      try {
        const parsedUser = JSON.parse(user);
        setUserInfo({ 
          email: parsedUser.email || "", 
          username: parsedUser.username || "" 
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!['admin', 'manager'].includes(user?.role)) {
      navigate('/homepage');
    }
  }, [navigate]);

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/issues/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(response.data);
      
      // Calculate stats
      const stats = response.data.reduce((acc, issue) => {
        acc.total++;
        acc[issue.status]++;
        return acc;
      }, { total: 0, pending: 0, "in-progress": 0, resolved: 0 });
      
      setIssueStats(stats);
    } catch (error) {
      setErrors(error?.response?.data?.message || "Error fetching issues");
    }
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/issues/update-status/${issueId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchIssues(); // Refresh issues after update
    } catch (error) {
      setErrors(error?.response?.data?.message || "Error updating status");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrors("");
      try {
        await Promise.all([
          fetchDashboardStats(), 
          fetchBookingCounts(),
          fetchIssues()
        ]);
      } catch (err) {
        setErrors(err?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboardStats({
          totalUsers: response.data.stats.totalUsers,
          recentUsers: response.data.stats.recentUsers || [],
          usersByRole: response.data.stats.usersByRole || [],
          growthStats: response.data.stats.growthStats || {}
        });
      }
    } catch (error) {
      setErrors(error?.response?.data?.message || "Error fetching dashboard data");
    }
  };

  const formatGrowth = (value) => {
    if (value === undefined || value === null) return 'N/A';
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return 'N/A';
    
    const arrow = numericValue > 0 ? '↑' : numericValue < 0 ? '↓' : '';
    const colorClass = numericValue > 0 ? 'text-green-600' : numericValue < 0 ? 'text-red-600' : 'text-gray-600';
    
    return (
      <span className={`${colorClass} font-medium`}>
        {arrow} {Math.abs(numericValue)}% from last month
      </span>
    );
  };

  const fetchBookingCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/book/bookings/count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { total, pending, confirmed, canceled, missed } = response.data.counts;
      setBookingCounts({ total, pending, confirmed, canceled, missed });
    } catch (error) {
      setErrors(error?.response?.data?.message || "Error fetching bookings");
    }
  };

  const cards = [
    {
      title: "Total Users",
      value: dashboardStats.totalUsers,
      icon: Users,
      color: "green",
      trend: formatGrowth(dashboardStats.growthStats?.userGrowth)
    },
    {
      title: "Total Bookings",
      value: bookingCounts.total,
      icon: Calendar,
      color: "blue",
      trend: formatGrowth(dashboardStats.growthStats?.bookingGrowth)
    }
  ];

  return (
    <SidebarLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full flex flex-col p-4 sm:p-6 md:p-8 overflow-x-hidden min-h-screen"
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-green-50 to-green-100 px-4 sm:px-6 py-4 rounded-xl"
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-0 flex-1 min-w-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-2 sm:p-3 bg-green-500 rounded-lg sm:rounded-xl shadow-md flex-shrink-0"
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">Dashboard Overview</h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm truncate">
                Welcome back, <span className="font-semibold text-green-600">{userInfo.username}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:block h-6 w-px bg-gray-200"></div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600 min-w-0 max-w-[200px] sm:max-w-none">
              <span className="hidden sm:inline mr-1 truncate">Account:</span>
              <span className="font-medium text-green-600 truncate text-xs sm:text-sm">
                {userInfo.email}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Loading and Error States */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-gray-100 text-gray-700 rounded-md text-sm"
            >
              Loading data...
            </motion.div>
          )}
          {errors && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm"
            >
              {errors}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        {!loading && !errors && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6"
          >
            {/* Left Column - Metrics */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {cards.map((card, index) => (
    <motion.div
      key={index}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500">{card.title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
            {card.value}
          </p>
        </div>
        <div className={`p-2 bg-${card.color}-100 rounded-lg`}>
          <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${card.color}-600`} />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs sm:text-sm">
          {card.trend}
        </span>
      </div>
    </motion.div>
  ))}
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-3">
                {[
                  { status: "Confirmed", value: bookingCounts.confirmed, icon: CheckCircle2, color: "green" },
                  { status: "Pending", value: bookingCounts.pending, icon: AlertTriangle, color: "yellow" },
                  { status: "Canceled", value: bookingCounts.canceled, icon: XOctagon, color: "red" },
                  { status: "Missed", value: bookingCounts.missed, icon: TbClockX, color: "orange" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-500">{item.status}</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{item.value}</p>
                      </div>
                      <div className={`p-2 bg-${item.color}-100 rounded-lg`}>
                        <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${item.color}-600`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="xl:col-span-1">
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100"
              >
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">Management Tools</h3>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {[
                    { icon: UserPlus, label: "Manage Users", path: "/usermanagement" },
                    { icon: BookOpen, label: "Manage Rooms", path: "/roomOperationpage" },
                    { icon: Calendar, label: "Manage Bookings", path: "/bookingOperationpage" },
                    { icon: Settings, label: "Configurations", path: "/configmanagement" },
                  ].map(({ icon: Icon, label, path }, index) => (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(path)}
                      className="group flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors min-w-0"
                    >
                      <div className="p-2 bg-green-100 rounded-md group-hover:bg-green-200">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                        {label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Issues Management Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Issues Management</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/issue-report')}
                  className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  View All Issues
                </button>
              </div>
            </div>

            {/* Issues Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Issues", value: issueStats.total, color: "blue" },
                { label: "Pending", value: issueStats.pending, color: "yellow" },
                { label: "In Progress", value: issueStats["in-progress"], color: "orange" },
                { label: "Resolved", value: issueStats.resolved, color: "green" }
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-${stat.color}-50 p-4 rounded-lg border border-${stat.color}-100`}
                >
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-xl font-bold text-${stat.color}-600 mt-1`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Issues Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Reported By</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.slice(0, 5).map((issue) => (
                    <tr key={issue._id} className="border-b last:border-b-0">
                      <td className="py-3 text-sm">{issue.issueType}</td>
                      <td className="py-3 text-sm">
                        {issue.description.length > 50
                          ? `${issue.description.substring(0, 50)}...`
                          : issue.description}
                      </td>
                      <td className="py-3 text-sm">{issue.email}</td>
                      <td className="py-3">
                        <select
                          value={issue.status}
                          onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                          className={`text-sm px-3 py-1 rounded-full border
                            ${issue.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            issue.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-green-50 text-green-700 border-green-200'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => navigate(`/issue-report/${issue._id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        <SystemStatusBanner />
      </motion.div>
    </SidebarLayout>
  );
};

export default DashBoard;