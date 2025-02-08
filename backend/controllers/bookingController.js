// controllers/bookingController.js
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const Config = require("../models/Config");
const nodemailer = require("nodemailer");
const notificationsController = require("../controllers/notificationsController");
const moment = require('moment-timezone'); // Add this line

// Constants
const BOOKING_CONSTANTS = {
  STATUSES: {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CANCELED: "Canceled",
    COMPLETED: "Completed",
    ACTIVE: "Active",
    MISSED: "Missed"
  },
  MAX_DURATION: 3,
  MIN_DURATION: 0,
};

const ROOM_TYPES = {
  LARGE_SEMINAR: "Large Seminar",
  REGULAR: "Regular",
  COMPUTER_LAB: "Computer Lab",
  STUDY_ROOM: "Study Room",
};

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

class BookingController {
  // Helper Methods
  static calculateDurationInHours(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    return (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
  }

  static isBookingPast(date, endTime) {
    const bookingDateTime = new Date(date);
    const [hours, minutes] = endTime.split(":").map(Number);
    bookingDateTime.setHours(hours, minutes, 0);
    return bookingDateTime < new Date();
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static async sendAdminNotificationEmail({
    to,
    bookingId,
    roomName,
    date,
    startTime,
    endTime,
    userEmail,
    userName,
  }) {
    const emailContent = `
      New Large Seminar Room Booking Request

      Booking ID: ${bookingId}
      Room: ${roomName}
      Date: ${date}
      Time: ${startTime} - ${endTime}
      Requested by: ${userName} (${userEmail})
      
      Please review and confirm this booking through the admin dashboard.
    `;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "New Large Seminar Room Booking Request",
        text: emailContent,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Large Seminar Room Booking Request</h2>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Booking ID:</strong> ${bookingId}</p>
              <p><strong>Room:</strong> ${roomName}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p><strong>Requested by:</strong> ${userName} (${userEmail})</p>
            </div>
            <p>Please review and confirm this booking through the admin dashboard.</p>
            <p style="color: #666;">This is an automated message from the LabBooker system.</p>
          </div>
        `,
      });
      console.log("Admin notification email sent successfully");
    } catch (error) {
      console.error("Failed to send admin notification email:", error);
      throw error;
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
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }
      res.status(200).json({ success: true, booking });
    } catch (error) {
      console.error("getBookingById - Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch booking",
          error: error.message,
        });
    }
  };

  // GET /bookings
  getBookings = async (req, res) => {
    try {
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
          $lte: new Date(req.query.endDate),
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
          totalBookings: total,
        },
      });
    } catch (error) {
      console.error("getBookings - Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch bookings",
          error: error.message,
        });
    }
  };

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
        additionalUsers = [],
      } = req.body;
      if (!roomId || !userId || !date || !startTime || !endTime) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required booking fields" });
      }

      const room = await Room.findById(roomId);
      if (!room)
        return res
          .status(404)
          .json({ success: false, message: "Room not found" });

      const user = await User.findById(userId);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      // Format date for comparison
      const [year, day, month] = date.split("-");
      const formattedDate = `${year}-${month}-${day}`;
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid time format. Please use HH:mm format",
          });
      }

      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);
      const bookingDateTime = new Date(formattedDate);
      bookingDateTime.setHours(startHour, startMinute, 0);
      const currentDateTime = new Date();
      if (bookingDateTime < currentDateTime) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Cannot book for past date and time",
          });
      }
      if (startHour < 8 || endHour > 22) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Bookings are only available between 9 AM and 6 PM",
          });
      }
      const thirtyMinutesFromNow = new Date(
        currentDateTime.getTime() + 30 * 60000,
      );
      if (bookingDateTime < thirtyMinutesFromNow) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Bookings must be made at least 30 minutes in advance",
          });
      }

      const invalidEmails = additionalUsers.filter(
        (email) => !BookingController.validateEmail(email),
      );
      if (invalidEmails.length > 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid email format",
            invalidEmails,
          });
      }
      let additionalUserIds = [];
      if (additionalUsers.length > 0) {
        const users = await User.find({
          email: { $in: additionalUsers },
        }).select("_id");
        additionalUserIds = users.map((user) => user._id);
        if (additionalUserIds.length !== additionalUsers.length) {
          return res
            .status(400)
            .json({
              success: false,
              message: "One or more additional users were not found",
            });
        }
      }

      const duration = BookingController.calculateDurationInHours(
        startTime,
        endTime,
      );
      if (
        duration <= BOOKING_CONSTANTS.MIN_DURATION ||
        duration > BOOKING_CONSTANTS.MAX_DURATION
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid booking duration. Must be between ${BOOKING_CONSTANTS.MIN_DURATION} and ${BOOKING_CONSTANTS.MAX_DURATION} hours`,
        });
      }

      const conflictingBooking = await Booking.findOne({
        roomId,
        date,
        status: { $ne: BOOKING_CONSTANTS.STATUSES.CANCELED },
        $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
      });
      if (conflictingBooking) {
        return res
          .status(400)
          .json({ success: false, message: "Time slot is already booked" });
      }

      const bookingStatus =
        room.type === ROOM_TYPES.LARGE_SEMINAR
          ? BOOKING_CONSTANTS.STATUSES.PENDING
          : BOOKING_CONSTANTS.STATUSES.CONFIRMED;

      const booking = new Booking({
        roomId,
        userId,
        date,
        startTime,
        endTime,
        additionalUsers: additionalUserIds,
        status: bookingStatus,
      });

      await booking.save({ session });

      // Send notification based on room type
      try {
        let message;
        if (room.type === "Open" || room.type === "Small Seminar") {
          message = `Your booking for room ${room.name} has been created and confirmed successfully.`;
        } else if (room.type === "Large Seminar") {
          message = `Your booking for room ${room.name} has been created and is pending admin approval.`;
        } else {
          message = `Your booking for room ${room.name} has been created successfully.`;
        }
        await notificationsController.createNotification(
          user._id,
          message,
          "bookingCreation",
        );
      } catch (notificationError) {
        console.error(
          "Booking creation notification error:",
          notificationError.message,
        );
      }

      // For Large Seminar rooms, send admin email notification
      if (room.type === ROOM_TYPES.LARGE_SEMINAR) {
        try {
          const config = await Config.findOne();
          const adminEmail = config?.adminEmail || process.env.ADMIN_EMAIL;
          await BookingController.sendAdminNotificationEmail({
            to: adminEmail,
            bookingId: booking._id,
            roomName: room.name,
            date,
            startTime,
            endTime,
            userEmail: user.email,
            userName: user.username,
          });
        } catch (emailError) {
          console.error("Failed to send admin notification email:", emailError);
        }
      }

      const populatedBooking = await Booking.findById(booking._id)
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email");

      await session.commitTransaction();
      session.endSession();
      console.log("date", date, new Date(), new Date(`${date}:${startTime}`));
      res.status(201).json({
        success: true,
        message:
          bookingStatus === BOOKING_CONSTANTS.STATUSES.PENDING
            ? "Booking created and pending admin approval"
            : "Booking created successfully",
        booking: populatedBooking,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("createBookingByNames - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create booking by username/roomName",
        error: error.message,
      });
    }
  };

  // GET /bookings/by-room/:roomName
  getAllBookingsByRoomName = async (req, res) => {
    try {
      const { roomName } = req.params;
      const room = await Room.findOne({ name: roomName }).select("_id");
      if (!room) {
        return res
          .status(404)
          .json({
            success: false,
            message: `No room found with name: ${roomName}`,
          });
      }
      const allBookings = await Booking.find({ roomId: room._id })
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email")
        .sort({ date: -1, startTime: -1 });
      res
        .status(200)
        .json({
          success: true,
          bookings: allBookings,
          count: allBookings.length,
        });
    } catch (error) {
      console.error("getAllBookingsByRoomName - Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch bookings for this room",
          error: error.message,
        });
    }
  };

  // GET /my-bookings
  getMyBooking = async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const bookings = await Booking.find({
        $or: [{ userId }, { additionalUsers: userId }],
      })
        .populate("roomId", "name type capacity")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email")
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(limit);
      const total = await Booking.countDocuments({
        $or: [{ userId }, { additionalUsers: userId }],
      });
      res.status(200).json({
        success: true,
        bookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
        },
      });
    } catch (error) {
      console.error("getMyBooking - Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch your bookings",
          error: error.message,
        });
    }
  };

  // DELETE /booking/:id
  deleteBooking = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }
      const room = await Room.findById(booking.roomId);
      if (!room) {
        return res
          .status(404)
          .json({ success: false, message: "Room not found" });
      }
      if (req.user) {
        if (
          booking.userId.toString() !== req.user.id &&
          req.user.role !== "admin"
        ) {
          return res
            .status(403)
            .json({
              success: false,
              message: "Not authorized to delete this booking",
            });
        }
      }
      const currentDate = new Date();
      booking.status = "Canceled";
      booking.isDeleted = true;
      booking.deletedAt = currentDate;
      await booking.save();
      try {
        await notificationsController.createNotification(
          booking.userId,
          `Your booking for room ${room.name} has been cancelled successfully.`,
          "bookingDeletion",
        );
      } catch (notificationError) {
        console.error(
          "Booking deletion notification error:",
          notificationError.message,
        );
      }
      const updatedBooking = await Booking.findById(booking._id)
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email");
      res.status(200).json({
        success: true,
        message:
          "Booking cancelled successfully and will be permanently deleted in 3 days",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error("deleteBooking - Error:", {
        error: error.message,
        stack: error.stack,
        bookingId: req.params.id,
        user: req.user,
      });
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to delete booking",
          error: error.message,
        });
    }
  };

  // PATCH /booking/:id/status/by-username?username=john_doe (Admin update)
  updateBookingStatusByUsername = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { username } = req.query;
      const validStatuses = Object.values(BOOKING_CONSTANTS.STATUSES);
      if (!validStatuses.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status", validStatuses });
      }
      if (!username) {
        return res
          .status(400)
          .json({ success: false, message: "Missing query param ?username=" });
      }
      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message: `No user found with username: ${username}`,
          });
      }
      const booking = await Booking.findOne({
        _id: id,
        $or: [{ userId: user._id }, { additionalUsers: user._id }],
      });
      if (!booking) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Booking not found or unauthorized for this username",
          });
      }
      const room = await Room.findById(booking.roomId);
      if (!room) {
        return res
          .status(404)
          .json({ success: false, message: "Room not found" });
      }
      booking.status = status;
      await booking.save();

      // Notify admin
      try {
        await notificationsController.createNotification(
          req.user._id,
          `You just updated the booking successfully for user ${user.username}.`,
          "bookingUpdateAdmin",
        );
      } catch (notificationError) {
        console.error(
          "Admin booking update notification error:",
          notificationError.message,
        );
      }

      // Notify booking owner
      try {
        let userMsg = "";
        if (status === BOOKING_CONSTANTS.STATUSES.CONFIRMED) {
          userMsg = `Your booking for room ${room.name} has been Confirmed by admin ${req.user.username}.`;
        } else if (status === BOOKING_CONSTANTS.STATUSES.CANCELED) {
          userMsg = `Your booking for room ${room.name} has been cancelled by admin ${req.user.username}.`;
        } else {
          userMsg = `Your booking for room ${room.name} has been updated to ${status} by admin ${req.user.username}.`;
        }
        await notificationsController.createNotification(
          user._id,
          userMsg,
          "bookingUpdateUser",
        );
      } catch (notificationError) {
        console.error(
          "User booking update notification error:",
          notificationError.message,
        );
      }

      res
        .status(200)
        .json({
          success: true,
          message: "Booking status updated successfully (by username)!",
          booking,
        });
    } catch (error) {
      console.error("updateBookingStatusByUsername - Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to update booking status by username",
          error: error.message,
        });
    }
  };

  // DELETE /booking/:id/by-username?username=john_doe (Admin deletion)
  deleteBookingByUsername = async (req, res) => {
    try {
      const { id } = req.params;
      const { username } = req.query;
      if (!username) {
        return res
          .status(400)
          .json({ success: false, message: "Missing query param ?username=" });
      }
      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message: `No user found with username: ${username}`,
          });
      }
      const booking = await Booking.findOne({
        _id: id,
        $or: [{ userId: user._id }, { additionalUsers: user._id }],
      });
      if (!booking) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Booking not found or unauthorized for this username",
          });
      }
      const room = await Room.findById(booking.roomId);
      if (!room) {
        return res
          .status(404)
          .json({ success: false, message: "Room not found" });
      }
      const currentDate = new Date();
      booking.status = "Canceled";
      booking.isDeleted = true;
      booking.deletedAt = currentDate;
      await booking.save();

      // Admin notification
      try {
        await notificationsController.createNotification(
          req.user._id,
          `Booking cancelation was successful for user ${user.username}.`,
          "bookingDeletionAdmin",
        );
      } catch (notificationError) {
        console.error(
          "Admin deletion notification error:",
          notificationError.message,
        );
      }

      // User notification
      try {
        await notificationsController.createNotification(
          user._id,
          `Your booking for room ${room.name} has been cancelled by admin ${req.user.username}.`,
          "bookingDeletionUser",
        );
      } catch (notificationError) {
        console.error(
          "User deletion notification error:",
          notificationError.message,
        );
      }

      const updatedBooking = await Booking.findById(booking._id)
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email");
      res.status(200).json({
        success: true,
        message:
          "Booking cancelled successfully and will be permanently deleted in 3 days",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error("deleteBookingByUsername - Error:", {
        error: error.message,
        stack: error.stack,
        bookingId: req.params.id,
        username: req.query.username,
      });
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to cancel booking",
          error: error.message,
        });
    }
  };

  // GET /bookings/count
  getBookingCounts = async (req, res) => {
    try {
      const query = {};
      if (req.query.roomId) query.roomId = req.query.roomId;
      if (req.query.userId) query.userId = req.query.userId;
      const [total, pending, confirmed, canceled] = await Promise.all([
        Booking.countDocuments(query),
        Booking.countDocuments({
          ...query,
          status: BOOKING_CONSTANTS.STATUSES.PENDING,
        }),
        Booking.countDocuments({
          ...query,
          status: BOOKING_CONSTANTS.STATUSES.CONFIRMED,
        }),
        Booking.countDocuments({
          ...query,
          status: BOOKING_CONSTANTS.STATUSES.CANCELED,
        }),
      ]);
      res
        .status(200)
        .json({
          success: true,
          counts: { total, pending, confirmed, canceled },
        });
    } catch (error) {
      console.error("getBookingCounts - Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch booking counts",
          error: error.message,
        });
    }
  };

  // GET /bookings/upcoming/:username
  getUserUpcomingBookings = async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username }).select("_id");
      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message: `No user found with username: ${username}`,
          });
      }
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`;
      let allPotentiallyUpcoming = await Booking.find({
        $or: [{ userId: user._id }, { additionalUsers: user._id }],
        date: { $gte: todayStr },
        status: { $ne: BOOKING_CONSTANTS.STATUSES.CANCELED },
      })
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email")
        .sort({ date: 1, startTime: 1 });
      const nowReal = new Date();
      const finalUpcoming = allPotentiallyUpcoming.filter((booking) => {
        if (booking.date > todayStr) return true;
        if (booking.date === todayStr) {
          const [endH, endM] = booking.endTime.split(":").map(Number);
          const bookingEnd = new Date();
          bookingEnd.setHours(endH, endM, 0, 0);
          return bookingEnd > nowReal;
        }
        return false;
      });
      res.status(200).json({ success: true, bookings: finalUpcoming });
    } catch (error) {
      console.error("getUserUpcomingBookingsByUsername - Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch upcoming bookings by username",
          error: error.message,
        });
    }
  };

  createBookingByNames = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        username,
        roomName,
        date,
        startTime,
        endTime,
        additionalUsers = [],
      } = req.body;

      // 1) Basic field checks
      if (!username || !roomName || !date || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields (username, roomName, date, startTime, endTime).",
        });
      }

      // 2) Find the user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `No user found with username: ${username}`,
        });
      }

      // 3) Find the room by name
      const room = await Room.findOne({ name: roomName });
      if (!room) {
        return res.status(404).json({
          success: false,
          message: `No room found with name: ${roomName}`,
        });
      }

      // 4) Validate date. For example, no past dates:
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = new Date(date); // if you're storing date as a real Date in DB
      // (If your schema uses string-based date, adapt accordingly.)

      if (bookingDate < today) {
        return res.status(400).json({
          success: false,
          message: "Cannot book for past dates.",
        });
      }

      // Validate email format for additional users
      const invalidEmails = additionalUsers.filter(
        (email) => !BookingController.validateEmail(email),
      );
      if (invalidEmails.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
          invalidEmails,
        });
      }

      // Look up additional users by email
      let additionalUserIds = [];
      if (additionalUsers.length > 0) {
        const users = await User.find({
          email: { $in: additionalUsers },
        }).select("_id");

        additionalUserIds = users.map((user) => user._id);

        if (additionalUserIds.length !== additionalUsers.length) {
          return res.status(400).json({
            success: false,
            message: "One or more additional users were not found",
          });
        }
      }

      // 7) Check duration
      const duration = BookingController.calculateDurationInHours(
        startTime,
        endTime,
      );
      if (
        duration <= BOOKING_CONSTANTS.MIN_DURATION ||
        duration > BOOKING_CONSTANTS.MAX_DURATION
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid booking duration. Must be between ${BOOKING_CONSTANTS.MIN_DURATION} and ${BOOKING_CONSTANTS.MAX_DURATION} hours`,
        });
      }

      // 8) Check conflicts (for date, startTime <-> endTime overlap)
      const conflictingBooking = await Booking.findOne({
        roomId: room._id,
        date, // If your schema stores date as string vs real Date, adapt
        status: { $ne: BOOKING_CONSTANTS.STATUSES.CANCELED },
        $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
      });
      if (conflictingBooking) {
        return res.status(400).json({
          success: false,
          message: "Time slot is already booked.",
        });
      }

      // 9) Determine booking status if you have special logic (like Large Seminar => "Pending", else => "Confirmed")
      let bookingStatus = BOOKING_CONSTANTS.STATUSES.CONFIRMED;
      // if (room.type === "Large Seminar") {
      //   bookingStatus = BOOKING_CONSTANTS.STATUSES.PENDING;
      // }

      // 10) Create the booking
      const booking = new Booking({
        roomId: room._id,
        userId: user._id,
        date,
        startTime,
        endTime,
        additionalUsers: additionalUserIds,
        status: bookingStatus,
      });

      await booking.save({ session });

      // Notification for the user (booking owner)
      try {
        let userMsg = "";
        if (bookingStatus === BOOKING_CONSTANTS.STATUSES.PENDING) {
          userMsg = `Your booking for room ${room.name} has been created by admin ${req.user.username} and is pending approval.`;
        } else {
          userMsg = `Your booking for room ${room.name} has been created by admin ${req.user.username} and is confirmed.`;
        }
        await notificationsController.createNotification(
          user._id,
          userMsg,
          "bookingCreationByAdmin",
        );
      } catch (notificationError) {
        console.error(
          "Booking creation by admin (user) notification error:",
          notificationError.message,
        );
      }

      // Notification for the admin
      try {
        await notificationsController.createNotification(
          req.user._id,
          `You successfully created a booking for user ${user.username}.`,
          "bookingCreationAdmin",
        );
      } catch (notificationError) {
        console.error(
          "Booking creation by admin (admin) notification error:",
          notificationError.message,
        );
      }

      // If it's Large Seminar => maybe send admin email notification or do other logic
      // e.g. if (room.type === 'Large Seminar') { ... }

      // 11) Populate final booking
      const populatedBooking = await Booking.findById(booking._id)
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email");

      await session.commitTransaction();
      session.endSession();
      console.log("date", date, new Date(), new Date(`${date}:${startTime}`));

      return res.status(201).json({
        success: true,
        message:
          bookingStatus === BOOKING_CONSTANTS.STATUSES.PENDING
            ? "Booking created and pending admin approval"
            : "Booking created successfully",
        booking: populatedBooking,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("createBookingByNames - Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create booking by username/roomName",
        error: error.message,
      });
    }
  };

  // GET /bookings/all-by-username/:username
  getAllBookingsByUsername = async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username }).select("_id");
      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message: `No user found with username: ${username}`,
          });
      }
      const allBookings = await Booking.find({
        $or: [{ userId: user._id }, { additionalUsers: user._id }],
      })
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email")
        .sort({ date: -1, startTime: -1 });
      res.status(200).json({ success: true, bookings: allBookings });
    } catch (error) {
      console.error("getAllBookingsByUsername - Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch all bookings by username",
          error: error.message,
        });
    }
  };


  // these functions are used for the next booking card in the homepage along with the delete booking function located above.

  updateBookingStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      const room = await Room.findById(booking.roomId);
      if (!room) {
        return res
          .status(404)
          .json({ success: false, message: "Room not found" });
      }
  
      booking.status = status;
      await booking.save();
  
      // Create notification based on status
      let notificationMessage;
      if (status === 'Missed') {
        notificationMessage = `Your booking for room ${room.name} has been marked as missed.`;
      } else if (status === 'Completed') {
        notificationMessage = `Your booking for room ${room.name} has been completed.`;
      }
  
      if (notificationMessage) {
        try {
          await notificationsController.createNotification(
            booking.userId,
            notificationMessage,
            `booking${status}`
          );
        } catch (notifError) {
          console.error("Failed to create status update notification:", notifError);
        }
      }
  
      return res.status(200).json({
        success: true,
        message: `Booking status updated to ${status}`,
        booking
      });
    } catch (error) {
      console.error("updateBookingStatus - Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update booking status",
        error: error.message
      });
    }
  };

getNextUpcomingBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const nextBooking = await Booking.findOne({
      $or: [{ userId }, { additionalUsers: userId }],
      status: { $nin: [BOOKING_CONSTANTS.STATUSES.CANCELED, 
                       BOOKING_CONSTANTS.STATUSES.COMPLETED, 
                       BOOKING_CONSTANTS.STATUSES.MISSED] },
      date: { $gte: todayStr }
    })
    .sort({ date: 1, startTime: 1 })
    .populate("roomId", "name type")
    .populate("userId", "username email");

    return res.status(200).json({
      success: true,
      booking: nextBooking // Will be null if no upcoming bookings
    });
  } catch (error) {
    console.error("getNextUpcomingBooking - Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch next upcoming booking",
      error: error.message
    });
  }
};

// lateCheckIn = async (req, res) => {
//   try {
//     const bookingId = req.params.id;
//     const { wasPresent } = req.body;

//     const booking = await Booking.findById(bookingId)
//       .populate('roomId', 'name')
//       .populate('userId', 'username email');

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found"
//       });
//     }

//     // Update booking status based on presence
//     booking.status = wasPresent ? 'Completed' : 'Missed';
//     if (wasPresent) {
//       booking.checkedIn = true;
//       booking.checkedInAt = new Date(`${booking.date}T${booking.startTime}`);
//     }

//     await booking.save();

//     // Create notification with appropriate message
//     const notificationMessage = wasPresent
//       ? `Booking for room ${booking.roomId.name} has been marked as completed.`
//       : `Booking for room ${booking.roomId.name} has been marked as missed.`;

//     try {
//       await notificationsController.createNotification(
//         booking.userId._id,
//         notificationMessage,
//         wasPresent ? "bookingCompleted" : "bookingMissed"
//       );
//     } catch (notificationError) {
//       console.error("Notification error:", notificationError.message);
//     }

//     return res.status(200).json({
//       success: true,
//       message: wasPresent ? "Booking marked as completed" : "Booking marked as missed",
//       booking
//     });

//   } catch (error) {
//     console.error("lateCheckIn - Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to process late check-in",
//       error: error.message
//     });
//   }
// };

checkInToBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('roomId', 'name')
      .populate('userId', 'username email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify user is authorized
    const isAuthorized = 
      booking.userId._id.toString() === userId || 
      booking.additionalUsers.includes(userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to check in to this booking"
      });
    }

    // Check if booking is active
    const now = new Date();
    const bookingStart = new Date(`${booking.date}T${booking.startTime}:00`);
    const bookingEnd = new Date(`${booking.date}T${booking.endTime}:00`);

    // If trying to check in more than 15 minutes after start time
    if (now > new Date(bookingStart.getTime() + 15 * 60000)) {
      booking.status = BOOKING_CONSTANTS.STATUSES.MISSED;
      await booking.save();

      // Create missed booking notification
      try {
        await notificationsController.createNotification(
          booking.userId._id,
          `You missed your booking for room ${booking.roomId.name}. The booking has been marked as missed.`,
          "bookingMissed"
        );
      } catch (notificationError) {
        console.error("Missed booking notification error:", notificationError.message);
      }

      return res.status(400).json({
        success: false,
        message: "Booking has been marked as missed due to late check-in"
      });
    }

    if (now > bookingEnd) {
      return res.status(400).json({
        success: false,
        message: "Booking has already ended"
      });
    }

    // Update booking status
    booking.status = BOOKING_CONSTANTS.STATUSES.ACTIVE;
    booking.checkedIn = true;
    booking.checkedInAt = now;
    await booking.save();

    // Create check-in notification
    try {
      await notificationsController.createNotification(
        booking.userId._id,
        `Successfully checked in to room ${booking.roomId.name}.`,
        "bookingCheckIn"
      );
    } catch (notificationError) {
      console.error("Check-in notification error:", notificationError.message);
    }

    res.status(200).json({
      success: true,
      message: "Successfully checked in to booking",
      booking
    });

  } catch (error) {
    console.error("checkInToBooking - Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check in to booking",
      error: error.message
    });
  }
};

updatePastBookings = async (req, res) => {
  try {
    const now = new Date();
    const bookingsToUpdate = await Booking.find({
      status: { $nin: [BOOKING_CONSTANTS.STATUSES.CANCELED, 
                       BOOKING_CONSTANTS.STATUSES.COMPLETED, 
                       BOOKING_CONSTANTS.STATUSES.MISSED] },
      date: { $lte: now.toISOString().split('T')[0] }
    });

    let updatedCount = 0;
    for (const booking of bookingsToUpdate) {
      const bookingEnd = new Date(`${booking.date}T${booking.endTime}:00`);
      
      if (bookingEnd < now) {
        // If checked in, mark as completed
        if (booking.checkedIn) {
          booking.status = BOOKING_CONSTANTS.STATUSES.COMPLETED;
        } else {
          booking.status = BOOKING_CONSTANTS.STATUSES.MISSED;
          
          // Create notification for missed booking
          try {
            await notificationsController.createNotification(
              booking.userId,
              `You missed your booking for room ${booking.roomId.name}`,
              "bookingMissed"
            );
          } catch (notifError) {
            console.error("Failed to create missed booking notification:", notifError);
          }
        }
        
        await booking.save();
        updatedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `${updatedCount} booking(s) updated`
    });
  } catch (error) {
    console.error("updatePastBookings - Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update past bookings",
      error: error.message
    });
  }
};

// getMissedBooking = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const now = new Date();
    
//     // Find the most recent booking that should be marked as missed
//     const missedBooking = await Booking.findOne({
//       $or: [
//         { userId },
//       ],
//       userId: userId,
//       date: { $lte: now.toISOString().split('T')[0] },
//       status: { $nin: ['Completed', 'Canceled', 'Missed'] },
//       checkedIn: false,
//       endTime: { $lt: now.toLocaleTimeString('en-US', { hour12: false }) }
//     })
//     .populate('roomId', 'name')
//     .sort({ date: -1, endTime: -1 })
//     .limit(1);

//     return res.status(200).json({
//       success: true,
//       booking: missedBooking
//     });
//   } catch (error) {
//     console.error("getMissedBooking - Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch missed booking",
//       error: error.message
//     });
//   }
// };

updatePastBookingsCron = async () => {
  try {
    const timezone = 'Asia/Jerusalem'; // For Jerusalem time
    const now = moment().tz(timezone);

    // Debug logs
    console.log(`[${now.format()}] Running booking status update...`);

    const bookingsToUpdate = await Booking.find({
      status: { $nin: ["Canceled", "Completed", "Missed"] },
      $expr: {
        $lte: [
          {
            $dateFromString: {
              dateString: { $concat: ["$date", "T", "$endTime", ":00"] },
              timezone: timezone
            }
          },
          now.toDate()
        ]
      }
    })
    .populate("roomId", "name")
    .populate("userId", "email");

    console.log(`Found ${bookingsToUpdate.length} bookings to process`);

    let updatedCount = 0;

    for (const booking of bookingsToUpdate) {
      try {
        const bookingEnd = moment.tz(`${booking.date}T${booking.endTime}:00`, timezone);
        const timeDiff = now.diff(bookingEnd, 'seconds');

        console.log(`Processing booking ${booking._id}:`);
        console.log(`- End Time: ${bookingEnd.format()}`);
        console.log(`- Current Time: ${now.format()}`);
        console.log(`- Time Difference: ${timeDiff} seconds`);

        if (timeDiff >= 0) {
          const newStatus = booking.checkedIn ? "Completed" : "Missed";
          console.log(`- Updating status to: ${newStatus}`);

          booking.status = newStatus;
          await booking.save();

          // Send notification
          const message = `Your booking for ${booking.roomId.name} `
            + `(ended ${bookingEnd.format('HH:mm')}) has been marked as ${newStatus}.`;
            
          await notificationsController.createNotification(
            booking.userId._id,
            message,
            `booking${newStatus}`
          );

          updatedCount++;
        }
      } catch (bookingError) {
        console.error(`Error processing booking ${booking._id}:`, bookingError);
      }
    }

    return {
      success: true,
      message: `Successfully updated ${updatedCount} booking(s)`,
      updatedCount
    };
    
  } catch (error) {
    console.error("updatePastBookingsCron - Error:", error);
    return {
      success: false,
      message: "Failed to update past bookings",
      error: error.message
    };
  }
};

}

module.exports = new BookingController();
