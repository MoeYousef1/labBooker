import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SidebarLayout } from "../components/SidebarLayout";
import { TbClockX } from "react-icons/tb";

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
    <SidebarLayout>
      <div className="w-full flex flex-col px-4 sm:px-6 md:px-8 py-6 sm:py-8 overflow-hidden">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 shrink-0" />
              <span>Dashboard</span>
            </div>
          </h1>
          <p className="text-gray-600 mt-2 sm:mt-0 text-sm sm:text-base">
            Welcome, {userInfo.username}!
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Card: Total Users */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-4 sm:p-6 transition-all duration-300 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 text-xs sm:text-sm uppercase font-semibold tracking-wider">
                Total Users
              </h3>
              <div className="flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500 shrink-0" />
              </div>
            </div>
            {loading ? (
              <p className="mt-2 text-gray-600 text-sm">Loading...</p>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{userCount}</p>
            )}
            {errors && <p className="mt-1 text-red-600 text-sm">{errors}</p>}
          </div>

          {/* Card: Total Bookings */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-4 sm:p-6 transition-all duration-300 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 text-xs sm:text-sm uppercase font-semibold tracking-wider">
                Total Bookings
              </h3>
              <div className="flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-500 shrink-0" />
              </div>
            </div>
            {loading ? (
              <p className="mt-2 text-gray-600 text-sm">Loading...</p>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{bookingCounts.total}</p>
            )}
            {errors && <p className="mt-1 text-red-600 text-sm">{errors}</p>}
          </div>
        </div>

        {/* Detailed Booking Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Confirmed Bookings */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-4 sm:p-6 transition-all duration-300 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 text-xs sm:text-sm uppercase font-semibold tracking-wider">
                Confirmed
              </h3>
              <div className="flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
              </div>
            </div>
            {loading ? (
              <p className="mt-2 text-gray-600 text-sm">Loading...</p>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{bookingCounts.confirmed}</p>
            )}
            {errors && <p className="mt-1 text-red-600 text-sm">{errors}</p>}
          </div>

          {/* Pending Bookings */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-4 sm:p-6 transition-all duration-300 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 text-xs sm:text-sm uppercase font-semibold tracking-wider">
                Pending
              </h3>
              <div className="flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" />
              </div>
            </div>
            {loading ? (
              <p className="mt-2 text-gray-600 text-sm">Loading...</p>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{bookingCounts.pending}</p>
            )}
            {errors && <p className="mt-1 text-red-600 text-sm">{errors}</p>}
          </div>

          {/* Canceled Bookings */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-4 sm:p-6 transition-all duration-300 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 text-xs sm:text-sm uppercase font-semibold tracking-wider">
                Canceled
              </h3>
              <div className="flex items-center justify-center">
                <XOctagon className="w-6 h-6 text-red-500 shrink-0" />
              </div>
            </div>
            {loading ? (
              <p className="mt-2 text-gray-600 text-sm">Loading...</p>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{bookingCounts.canceled}</p>
            )}
            {errors && <p className="mt-1 text-red-600 text-sm">{errors}</p>}
          </div>

          {/* Missed Bookings */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-4 sm:p-6 transition-all duration-300 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 text-xs sm:text-sm uppercase font-semibold tracking-wider">
                Missed
              </h3>
              <div className="flex items-center justify-center">
                <TbClockX  className="w-6 h-6 text-red-500 shrink-0" />
              </div>
            </div>
            {loading ? (
              <p className="mt-2 text-gray-600 text-sm">Loading...</p>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{bookingCounts.missed}</p>
            )}
            {errors && <p className="mt-1 text-red-600 text-sm">{errors}</p>}
          </div>
        </div>

        {/* Management Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[
            { icon: UserPlus, label: "Manage Users", path: "/usermanagement" },
            { icon: BookOpen, label: "Manage Rooms", path: "/roomOperationpage" },
            { icon: Calendar, label: "Manage Bookings", path: "/bookingOperationpage" },
            { icon: Settings, label: "Configurations", path: "/configmanagement" }
          ].map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="min-h-[80px] sm:min-h-0 flex flex-col sm:flex-row items-center justify-center p-4 sm:p-6 bg-white text-gray-800 font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 group"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <Icon className="w-6 h-6 text-green-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm text-center sm:text-left">{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default DashBoard;
