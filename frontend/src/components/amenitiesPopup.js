import React from "react";
import iconMapping from "../utils/iconMapping";

const AmenitiesPopup = ({ showPopup, setShowPopup, popupAmenities }) => {
  return (
    <>
      {/* Popup for extra amenities */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Room Amenities</h3>
            <ul>
              {popupAmenities.map((amenity, index) => (
                <li key={index} className="flex items-center gap-2 mb-2">
                  {iconMapping[amenity.icon]}
                  <span>{amenity.name}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 py-2 px-4 bg-gradient-grayMidToRight text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AmenitiesPopup;
