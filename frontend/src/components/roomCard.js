import React, { useEffect } from "react";
import RoomImg from "../assets/room.jpg"; // Placeholder image
import iconMapping from "../utils/iconMapping"; // Centralized icon mapping utility
import RoomCardBookingForm from "./roomCardBookingForm";

const RoomCard = ({
  rooms,
  room,
  userInfo,
  extraCount,
  containerRef,
  visibleIconsCount,
  handleExtraClick,
  toggleDescription,
  setVisibleIconsCount,
  activeRoom,
  setActiveRoom,
}) => {
  const handleStartBooking = (roomId) => {
    setActiveRoom((prevRoom) => (prevRoom === roomId ? null : roomId));
  };

  useEffect(() => {
    const updateVisibleIcons = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const iconWidth = 60; // Approximate width per icon
        const visibleIcons = Math.floor(containerWidth / iconWidth);
        setVisibleIconsCount(visibleIcons);
      }
    };

    window.addEventListener("resize", updateVisibleIcons);
    updateVisibleIcons(); // Initial calculation

    return () => {
      window.removeEventListener("resize", updateVisibleIcons);
    };
  }, [rooms, containerRef, setVisibleIconsCount]);

  return (
    <>
      {/* Outer Card Container */}
      <div
        key={room._id}
        className={`
          relative flex flex-col med:flex-row w-full sm:w-2/3 med:w-full
          max-w-4xl lg:max-w-screen-xl 2xl:max-w-screen-2xl rounded-xl
          bg-white shadow-xl mx-auto p-4 space-y-4 med:p-6 med:space-y-0
          med:space-x-4 lg:p-8 lg:space-x-6 2xl:p-10
          transform transition hover:-translate-y-1 hover:shadow-2xl
        `}
      >
        {/* Room Image */}
        <div
          className="
            relative w-full h-[350px] med:w-1/2 med:h-[350px]
            overflow-hidden rounded-2xl
          "
        >
          <img
            src={room.imageUrl || RoomImg}
            alt={room.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Room Details */}
        <div className="w-full px-5 med:py-10 med:w-1/2 flex-1 flex flex-col justify-between relative">
          {/* Title + Basic Info */}
          <div>
            <h5 className="
              text-2xl sm:text-3xl med:text-3xl lg:text-4xl
              font-extrabold text-grayDark font-littleone
              text-left mb-6
            ">
              {room.name}
            </h5>

            <div className="text-sm med:text-lg lg:text-xl text-grayMid mb-2">
              <div className="flex justify-between border-b border-grayMid pb-2">
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
          </div>

          {/* Amenities */}
          <div
            ref={containerRef}
            className="
              flex flex-wrap items-center justify-center
              gap-3 mt-4 med:mt-0 mb-2
            "
          >
            {room.amenities
              .slice(0, visibleIconsCount - 1)
              .map((amenity, index) => (
                <span
                  key={index}
                  title={amenity.name}
                  className="
                    cursor-pointer rounded-full bg-tertiary
                    p-2 sm:p-3 text-white
                    hover:bg-grayMid
                    transition
                  "
                >
                  {iconMapping[amenity.icon]}
                </span>
              ))}

            {extraCount > 0 && (
              <span
                className="
                  cursor-pointer rounded-full bg-tertiary
                  p-2 sm:p-3 text-white
                  hover:bg-grayMid
                  transition
                "
                onClick={() => handleExtraClick(room)}
                title={`+${extraCount} more`}
              >
                +{extraCount}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="
            flex flex-col space-y-2
            med:flex-row med:space-y-0 med:justify-between
            mt-4 med:mt-0
          ">
            <button
              onClick={() => toggleDescription(room._id)}
              className="
                py-4 px-4 text-xs med:text-sm
                bg-gray-500 text-white
                rounded-lg hover:bg-gray-600
                transition
              "
            >
              More about the room
            </button>

            <button
              onClick={() => handleStartBooking(room._id)}
              className="
                py-4 px-4 text-xs med:text-sm
                bg-blue-600 text-white
                font-semibold
                rounded-lg
                hover:bg-blue-700
                transition
              "
            >
              {activeRoom === room._id ? "Cancel" : "Book Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Form (Conditionally Rendered) */}
      <RoomCardBookingForm
        room={room}
        activeRoom={activeRoom}
        userInfo={userInfo}
        handleStartBooking={handleStartBooking}
      />
    </>
  );
};

export default RoomCard;
