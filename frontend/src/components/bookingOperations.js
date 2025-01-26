import React, { useState } from "react";

const BookingOperations = ({
  operation,
  setOperation,
  bookingId,
  setBookingId,
  setBookingDetails
}) => {
  const [localId, setLocalId] = useState(bookingId);

  // If you want to fetch booking details on "update"
  const handleFetchBookingDetails = async () => {
    // Example: fetch booking by ID
    // const response = await axios.get(`http://localhost:5000/api/book/booking/${localId}`);
    // setBookingDetails(response.data.booking);
    
    // For now, just a placeholder:
    setBookingDetails({ id: localId, date: "2025-01-02", startTime: "10:00" });
  };

  const handleChangeOperation = (op) => {
    setOperation(op);
    if (op !== "update" && op !== "delete") {
      setBookingId("");
      setBookingDetails(null);
    }
  };

  const handleSetBooking = () => {
    setBookingId(localId);
    // Optionally fetch details if in update mode
    if (operation === "update") {
      handleFetchBookingDetails();
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Select Booking Operation</h2>
      
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => handleChangeOperation("create")}
          className={`px-4 py-2 rounded-md ${
            operation === "create"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-green-100"
          }`}
        >
          Create
        </button>
        <button
          onClick={() => handleChangeOperation("update")}
          className={`px-4 py-2 rounded-md ${
            operation === "update"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-green-100"
          }`}
        >
          Update
        </button>
        <button
          onClick={() => handleChangeOperation("delete")}
          className={`px-4 py-2 rounded-md ${
            operation === "delete"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-green-100"
          }`}
        >
          Delete
        </button>
      </div>

      {(operation === "update" || operation === "delete") && (
        <div className="space-y-4">
          <label className="block text-gray-700 font-medium">
            Booking ID:
          </label>
          <input
            type="text"
            value={localId}
            onChange={(e) => setLocalId(e.target.value)}
            placeholder="Enter Booking ID"
            className="p-2 border border-gray-300 rounded-md w-full"
          />
          <button
            onClick={handleSetBooking}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {operation === "update" ? "Load Booking for Update" : "Set Booking ID"}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingOperations;
