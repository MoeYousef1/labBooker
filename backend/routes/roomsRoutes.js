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

// Add a new room
router.post('/rooms', async (req, res) => {
    try {
        const result = await createRoom(req.body);
        res.status(result.status).json({ message: result.message, room: result.room });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

module.exports = router;

