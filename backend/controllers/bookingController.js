const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const validateTimeSlot = require("../utils/validateTimeSlot");

const BOOKING_NOT_FOUND = {
  message: "Booking not found",
  code: "BOOKING_NOT_FOUND",
  status: 404,
};

async function createBooking(req, res) {
  const { roomId, userId, date, startTime, endTime, additionalUsers } =
    req.body;

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
    const user = await User.findById(userId);
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

    // Validate room type and user count
    const requiredUserCount =
      room.type === "Small Seminar" ? 2 : room.type === "Large Seminar" ? 3 : 1;
    if (additionalUsers.length + 1 < requiredUserCount) {
      return res.status(400).json({
        message: `${room.type} Room requires at least ${requiredUserCount} users to book`,
      });
    }

    // Validate additional users
    const additionalUserIds = [];
    for (const email of additionalUsers) {
      const additionalUser = await User.findOne({ email });
      if (!additionalUser) {
        return res
          .status(404)
          .json({ message: `User with email ${email} not found` });
      }
      additionalUserIds.push(additionalUser._id);
    }

    // Create Booking
    const booking = new Booking({
      roomId,
      userId,
      date,
      startTime,
      endTime,
      additionalUsers: additionalUserIds,
    });
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
      .populate("roomId", "name")
      .populate("userId", "name email")
      .populate("additionalUsers", "name email");
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
      .populate("userId")
      .populate("additionalUsers");
    if (!booking) {
      return res.status(BOOKING_NOT_FOUND.status).json(BOOKING_NOT_FOUND);
    }
    return res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error.message);
    return res.status(500).json({ message: "Failed to fetch booking" });
  }
}

async function deleteBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(BOOKING_NOT_FOUND.status).json(BOOKING_NOT_FOUND);
    }

    await Booking.findByIdAndDelete(req.params.id);

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

    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error.message);
    return res.status(500).json({ message: "Failed to delete booking" });
  }
}

async function getBookingCounts(req, res) {
  try {
    // Count all pending bookings
    const pendingCount = await Booking.countDocuments({ status: "Pending" });

    // Count all active/confirmed bookings
    const activeCount = await Booking.countDocuments({ status: "Confirmed" });

    // You can also count canceled if needed
    // const canceledCount = await Booking.countDocuments({ status: "Canceled" });

    return res.status(200).json({
      pendingCount,
      activeCount,
      // canceledCount,
    });
  } catch (error) {
    console.error("Error fetching booking counts:", error.message);
    return res.status(500).json({ message: "Failed to fetch booking counts" });
  }
}

// Then include it in the exports
module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  deleteBooking,
  getBookingCounts, // <-- new function
};