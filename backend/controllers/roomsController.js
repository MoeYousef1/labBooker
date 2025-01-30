const Room = require("../models/Room"); // Import the Room model
const Booking = require("../models/Booking"); // Import the Booking model

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

async function getRooms(name = null) {
  try {
    if (name) {
      const room = await Room.findOne({ name });
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
                    "Each amenity must have a 'name' and 'icon' property."
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
          const { name, type, capacity, description, amenities } = req.body; // Original name passed in request body
          const originalName = req.body.originalName; // Ensure the original name is passed for identification

          if (!originalName) {
            reject({ status: 400, message: "Original room name is missing" });
            return;
          }

          // Find the room by the original name
          const room = await Room.findOne({ name: originalName });
          if (!room) {
            reject({ status: 404, message: "Room not found" });
            return;
          }

          // Handle file upload if present
          if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            fs.unlinkSync(req.file.path);
            room.imageUrl = result.secure_url; // Update image URL directly
          }

          // Validate and parse amenities if provided
          if (amenities) {
            try {
              room.amenities = JSON.parse(amenities).map((amenity) => {
                if (!amenity.name || !amenity.icon) {
                  throw new Error(
                    "Each amenity must have 'name' and 'icon' properties."
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

          // Update fields with the provided data
          if(name) room.name = name;
          if (type) room.type = type;
          if (capacity) room.capacity = capacity;
          if (description) room.description = description;

          // Save updated room (using the original name for identification)
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





async function deleteRoom(name) {
  try {
    // Search for room by name instead of ID
    const room = await Room.findOne({ name }); // Find room by name

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

    await Room.findByIdAndDelete(room._id); // Use the room's ID to delete the document

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

// const generateNext30Days = () => {
//   const dates = [];
//   const today = new Date();
//   for (let i = 0; i < 30; i++) {
//     const date = new Date(today);
//     date.setDate(today.getDate() + i);
//     dates.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
//   }
//   return dates;
// };

const generateNext30Days = () => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    // Create a new Date instance to avoid mutating 'today'
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
    dates.push(formattedDate);
  }

  return dates;
};

function generateHalfHourlySlots() {
  const slots = [];
  for (let hour = 8; hour < 22; hour++) { // From 8:00 AM to 10:00 PM
    const times = [`${String(hour).padStart(2, '0')}:00`, `${String(hour).padStart(2, '0')}:30`];
    for (let i = 0; i < times.length - 1; i++) {
      const startTime = times[i];
      const endTime = hour === 21 && i === 1 ? "22:00" : times[i + 1]; // Special handling for the last slot
      slots.push({ startTime, endTime });
    }
  }
  return slots;
}

const getRoomAvailabilityForMonth = async (roomId) => {
  // Ensure the room exists
  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found.");
  }

  // Generate dates for the next 30 days
  const dates = generateNext30Days();

  // Fetch all bookings for the room for the next 30 days
  const bookings = await Booking.find({
    roomId,
    date: { $in: dates },
    status: { $in: ["Pending", "Confirmed"] }, // Include Pending and Confirmed bookings
  });

  // Prepare availability for each date
  const availability = dates.map((date) => {
    // Generate half-hourly slots for the day
    const halfHourlySlots = generateHalfHourlySlots();

    // Check each slot for conflicts
    const slots = halfHourlySlots.map((slot) => {
      const isOccupied = bookings.some(
        (booking) =>
          booking.date === date &&
          ((slot.startTime >= booking.startTime && slot.startTime < booking.endTime) || // Slot starts during booking
            (slot.endTime > booking.startTime && slot.endTime <= booking.endTime) || // Slot ends during booking
            (slot.startTime <= booking.startTime && slot.endTime >= booking.endTime)) // Slot fully overlaps booking
      );

      return {
        ...slot,
        status: isOccupied ? "Occupied" : "Available",
      };
    });

    return {
      date,
      slots,
    };
  });

  return {
    room: room.name,
    availability,
  }; 
};

async function getRoomAvailabilityForMonthByName(roomName) {
  // 1) Ensure the room exists by name
  const room = await Room.findOne({ name: roomName });
  if (!room) {
    throw new Error("Room not found by that name.");
  }

  const roomId = room._id;

  // 2) Generate next 30 days
  const dates = generateNext30Days();

  // 3) Fetch all bookings for that room & date in next 30 days
  const bookings = await Booking.find({
    roomId,
    date: { $in: dates },
    status: { $in: ["Pending", "Confirmed"] },
  });

  // 4) Prepare availability
  const availability = dates.map((date) => {
    // Generate half-hourly slots
    const halfHourlySlots = generateHalfHourlySlots();

    // Check conflicts
    const slots = halfHourlySlots.map((slot) => {
      const isOccupied = bookings.some(
        (b) =>
          b.date === date &&
          (
            // Overlapping start or end
            (slot.startTime >= b.startTime && slot.startTime < b.endTime) ||
            (slot.endTime > b.startTime && slot.endTime <= b.endTime) ||
            // slot fully covers the booking
            (slot.startTime <= b.startTime && slot.endTime >= b.endTime)
          )
      );
      return { ...slot, status: isOccupied ? "Occupied" : "Available" };
    });

    return { date, slots };
  });

  return {
    room: room.name,
    availability,
  };
}

module.exports = {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomAvailabilityForMonth,
  getRoomAvailabilityForMonthByName,
};
