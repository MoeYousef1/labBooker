const Room = require("../models/Room");
const Booking = require("../models/Booking");

async function validateTimeSlot(roomId, date, startTime, endTime) {
  if (!roomId || !date || !startTime || !endTime) {
    throw new Error("All fields are required");
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  // Check for overlapping bookings
  const overlappingBooking = await Booking.findOne({
    roomId,
    date,
    $or: [
      { startTime: { $lt: endTime, $gt: startTime } },
      { endTime: { $lt: endTime, $gt: startTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
  });

  if (overlappingBooking) {
    return false; // Time slot is already booked
  }

  return true; // Time slot is available
}

module.exports = validateTimeSlot;