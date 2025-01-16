import React, { useState, useEffect } from "react";
import axios from "axios";
import iconMapping from "../utils/iconMapping";
import FormInput from "./FormInput";
import Message from "./Error_successMessage";

const UpdateRoomForm = ({ roomId, roomDetails, setRoomId, setRoomDetails, onSuccess }) => {
  // List of all rooms, but we only need their "name"
  const [roomsList, setRoomsList] = useState([]);

  // The user picks a room name from the dropdown. We'll store that in roomId (like old code).
  // This is the string name, not the _id!
  // We'll pass this to your GET logic exactly as you did before.
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    capacity: "",
    description: "",
    amenities: [],
    image: null,
  });
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRoom, setFetchingRoom] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const availableAmenities = Object.keys(iconMapping);

  // 1) On mount, fetch all existing rooms so we can populate the dropdown with their names
  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        // We expect this endpoint to return an array of room objects with at least { name: "...", ... }
        const response = await axios.get("http://localhost:5000/api/room/rooms");
        setRoomsList(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load rooms list.");
      }
    };
    fetchAllRooms();
  }, []);

  // 2) The old handleRoomFetch logic, but we're fetching by "room name"
  //    just like the old code typed in the text field. 
  //    If your endpoint is exactly: GET /api/room/rooms/:roomName
  //    We'll pass roomId as the name, not the _id.
  const handleRoomFetch = async () => {
    if (!roomId) {
      setError("Please select a valid room name.");
      return;
    }
    setFetchingRoom(true);
    setError("");
    setSuccessMessage("");

    try {
      // Instead of :_id, we do :roomName (the same as your old code).
      // If your route is actually /api/room/rooms/byName/:name, adjust accordingly.
      const response = await axios.get(`http://localhost:5000/api/room/rooms/${roomId}`);
      const room = response.data;

      // Pre-fill the form data with the fetched details
      setFormData({
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        description: room.description,
        amenities: room.amenities.map((a) => a.name),
        image: room.imageUrl,
      });
      setSelectedAmenities(room.amenities.map((a) => a.name));
      setRoomDetails(room);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching room details. Please try again.");
    } finally {
      setFetchingRoom(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Amenity changes
  const handleAmenityChange = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Image changes
  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Submit to update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!formData.name || !formData.type || !formData.capacity) {
      setError("Please fill in the name, type, and capacity fields.");
      setLoading(false);
      return;
    }
    if (selectedAmenities.length < 3) {
      setError("Please select at least three amenities.");
      setLoading(false);
      return;
    }

    const amenities = selectedAmenities.map((name) => ({ name, icon: name }));
    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    // The old code uses "originalName" from the fetched room
    formPayload.append("originalName", roomDetails.name);
    formPayload.append("type", formData.type);
    formPayload.append("capacity", formData.capacity);
    formPayload.append("description", formData.description);
    formPayload.append("amenities", JSON.stringify(amenities));
    if (formData.image) formPayload.append("image", formData.image);

    try {
      // The old code does a PUT to /api/room/rooms/:roomId 
      // but here, "roomId" is actually the name. 
      // Make sure your server route supports /api/room/rooms/:roomName if that's how you're doing it.
      const response = await axios.put(`http://localhost:5000/api/room/rooms/${roomId}`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        setSuccessMessage("Room updated successfully!");
        onSuccess("Room updated successfully!");
        setFormData({ name: "", type: "", capacity: "", description: "", amenities: [], image: null });
        setSelectedAmenities([]);
        setRoomId("");
        setRoomDetails(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while updating the room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:flex-1 sm:pl-64 2xl:pl-0 mb-4">
      {/* Dropdown of room names */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select a Room by Name</label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">-- Choose a Room --</option>
          {roomsList.map((room) => (
            <option key={room._id} value={room.name}>
              {room.name}
            </option>
          ))}
        </select>

        <div className="text-center mb-4 mt-4">
          {error && <Message message={error} type="error" onClose={() => setError("")} />}
          {successMessage && <Message message={successMessage} type="success" onClose={() => setSuccessMessage("")} />}
        </div>

        {/* "Get Room Details" button, just like before */}
        <div className="mt-4">
          <button
            onClick={handleRoomFetch}
            className="px-6 py-2 bg-gradient-grayToRight text-white rounded-md hover:bg-gradient-grayToLeft transition duration-300 mb-6"
            disabled={fetchingRoom}
          >
            {fetchingRoom ? "Fetching..." : "Get Room Details"}
          </button>
        </div>
      </div>

      {/* If roomDetails is loaded, show the form */}
      {roomDetails && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 w-full mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-grayToRight mb-6 text-center">Update Room</h2>

          <FormInput type="text" name="name" value={formData.name} onChange={handleInputChange} label="Room Name" error={error.name} />

          <div className="mb-4 relative">
            <label htmlFor="type" className="block mb-2 text-sm font-medium text-grayMid">Type</label>
            <select id="type" name="type" value={formData.type} onChange={handleInputChange} className="bg-white text-grayDark text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3">
              <option value="Open">Open</option>
              <option value="Small Seminar">Small Seminar</option>
              <option value="Large Seminar">Large Seminar</option>
            </select>
            {error.type && <p className="text-red-500 text-xs">{error.type}</p>}
          </div>

          <FormInput type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} label="Capacity" error={error.capacity} />
          <FormInput type="textarea" name="description" value={formData.description} onChange={handleInputChange} label="Description" error={error.description} />

          <div className="mb-4 mt-4">
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="form-checkbox text-primary"
                  />
                  <div className="flex items-center space-x-1">
                    {iconMapping[amenity]} 
                    <span className="capitalize">{amenity}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Upload Image</label>
            <input type="file" onChange={handleImageChange} className="form-input w-full p-3 border border-grayMid rounded-lg" />
          </div>

          <div className="text-center">
            {error && <Message message={error} type="error" onClose={() => setError("")} />}
            {successMessage && <Message message={successMessage} type="success" onClose={() => setSuccessMessage("")} />}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-grayToRight text-white rounded-md hover:bg-gradient-grayToLeft transition duration-300"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Room"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateRoomForm;
