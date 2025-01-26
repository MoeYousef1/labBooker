import React, { useState } from "react";
import axios from "axios";
import Message from "./Error_successMessage";
import { motion } from "framer-motion";

const DeleteBookingByUsername = ({ onSuccess }) => {
  // Similar state to "update by username"
  const [username, setUsername] = useState("");
  const [userBookings, setUserBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");

  // UI feedback
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1) Fetch upcoming bookings by username
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
      // e.g. GET /api/book/bookings/upcoming-by-username/:username
      const response = await axios.get(
        `http://localhost:5000/api/book/bookings/upcoming/${username}`
      );
      if (response.status === 200) {
        const bookings = response.data.bookings || [];
        setUserBookings(bookings);
        if (bookings.length === 0) {
          setErrors(`No upcoming bookings found for "${username}".`);
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

  // 2) Delete the chosen booking
  const handleDelete = async () => {
    if (!username) {
      setErrors("Please enter a username first.");
      return;
    }
    if (!selectedBookingId) {
      setErrors("Please select a booking to delete.");
      return;
    }
    setErrors("");
    setSuccessMessage("");
    setLoadingDelete(true);

    try {
      // e.g. DELETE /api/book/booking/:id/by-username?username=john_doe
      const response = await axios.delete(
        `http://localhost:5000/api/book/booking/${selectedBookingId}/by-username?username=${username}`
      );
      if (response.status === 200) {
        setSuccessMessage(response.data.message || "Booking deleted successfully!");
        onSuccess?.(response.data.message);
        // Optionally re-fetch updated bookings list
        fetchBookings();
      }
    } catch (err) {
      setErrors(err.response?.data?.message || "Error deleting booking by username");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 p-6 rounded-md shadow-md border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Delete Booking (By Username)</h2>

      {/* Step 1: Enter username, fetch bookings */}
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

      {/* Step 2: If we have bookings, show them in a dropdown */}
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

      {/* Error/Success Messages */}
      {errors && (
        <Message message={errors} type="error" onClose={() => setErrors("")} />
      )}
      {successMessage && (
        <Message
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage("")}
        />
      )}

      {/* Step 3: Delete button */}
      {selectedBookingId && (
        <button
          onClick={handleDelete}
          disabled={loadingDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          {loadingDelete ? "Deleting..." : "Delete Booking"}
        </button>
      )}
    </motion.div>
  );
};

export default DeleteBookingByUsername;
