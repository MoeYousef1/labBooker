const Room = require("../models/Room"); // Import the Room model
const uploadMulter = require("../middleware/multer");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

// async function getRooms() {
//   try {
//     // Fetch all room documents from the database
//     const rooms = await Room.find();
//     return rooms;
//   } catch (error) {
//     console.error("Error in getRooms:", error.message);
//     throw new Error("Unable to fetch rooms");
//   }
// }

async function getRooms(roomId = null) {
  try {
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        throw new Error("Room not found");
      }
      return room;
    } else {
      const rooms = await Room.find();
      return rooms;
    }
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
          // Extract fields from the request body
          const { name, type, capacity, description, amenities } = req.body;
          let imageUrl = "";

          // Ensure amenities is an array if provided
          let parsedAmenities = [];
          if (amenities) {
            try {
              // Check if amenities is an array, and ensure each object has the correct properties
              if (Array.isArray(amenities)) {
                // Ensure that each amenity object only contains 'name' and 'icon'
                parsedAmenities = amenities.map((item) => {
                  if (item.name && item.icon) {
                    return { name: item.name, icon: item.icon };
                  }
                  throw new Error(
                    "Each amenity must have a 'name' and 'icon' property.",
                  );
                });
              } else {
                // If amenities is a stringified array, try to parse it
                parsedAmenities = JSON.parse(amenities);
              }
            } catch (parseError) {
              reject({
                status: 400,
                message:
                  "Invalid format for amenities. It should be an array of objects with 'name' and 'icon' properties.",
              });
              return;
            }
          }

          // Handle file upload if present
          if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path); // Upload file to Cloudinary
            fs.unlinkSync(req.file.path); // Remove file from server after upload
            imageUrl = result.secure_url; // Save the Cloudinary URL
          }

          // Check for required fields
          if (!name || !type || !capacity) {
            reject({
              status: 400,
              message: "Missing required fields: name, type, capacity",
            });
            return;
          }

          // Create a new Room object with amenities included
          const newRoom = new Room({
            name,
            type,
            capacity,
            description, // Add description if provided
            imageUrl, // Save the Cloudinary URL
            amenities: parsedAmenities, // Add amenities as an array of objects
          });

          // Save the new room
          await newRoom.save();

          // Return response with the created room
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
        reject({ status: 500, message: "Failed to upload file" });
      } else {
        try {
          const { name, type, capacity, description, amenities } = req.body;
          const roomId = req.params.id;

          const room = await Room.findById(roomId);
          if (!room) {
            reject({ status: 404, message: "Room not found" });
            return;
          }

          // Handle file upload if present
          if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            fs.unlinkSync(req.file.path);
            room.imageUrl = result.secure_url;
          }

          // Validate and parse amenities
          if (amenities) {
            try {
              room.amenities = JSON.parse(amenities).map((amenity) => {
                if (!amenity.name || !amenity.icon) {
                  throw new Error(
                    "Each amenity must have 'name' and 'icon' properties.",
                  );
                }
                return { name: amenity.name, icon: amenity.icon };
              });
            } catch (parseError) {
              reject({
                status: 400,
                message:
                  "Invalid format for amenities. It should be an array of objects with 'name' and 'icon' properties.",
              });
              return;
            }
          }

          // Update other fields
          if (name) room.name = name;
          if (type) room.type = type;
          if (capacity) room.capacity = capacity;
          if (description) room.description = description;

          // Save updated room
          await room.save();

          resolve({
            status: 200,
            message: "Room updated successfully",
            room,
          });
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
    if (imageUrl) {
      const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
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
