import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Message from "./Error_successMessage";

const DeleteRoomForm = ({ operation, onSuccess }) => {
  const [roomsList, setRoomsList] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all rooms for the dropdown
  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/room/rooms");
        setRoomsList(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load rooms list.");
      }
    };
    fetchAllRooms();
  }, []);

  // Handle room deletion
  const handleDelete = async () => {
    if (!roomId) {
      setError("Please select a room first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/room/rooms/${roomId}`
      );
      if (response.status === 200) {
        setSuccessMessage("Room deleted successfully!");
        onSuccess();
        setRoomId("");
        setRoomsList((prev) => prev.filter((room) => room.name !== roomId));
      } else {
        setError("An unexpected error occurred.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-10 bg-gray-50 rounded-lg shadow-xl mb-4"
    >
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Delete Room
      </h2>

      <div className="space-y-6">
        {/* Room Dropdown */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="roomDropdown"
          >
            Select a Room to Delete
          </label>

          <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="" disabled>
            Choose a Room
          </option>
          {roomsList.map((room) => (
            <option key={room._id} value={room.name}>
              {room.name}
            </option>
          ))}
        </select>

        </div>

        {/* Messages */}
        <div className="text-center">
          {error && (
            <Message
              message={error}
              type="error"
              onClose={() => setError("")}
            />
          )}
          {successMessage && (
            <Message
              message={successMessage}
              type="success"
              onClose={() => setSuccessMessage("")}
            />
          )}
        </div>

        {/* Delete Button */}
        <div className="flex justify-center">
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`px-6 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md transition duration-300 focus:ring-2 focus:ring-red-400 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-red-700"
            }`}
          >
            {loading ? "Deleting..." : "Delete Room"}
          </button>
        </div>

        
      </div>
    </motion.div>
  );
};

export default DeleteRoomForm;
