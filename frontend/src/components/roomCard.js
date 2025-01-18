import React, { useEffect, useMemo, useCallback } from "react";
import RoomImg from "../assets/room.jpg";
import iconMapping from "../utils/iconMapping";
import RoomCardBookingForm from "./roomCardBookingForm";

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
      <div className="relative flex flex-col med:flex-row w-full rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        {/* Room Image */}
        <div className="relative w-full med:w-1/2 h-[300px] overflow-hidden">
          <img
            src={room.imageUrl || RoomImg}
            alt={room.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Room Type Tag */}
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
            {room.type}
          </div>
        </div>

        {/* Room Details */}
        <div className="w-full med:w-1/2 p-5 flex flex-col justify-between">
          {/* Title and Capacity */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{room.name}</h3>
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                {room.capacity}
              </div>
            </div>

            {/* Amenities */}
            <div ref={containerRef} className="flex flex-wrap gap-2 mb-4">
              {visibleAmenities.map((amenity, index) => (
                <div 
                  key={`${amenity.name}-${index}`} 
                  className="bg-gray-100 text-gray-700 p-2 rounded-md text-sm flex items-center"
                >
                  <span className="mr-2">{iconMapping[amenity.icon]}</span>
                  {amenity.name}
                </div>
              ))}
              {extraCount > 0 && (
                <button 
                  onClick={() => toggleDescription(room)}
                  className="bg-blue-50 text-blue-600 p-2 rounded-md text-sm"
                >
                  +{extraCount} more
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => toggleDescription(room._id)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Details
            </button>
            <button
              onClick={() => handleStartBooking(room._id)}
              className={`
                flex-1 py-2 rounded-md transition-colors
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