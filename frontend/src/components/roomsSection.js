import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../assets/header-bg.jpg"; // Background image
import { useNavigate } from "react-router-dom";
import MoreAboutRoomPopup from "./amenitiesPopup"; // New component for combined popup
import RoomCard from "./roomCard";

const RoomsSection = ({ userInfo }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popupRoomDetails, setPopupRoomDetails] = useState(null); // Store the selected room's details
  const [popupAmenities, setPopupAmenities] = useState([]); // Store room amenities
  const [showPopup, setShowPopup] = useState(false); // Controls the popup visibility
  const [activeRoom, setActiveRoom] = useState(null); // Declare activeRoom here
  const navigate = useNavigate();

  const handleRulesNavigation = () => {
    navigate("/roomguidelines"); // Navigate to the rules page
  };

  const containerRef = useRef(null); // Reference to the container holding icons

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/room/rooms"
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

  // Handle the modal open/close
  const toggleDescription = (room) => {
    setPopupRoomDetails(room); // Set room details to display in the popup
    setPopupAmenities(room.amenities); // Set the amenities for the popup
    setShowPopup(true); // Open the popup modal
  };

  return (
    <div className="relative min-h-screen w-full pt-16 bg-gray-100">
      <div
        className="absolute inset-0 bg-cover bg-center w-full h-full"
        style={{ backgroundImage: `url(${Header})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 md:px-10 py-6 mx-auto">
        {loading && (
          <div className="text-center text-lg text-gray-700">
            Loading rooms...
          </div>
        )}
        {error && (
          <div className="text-center text-lg text-red-500">{error}</div>
        )}

        <div className="grid grid-cols-1 xxl:grid-cols-2 gap-6">
          {rooms.length > 0 ? (
            rooms.map((room) => {
              const extraCount = Math.max(
                0,
                room.amenities.length - visibleIconsCount
              );
              return (
                <RoomCard
                  key={room._id}
                  room={room}
                  userInfo={userInfo}
                  extraCount={extraCount}
                  containerRef={containerRef}
                  visibleIconsCount={visibleIconsCount}
                  toggleDescription={() => toggleDescription(room)} // Pass the full room data
                  setVisibleIconsCount={setVisibleIconsCount}
                  activeRoom={activeRoom} // Pass activeRoom to RoomCard
                  setActiveRoom={setActiveRoom} // Pass setActiveRoom to RoomCard
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

      <MoreAboutRoomPopup
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        roomDetails={popupRoomDetails} // Pass the room details to the popup
        amenities={popupAmenities} // Pass the amenities to the popup
        handleRulesNavigation={handleRulesNavigation}
      />
    </div>
  );
};

export default RoomsSection;
