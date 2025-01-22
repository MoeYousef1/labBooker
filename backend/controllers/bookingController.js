// controllers/bookingController.js
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const Config = require("../models/Config");

class BookingController {
  // Helper methods
  static calculateDurationInHours(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    return ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
  }

  static isBookingPast(date, endTime) {
    const bookingDateTime = new Date(date);
    const [hours, minutes] = endTime.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    return bookingDateTime < new Date();
  }

  // GET /bookings
  getBookings = async (req, res) => {
    try {
      console.log("getBookings - Start", req.query);

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const query = {};
      
      if (req.query.status) query.status = req.query.status;
      if (req.query.roomId) query.roomId = req.query.roomId;
      if (req.query.userId) query.userId = req.query.userId;
      
      if (req.query.startDate && req.query.endDate) {
        query.date = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        };
      }

      const bookings = await Booking.find(query)
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Booking.countDocuments(query);

      res.status(200).json({
        success: true,
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
        success: false,
        message: "Failed to fetch bookings",
        error: error.message
      });
    }
  }

  // GET /booking/:id
  getBookingById = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate("roomId", "name type capacity description")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email");

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      res.status(200).json({
        success: true,
        booking
      });
    } catch (error) {
      console.error("getBookingById - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch booking",
        error: error.message
      });
    }
  }

  // POST /booking
  createBooking = async (req, res) => {
    try {
      const { 
        roomId, 
        userId, 
        date, 
        startTime, 
        endTime, 
        additionalUsers = [] 
      } = req.body;

      // Basic validation
      if (!roomId || !userId || !date || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Missing required booking fields"
        });
      }

      // Duration check
      const duration = BookingController.calculateDurationInHours(startTime, endTime);
      if (duration <= 0 || duration > 3) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking duration. Must be between 0 and 3 hours"
        });
      }

      // Check for conflicts
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
          success: false,
          message: "Time slot is already booked"
        });
      }

      const booking = new Booking({
        roomId,
        userId,
        date,
        startTime,
        endTime,
        additionalUsers,
        status: "Pending"
      });

      await booking.save();

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        booking
      });
    } catch (error) {
      console.error("createBooking - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create booking",
        error: error.message
      });
    }
  }

  // GET /my-bookings
  getMyBooking = async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const bookings = await Booking.find({
        $or: [
          { userId },
          { additionalUsers: userId }
        ]
      })
        .populate('roomId', 'name type capacity')
        .populate('userId', 'username email')
        .populate('additionalUsers', 'username email')
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Booking.countDocuments({
        $or: [{ userId }, { additionalUsers: userId }]
      });

      res.status(200).json({
        success: true,
        bookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBookings: total
        }
      });
    } catch (error) {
      console.error("getMyBooking - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch your bookings",
        error: error.message
      });
    }
  }

  // PATCH /booking/:id/status
  updateBookingStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      const validStatuses = ["Pending", "Confirmed", "Canceled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
          validStatuses
        });
      }

      const booking = await Booking.findOne({
        _id: id,
        userId
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or unauthorized"
        });
      }

      booking.status = status;
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Booking status updated successfully",
        booking
      });
    } catch (error) {
      console.error("updateBookingStatus - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update booking status",
        error: error.message
      });
    }
  }

  // DELETE /booking/:id
  deleteBooking = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      await Booking.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Booking deleted successfully",
        deletedBooking: booking
      });
    } catch (error) {
      console.error("deleteBooking - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete booking",
        error: error.message
      });
    }
  }

  // GET /bookings/count
  getBookingCounts = async (req, res) => {
    try {
      const query = {};
      
      if (req.query.roomId) query.roomId = req.query.roomId;
      if (req.query.userId) query.userId = req.query.userId;

      const [total, pending, confirmed, canceled] = await Promise.all([
        Booking.countDocuments(query),
        Booking.countDocuments({ ...query, status: "Pending" }),
        Booking.countDocuments({ ...query, status: "Confirmed" }),
        Booking.countDocuments({ ...query, status: "Canceled" })
      ]);

      res.status(200).json({
        success: true,
        counts: {
          total,
          pending,
          confirmed,
          canceled
        }
      });
    } catch (error) {
      console.error("getBookingCounts - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch booking counts",
        error: error.message
      });
    }
  }

  // GET /bookings/upcoming/:userId
  getUserUpcomingBookings = async (req, res) => {
    try {
      const { userId } = req.params;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingBookings = await Booking.find({
        $or: [
          { userId },
          { additionalUsers: userId }
        ],
        date: { $gte: today },
        status: { $ne: "Canceled" }
      })
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email")
        .sort({ date: 1, startTime: 1 });

      res.status(200).json({
        success: true,
        bookings: upcomingBookings
      });
    } catch (error) {
      console.error("getUserUpcomingBookings - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch upcoming bookings",
        error: error.message
      });
    }
  }
}

// Export a new instance of the controller
module.exports = new BookingController();