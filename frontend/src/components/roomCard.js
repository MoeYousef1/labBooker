import React, { useEffect, useMemo, useCallback } from "react";
import RoomImg from "../assets/room.jpg";
import iconMapping from "../utils/iconMapping";
import RoomCardBookingForm from "./roomCardBookingForm";
import { Users, MapPin } from 'lucide-react';

const RoomCard = ({
  rooms,
  room,
  userInfo,
  extraCount,
  containerRef,
  visibleIconsCount,
  toggleDescription,
  setVisibleIconsCount,
  activeRoom,
  setActiveRoom,
}) => {
  const handleStartBooking = useCallback((roomId) => {
    setActiveRoom((prevRoom) => (prevRoom === roomId ? null : roomId));
  }, [setActiveRoom]);

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const iconWidth = 60;
      const visibleIcons = Math.floor(containerWidth / iconWidth);
      setVisibleIconsCount(visibleIcons);
    }
  }, [containerRef, setVisibleIconsCount]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const visibleAmenities = useMemo(() => 
    room.amenities.slice(0, visibleIconsCount - 1),
    [room.amenities, visibleIconsCount]
  );

  return (
    <>
      <div className="
        flex flex-col md:flex-row
        bg-white 
        rounded-2xl 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 
        overflow-hidden
        border border-gray-200
        h-full
      ">
        {/* Room Image */}
        <div className="relative md:w-1/2 h-64 overflow-hidden">
          <img
            src={room.imageUrl || RoomImg}
            alt={room.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          
          {/* Room Type Tag */}
          <div className="
            absolute top-4 left-4 
            bg-blue-500 text-white 
            px-3 py-1 rounded-full 
            text-sm shadow-md
          ">
            {room.type}
          </div>
        </div>

        {/* Room Details */}
        <div className="p-5 flex flex-col flex-grow md:w-1/2">
          {/* Title and Capacity */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-1 text-blue-500" />
                <span className="text-sm">{room.capacity}</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div ref={containerRef} className="flex flex-wrap gap-2 mb-4 mt-auto">
            {visibleAmenities.map((amenity, index) => (
              <div 
                key={`${amenity.name}-${index}`} 
                className="
                  bg-blue-50 text-blue-700 
                  px-2 py-1 rounded-md text-xs 
                  flex items-center 
                  shadow-sm
                "
              >
                <span className="mr-1 text-sm">{iconMapping[amenity.icon]}</span>
                {amenity.name}
              </div>
            ))}
            {extraCount > 0 && (
              <button 
                onClick={() => toggleDescription(room)}
                className="
                  bg-blue-100 text-blue-700 
                  px-2 py-1 rounded-md text-xs
                  hover:bg-blue-200
                  transition-colors
                "
              >
                +{extraCount} more
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-auto">
            <button
              onClick={() => toggleDescription(room._id)}
              className="
                flex-1 
                bg-gray-100 text-gray-700 
                py-2 rounded-md 
                text-sm
                hover:bg-gray-200 
                transition-colors
                shadow-sm
                hover:shadow-md
              "
            >
              Details
            </button>
            <button
              onClick={() => handleStartBooking(room._id)}
              className={`
                flex-1 py-2 rounded-md 
                text-sm
                transition-all duration-300
                shadow-md hover:shadow-lg
                transform hover:-translate-y-1
                ${activeRoom === room._id 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'}
              `}
            >
              {activeRoom === room._id ? "Cancel" : "Book"}
            </button>
          </div>
        </div>
      </div>

      <RoomCardBookingForm
        room={room}
        activeRoom={activeRoom}
        userInfo={userInfo}
        handleStartBooking={handleStartBooking}
      />
    </>
  );
};

export default React.memo(RoomCard);