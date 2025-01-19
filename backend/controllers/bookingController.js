// controllers/bookingController.js
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const Config = require("../models/Config");

class BookingController {
  // Fetch all bookings with advanced filtering and pagination
  async getBookings(req, res) {
    try {
      console.log("getBookings - Start");
      console.log("Request Query:", req.query);

      // Pagination and filtering options
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build query object
      const query = {};
      
      // Filter by status
      if (req.query.status) {
        query.status = req.query.status;
      }

      // Filter by room
      if (req.query.roomId) {
        query.roomId = req.query.roomId;
      }

      // Filter by user
      if (req.query.userId) {
        query.userId = req.query.userId;
      }

      // Date range filtering
      if (req.query.startDate && req.query.endDate) {
        query.date = {
          $gte: req.query.startDate,
          $lte: req.query.endDate
        };
      }

      // Fetch bookings
      const bookings = await Booking.find(query)
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Count total bookings
      const total = await Booking.countDocuments(query);

      res.status(200).json({
        bookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBookings: total
        }
      });
    } catch (error) {
      console.error("getBookings - Error:", error);
      res.status(500).json({ 
        message: "Failed to fetch bookings", 
        error: error.message 
      });
    }
  }

  // Get a specific booking by ID
  async getBookingById(req, res) {
    try {
      console.log("getBookingById - Start");
      console.log("Booking ID:", req.params.id);

      const booking = await Booking.findById(req.params.id)
        .populate("roomId", "name type capacity description")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email");

      if (!booking) {
        return res.status(404).json({ 
          message: "Booking not found" 
        });
      }

      res.status(200).json(booking);
    } catch (error) {
      console.error("getBookingById - Error:", error);
      res.status(500).json({ 
        message: "Failed to fetch booking", 
        error: error.message 
      });
    }
  }

  // Create a new booking
  async createBooking(req, res) {
    try {
      console.log("createBooking - Start");
      console.log("Request Body:", req.body);

      const { 
        roomId, 
        userId, 
        date, 
        startTime, 
        endTime, 
        additionalUsers = [] 
      } = req.body;

      // Validate input
      if (!roomId || !userId || !date || !startTime || !endTime) {
        return res.status(400).json({ 
          message: "Missing required booking fields" 
        });
      }

      // Fetch configuration
      const config = await Config.findOne();
      if (!config) {
        return res.status(500).json({ 
          message: "Booking configuration not found" 
        });
      }

      // Check room existence
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ 
          message: "Room not found" 
        });
      }

      // Check user existence
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: "User not found" 
        });
      }

      // Validate booking date
      const bookingDate = new Date(date);
      const today = new Date();
      const maxBookingDate = new Date();
      maxBookingDate.setDate(today.getDate() + config.booking.openDaysBefore);

      if (bookingDate > maxBookingDate) {
        return res.status(400).json({
          message: `Bookings can only be made ${config.booking.openDaysBefore} days in advance`
        });
      }

      // Room type and user count validation
      const requiredUserCount = {
        "Small Seminar": 2,
        "Large Seminar": 3,
        "Open": 1
      }[room.type] || 1;

      // Validate total users
      const totalUsers = additionalUsers.length + 1;
      if (totalUsers < requiredUserCount) {
        return res.status(400).json({
          message: `${room.type} Room requires at least ${requiredUserCount} users`,
          currentUsers: totalUsers,
          requiredUsers: requiredUserCount
        });
      }

      // Validate additional users
      const additionalUserIds = [];
      for (const email of additionalUsers) {
        const additionalUser = await User.findOne({ email });
        if (!additionalUser) {
          return res.status(404).json({ 
            message: `User with email ${email} not found` 
          });
        }
        additionalUserIds.push(additionalUser._id);
      }

      // Check for conflicting bookings
      const conflictingBooking = await Booking.findOne({
        roomId,
        date,
        status: { $ne: "Canceled" },
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      if (conflictingBooking) {
        return res.status(400).json({ 
          message: "Time slot is already booked" 
        });
      }

      // Create booking
      const booking = new Booking({
        roomId,
        userId,
        date,
        startTime,
        endTime,
        additionalUsers: additionalUserIds,
        status: room.bookingConfirmationRequired ? "Pending" : "Confirmed"
      });

      await booking.save();

      // Update room's occupied time slots
      room.occupiedTimeSlots.push({
        date,
        slot: `${startTime}-${endTime}`
      });
      await room.save();

      res.status(201).json({ 
        message: "Booking created successfully", 
        booking,
        status: booking.status
      });
    } catch (error) {
      console.error("createBooking - Error:", error);
      res.status(500).json({ 
        message: "Failed to create booking", 
        error: error.message 
      });
    }
  }

  // Update booking status
  async updateBookingStatus(req, res) {
    try {
      console.log("updateBookingStatus - Start");
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ["Pending", "Confirmed", "Canceled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status", 
          validStatuses 
        });
      }

      const booking = await Booking.findByIdAndUpdate(
        id, 
        { status }, 
        { new: true, runValidators: true }
      );

      if (!booking) {
        return res.status(404).json({ 
          message: "Booking not found" 
        });
      }

      res.status(200).json({ 
        message: "Booking status updated successfully", 
        booking 
      });
    } catch (error) {
      console.error("updateBookingStatus - Error:", error);
      res.status(500).json({ 
        message: "Failed to update booking status", 
        error: error.message 
      });
    }
  }

  // Delete a booking
  async deleteBooking(req, res) {
    try {
      console.log("deleteBooking - Start");
      const booking = await Booking.findById(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ 
          message: "Booking not found" 
        });
      }

      // Remove the booking
      await Booking.findByIdAndDelete(req.params.id);

      // Update room's occupied time slots
      const room = await Room.findById(booking.roomId);
      if (room) {
        room.occupiedTimeSlots = room.occupiedTimeSlots.filter(
          (slot) =>
            slot.date !== booking.date ||
            slot.slot !== `${booking.startTime}-${booking.endTime}`
        );
        await room.save();
      }

      res.status(200).json({ 
        message: "Booking deleted successfully",
        deletedBooking: booking
      });
    } catch (error) {
      console.error("deleteBooking - Error:", error);
      res.status(500).json({ 
        message: "Failed to delete booking", 
        error: error.message 
      });
    }
  }

  // Get booking counts
  async getBookingCounts(req, res) {
    try {
      console.log("getBookingCounts - Start");
      console.log("Request Query:", req.query);

      // Build query object
      const query = {};
      
      // Filter by room
      if (req.query.roomId) {
        query.roomId = req.query.roomId;
      }

      // Filter by user
      if (req.query.userId) {
        query.userId = req.query.userId;
      }

      // Date range filtering
      if (req.query.startDate && req.query.endDate) {
        query.date = {
          $gte: req.query.startDate,
          $lte: req.query.endDate
        };
      }

      // Count bookings by status
      const counts = {
        total: await Booking.countDocuments(query),
        pending: await Booking.countDocuments({ ...query, status: "Pending" }),
        confirmed: await Booking.countDocuments({ ...query, status: "Confirmed" }),
        canceled: await Booking.countDocuments({ ...query, status: "Canceled" })
      };

      res.status(200).json(counts);
    } catch (error) {
      console.error("getBookingCounts - Error:", error);
      res.status(500).json({ 
        message: "Failed to fetch booking counts", 
        error: error.message 
      });
    }
  }

  // Get user's upcoming bookings
  async getUserUpcomingBookings(req, res) {
    try {
      console.log("getUserUpcomingBookings - Start");
      const { userId } = req.params;
      const today = new Date().toISOString().split('T')[0];

      const upcomingBookings = await Booking.find({
        $or: [
          { userId },
          { additionalUsers: userId }
        ],
        date: { $gte: today },
        status: { $ne: "Canceled" }
      })
      .populate("roomId", "name type")
      .sort({ date: 1, startTime: 1 });

      res.status(200).json(upcomingBookings);
    } catch (error) {
      console.error("getUserUpcomingBookings - Error:", error);
      res.status(500).json({ 
        message: "Failed to fetch upcoming bookings", 
        error: error.message 
      });
    }
  }
}

// Export an instance of the controller
module.exports = new BookingController();