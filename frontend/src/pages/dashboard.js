import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SidebarLayout } from "../components/SidebarLayout";
import { TbClockX } from "react-icons/tb";
import SystemStatusBanner from '../components/SystemStatusBanner';


import { 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  UserPlus, 
  AlertTriangle,
  CheckCircle2,
  XOctagon
} from 'lucide-react';

const DashBoard = () => {
  const navigate = useNavigate();

  // User info
  const [userInfo, setUserInfo] = useState({ email: "", username: "" });

  // User Count
  const [userCount, setUserCount] = useState(0);

  // Booking counts
  const [bookingCounts, setBookingCounts] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    canceled: 0,
    missed: 0,
  });

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    // Check user in localStorage
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    } else {
      try {
        const parsedUser = JSON.parse(user);
        setUserInfo({
          email: parsedUser.email || "",
          username: parsedUser.username || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [navigate]);

  // Fetch data on mount
  useEffect(() => {
    fetchUserCount();
    fetchBookingCounts();
  }, []);

  // 1. Fetch total user count
  const fetchUserCount = async () => {
    setLoading(true);
    setErrors("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/user/count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setUserCount(response.data.count);
      }
    } catch (error) {
      setErrors(
        error?.response?.data?.message ||
        "An error occurred while fetching user count"
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch booking counts (total, pending, confirmed, canceled)
  const fetchBookingCounts = async () => {
    setLoading(true);
    setErrors("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/book/bookings/count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        // destructure out total, pending, confirmed, canceled
        const { total, pending, confirmed, canceled, missed } = response.data.counts;
        setBookingCounts({ total, pending, confirmed, canceled, missed });
      }
    } catch (error) {
      setErrors(
        error?.response?.data?.message ||
        "An error occurred while fetching booking counts"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
   // Dashboard component with improved styling
<SidebarLayout>
  <div className="w-full flex flex-col px-4 sm:px-6 md:px-8 py-6 sm:py-8 overflow-hidden">
    {/* Header Section */}
    <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-500 rounded-xl shadow-lg">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1 text-sm">Welcome back, <span className="font-semibold text-green-600">{userInfo.username}</span></p>
        </div>
      </div>
      <div className="mt-4 sm:mt-0 flex items-center gap-3">
        <div className="hidden sm:block h-8 w-px bg-gray-200"></div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="hidden sm:inline">Account:</span>
          <span className="font-medium text-green-600">{userInfo.email}</span>
        </div>
      </div>
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Key Metrics */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Users Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{userCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <span className="text-sm text-green-600 font-medium">+2.4% from last month</span>
            </div>
          </div>

          {/* Total Bookings Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-800">{bookingCounts.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <span className="text-sm text-blue-600 font-medium">+12.6% from last month</span>
            </div>
          </div>
        </div>

        {/* Booking Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {[
            { status: 'Confirmed', value: bookingCounts.confirmed, icon: CheckCircle2, color: 'green' },
            { status: 'Pending', value: bookingCounts.pending, icon: AlertTriangle, color: 'yellow' },
            { status: 'Canceled', value: bookingCounts.canceled, icon: XOctagon, color: 'red' },
            { status: 'Missed', value: bookingCounts.missed, icon: TbClockX, color: 'orange' },
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.status}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{item.value}</p>
                </div>
                <div className={`p-2 bg-${item.color}-100 rounded-lg`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Quick Actions */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Management Tools</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: UserPlus, label: "Manage Users", path: "/usermanagement" },
              { icon: BookOpen, label: "Manage Rooms", path: "/roomOperationpage" },
              { icon: Calendar, label: "Manage Bookings", path: "/bookingOperationpage" },
              { icon: Settings, label: "Configurations", path: "/configmanagement" }
            ].map(({ icon: Icon, label, path }, index) => (
              <button
                key={index}
                onClick={() => navigate(path)}
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* System Status Banner */}
    <SystemStatusBanner />
    
  </div>
</SidebarLayout>
  );
};

export default DashBoard;
