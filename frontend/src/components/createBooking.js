import React, { useState, useEffect } from "react";
import axios from "axios";
import Message from "./Error_successMessage";
import CustomDatepicker from "../utils/datePicker";

const CreateBookingByNamesForm = ({ onSuccess }) => {
  // Main form data
  const [formData, setFormData] = useState({
    roomName: "",
    username: "",
    colleagues: [],
    date: "",
    startTime: "",
    endTime: "",
  });

  // Additional user emails input (comma-separated)
  const [colleagueEmails, setColleagueEmails] = useState("");

  // States for availability
  const [availability, setAvailability] = useState(null);
  const [displaySlots, setDisplaySlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);

  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1) Handle form changes for roomName, username, etc.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormError("");
    setSuccessMessage("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2) Convert colleagueEmails => formData.colleagues
  useEffect(() => {
    if (colleagueEmails.trim()) {
      const arr = colleagueEmails.split(",").map((email) => email.trim());
      setFormData((prev) => ({ ...prev, colleagues: arr }));
    } else {
      setFormData((prev) => ({ ...prev, colleagues: [] }));
    }
  }, [colleagueEmails]);

  // 3) Fetch monthly availability by roomName
  const fetchAvailability = async () => {
    if (!formData.roomName) {
      setFormError("Please enter a room name first.");
      return;
    }
    setLoadingAvailability(true);
    setFormError("");
    setSuccessMessage("");
    setAvailability(null);
    setAvailableDates([]);
    setDisplaySlots([]);

    try {
      // For example: GET /api/room/rooms-by-name/<roomName>/monthly-availability
      // Adjust to match your actual endpoint
      const response = await axios.get(
        `http://localhost:5000/api/room/rooms-by-name/${formData.roomName}/monthly-availability`
      );
      if (response.status === 200) {
        setAvailability(response.data.availability || []);
        // Extract date strings
        const dateStrings = (response.data.availability || []).map((day) => day.date);
        setAvailableDates(dateStrings);
      }
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          `Unable to fetch availability for room: ${formData.roomName}`
      );
    } finally {
      setLoadingAvailability(false);
    }
  };

  // 4) Once user picks a date => find that date’s slots
  const handleDateSelected = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    setFormData((prev) => ({
      ...prev,
      date: dateStr,
      startTime: "",
      endTime: "",
    }));
    setDisplaySlots([]);

    if (availability) {
      const dayAvailability = availability.find((d) => d.date === dateStr);
      if (dayAvailability) {
        setDisplaySlots(dayAvailability.slots || []);
      } else {
        setDisplaySlots([]);
      }
    }
  };

  // 5) Selecting a slot => store it in formData
  const handleSlotSelect = (slot) => {
    if (slot.status !== "Available") {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
    setFormError("");
  };

  // 6) Validate form
  const validateForm = () => {
    if (!formData.roomName) return "Please enter a room name.";
    if (!formData.username) return "Please enter your username.";
    if (!formData.date) return "Please choose a date.";
    if (!formData.startTime || !formData.endTime) return "Please select a time slot.";
    return "";
  };

  // 7) Create booking (by name) => POST to e.g. /api/book/booking/create-by-names
  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      setSuccessMessage("");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      // e.g. POST /booking/create-by-names
      const response = await axios.post(
        "http://localhost:5000/api/book/booking/create-by-names",
        {
          username: formData.username,
          roomName: formData.roomName,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          additionalUsers: formData.colleagues,
        }
      );
      if (response.status === 201) {
        setSuccessMessage(response.data.message || "Booking created successfully!");
        onSuccess?.(response.data.message);

        // Reset form
        setFormData({
          roomName: "",
          username: "",
          colleagues: [],
          date: "",
          startTime: "",
          endTime: "",
        });
        setColleagueEmails("");
        setAvailability(null);
        setDisplaySlots([]);
        setAvailableDates([]);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Error creating booking by names");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-md shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Create a Booking (By Username &amp; Room Name)
      </h2>

      {/* 1) RoomName & Username */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium">Room Name</label>
          <input
            type="text"
            name="roomName"
            value={formData.roomName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="e.g. Large Seminar Room A"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Your Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="e.g. jdoe"
          />
        </div>

        {/* 2) Fetch Monthly Availability Button */}
        <button
          type="button"
          onClick={fetchAvailability}
          disabled={loadingAvailability}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loadingAvailability ? "Loading..." : "Fetch Availability"}
        </button>

        {/* If we have availability => custom datepicker */}
        {availability && availability.length > 0 && (
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-1">
              Select Date
            </label>
            <CustomDatepicker
              onDateChange={handleDateSelected}
              availableDates={availableDates} // from state
            />
          </div>
        )}

        {/* Time Slots */}
        {formData.date && (
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select Time Slot
            </label>
            {displaySlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {displaySlots.map((slot, index) => {
                  const isSelected =
                    formData.startTime === slot.startTime &&
                    formData.endTime === slot.endTime;
                  if (slot.status !== "Available") {
                    return (
                      <div
                        key={index}
                        className="relative px-4 py-3 bg-gray-200 text-gray-500 border border-gray-300 rounded-md flex items-center justify-center"
                      >
                        <span className="line-through">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <div className="absolute bottom-0 right-2">
                          <span className="text-[10px] uppercase font-semibold">Booked</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      type="button"
                      className={`px-4 py-3 border rounded-md transition ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50"
                      }`}
                    >
                      {slot.startTime} - {slot.endTime}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-red-500">No available slots for {formData.date}</p>
            )}
          </div>
        )}

        {/* Additional Users (colleagues) */}
        <div>
          <label className="block text-gray-700 font-medium">
            Additional User Emails (comma-separated)
          </label>
          <input
            type="text"
            value={colleagueEmails}
            onChange={(e) => setColleagueEmails(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="email1@example.com, email2@example.com"
          />
        </div>

        {/* Error/Success */}
        {formError && (
          <Message message={formError} type="error" onClose={() => setFormError("")} />
        )}
        {successMessage && (
          <Message message={successMessage} type="success" onClose={() => setSuccessMessage("")} />
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {isSubmitting ? "Creating..." : "Create Booking"}
        </button>
      </form>
    </div>
  );
};

export default CreateBookingByNamesForm;
