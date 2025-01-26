import React, { useState } from "react";
import axios from "axios";
import Message from "./Error_successMessage";

const CreateBooking = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    roomId: "",
    userId: "",
    date: "",
    startTime: "",
    endTime: "",
    additionalUsers: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors("");
    setSuccessMessage("");

    // Prepare additionalUsers as array
    const usersArray = formData.additionalUsers
      ? formData.additionalUsers.split(",").map((u) => u.trim())
      : [];

    try {
      const response = await axios.post("http://localhost:5000/api/book/booking", {
        roomId: formData.roomId,
        userId: formData.userId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        additionalUsers: usersArray
      });

      if (response.status === 201) {
        setSuccessMessage(response.data.message || "Booking created successfully!");
        onSuccess("Booking created successfully!");
        setFormData({
          roomId: "",
          userId: "",
          date: "",
          startTime: "",
          endTime: "",
          additionalUsers: "",
        });
      }
    } catch (err) {
      setErrors(
        err.response?.data?.message ||
        "An error occurred while creating the booking"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-md shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Create a Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* roomId */}
        <div>
          <label className="block text-gray-700 font-medium">
            Room ID
          </label>
          <input
            type="text"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="e.g. 642d2bbd8235cc0d8f1467b0"
          />
        </div>

        {/* userId */}
        <div>
          <label className="block text-gray-700 font-medium">
            User ID
          </label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="e.g. 642c9e4d8235cc0d8f14679f"
          />
        </div>

        {/* date, startTime, endTime */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* additionalUsers */}
        <div>
          <label className="block text-gray-700 font-medium">
            Additional User Emails (comma-separated)
          </label>
          <input
            type="text"
            name="additionalUsers"
            value={formData.additionalUsers}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="email1@example.com, email2@example.com"
          />
        </div>

        {/* Error / Success messages */}
        {errors && (
          <Message
            message={errors}
            type="error"
            onClose={() => setErrors("")}
          />
        )}
        {successMessage && (
          <Message
            message={successMessage}
            type="success"
            onClose={() => setSuccessMessage("")}
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {loading ? "Creating..." : "Create Booking"}
        </button>
      </form>
    </div>
  );
};

export default CreateBooking;
