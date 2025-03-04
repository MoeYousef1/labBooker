import React from "react";
import iconMapping from "../utils/iconMapping";

const MoreAboutRoomPopup = ({
  showPopup,
  setShowPopup,
  roomDetails,
  amenities,
  handleRulesNavigation,
}) => {
  if (!roomDetails) return null;

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl h-auto max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-gray-900/50 p-5 sm:p-8 transform transition-all duration-300 scale-95 hover:scale-100 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2 mb-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {roomDetails.name}
              </h3>
              <button
                className="text-gray-400 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors text-2xl"
                onClick={() => setShowPopup(false)}
              >
                &times;
              </button>
            </div>

            {/* Description */}
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              {roomDetails.description || "No description available."}
            </p>

            {/* Amenities */}
            <h4 className="mt-4 text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
              Room Amenities
            </h4>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {amenities && amenities.length > 0 ? (
                amenities.map((amenity, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
                  >
                    {React.cloneElement(iconMapping[amenity.icon], {
                      className: "w-5 h-5 text-blue-600 dark:text-blue-400",
                    })}
                    <span>{amenity.name}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No amenities available.
                </p>
              )}
            </ul>

            {/* Guidelines Button */}
            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-2 text-sm sm:text-base bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-300"
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
