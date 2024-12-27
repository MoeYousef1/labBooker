const express = require('express');
const router = express.Router(); 
const roomController = require('../controllers/roomsController');

// Rooms Route
router.get("/rooms", async (req, res) => {
  try {
    // Call the controller function to get rooms
    const response = await roomController.getRooms();
    return res.status(200).json(response); 
  } catch (error) {
    console.error("Error fetching rooms:", error.message);
    return res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// Create Room Route
router.post("/rooms", async (req, res) => {
  try {
    const response = await roomController.createRoom(req.body);
    return res.status(201).json(response);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ message: "Room with this name already exists" });
    } else if (error.name === 'ValidationError') {
      // Validation error
      return res.status(400).json({ message: error.message });
    } else {
      console.error("Error creating room: ", error.message);
      return res.status(500).json({ message: "Failed to create room" });
    }
  }
});

// Update Room Details 
router.put("/rooms/:id", async (req, res) => {
    try {
        const response = await roomController.updateRoom(req.params.id, req.body);
        return res.status(response.status).json({ message: response.message });
    } catch (error) {
        console.error("Failed to update room details " + error.message);
        return res.status(error.status || 500).json({ error: error.message || "Failed to update room details" });
    }
});

router.delete("/rooms/:id", async (req, res) => {
  try {
    const response = await roomController.deleteRoom(req.params.id);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error deleting room:", error.message);
    return res.status(500).json({ message: "Failed to delete room" });
  }
});

module.exports = router;