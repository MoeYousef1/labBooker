import React, { useState } from "react";
import axios from "axios";
import iconMapping from "../utils/iconMapping";
import FormInput from "./FormInput";
import Message from "./Error_successMessage";

const CreateRoomForm = ({ onSuccess }) => {
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
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const availableAmenities = Object.keys(iconMapping);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors("");
    setSuccessMessage("");

    if (!formData.name || !formData.type || !formData.capacity) {
      setErrors("Please fill in the name, type, and capacity fields.");
      setLoading(false);
      return;
    }

    if (selectedAmenities.length < 3) {
      setErrors("Please select at least three amenities.");
      setLoading(false);
      return;
    }

    const amenities = selectedAmenities.map((name) => ({ name, icon: name }));
    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("type", formData.type);
    formPayload.append("capacity", formData.capacity);
    formPayload.append("description", formData.description);
    formPayload.append("amenities", JSON.stringify(amenities));
    if (formData.image) formPayload.append("image", formData.image);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/room/rooms",
        formPayload,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response.status === 201) {
        setSuccessMessage("Room created successfully!");
        onSuccess("Room created successfully!");

        setFormData({
          name: "",
          type: "",
          capacity: "",
          description: "",
          amenities: [],
          image: null,
        });
        setSelectedAmenities([]);
      }
    } catch (err) {
      setErrors(
        err.response?.data?.message ||
          "An error occurred while creating the room",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:flex-1 sm:pl-48">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full mx-auto space-y-6 mb-4 overflow-hidden"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-grayToRight mb-6 text-center">
          Create Room
        </h2>

        {/* Room Name */}
        <FormInput
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          label="Room Name"
          error={errors.name}
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
            <option value="" disabled>
              Select a Room Type
            </option>
            <option value="Open">Open</option>
            <option value="Small Seminar">Small Seminar</option>
            <option value="Large Seminar">Large Seminar</option>
          </select>
          {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
        </div>

        {/* Capacity */}
        <FormInput
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleInputChange}
          label="Capacity"
          error={errors.capacity}
        />

        {/* Description */}
        <FormInput
          type="textarea"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          label="Description"
          error={errors.description}
        />

        {/* Amenities Checklist */}
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
          <label className="block text-sm font-medium mb-2">Upload Image</label>
          <input
            type="file"
            onChange={handleImageChange}
            className="form-input w-full p-3 border border-grayMid rounded-lg"
          />
        </div>
        {/* Error and Success Message */}
        <div className="text-center">
          {errors && (
            <Message
              message={errors}
              type="error"
              onClose={() => setErrors("")}
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
            {loading ? "Creating..." : "Create Room"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomForm;
