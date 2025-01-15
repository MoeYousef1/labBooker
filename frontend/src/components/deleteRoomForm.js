import React, { useState } from "react";
import axios from "axios";
import Message from "./Error_successMessage"; // Import Message component

const DeleteRoomForm = ({ operation, onSuccess }) => {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // For error messages
  const [successMessage, setSuccessMessage] = useState(""); // For success messages

  const handleDelete = async () => {
    if (!roomId) {
      setError("Please enter a room ID.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Make a DELETE request to the backend to delete the room
      const response = await axios.delete(
        `http://localhost:5000/api/room/rooms/${roomId}`,
      );

      // Check the status in the response and display appropriate message
      if (response.data.status === 200) {
        // Success: Room deleted
        setSuccessMessage(response.data.message);
        onSuccess(); // Notify parent component about success
      } else if (response.data.status === 404) {
        // Error: Room not found
        setError(response.data.message);
      } else {
        // Unexpected status
        setError("An unexpected error occurred.");
      }
    } catch (err) {
      // General error handler (e.g., network issues)
      setError("Error deleting room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:flex-1 sm:pl-48">
      <div className="mx-auto p-6 w-full bg-white rounded-lg shadow-md">
        {operation === "delete" && (
          <div>
            <h3 className="text-xl font-semibold text-center mb-4">
              Delete Room
            </h3>

            <div className="mb-4">
              <label
                htmlFor="roomId"
                className="block text-sm font-medium text-gray-700"
              >
                Room Name
              </label>
              <input
                id="roomId"
                type="text"
                placeholder="Enter room name"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleDelete}
                disabled={loading}
                className={`w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md transition duration-300 
                ${loading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-red-700"}`}
              >
                {loading ? "Deleting..." : "Delete Room"}
              </button>
            </div>

            {/* Display success and error messages */}
            <div className="text-center mt-4">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteRoomForm;
