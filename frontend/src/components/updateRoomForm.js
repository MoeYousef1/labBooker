import React, { useState, useEffect } from "react";
import axios from "axios";
import iconMapping from "../utils/iconMapping";
import Message from "./Error_successMessage";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const UpdateRoomForm = ({
  roomId,
  roomDetails,
  setRoomId,
  setRoomDetails,
  onSuccess,
}) => {
  const [roomsList, setRoomsList] = useState([]);
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
  const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const availableAmenities = Object.keys(iconMapping);

  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/room/rooms");
        setRoomsList(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load rooms list.");
      }
    };
    fetchAllRooms();
  }, []);

  const handleRoomFetch = async () => {
    if (!roomId) {
      setError("Please select a valid room.");
      return;
    }
    setFetchingRoom(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.get(
        `http://localhost:5000/api/room/rooms/${roomId}`
      );
      const room = response.data;

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
      setShowForm(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching room details. Please try again."
      );
    } finally {
      setFetchingRoom(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

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

    const amenities = selectedAmenities.map((name) => ({
      name,
      icon: name,
    }));

    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("originalName", roomDetails.name);
    formPayload.append("type", formData.type);
    formPayload.append("capacity", formData.capacity);
    formPayload.append("description", formData.description);
    formPayload.append("amenities", JSON.stringify(amenities));
    if (formData.image) formPayload.append("image", formData.image);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/room/rooms/${roomId}`,
        formPayload,
        { headers: { "Content-Type": "multipart/form-data" } }
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
        setShowForm(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while updating the room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-10 bg-gray-50 rounded-lg shadow-xl mb-4"
    >
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Update Room
      </h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select a Room to Update
        </label>

        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="" disabled>
            Choose a Room
          </option>
          {roomsList.map((room) => (
            <option key={room._id} value={room.name}>
              {room.name}
            </option>
          ))}
        </select>



        {/* Messages */}
        <div className="text-center">
        {["Please select a valid room.", "Failed to fetch room", "Failed to load rooms list."].includes(error) && (
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
        <button
          type="button"
          onClick={handleRoomFetch}
          className="w-full py-2 mt-4 bg-white text-green-500 shadow-md rounded-lg hover:bg-green-500 hover:text-white transition"
        >
          {fetchingRoom ? "Fetching..." : "Get Room Details"}
        </button>
      </div>

      {showForm && (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-10 mt-10"
        >
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Room Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Room Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="" disabled>
                  Select Room Type
                </option>
                <option value="Open">Open</option>
                <option value="Small Seminar">Small Seminar</option>
                <option value="Large Seminar">Large Seminar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Amenities
            </h3>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAmenitiesDropdown((prev) => !prev)}
                className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center focus:ring-2 focus:ring-green-500"
              >
                Select Amenities
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </button>
              {showAmenitiesDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-60 overflow-y-auto">
                  <input
                    type="text"
                    placeholder="Search amenities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
                  />
                  <div className="grid grid-cols-1 gap-2">
                    {availableAmenities
                      .filter((amenity) =>
                        amenity.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((amenity) => (
                        <label
                          key={amenity}
                          className="flex items-center space-x-2"
                        >
                          {iconMapping[amenity]}
                          <span className="capitalize">{amenity}</span>
                          <input
                            type="checkbox"
                            checked={selectedAmenities.includes(amenity)}
                            onChange={() => handleAmenityToggle(amenity)}
                            className="form-checkbox text-green-500"
                          />
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Messages */}
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

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-white text-green-500 rounded-lg shadow-md hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Room"}
            </button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
};

export default UpdateRoomForm;
