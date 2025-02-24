import React, { useLayoutEffect, useCallback, useRef, useState, useEffect } from "react";
import RoomImg from "../assets/room.jpg";
import iconMapping from "../utils/iconMapping";
import RoomCardBookingForm from "./roomCardBookingForm";
import { Users } from "lucide-react";
import debounce from "lodash/debounce";

const RoomCard = ({ room, userInfo, toggleDescription, activeRoom, setActiveRoom }) => {
  const [visibleAmenities, setVisibleAmenities] = useState(room.amenities);
  const [extraCount, setExtraCount] = useState(0);

  const containerRef = useRef(null);
  const measurementAmenitiesRef = useRef([]);
  const measurementMoreRef = useRef(null);

  const handleStartBooking = useCallback(
    (roomId) => {
      setActiveRoom((prev) => (prev === roomId ? null : roomId));
    },
    [setActiveRoom]
  );

  const calculateVisibleAmenities = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const gapSize = 8;
    const amenitiesWidths = measurementAmenitiesRef.current.map((ref) => (ref ? ref.offsetWidth : 0));
    const moreWidth = measurementMoreRef.current ? measurementMoreRef.current.offsetWidth : 0;

    let availableWidth = containerWidth;
    let visibleCount = 0;

    for (let i = 0; i < amenitiesWidths.length; i++) {
      const amenityWidth = amenitiesWidths[i];
      const requiredWidth =
        amenityWidth + (visibleCount > 0 ? gapSize : 0) + (i < amenitiesWidths.length - 1 ? moreWidth : 0);

      if (availableWidth - requiredWidth >= 0) {
        availableWidth -= amenityWidth + (visibleCount > 0 ? gapSize : 0);
        visibleCount++;
      } else {
        break;
      }
    }

    const hiddenCount = amenitiesWidths.length - visibleCount;
    setVisibleAmenities(room.amenities.slice(0, visibleCount));
    setExtraCount(hiddenCount > 0 ? hiddenCount : 0);
  }, [room.amenities]);

  const debouncedCalculateRef = useRef();
  useEffect(() => {
    // Create the debounced function
    debouncedCalculateRef.current = debounce(calculateVisibleAmenities, 100);
    
    // Cleanup on unmount
    return () => {
      debouncedCalculateRef.current?.cancel();
    };
  }, [calculateVisibleAmenities]);

  useLayoutEffect(() => {
    const handleResize = () => {
      debouncedCalculateRef.current?.();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
      debouncedCalculateRef.current?.cancel();
    };
  }, []);

  useLayoutEffect(() => {
    calculateVisibleAmenities();
  }, [room.amenities, calculateVisibleAmenities]);

  return (
    <>
      {/* Hidden Measurement Container - No changes needed here */}
      <div className="absolute top-0 left-[-9999px] opacity-0 pointer-events-none whitespace-nowrap">
      {room.amenities.map((amenity, index) => (
          <div
            key={`measure-${amenity.name}-${index}`}
            ref={(el) => (measurementAmenitiesRef.current[index] = el)}
            className="inline-flex items-center px-2 py-1 text-xs box-border bg-blue-50 text-blue-700 shadow-sm whitespace-nowrap"
          >
            <span className="mr-1 text-sm">{React.cloneElement(iconMapping[amenity.icon], { className: "h-5 w-5" })}</span>
            {amenity.name}
          </div>
        ))}
        {room.amenities.length > 0 && (
          <span
            ref={measurementMoreRef}
            className="inline-flex items-center px-2 py-1 text-xs box-border bg-blue-100 text-blue-700 shadow-sm whitespace-nowrap"
          >
            +{room.amenities.length} more
          </span>
        )}
      </div> 
  
      {/* Main Card Layout */}
      <div className="
        flex flex-col md:flex-row 
        bg-white dark:bg-gray-800 
        rounded-2xl shadow-lg dark:shadow-gray-900/30 
        hover:shadow-xl dark:hover:shadow-gray-900/50 
        transition-all duration-300 
        overflow-hidden 
        border border-gray-200 dark:border-gray-700 
        h-full
      ">
        <div className="relative md:w-1/2 h-64 overflow-hidden">
          <img
            src={room.imageUrl || RoomImg}
            alt={room.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded-full text-sm shadow-md">
            {room.type}
          </div>
        </div>
  
        <div className="p-5 flex flex-col flex-grow md:w-1/2">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {room.name}
              </h3>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
                <span className="text-sm">{room.capacity}</span>
              </div>
            </div>
          </div>
  
          {/* Amenities Container */}
          <div ref={containerRef} className="flex flex-nowrap gap-2 mb-4 mx-1 mt-auto overflow-hidden justify-center items-center">
            {visibleAmenities.map((amenity, index) => (
              <div
                key={`${amenity.name}-${index}`}
                className="
                  bg-blue-50 dark:bg-blue-900/30 
                  text-blue-700 dark:text-blue-300 
                  px-2 py-1 rounded-md text-xs 
                  inline-flex items-center shadow-sm 
                  whitespace-nowrap box-border cursor-pointer 
                  hover:bg-blue-200 dark:hover:bg-blue-800/50 
                  transition-colors
                "
              >
                <span className="mr-1 text-sm">
                  {React.cloneElement(iconMapping[amenity.icon], { 
                    className: "h-5 w-5 text-blue-600 dark:text-blue-400" 
                  })}
                </span>
                {amenity.name}
              </div>
            ))}
  
            {extraCount > 0 && (
              <span
                className="
                  bg-blue-100 dark:bg-blue-800/40 
                  text-blue-700 dark:text-blue-300 
                  px-2 py-[6px] rounded-md text-xs 
                  inline-flex items-center shadow-sm 
                  whitespace-nowrap box-border cursor-pointer 
                  hover:bg-blue-300 dark:hover:bg-blue-700/50 
                  transition-colors relative group flex-shrink-0
                "
              >
                +{extraCount} more
                <div className="
                  absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                  w-max bg-gray-700 dark:bg-gray-600 text-white text-xs 
                  rounded py-1 px-2 opacity-0 group-hover:opacity-100 
                  transition-opacity z-10 pointer-events-none
                ">
                  {room.amenities.slice(visibleAmenities.length).map((hiddenAmenity, idx) => (
                    <div key={`tooltip-${idx}`} className="flex items-center">
                      <span className="mr-1">
                        {React.cloneElement(iconMapping[hiddenAmenity.icon], { 
                          className: "h-4 w-4 text-blue-400" 
                        })}
                      </span>
                      {hiddenAmenity.name}
                    </div>
                  ))}
                </div>
              </span>
            )}
          </div>
  
          <div className="flex space-x-2 mt-auto">
            <button
              onClick={() => toggleDescription(room._id)}
              className="
                flex-1 bg-gray-100 dark:bg-gray-700 
                text-gray-700 dark:text-gray-300 
                py-2 rounded-md text-sm 
                hover:bg-gray-200 dark:hover:bg-gray-600 
                transition-colors shadow-sm hover:shadow-md
              "
            >
              Details
            </button>
            <button
              onClick={() => handleStartBooking(room._id)}
              className={`
                flex-1 py-2 rounded-md text-sm 
                transition-all duration-300 
                shadow-md hover:shadow-lg 
                transform hover:-translate-y-1 
                ${
                  activeRoom === room._id
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white"
                }
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
