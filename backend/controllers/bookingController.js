const Booking = require("../models/Booking");
const Room = require("../models/Room");

async function createBooking(req, res) {
  const { roomId, userId, date, slot } = req.body;

  if (!roomId || !userId || !date || !slot) {
    console.error("All fields are required");
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      roomId,
      date,
      slot,
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: "Time slot is already booked" });
    }

    const booking = new Booking({
      roomId,
      userId,
      date,
      slot,
    });

    await booking.save();

    // Update room's occupied time slots
    room.occupiedTimeSlots.push({ date, slot });
    await room.save();

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({ message: "Failed to create booking" });
  }
}

async function getBookings(req, res) {
  try {
    const bookings = await Booking.find().populate("roomId").populate("userId");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
}

async function getBookingById(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("roomId")
      .populate("userId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error.message);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
}

async function deleteBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.remove();

    // Update room's occupied time slots
    const room = await Room.findById(booking.roomId);
    room.occupiedTimeSlots = room.occupiedTimeSlots.filter(
      (slot) => slot.date !== booking.date || slot.slot !== booking.slot,
    );
    await room.save();

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error.message);
    res.status(500).json({ message: "Failed to delete booking" });
  }
}

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  deleteBooking,
};
