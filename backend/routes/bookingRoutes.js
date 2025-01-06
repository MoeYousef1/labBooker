const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Get all bookings
router.get("/bookings", bookingController.getBookings);

// Get booking by ID
router.get("/booking/:id", bookingController.getBookingById);

// Create a new booking
router.post("/booking", bookingController.createBooking);

// Delete booking by ID
router.delete("/booking/:id", bookingController.deleteBooking);

module.exports = router;
