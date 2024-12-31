const RoomCardBookingForm = ({ room, activeRoom }) => {
  const handleProceedBooking = () => {
    alert(`Room ${room._id} booked!`); // Handle booking logic
  };

  return (
    <>
      {/* Right Side: Booking Form */}
      <div className="lg:w-1/3 w-full p-6 flex flex-col justify-between bg-white shadow-lg rounded-tr-xl rounded-b-xl relative">
        {activeRoom !== room._id && (
          <div className="absolute inset-0 bg-white/30 backdrop-blur-md border border-white/20 shadow-lg flex flex-col items-center justify-center text-center lg:rounded-r-xl rounded-b-xl lg:rounded-bl-none z-10">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-grayDark drop-shadow-md">
              Click <span className="text-grayExtraDark">"Book Now"</span> to
              Start
            </h2>
            <p className="mt-2 text-sm lg:text-base font-normal text-grayMid drop-shadow-sm">
              Unlock the booking form and reserve your space.
            </p>
          </div>
        )}

        <h5 className="text-xl font-extrabold mb-4 text-center text-gray-700">
          Book This Room
        </h5>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            className={`p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeRoom !== room._id ? "pointer-events-none" : ""
            }`}
            placeholder="Your Name"
          />
          <input
            type="text"
            className={`p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeRoom !== room._id ? "pointer-events-none" : ""
            }`}
            placeholder="Colleagues' Names"
          />
          <select
            className={`p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeRoom !== room._id ? "pointer-events-none" : ""
            }`}
          >
            <option value="">Select Time Slot</option>
            <option value="slot1">Slot 1</option>
            <option value="slot2">Slot 2</option>
          </select>
          <textarea
            className={`p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeRoom !== room._id ? "pointer-events-none" : ""
            }`}
            placeholder="Why do you want to book this room?"
          ></textarea>
          <button
            className={`py-3 px-6 bg-gradient-grayMidToRight text-white font-semibold text-lg rounded-lg focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 ${
              activeRoom !== room._id ? "pointer-events-none" : ""
            }`}
            onClick={handleProceedBooking}
          >
            Proceed with booking
          </button>
        </div>
      </div>
    </>
  );
};

export default RoomCardBookingForm;
