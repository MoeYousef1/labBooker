const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// get Bookings Route
router.get("/bookings", async (req, res) => {
  try {
    // Call the controller function to get bookings
    const response = await bookingController.getBookings(req ,res);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// get Booking by ID Route
router.get("/booking/:id", async (req, res) => {
  try {
    // Call the controller function to get booking by ID
    const response = await bookingController.getBookingById(req,res);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching booking:", error.message);
    return res.status(500).json({ message: "Failed to fetch booking" });
  }
});

// Create Booking Route
router.post("/booking", async (req, res) => {
  try {
    // Call the controller function to create booking
    const response = await bookingController.createBooking(req, res);
    if(!response ){
      return res.status(400).json(response);
    }
  } catch (error) {
    console.error("Error creating booking:", error.message);
    return res.status(500).json({ message: "Failed to create booking" });
  }
});
// delete Booking Route
router.delete("/booking/:id", async (req, res) => {
  try {
    // Call the controller function to delete booking
    const response = await bookingController.deleteBooking(req,res);
    if(!response){
      return res.status(400).json(response);
    }
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error deleting booking:", error.message);
    return res.status(500).json({ message: "Failed to delete booking" });
  }
});

module.exports = router;
