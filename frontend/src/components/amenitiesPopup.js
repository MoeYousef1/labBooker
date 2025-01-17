import React from "react";
import iconMapping from "../utils/iconMapping";

const MoreAboutRoomPopup = ({ showPopup, setShowPopup, roomDetails, amenities, handleRulesNavigation }) => {
  if (!roomDetails) return null;

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl h-auto max-h-[90vh] bg-white rounded-xl shadow-2xl p-5 sm:p-8 transform transition-all duration-300 scale-95 hover:scale-100 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{roomDetails.name}</h3>
              <button
                className="text-gray-400 hover:text-red-500 transition-colors text-2xl"
                onClick={() => setShowPopup(false)}
              >
                &times;
              </button>
            </div>

            {/* Description */}
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {roomDetails.description || "No description available."}
            </p>

            {/* Amenities */}
            <h4 className="mt-4 text-base sm:text-lg md:text-xl font-semibold text-gray-800">Room Amenities</h4>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {amenities && amenities.length > 0 ? (
                amenities.map((amenity, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    {iconMapping[amenity.icon]}
                    <span>{amenity.name}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No amenities available.</p>
              )}
            </ul>

            {/* Guidelines Button */}
            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-2 text-sm sm:text-base bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                onClick={handleRulesNavigation}
              >
                Guidelines
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MoreAboutRoomPopup;
