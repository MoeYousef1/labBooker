// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

// Debugging middleware
const debugMiddleware = (req, res, next) => {
  console.log(`[DEBUG] Route called: ${req.method} ${req.path}`);
  next();
};

// Routes
router.get("/bookings", debugMiddleware, bookingController.getBookings);
router.get("/booking/:id", debugMiddleware, bookingController.getBookingById);
router.post("/booking", debugMiddleware, bookingController.createBooking);
router.get("/my-bookings", authMiddleware.requireAuth, bookingController.getMyBooking);
router.patch("/booking/:id/status", authMiddleware.requireAuth, bookingController.updateBookingStatus);
router.delete("/booking/:id", debugMiddleware, bookingController.deleteBooking);
router.get("/bookings/count", debugMiddleware, bookingController.getBookingCounts);
// router.get("/bookings/upcoming/:username", authMiddleware.requireAuth , bookingController.getUserUpcomingBookings); // cuz the token is still not working



// moe added these three routes for testing
router.get("/bookings/upcoming/:username",  bookingController.getUserUpcomingBookings);


// PATCH /booking/:id/status/by-username?username=john_doe
router.patch(
  "/booking/:id/status/by-username",
  debugMiddleware,
  bookingController.updateBookingStatusByUsername
);

router.delete(
  "/booking/:id/by-username",
  debugMiddleware,
  bookingController.deleteBookingByUsername
);

module.exports = router;