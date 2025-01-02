import React, { useState } from "react";
import axios from "axios";
import iconMapping from "../utils/iconMapping"; // Import your icon mapping
import FormInput from "./FormInput"; // Assuming FormInput component is reused
import Message from "./Error_successMessage"; // Assuming Message component is reused

const UpdateRoomForm = ({
  roomId,
  roomDetails,
  setRoomId,
  setRoomDetails,
  onSuccess,
}) => {
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
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fetchingRoom, setFetchingRoom] = useState(false);

  const availableAmenities = Object.keys(iconMapping);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleRoomFetch = async () => {
    if (!roomId) {
      setError("Please enter a valid room ID");
      return;
    }

    setFetchingRoom(true);
    setError("");
    setSuccessMessage(""); // Clear previous success message
    try {
      const response = await axios.get(
        `http://localhost:5000/api/room/rooms/${roomId}`,
      );
      const room = response.data;

      // Pre-fill the form with the fetched room details
      setFormData({
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        description: room.description,
        amenities: room.amenities.map((amenity) => amenity.name),
        image: room.imageUrl, // Assuming the image is a URL
      });

      setSelectedAmenities(room.amenities.map((amenity) => amenity.name)); // Set selected amenities
      setRoomDetails(room); // Store the room details
    } catch (err) {
      setError("Error fetching room details. Please try again.");
    } finally {
      setFetchingRoom(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage(""); // Clear previous success message

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

    const amenities = selectedAmenities.map((name) => ({
      name,
      icon: name, // Assuming the icon class name matches the amenity name
    }));

    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("type", formData.type);
    formPayload.append("capacity", formData.capacity);
    formPayload.append("description", formData.description);
    formPayload.append("amenities", JSON.stringify(amenities));
    if (formData.image) {
      formPayload.append("image", formData.image);
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/room/rooms/${roomId}`,
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200) {
        setSuccessMessage("Room updated successfully!");
        onSuccess("Room updated successfully!");
        setFormData({
          name: "",
          type: "",
          capacity: "",
          description: "",
          amenities: [],
          image: null,
        });
        setSelectedAmenities([]);
        setRoomId("");
        setRoomDetails(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while updating the room",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:flex-1 sm:pl-48 mb-4">
      {/* Room ID Form */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Room ID</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        {/* Error and Success Message */}
        <div className="text-center mb-4">
          {error && (
            <Message
              message={error}
              type="error"
              onClose={() => setError("")}
            />
          )}
          {successMessage && (
            <Message
              message={successMessage}
              type="success"
              onClose={() => setSuccessMessage("")}
            />
          )}
        </div>
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

      {/* Room Update Form */}
      {roomDetails && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 w-full sm:w-11/12 mx-auto space-y-6"
        >
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-grayToRight mb-6 text-center">
            Update Room
          </h2>

          {/* Room Name */}
          <FormInput
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            label="Room Name"
            error={error.name}
          />

          {/* Room Type */}
          <div className="mb-4 relative">
            <label
              htmlFor="type"
              className="block mb-2 text-sm font-medium text-grayMid"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="bg-white text-grayDark text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3"
            >
              <option value="Open">Open</option>
              <option value="Small Seminar">Small Seminar</option>
              <option value="Large Seminar">Large Seminar</option>
            </select>
            {error.type && <p className="text-red-500 text-xs">{error.type}</p>}
          </div>

          {/* Capacity */}
          <FormInput
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            label="Capacity"
            error={error.capacity}
          />

          {/* Description */}
          <FormInput
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            label="Description"
            error={error.description}
          />

          {/* Amenities */}
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
                    {iconMapping[amenity]}{" "}
                    <span className="capitalize">{amenity}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Upload Image
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              className="form-input w-full p-3 border border-grayMid rounded-lg"
            />
          </div>

          {/* Error and Success Message */}
          <div className="text-center">
            {error && (
              <Message
                message={error}
                type="error"
                onClose={() => setError("")}
              />
            )}
            {successMessage && (
              <Message
                message={successMessage}
                type="success"
                onClose={() => setSuccessMessage("")}
              />
            )}
          </div>

          {/* Submit Button */}
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
