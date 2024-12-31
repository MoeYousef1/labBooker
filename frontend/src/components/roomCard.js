import React, { useEffect } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import RoomImg from "../assets/room.jpg"; // Placeholder image
import iconMapping from "../utils/iconMapping"; // Centralized icon mapping utility

const RoomCard = ({
  rooms,
  room,
  handleBookRoom,
  extraCount,
  containerRef,
  visibleIconsCount,
  handleExtraClick,
  toggleDescription,
  expandedRoom,
  handleRulesNavigation,
  setVisibleIconsCount,
}) => {
  useEffect(() => {
    const updateVisibleIcons = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const iconWidth = 60; // Approximate width of each icon
        const visibleIcons = Math.floor(containerWidth / iconWidth);
        setVisibleIconsCount(visibleIcons);
      }
    };

    window.addEventListener("resize", updateVisibleIcons);
    updateVisibleIcons(); // Initial calculation
    return () => {
      window.removeEventListener("resize", updateVisibleIcons);
    };
  }, [rooms, containerRef, setVisibleIconsCount]); // Recalculate when rooms change

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
                title={amenity.name} // Display name on hover
                className="cursor-pointer rounded-full bg-grayMid p-3 text-white transition-colors hover:bg-grayDark"
              >
                {iconMapping[amenity.icon]}
              </span>
            ))}

          {/* Show +X more icon if there are extra icons */}
          {extraCount > 0 && (
            <span
              className="cursor-pointer rounded-full bg-grayMid p-3 text-white transition-colors hover:bg-grayDark"
              onClick={() => handleExtraClick(room)}
              title={`+${extraCount} more`}
            >
              +{extraCount}
            </span>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => toggleDescription(room._id)}
            className="mt-6 text-sm text-grayDark hover:text-grayExtraDark focus:outline-none transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
            title={
              expandedRoom === room._id
                ? "Click to collapse"
                : "Click to expand description"
            } // Tooltip feature
          >
            <span>{expandedRoom === room._id ? "Show Less" : "Show More"}</span>{" "}
            {/* Button text */}
            {expandedRoom === room._id ? (
              <IoIosArrowUp className="ml-2" /> // Arrow pointing up when description is expanded
            ) : (
              <IoIosArrowDown className="ml-2" /> // Arrow pointing down when description is collapsed
            )}
          </button>
        </div>

        {/* Room Description */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedRoom === room._id ? "max-h-full opacity-100" : "max-h-0 opacity-0"}`}
        >
          <p className="mt-4 text-sm text-tertiary">
            {room.description || "No description available."}
          </p>
        </div>

        <div className="flex justify-between">
          <button
            className="mt-6 text-lg text-gray-800 font-semibold underline hover:text-gray-600 "
            onClick={handleRulesNavigation} // Updated handler
          >
            Guidelines
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
};

export default RoomCard;
