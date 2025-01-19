// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

// Debugging middleware
const debugMiddleware = (req, res, next) => {
  console.log(`[DEBUG] Route called: ${req.method} ${req.path}`);
  console.log('[DEBUG] Booking Controller Methods:', Object.keys(bookingController));
  next();
};

// Routes
router.get("/bookings", 
  debugMiddleware,
  bookingController.getBookings
);

router.get("/booking/:id", 
  debugMiddleware,
  bookingController.getBookingById
);

router.post("/booking", 
  debugMiddleware,
  bookingController.createBooking
);

router.delete("/booking/:id", 
  debugMiddleware,
  bookingController.deleteBooking
);

router.get("/bookings/count", 
  debugMiddleware,
  bookingController.getBookingCounts
);

router.get("/user/:userId/bookings", 
  debugMiddleware,
  bookingController.getUserUpcomingBookings
);

console.log("[ROUTES] Booking routes configured");

module.exports = router;