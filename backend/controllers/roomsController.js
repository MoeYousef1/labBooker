const Room = require("../models/Room"); // Import the Room model
const uploadMulter = require("../middleware/multer");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

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

async function createRoom(req, res) {
  return new Promise((resolve, reject) => {
    uploadMulter(req, res, async (err) => {
      if (err) {
        console.error("Error uploading file:", err.message);
        reject({ status: 500, message: "Failed to upload file" });
      } else {
        try {
          const { name, type, capacity } = req.body;
          let imageUrl = "";

          if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path); // Upload file to Cloudinary
            fs.unlinkSync(req.file.path); // Remove file from server after upload
            imageUrl = result.secure_url; // Save the Cloudinary URL
          }

          if (!name || !type || !capacity) {
            reject({
              status: 400,
              message: "Missing required fields: name, type, capacity",
            });
            return;
          }

          const newRoom = new Room({
            name,
            type,
            capacity,
            imageUrl, // Save the Cloudinary URL
          });

          await newRoom.save();
          resolve({
            status: 201,
            message: "Room created successfully",
            room: newRoom,
          });
        } catch (error) {
          console.error("Error creating room:", error.message);
          reject({
            status: 500,
            message:
              "Failed to create room. Please check the input and try again.",
          });
        }
      }
    });
  });
}

async function updateRoom(req, res) {
  return new Promise((resolve, reject) => {
    uploadMulter(req, res, async (err) => {
      if (err) {
        console.error("Error uploading file:", err.message);
        reject({ status: 500, message: "Failed to upload file" });
      } else {
        try {
          const { name, type, capacity, description } = req.body;
          const roomId = req.params.id;
          const room = await Room.findById(roomId);

          if (!room) {
            reject({ status: 404, message: "Room not found" });
          } else {
            if (req.file) {
              const result = await cloudinary.uploader.upload(req.file.path); // Upload file to Cloudinary
              fs.unlinkSync(req.file.path); // Remove file from server after upload
              room.imageUrl = result.secure_url; // Update the Cloudinary URL
            }

            room.name = name;
            room.type = type;
            room.capacity = capacity;
            room.description = description;

            await room.save();
            resolve({
              status: 200,
              message: "Room updated successfully",
              room,
            });
          }
        } catch (error) {
          console.error("Error updating room:", error.message);
          reject({
            status: 500,
            message:
              "Failed to update room. Please check the input and try again.",
          });
        }
      }
    });
  });
}

async function deleteRoom(roomId) {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return {
        status: 404,
        message: "Room not found",
      };
    }

    const imageUrl = room.imageUrl;
    if(imageUrl) {
      const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Room.findByIdAndDelete(roomId);
    
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
