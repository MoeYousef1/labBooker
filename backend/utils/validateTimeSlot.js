// utils/validateTimeSlot.js
const Room = require("../models/Room");
const Booking = require("../models/Booking");

async function validateTimeSlot(roomId, date, startTime, endTime) {
  // Input validation
  if (!roomId || !date || !startTime || !endTime) {
    throw new Error("All fields are required");
  }

  // Validate room existence
  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  // Convert times to minutes for easier comparison
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const newBookingStart = parseTime(startTime);
  const newBookingEnd = parseTime(endTime);

  // Validate time order
  if (newBookingStart >= newBookingEnd) {
    throw new Error('Start time must be before end time');
  }

  // Check for any overlapping bookings
  const overlappingBookings = await Booking.find({
    roomId,
    date,
    status: { $ne: "Canceled" }, // Exclude canceled bookings
    $or: [
      // New booking starts within an existing booking
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      },
      // New booking completely covers an existing booking
      {
        startTime: { $gte: startTime },
        endTime: { $lte: endTime }
      },
      // Existing booking completely covers new booking
      {
        startTime: { $lte: startTime },
        endTime: { $gte: endTime }
      }
    ]
  });

  // Return true if no overlapping bookings are found
  return overlappingBookings.length === 0;
}

module.exports = validateTimeSlot;