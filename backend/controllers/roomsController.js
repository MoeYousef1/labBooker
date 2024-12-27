const Room = require("../models/Room"); // Import the Room model

// Controller function to fetch all rooms
async function getRooms() {
  try {
    // Fetch all room documents from the database
    const rooms = await Room.find();
    return rooms;
  } catch (error) {
    console.error("Error in getRooms:", error.message);
    throw new Error("Unable to fetch rooms");
  }
}

 
async function createRoom(roomData) {
    try {
        const newRoom = new Room(roomData);
        await newRoom.save();
        return {
            status: 201,
            message: "Room added successfully",
            room: newRoom,
        };
    } catch (error) {
        console.error("Error creating room: " + error.message);

        // Propagate the error
        throw {
            status: 500,
            message: "Failed to add room. Please check the input and try again.",
        };
    }
}


module.exports = {
  getRooms,
  createRoom,
};
