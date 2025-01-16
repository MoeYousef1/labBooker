import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/SideBar";

const DashBoard = () => {
  const navigate = useNavigate();

  // User info
  const [userInfo, setUserInfo] = useState({ email: "", username: "" });

  // User Count
  const [userCount, setUserCount] = useState(0);

  // Booking counts
  const [pendingBookings, setPendingBookings] = useState(0);
  const [activeBookings, setActiveBookings] = useState(0);

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
      const token = localStorage.getItem("token"); // if needed
      const response = await axios.get(
        "http://localhost:5000/api/user/users/count",
        {
          headers: {
            Authorization: `Bearer ${token}`, // remove if route not protected
          },
        }
      );
      if (response.status === 200) {
        setUserCount(response.data.userCount);
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

  // 2. Fetch booking counts (pending, active)
  const fetchBookingCounts = async () => {
    setLoading(true);
    setErrors("");
    try {
      const token = localStorage.getItem("token"); // if needed
      const response = await axios.get(
        "http://localhost:5000/api/book/bookings/count",
        {
          headers: {
            Authorization: `Bearer ${token}`, // remove if route not protected
          },
        }
      );
      if (response.status === 200) {
        // e.g. { pendingCount: 2, activeCount: 5 }
        setPendingBookings(response.data.pendingCount);
        setActiveBookings(response.data.activeCount);
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
    <div className="min-h-screen bg-gradient-to-br from-grayLight to-grayDark flex">
      <Sidebar />

      <div className="flex-1 flex flex-col sm:pl-64 2xl:pl-0 px-4 py-10 sm:px-8 max-w-screen-xl mx-auto mt-4">

        {/* Header Section */}
        <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Welcome, {userInfo.username}!
          </h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {/* Card: Total Users */}
          <div className="bg-white rounded-lg shadow hover:shadow-md p-6 transition transform hover:-translate-y-1">
            <h3 className="text-gray-500 text-sm uppercase font-semibold tracking-wider">
              Total Users
            </h3>
            {loading ? (
              <p className="mt-2 text-gray-600">Loading...</p>
            ) : (
              <p className="mt-2 text-3xl font-bold text-gray-800">
                {userCount}
              </p>
            )}
            {errors && <p className="mt-1 text-red-600">{errors}</p>}
          </div>

          {/* Card: Pending Bookings */}
          <div className="bg-white rounded-lg shadow hover:shadow-md p-6 transition transform hover:-translate-y-1">
            <h3 className="text-gray-500 text-sm uppercase font-semibold tracking-wider">
              Pending Bookings
            </h3>
            {loading ? (
              <p className="mt-2 text-gray-600">Loading...</p>
            ) : (
              <p className="mt-2 text-3xl font-bold text-gray-800">
                {pendingBookings}
              </p>
            )}
            {errors && <p className="mt-1 text-red-600">{errors}</p>}
          </div>

          {/* Card: Active Bookings */}
          <div className="bg-white rounded-lg shadow hover:shadow-md p-6 transition transform hover:-translate-y-1">
            <h3 className="text-gray-500 text-sm uppercase font-semibold tracking-wider">
              Active Bookings
            </h3>
            {loading ? (
              <p className="mt-2 text-gray-600">Loading...</p>
            ) : (
              <p className="mt-2 text-3xl font-bold text-gray-800">
                {activeBookings}
              </p>
            )}
            {errors && <p className="mt-1 text-red-600">{errors}</p>}
          </div>
        </div>

        {/* Management Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/usermanagement")}
            className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow hover:opacity-90 transform hover:-translate-y-1 transition"
          >
            Manage Users
          </button>

          <button
            onClick={() => navigate("/roomOperationpage")}
            className="flex items-center justify-center p-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow hover:opacity-90 transform hover:-translate-y-1 transition"
          >
            Manage Rooms
          </button>

          <button
            onClick={() => navigate("/bookingmanagement")}
            className="flex items-center justify-center p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg shadow hover:opacity-90 transform hover:-translate-y-1 transition"
          >
            Manage Bookings
          </button>

          <button
            onClick={() => navigate("/configmanagement")}
            className="flex items-center justify-center p-6 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-lg shadow hover:opacity-90 transform hover:-translate-y-1 transition"
          >
            Configurations
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
