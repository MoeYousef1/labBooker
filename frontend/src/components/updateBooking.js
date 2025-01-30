import React, { useState } from "react";
import axios from "axios";
import Message from "./Error_successMessage";
import { motion } from "framer-motion";

const validStatuses = ["Pending", "Confirmed", "Canceled"];

const UpdateBooking = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [userBookings, setUserBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [status, setStatus] = useState("Pending");
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetMessages = () => {
    setErrors("");
    setSuccessMessage("");
  };

  const resetForm = () => {
    setUsername("");
    setUserBookings([]);
    setSelectedBookingId("");
    setStatus("Pending");
    resetMessages();
  };

  const fetchBookings = async () => {
    if (!username.trim()) {
      setErrors("Please enter a username to fetch bookings.");
      return;
    }
    
    resetMessages();
    setLoadingBookings(true);
    setUserBookings([]);
    setSelectedBookingId("");

    try {
      const response = await axios.get(
        `http://localhost:5000/api/book/bookings/upcoming/${username}`
      );
      
      if (response.status === 200) {
        const bookings = response.data.bookings || [];
        setUserBookings(bookings);
        
        if (bookings.length === 0) {
          setErrors(`No upcoming bookings found for username: "${username}"`);
        } else {
          setSuccessMessage(`Found ${bookings.length} upcoming booking(s)`);
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

 // Update the handleUpdate function to prevent updating to the same status
const handleUpdate = async () => {
  if (!username.trim()) {
    setErrors("Please enter a username first.");
    return;
  }
  if (!selectedBookingId) {
    setErrors("Please select a booking to update.");
    return;
  }

  const currentStatus = userBookings.find(b => b._id === selectedBookingId)?.status;
  if (status === currentStatus) {
    setErrors("Please select a different status to update.");
    return;
  }

  resetMessages();
  setLoadingUpdate(true);

  try {
    const response = await axios.patch(
      `http://localhost:5000/api/book/booking/${selectedBookingId}/status/by-username?username=${username}`,
      { status }
    );
    
    if (response.status === 200) {
      setSuccessMessage(`Booking status successfully updated from ${currentStatus} to ${status}`);
      onSuccess?.(response.data.message);
      await fetchBookings();
    }
  } catch (err) {
    setErrors(err.response?.data?.message || "Error updating booking status");
  } finally {
    setLoadingUpdate(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-10 bg-gray-50 rounded-lg shadow-xl mb-4"
    >
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Update Booking Status
      </h2>

      <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
        {/* Username Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
            User Details
          </h3>
          <div className="flex space-x-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  resetMessages();
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter username to fetch bookings"
              />
            </div>
            <button
              type="button"
              onClick={fetchBookings}
              disabled={loadingBookings || !username.trim()}
              className={`px-6 py-3 rounded-lg shadow-md transition-colors self-end
                ${loadingBookings || !username.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-green-500 hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400'
                }`}
            >
              {loadingBookings ? "Fetching..." : "Fetch Bookings"}
            </button>
          </div>
        </div>

        {/* Bookings Section */}
        {userBookings.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Select Booking
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Bookings
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => {
                  setSelectedBookingId(e.target.value);
                  resetMessages();
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Select a booking to update --</option>
                {userBookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    Room: {booking.roomId?.name} | Date: {booking.date} | Time: {booking.startTime}-{booking.endTime}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Status Section */}
{selectedBookingId && (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
      Update Status
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Current Status Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Status
        </label>
        <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              userBookings.find(b => b._id === selectedBookingId)?.status === 'Confirmed'
                ? 'bg-green-500'
                : userBookings.find(b => b._id === selectedBookingId)?.status === 'Canceled'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}></span>
            <span className="font-medium text-gray-800">
              {userBookings.find(b => b._id === selectedBookingId)?.status || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* New Status Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Status <span className="text-red-500">*</span>
        </label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            resetMessages();
          }}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
            status === userBookings.find(b => b._id === selectedBookingId)?.status
              ? 'border-yellow-300 bg-yellow-50'
              : 'border-gray-300'
          }`}
        >
          {validStatuses.map((s) => (
            <option 
              key={s} 
              value={s}
              disabled={s === userBookings.find(b => b._id === selectedBookingId)?.status}
            >
              {s} {s === userBookings.find(b => b._id === selectedBookingId)?.status ? '(Current)' : ''}
            </option>
          ))}
        </select>
        {status === userBookings.find(b => b._id === selectedBookingId)?.status && (
          <p className="mt-1 text-sm text-yellow-600">
            Please select a different status to update
          </p>
        )}
      </div>
    </div>

    {/* Booking Details Summary */}
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Booking Details</h4>
      {(() => {
        const selectedBooking = userBookings.find(b => b._id === selectedBookingId);
        return selectedBooking ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="block text-gray-500">Room</span>
              <span className="font-medium">{selectedBooking.roomId?.name}</span>
            </div>
            <div>
              <span className="block text-gray-500">Date</span>
              <span className="font-medium">{selectedBooking.date}</span>
            </div>
            <div>
              <span className="block text-gray-500">Time</span>
              <span className="font-medium">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
            </div>
            <div>
              <span className="block text-gray-500">Booking ID</span>
              <span className="font-medium">{selectedBooking._id.slice(-6)}</span>
            </div>
          </div>
        ) : null;
      })()}
    </div>
  </div>
)}

        {/* Messages */}
        <div className="text-center">
          {errors && (
            <Message message={errors} type="error" onClose={resetMessages} />
          )}
          {successMessage && (
            <Message message={successMessage} type="success" onClose={resetMessages} />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          {userBookings.length > 0 && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          )}
          {selectedBookingId && (
            <button
              type="button"
              onClick={handleUpdate}
              disabled={loadingUpdate}
              className={`px-6 py-3 rounded-lg shadow-md transition-colors
                ${loadingUpdate
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-green-500 hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400'
                }`}
            >
              {loadingUpdate ? "Updating..." : "Update Booking"}
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default UpdateBooking;