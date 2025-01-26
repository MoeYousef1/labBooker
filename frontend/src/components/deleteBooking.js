import React, { useState } from "react";
import axios from "axios";
import Message from "./Error_successMessage";

const DeleteBooking = ({ bookingId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleDelete = async () => {
    if (!bookingId) {
      setErrors("Booking ID is required to delete");
      return;
    }
    setLoading(true);
    setErrors("");
    setSuccessMessage("");
    try {
      const response = await axios.delete(`http://localhost:5000/api/book/booking/${bookingId}`);
      if (response.status === 200) {
        setSuccessMessage("Booking deleted successfully");
        onSuccess("Booking deleted successfully");
      }
    } catch (err) {
      setErrors(err.response?.data?.message || "Error deleting booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-md shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Delete Booking</h2>
      <p className="text-sm text-gray-600">Booking ID: {bookingId}</p>

      {errors && <Message message={errors} type="error" onClose={() => setErrors("")} />}
      {successMessage && <Message message={successMessage} type="success" onClose={() => setSuccessMessage("")} />}

      <button
        onClick={handleDelete}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        {loading ? "Deleting..." : "Delete Booking"}
      </button>
    </div>
  );
};

export default DeleteBooking;
