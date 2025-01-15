import React from "react";
import iconMapping from "../utils/iconMapping";

const MoreAboutRoomPopup = ({
  showPopup,
  setShowPopup,
  roomDetails,
  amenities,
  handleRulesNavigation,  // Add the function as a prop
}) => {
  if (!roomDetails) {
    return null; // Avoid rendering the popup if roomDetails is undefined
  }

  return (
    <>
      {/* Popup for "More About the Room" */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-full max-w-xs sm:max-w-xl med:max-w-2xl lg:max-w-3xl p-6 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center border-b pb-4 mb-4">

            <h3 className="text-xl font-bold ">{roomDetails.name}</h3>
            <button
            className="text-gray-500 hover:text-red-500 text-2xl"
            onClick={() => setShowPopup(false)}

          >
            &times;
          </button>
          </div>
            {/* Room Description */}
            <p className="mt-4 text-sm sm:text-base text-gray-500">
            {roomDetails.description || "No description available."}
          </p>

            {/* Room Amenities */}
            <h4 className="text-lg font-semibold mt-4 ">Room Amenities</h4>
            <ul className="grid grid-cols-2 gap-4 mt-2">
              {amenities && amenities.length > 0 ? (
                amenities.map((amenity, index) => (
                  <li key={index} className="flex items-center gap-2 mb-2">
                    {iconMapping[amenity.icon]} {/* Display the amenity icon */}
                    <span>{amenity.name}</span> {/* Amenity name */}
                  </li>
                ))
              ) : (
                <p>No amenities available.</p>
              )}
            </ul>

              <div className="flex justify-between">
           
            {/* Guidelines Button */}
            <button
              onClick={handleRulesNavigation}
              className="mt-4 py-4 px-4 text-xs med:text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
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
