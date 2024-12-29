import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../assets/header-bg.jpg"; // Background image
import RoomImg from "../assets/room.jpg"; // Placeholder image

const RoomsSection = ({ userInfo }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State to track description visibility for each room
  const [expandedRoom, setExpandedRoom] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/room/rooms");
        setRooms(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load rooms. Please try again later.");
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleBookRoom = (roomId) => {
    alert(`Room ${roomId} booked!`);
  };

  // Toggle description visibility
  const toggleDescription = (roomId) => {
    setExpandedRoom((prevExpandedRoom) =>
      prevExpandedRoom === roomId ? null : roomId
    );
  };

  return (
    <div className="relative min-h-screen w-full pt-16 bg-gray-100">
      <div
        className="absolute inset-0 bg-cover bg-center w-full h-full"
        style={{ backgroundImage: `url(${Header})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 px-8 py-6 max-w-screen-xl mx-auto">
        {/* Personalized Welcome Message */}
        {userInfo && (
          <div className="mb-8 text-center text-white p-6 bg-gradient-to-r from-blue-500 to-blue-800 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Welcome, {userInfo.username}!
            </h2>
            <p className="mt-4 text-lg md:text-xl">
              Focus on studying and booking the perfect study room!
            </p>
          </div>
        )}

        {/* Loading/Error Messages */}
        {loading && <div className="text-center text-lg text-gray-700">Loading rooms...</div>}
        {error && <div className="text-center text-lg text-red-500">{error}</div>}

        {/* Rooms Container - One Card Per Line */}
        <div className="grid grid-cols-1 gap-8 px-4">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div
  key={room._id}
  className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-700 overflow-hidden transform transition-all duration-300 hover:scale-105 mx-auto w-full"
>
  {/* Room Image */}
  <div className="w-full sm:w-1/3 h-64 sm:h-auto">
    <img
      className="w-full h-full object-cover"
      src={room.imageUrl || RoomImg}
      alt={room.name}
    />
  </div>

  {/* Room Content */}
  <div className="p-6 flex-1 flex flex-col justify-between">
    {/* Room Title */}
    <h5 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4 relative">
      {room.name}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 to-blue-800 opacity-20 rounded-lg"></div>
    </h5>

    {/* Room Type and Capacity */}
    <div className="mt-4 text-lg text-gray-600 dark:text-gray-300">
      <div className="flex justify-between mb-4 border-b border-gray-300 pb-2">
        <div>
          <strong>Type: </strong>{room.type}
        </div>
        <div>
          <strong>Capacity: </strong>{room.capacity} people
        </div>
      </div>
    </div>

    {/* Room Description */}
    <div
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        expandedRoom === room._id ? "max-h-full opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <p className="mt-4 text-sm text-gray-700 dark:text-gray-400">
        {room.description || "No description available."}
      </p>
    </div>

    {/* Toggle Description Button */}
    <button
      onClick={() => toggleDescription(room._id)}
      className="mt-4 text-sm text-blue-600 hover:text-blue-800 focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
    >
      {expandedRoom === room._id ? "Show Less" : "Read More"}
    </button>

    {/* Book Now Button */}
    <button
      className="mt-6 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold text-lg rounded-lg hover:bg-gradient-to-l from-blue-700 to-blue-500 focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105"
      onClick={() => handleBookRoom(room._id)}
    >
      Book Now
    </button>
  </div>
</div>


            
            
            ))
          ) : (
            <div className="text-center text-lg text-gray-700">No rooms available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomsSection;
