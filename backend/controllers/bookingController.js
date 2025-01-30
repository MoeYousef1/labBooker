// controllers/bookingController.js
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const Config = require("../models/Config");
const nodemailer = require("nodemailer");

// Constants
const BOOKING_CONSTANTS = {
  STATUSES: {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CANCELED: "Canceled",
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
  // Helper methods
  static calculateDurationInHours(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    return (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
  }

  static isBookingPast(date, endTime) {
    const bookingDateTime = new Date(date);
    const [hours, minutes] = endTime.split(":");
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
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
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      res.status(200).json({
        success: true,
        booking,
      });
    } catch (error) {
      console.error("getBookingById - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch booking",
        error: error.message,
      });
    }
  };
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
      res.status(500).json({
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

      // Basic validation
      if (!roomId || !userId || !date || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Missing required booking fields",
        });
      }
      // Get room details to check type
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      // Get user details for email notification
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      } 

      const [year, day, month] = date.split("-");
      const formattedDate = `${year}-${month}-${day}`;

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          success: false,
          message: "Invalid time format. Please use HH:mm format",
        });
      }

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      // Create Date objects for full date-time comparison
      const bookingDateTime = new Date(formattedDate);
      bookingDateTime.setHours(startHour, startMinute, 0);
      
      const currentDateTime = new Date();

      // Compare with current date and time
      if (bookingDateTime < currentDateTime) {
        return res.status(400).json({
          success: false,
          message: "Cannot book for past date and time",
        });
      }

      // Validate business hours (8 AM to 10 PM)
      if (startHour < 8 || endHour > 22) {
        return res.status(400).json({
          success: false,
          message: "Bookings are only available between 9 AM and 6 PM",
        });
      }

      // Add minimum advance booking time (30 minutes)
      const thirtyMinutesFromNow = new Date(currentDateTime.getTime() + 30 * 60000);
      if (bookingDateTime < thirtyMinutesFromNow) {
        return res.status(400).json({
          success: false,
          message: "Bookings must be made at least 30 minutes in advance",
        });
      }

      // Validate email format for additional users
      const invalidEmails = additionalUsers.filter(
        (email) => !BookingController.validateEmail(email)
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

      // Duration check
      const duration = BookingController.calculateDurationInHours(
        startTime,
        endTime
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

      // Check for conflicts
      const conflictingBooking = await Booking.findOne({
        roomId,
        date,
        status: { $ne: BOOKING_CONSTANTS.STATUSES.CANCELED },
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
          },
        ],
      });

      if (conflictingBooking) {
        return res.status(400).json({
          success: false,
          message: "Time slot is already booked",
        });
      }

      // Determine booking status based on room type
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

      // If it's a large seminar room, send email to admin
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

      // Populate the response data
      const populatedBooking = await Booking.findById(booking._id)
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email");

      await session.commitTransaction();
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
      console.error("createBooking - Error:", {
        error: error.message,
        stack: error.stack,
        requestData: req.body,
      });
      res.status(500).json({
        success: false,
        message: "Failed to create booking",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  };
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
      res.status(500).json({
        success: false,
        message: "Failed to fetch bookings",
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
      res.status(500).json({
        success: false,
        message: "Failed to fetch your bookings",
        error: error.message,
      });
    }
  };

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
          validStatuses,
        });
      }

      const booking = await Booking.findOne({
        _id: id,
        userId,
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or unauthorized",
        });
      }

      booking.status = status;
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Booking status updated successfully",
        booking,
      });
    } catch (error) {
      console.error("updateBookingStatus - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update booking status",
        error: error.message,
      });
    }
  };

  // DELETE /booking/:id
  deleteBooking = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (req.user) {
        if (booking.userId.toString() !== req.user.id && !req.user.isAdmin) {
          return res.status(403).json({
            success: false,
            message: "Not authorized to delete this booking",
          });
        }
      }

      await Booking.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Booking deleted successfully",
        deletedBooking: booking,
      });
    } catch (error) {
      console.error("deleteBooking - Error:", {
        error: error.message,
        stack: error.stack,
        bookingId: req.params.id,
        user: req.user,
      });

      res.status(500).json({
        success: false,
        message: "Failed to delete booking",
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

      res.status(200).json({
        success: true,
        counts: {
          total,
          pending,
          confirmed,
          canceled,
        },
      });
    } catch (error) {
      console.error("getBookingCounts - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch booking counts",
        error: error.message,
      });
    }
  };

  // GET /bookings/upcoming/:username
  // getUserUpcomingBookings = async (req, res) => {
  //   try {
  //     const { username } = req.params;
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);

  //     const upcomingBookings = await Booking.find({
  //       $or: [{ username }, { additionalUsers: username }],
  //       date: { $gte: today },
  //       status: { $ne: BOOKING_CONSTANTS.STATUSES.CANCELED },
  //     })
  //       .populate("roomId", "name type")
  //       .populate("userId", "username email")
  //       .populate("additionalUsers", "username email")
  //       .sort({ date: 1, startTime: 1 });

  //     res.status(200).json({
  //       success: true,
  //       bookings: upcomingBookings,
  //     });
  //   } catch (error) {
  //     console.error("getUserUpcomingBookings - Error:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to fetch upcoming bookings",
  //       error: error.message,
  //     });
  //   }
  // };

  //moe added these functions for testing, might remove or keep some of them

  getUserUpcomingBookings = async (req, res) => {
    try {
      const { username } = req.params;

      // 1) Find user by username
      const user = await User.findOne({ username }).select("_id");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `No user found with username: ${username}`,
        });
      }

      // 2) Build todayStr (e.g., "2023-10-20") for lexical compare
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`; // e.g. "2023-10-20"

      // 3) Query for date >= todayStr (lexical compare),
      //    status != "Canceled",
      //    userId or additionalUsers = user._id
      // BUT this will return "today" bookings that might have ended,
      // so we'll further filter them out in code below
      let allPotentiallyUpcoming = await Booking.find({
        $or: [{ userId: user._id }, { additionalUsers: user._id }],
        date: { $gte: todayStr }, // lexical compare for future/present day
        status: { $ne: BOOKING_CONSTANTS.STATUSES.CANCELED },
      })
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email")
        .sort({ date: 1, startTime: 1 });

      // 4) Filter out bookings that are "today" but already ended
      //    Because we only want truly future bookings
      const nowReal = new Date();
      const finalUpcoming = allPotentiallyUpcoming.filter((booking) => {
        // If booking.date > todayStr, it's definitely future
        if (booking.date > todayStr) {
          return true;
        }
        // If booking.date < todayStr, we never see it because of the query
        // If booking.date === todayStr, check endTime
        if (booking.date === todayStr) {
          // Construct a DateTime for booking's endTime to see if it's still in the future
          const [endH, endM] = booking.endTime.split(":").map(Number);
          const bookingEnd = new Date();
          bookingEnd.setHours(endH, endM, 0, 0);
          // e.g., if now is 2023-10-20T14:00, and booking ends at 13:00, it's already past

          return bookingEnd > nowReal;
        }
        return false; // default, should never happen given the query
      });

      res.status(200).json({
        success: true,
        bookings: finalUpcoming,
      });
    } catch (error) {
      console.error("getUserUpcomingBookingsByUsername - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch upcoming bookings by username",
        error: error.message,
      });
    }
  };

  // GET /bookings/all-by-username/:username
  getAllBookingsByUsername = async (req, res) => {
    try {
      const { username } = req.params;

      // Find user
      const user = await User.findOne({ username }).select("_id");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `No user found with username: ${username}`,
        });
      }

      // fetch ALL bookings (no date filter)
      // userId or additionalUsers = user._id
      const allBookings = await Booking.find({
        $or: [{ userId: user._id }, { additionalUsers: user._id }],
      })
        .populate("roomId", "name type")
        .populate("userId", "username email")
        .populate("additionalUsers", "username email")
        .sort({ date: -1, startTime: -1 });

      res.status(200).json({
        success: true,
        bookings: allBookings,
      });
    } catch (error) {
      console.error("getAllBookingsByUsername - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch all bookings by username",
        error: error.message,
      });
    }
  };

  updateBookingStatusByUsername = async (req, res) => {
    try {
      const { id } = req.params; // The booking ID
      const { status } = req.body;
      const { username } = req.query;

      // Validate status
      const validStatuses = Object.values(BOOKING_CONSTANTS.STATUSES);
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
          validStatuses,
        });
      }

      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Missing query param ?username=",
        });
      }

      // Find user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `No user found with username: ${username}`,
        });
      }

      // Find the booking => if userId OR additionalUsers includes user._id
      const booking = await Booking.findOne({
        _id: id,
        $or: [{ userId: user._id }, { additionalUsers: user._id }],
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or unauthorized for this username",
        });
      }

      // Update
      booking.status = status;
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Booking status updated successfully (by username)!",
        booking,
      });
    } catch (error) {
      console.error("updateBookingStatusByUsername - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update booking status by username",
        error: error.message,
      });
    }
  };

  // DELETE /booking/:id/by-username?username=john_doe
  deleteBookingByUsername = async (req, res) => {
    try {
      const { id } = req.params; // booking ID
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Missing query param ?username=",
        });
      }

      // 1) Find user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `No user found with username: ${username}`,
        });
      }

      // 2) Check booking belongs to user
      const booking = await Booking.findOne({
        _id: id,
        $or: [{ userId: user._id }, { additionalUsers: user._id }],
      });
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or unauthorized for this username",
        });
      }

      // 3) Delete it
      await Booking.findByIdAndDelete(booking._id);

      res.status(200).json({
        success: true,
        message: "Booking deleted successfully by username",
        deletedBooking: booking,
      });
    } catch (error) {
      console.error("deleteBookingByUsername - Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete booking by username",
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
        (email) => !BookingController.validateEmail(email)
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
        endTime
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
      if (room.type === "Large Seminar") {
        bookingStatus = BOOKING_CONSTANTS.STATUSES.PENDING;
      }

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

    // GET /bookings/by-room/:roomName
getAllBookingsByRoomName = async (req, res) => {
  try {
    const { roomName } = req.params;

    // Find room
    const room = await Room.findOne({ name: roomName }).select("_id");
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `No room found with name: ${roomName}`,
      });
    }

    // Fetch ALL bookings for this room
    const allBookings = await Booking.find({ roomId: room._id })
      .populate("roomId", "name type")
      .populate("userId", "username email")
      .populate("additionalUsers", "username email")
      .sort({ date: -1, startTime: -1 });

    res.status(200).json({
      success: true,
      bookings: allBookings,
      count: allBookings.length
    });
  } catch (error) {
    console.error("getAllBookingsByRoomName - Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings for this room",
      error: error.message,
    });
  }
};

}

// Export a new instance of the controller
module.exports = new BookingController();
