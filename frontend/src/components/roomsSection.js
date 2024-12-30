import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../assets/header-bg.jpg"; // Background image
import RoomImg from "../assets/room.jpg"; // Placeholder image
import { FaWifi, FaTv, FaCoffee, FaChair, FaChalkboard } from "react-icons/fa";
import { MdChargingStation } from "react-icons/md";
import { BsFillProjectorFill } from "react-icons/bs";
import { FiPrinter } from "react-icons/fi";
import { TbAirConditioning } from "react-icons/tb";
import { CiSpeaker } from "react-icons/ci";

const iconMapping = {
  wifi: <FaWifi className="h-5 w-5" />,
  tv: <FaTv className="h-5 w-5" />,
  projector: <BsFillProjectorFill className="h-5 w-5" />,
  coffee: <FaCoffee className="h-5 w-5" />,
  chargingstation: <MdChargingStation className="h-5 w-5" />,
  chair: <FaChair className="h-5 w-5" />,
  whiteboard: <FaChalkboard className="h-5 w-5" />,
  ac: <TbAirConditioning className="h-5 w-5" />,
  printer: <FiPrinter className="h-5 w-5" />,
  speakers: <CiSpeaker className="h-5 w-5" />,
};

const RoomsSection = ({ userInfo }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRoom, setExpandedRoom] = useState(null);

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

  useEffect(() => {
    const updateVisibleIcons = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const iconWidth = 52; // Approximate width of each icon
        console.log(containerWidth);
        const visibleIcons = Math.floor(containerWidth / iconWidth);
        setVisibleIconsCount(visibleIcons);
      }
    };

    window.addEventListener("resize", updateVisibleIcons);
    updateVisibleIcons(); // Initial calculation
    return () => {
      window.removeEventListener("resize", updateVisibleIcons);
    };
  }, [rooms]); // Recalculate when rooms change

  const handleBookRoom = (roomId) => {
    alert(`Room ${roomId} booked!`);
  };

  const toggleDescription = (roomId) => {
    setExpandedRoom((prevExpandedRoom) =>
      prevExpandedRoom === roomId ? null : roomId,
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
                <div
                  key={room._id}
                  className="relative flex w-full max-w-md flex-col rounded-xl bg-white text-gray-700 shadow-lg mx-auto"
                >
                  <div className="relative mx-4 mt-4 overflow-hidden rounded-xl bg-gray-500 text-white shadow-lg">
                    <img
                      src={room.imageUrl || RoomImg}
                      alt={room.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <h5 className="text-xl md:text-3xl font-extrabold mb-4 relative text-center bg-gradient-grayMidToRight text-white rounded-lg inline-block">
                      {room.name}
                    </h5>

                    <div className="mt-4 text-md md:text-lg text-gray-600 dark:text-black">
                      <div className="flex justify-between mb-4 border-b border-gray-600 pb-2">
                        <div>
                          <strong>Type: </strong>
                          {room.type}
                        </div>
                        <div>
                          <strong>Capacity: </strong>
                          {room.capacity} people
                        </div>
                      </div>
                    </div>

                    {/* Room Amenities */}
                    <div
                      ref={containerRef}
                      className="group mt-2 inline-flex flex-wrap items-center justify-center gap-3"
                    >
                      {room.amenities
                        .slice(0, visibleIconsCount - 1)
                        .map((amenity, index) => (
                          <span
                            key={index}
                            data-tooltip-target={amenity.icon}
                            className="cursor-pointer rounded-full bg-grayMid p-3 text-white transition-colors hover:bg-grayDark"
                          >
                            {iconMapping[amenity.icon]}
                          </span>
                        ))}

                      {/* Show +X more icon if there are extra icons */}
                      {extraCount > 0 && (
                        <span
                          className="cursor-pointer rounded-full bg-grayMid p-3 text-white transition-colors hover:bg-grayDark"
                          title={`+${extraCount} more`}
                        >
                          +{extraCount}
                        </span>
                      )}
                    </div>

                    {/* Room Description */}
                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        expandedRoom === room._id
                          ? "max-h-full opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="mt-4 text-sm text-tertiary">
                        {room.description || "No description available."}
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => toggleDescription(room._id)}
                        className="mt-4 text-sm text-grayDark hover:text-grayExtraDark focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        {expandedRoom === room._id ? "Show Less" : "Read More"}
                      </button>

                      <button
                        className="mt-6 py-3 px-6 bg-gradient-grayMidToRight text-white font-semibold text-lg rounded-lg focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105"
                        onClick={() => handleBookRoom(room._id)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-lg text-gray-700">
              No rooms available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomsSection;
