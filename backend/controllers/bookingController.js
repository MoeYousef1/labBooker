// controllers/bookingController.js
const mongoose = require('mongoose');
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const Config = require("../models/Config");

const BOOKING_CONSTANTS = {
  STATUSES: {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELED: 'Canceled'
  },
  MAX_DURATION: 3,
  MIN_DURATION: 0
};

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

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    const session = await mongoose.startSession();
    session.startTransaction();

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

      // Validate date
      if (new Date(date) < new Date().setHours(0,0,0,0)) {
        return res.status(400).json({
          success: false,
          message: "Cannot book for past dates"
        });
      }

      // Validate email format
      const invalidEmails = additionalUsers.filter(email => !BookingController.validateEmail(email));
      if (invalidEmails.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
          invalidEmails
        });
      }

      // Look up additional users by email
      let additionalUserIds = [];
      if (additionalUsers.length > 0) {
        const users = await User.find({ 
          email: { $in: additionalUsers }
        }).select('_id');
        
        additionalUserIds = users.map(user => user._id);

        // Check if all emails were found
        if (additionalUserIds.length !== additionalUsers.length) {
          return res.status(400).json({
            success: false,
            message: "One or more additional users were not found"
          });
        }
      }

      // Duration check
      const duration = BookingController.calculateDurationInHours(startTime, endTime);
      if (duration <= BOOKING_CONSTANTS.MIN_DURATION || duration > BOOKING_CONSTANTS.MAX_DURATION) {
        return res.status(400).json({
          success: false,
          message: `Invalid booking duration. Must be between ${BOOKING_CONSTANTS.MIN_DURATION} and ${BOOKING_CONSTANTS.MAX_DURATION} hours`
        });
      }

      // Check for conflicts
      const conflictingBooking = await Booking.findOne({
        roomId,
        date,
        status: { $ne: BOOKING_CONSTANTS.STATUSES.CANCELED },
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
        additionalUsers: additionalUserIds,
        status: BOOKING_CONSTANTS.STATUSES.PENDING
      });

      await booking.save({ session });

      // Populate the response data
      const populatedBooking = await Booking.findById(booking._id)
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email");

      await session.commitTransaction();

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        booking: populatedBooking
      });

    } catch (error) {
      await session.abortTransaction();
      console.error("createBooking - Error:", {
        error: error.message,
        stack: error.stack,
        requestData: req.body
      });
      res.status(500).json({
        success: false,
        message: "Failed to create booking",
        error: error.message
      });
    } finally {
      session.endSession();
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

      const validStatuses = Object.values(BOOKING_CONSTANTS.STATUSES);
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
  // DELETE /booking/:id
deleteBooking = async (req, res) => {
  try {
    // First check if the booking exists
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // If you're using authentication middleware, make sure it's properly set up
    // If you want to allow deletion without authentication, remove this check
    if (req.user) {
      // Check authorization if user info is available
      if (booking.userId.toString() !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this booking"
        });
      }
    }

    // Proceed with deletion
    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      deletedBooking: booking
    });
  } catch (error) {
    console.error("deleteBooking - Error:", {
      error: error.message,
      stack: error.stack,
      bookingId: req.params.id,
      user: req.user
    });
    
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
        Booking.countDocuments({ ...query, status: BOOKING_CONSTANTS.STATUSES.PENDING }),
        Booking.countDocuments({ ...query, status: BOOKING_CONSTANTS.STATUSES.CONFIRMED }),
        Booking.countDocuments({ ...query, status: BOOKING_CONSTANTS.STATUSES.CANCELED })
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
        status: { $ne: BOOKING_CONSTANTS.STATUSES.CANCELED }
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