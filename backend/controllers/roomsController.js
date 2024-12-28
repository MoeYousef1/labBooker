const Room = require("../models/Room"); // Import the Room model
// const { validateRoomData } = require("../utils/validations");
// Controller function to fetch all room

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

    throw {
      status: 500,
      message: "Failed to add room. Please check the input and try again.",
    };
  }
}

async function updateRoom(roomId, roomData) {
  try {
    const { name, type, capacity } = roomData;
    const room = await Room.findById(roomId);

    if (!room) {
      return { status: 404, message: "Room not found" };
    }
    // const isRoomValid = validateRoomData(roomData);
    // if (!isRoomValid.isValid) {
    //   return { status: 400, message: isRoomValid.message };
    // }
    room.name = name;
    room.type = type;
    room.capacity = capacity;

    await room.save();

    return { status: 200, message: "Room updated successfully" };
  } catch (error) {
    console.error("Error updating room: " + error.message);

    throw {
      status: 500,
      message: "Failed to update room. Please check the input and try again.",
    };
  }
}

async function deleteRoom(roomId) {
  try {
    const room = await Room.findByIdAndDelete(roomId);
    if (!room) {
      return {
        status: 404,
        message: "Room not found",
      };
    }
    return {
      status: 200,
      message: "Room deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting room:", error.message);
    return {
      status: 500,
      message: "Failed to delete room. Please check the input and try again.",
    };
  }
}

module.exports = {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};
