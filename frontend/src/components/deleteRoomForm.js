import React, { useState, useEffect } from "react";
import axios from "axios";
import Message from "./Error_successMessage";

const DeleteRoomForm = ({ operation, onSuccess }) => {
  // We'll fetch all rooms to populate our dropdown
  const [roomsList, setRoomsList] = useState([]);

  // This is what the user selects from the dropdown; 
  // your existing code calls it "roomId," but we'll store the room's name here
  const [roomId, setRoomId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1) On mount, fetch all rooms so we can display their names in the dropdown
  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        // Adjust this endpoint if your backend route is different
        const response = await axios.get("http://localhost:5000/api/room/rooms");
        // Expect response.data to be an array of room objects, each with at least a 'name'
        setRoomsList(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load rooms list.");
      }
    };
    fetchAllRooms();
  }, []);

  // 2) The delete logic, same as before, but we do a DELETE with the selected room name
  const handleDelete = async () => {
    if (!roomId) {
      setError("Please select a room first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      // This calls DELETE /api/room/rooms/:roomName
      // Make sure your backend supports a route that accepts the name as a parameter
      const response = await axios.delete(`http://localhost:5000/api/room/rooms/${roomId}`);
      if (response.data.status === 200) {
        setSuccessMessage(response.data.message);
        onSuccess();
      } else if (response.data.status === 404) {
        setError(response.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } catch (err) {
      setError("Error deleting room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:flex-1 sm:pl-64 2xl:pl-0">
      <div className="mx-auto p-6 w-full bg-white rounded-lg shadow-lg transition">
        {operation === "delete" && (
          <div>
            <h3 className="text-xl font-semibold text-center mb-4">Delete Room</h3>

            {/* Dropdown to select the room name instead of typing it */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="roomDropdown">
                Choose a Room
              </label>
              <select
                id="roomDropdown"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a Room --</option>
                {roomsList.map((room) => (
                  <option key={room._id} value={room.name}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleDelete}
                disabled={loading}
                className={`w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md transition duration-300 ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-red-700"
                }`}
              >
                {loading ? "Deleting..." : "Delete Room"}
              </button>
            </div>

            <div className="text-center mt-4">
              {error && <Message message={error} type="error" onClose={() => setError("")} />}
              {successMessage && <Message message={successMessage} type="success" onClose={() => setSuccessMessage("")} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteRoomForm;
