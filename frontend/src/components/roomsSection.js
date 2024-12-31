import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../assets/header-bg.jpg"; // Background image
import { useNavigate } from "react-router-dom";
import AmenitiesPopup from "./amenitiesPopup";
import RoomCard from "./roomCard";

const RoomsSection = ({ userInfo }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [popupAmenities, setPopupAmenities] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleRulesNavigation = () => {
    navigate("/roomguidelines"); // Navigate to the rules page
  };

  const containerRef = useRef(null); // Reference to the container holding icons

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/room/rooms",
        );
        setRooms(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load rooms. Please try again later.");
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Calculate the number of visible icons based on the container width
  const [visibleIconsCount, setVisibleIconsCount] = useState(0);

  const handleBookRoom = (roomId) => {
    alert(`Room ${roomId} booked!`);
  };

  const toggleDescription = (roomId) => {
    setExpandedRoom((prevExpandedRoom) =>
      prevExpandedRoom === roomId ? null : roomId,
    );
  };

  const handleExtraClick = (room) => {
    setPopupAmenities(room.amenities);
    setShowPopup(true);
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
        {userInfo && (
          <div className="mb-8 text-center text-white p-6 bg-gradient-grayMidToRight rounded-lg shadow-lg w-auto mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-200">
              Ready to book your next study session, {userInfo.username}?
            </h2>
            <p className="mt-2 text-sm md:text-base font-light text-gray-300">
              Explore available rooms and choose the perfect spot to focus and
              succeed. Your next study session is just a click away!
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center text-lg text-gray-700">
            Loading rooms...
          </div>
        )}
        {error && (
          <div className="text-center text-lg text-red-500">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {rooms.length > 0 ? (
            rooms.map((room) => {
              const extraCount = Math.max(
                0,
                room.amenities.length - visibleIconsCount,
              );
              return (
                <RoomCard
                  key={room._id}
                  rooms={rooms}
                  room={room}
                  handleBookRoom={handleBookRoom}
                  extraCount={extraCount}
                  containerRef={containerRef}
                  visibleIconsCount={visibleIconsCount}
                  handleExtraClick={handleExtraClick}
                  toggleDescription={toggleDescription}
                  expandedRoom={expandedRoom}
                  handleRulesNavigation={handleRulesNavigation}
                  setVisibleIconsCount={setVisibleIconsCount}
                />
              );
            })
          ) : (
            <div className="text-center text-lg text-gray-700">
              No rooms available.
            </div>
          )}
        </div>
      </div>

      <AmenitiesPopup
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        popupAmenities={popupAmenities}
      />
    </div>
  );
};

export default RoomsSection;
