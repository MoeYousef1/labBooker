const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const validateTimeSlot = require("../utils/validateTimeSlot");

async function createBooking(req, res) {
  const { roomId, userId, date, startTime, endTime } = req.body;

  if (!roomId || !userId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Validate Room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Validate User
    const user = await User.findById(userId); // Make sure you have a User model
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate Time Slot
    const isTimeSlotAvailable = await validateTimeSlot(
      roomId,
      date,
      startTime,
      endTime,
    );
    if (!isTimeSlotAvailable) {
      return res.status(400).json({ message: "Time slot is already booked" });
    }

    // Create Booking
    const booking = new Booking({ roomId, userId, date, startTime, endTime });
    await booking.save();

    // Update Room's occupied time slots
    room.occupiedTimeSlots.push({ date, startTime, endTime });
    await room.save();

    return res
      .status(201)
      .json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    return res.status(500).json({ message: "Failed to create booking" });
  }
}

async function getBookings(req, res) {
  try {
    const bookings = await Booking.find()
      .populate("roomId", "name location")
      .populate("userId", "name email");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
}

async function getBookingById(req, res) {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id)
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
    // Fetch the booking by ID from req.params.id
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Delete the booking using the static method on the Booking model
    await Booking.findByIdAndDelete(req.params.id);

    // Update the room's occupied time slots
    const room = await Room.findById(booking.roomId);
    if (room) {
      room.occupiedTimeSlots = room.occupiedTimeSlots.filter(
        (slot) =>
          slot.date !== booking.date ||
          slot.startTime !== booking.startTime ||
          slot.endTime !== booking.endTime,
      );
      await room.save();
    }

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
