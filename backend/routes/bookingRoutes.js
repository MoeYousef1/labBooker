// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

// // Debugging middleware
// const debugMiddleware = (req, res, next) => {
//   console.log(`[DEBUG] Route called: ${req.method} ${req.path}`);
//   next();
// };

// Routes
router.get("/bookings", bookingController.getBookings);
router.get("/booking/:id",  bookingController.getBookingById);
router.post("/booking",  bookingController.createBooking);
router.get("/my-bookings", authMiddleware.requireAuth, bookingController.getMyBooking);
router.patch("/booking/:id/status", authMiddleware.requireAuth, bookingController.updateBookingStatus);
router.delete("/booking/:id",  bookingController.deleteBooking);
router.get("/bookings/count",  bookingController.getBookingCounts);
// router.get("/bookings/upcoming/:username", authMiddleware.requireAuth , bookingController.getUserUpcomingBookings); // cuz the token is still not working



// moe added these three routes for testing
router.get("/bookings/upcoming/:username",  bookingController.getUserUpcomingBookings);


// PATCH /booking/:id/status/by-username?username=john_doe
router.patch(
  "/booking/:id/status/by-username",
  bookingController.updateBookingStatusByUsername
);

router.delete(
  "/booking/:id/by-username",
  bookingController.deleteBookingByUsername
);

// e.g. GET /bookings/all-by-username/:username
router.get(
  "/bookings/all-by-username/:username",
  bookingController.getAllBookingsByUsername
);

// e.g. POST /api/book/booking/by-names
router.post("/booking/create-by-names", bookingController.createBookingByNames);

// to delete bookings using room name 
router.get("/bookings/by-room/:roomName", bookingController.getAllBookingsByRoomName);

module.exports = router;