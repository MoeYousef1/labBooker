import React, { useState } from "react";
import axios from "axios";
import Message from "./Error_successMessage";
import { motion } from "framer-motion";

// Example statuses used in your system
const validStatuses = ["Pending", "Confirmed", "Canceled"];

const UpdateBooking = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [userBookings, setUserBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [status, setStatus] = useState("Pending");

  // For UI feedback
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1) Fetch user’s upcoming bookings by username
  const fetchBookings = async () => {
    if (!username) {
      setErrors("Please enter a username to fetch bookings.");
      return;
    }
    setErrors("");
    setSuccessMessage("");
    setLoadingBookings(true);
    setUserBookings([]);

    try {
      // e.g. /api/book/bookings/upcoming-by-username?username=<username>
      const response = await axios.get(
        `http://localhost:5000/api/book/bookings/upcoming-by-username/${username}`
      );
      if (response.status === 200) {
        const bookings = response.data.bookings || [];
        setUserBookings(bookings);
        if (bookings.length === 0) {
          setErrors(`No upcoming bookings found for username: "${username}"`);
        }
      }
    } catch (err) {
      setErrors(
        err.response?.data?.message ||
        `Error fetching upcoming bookings for username: ${username}`
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  // 2) Update a chosen booking’s status
  const handleUpdate = async () => {
    if (!username) {
      setErrors("Please enter a username first.");
      return;
    }
    if (!selectedBookingId) {
      setErrors("Please select a booking to update.");
      return;
    }

    setErrors("");
    setSuccessMessage("");
    setLoadingUpdate(true);

    try {
      // e.g. PATCH /booking/:id/status/by-username?username=john_doe
      const response = await axios.patch(
        `http://localhost:5000/api/book/booking/${selectedBookingId}/status/by-username?username=${username}`,
        { status }
      );
      if (response.status === 200) {
        setSuccessMessage(response.data.message || "Booking updated successfully!");
        onSuccess?.(response.data.message);
        // Optionally re-fetch bookings to reflect updated statuses
        fetchBookings();
      }
    } catch (err) {
      setErrors(err.response?.data?.message || "Error updating booking by username");
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 p-6 rounded-md shadow-md border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Booking (By Username)</h2>

      {/* Step 1: Enter username & fetch bookings */}
      <div className="flex flex-col sm:flex-row sm:items-end mb-6 gap-4">
        <div className="w-full sm:w-1/2">
          <label className="block text-gray-700 font-medium">Username</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john_doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <button
          onClick={fetchBookings}
          disabled={loadingBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {loadingBookings ? "Fetching..." : "Fetch Bookings"}
        </button>
      </div>

      {/* Step 2: Display upcoming bookings in dropdown */}
      {userBookings.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-700 font-medium">Select Booking</label>
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
          >
            <option value="">-- Choose a Booking --</option>
            {userBookings.map((b) => (
              <option key={b._id} value={b._id}>
                BookingID: {b._id.slice(-4)} | Room: {b.roomId?.name} | {b.date} ({b.startTime}-{b.endTime})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: If a booking is selected, pick a status */}
      {selectedBookingId && (
        <div className="mb-6">
          <label className="block text-gray-700 font-medium">New Status</label>
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {validStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error/Success Messages */}
      {errors && (
        <Message message={errors} type="error" onClose={() => setErrors("")} />
      )}
      {successMessage && (
        <Message message={successMessage} type="success" onClose={() => setSuccessMessage("")} />
      )}

      {/* Update Button */}
      {selectedBookingId && (
        <button
          onClick={handleUpdate}
          disabled={loadingUpdate}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          {loadingUpdate ? "Updating..." : "Update Booking"}
        </button>
      )}
    </motion.div>
  );
};

export default UpdateBooking;
