import React, { useState } from "react";
import Message from "./Error_successMessage";
import CustomDatepicker from "../utils/datePicker";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa"; // For remove icon
import api from "../utils/axiosConfig"; // Import the centralized Axios instance


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

  // Single colleague email input
  const [colleagueEmail, setColleagueEmail] = useState("");

  // States for availability
  const [availability, setAvailability] = useState(null);
  const [displaySlots, setDisplaySlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);

  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [roomType, setRoomType] = useState(null);
  const [maxAdditionalUsers, setMaxAdditionalUsers] = useState(0);
  const [requiredUsers, setRequiredUsers] = useState(0);

  // Function to fetch room details manually
  const fetchRoomDetails = async () => {
    if (!formData.roomName.trim()) {
      setFormError("Please enter a room name before fetching details.");
      return;
    }

    try {
      const response = await api.get(
        `/room/rooms/${formData.roomName.trim()}`,
      );
      if (response.status === 200) {
        const room = response.data;
        setRoomType(room.type);

        // Set required and max additional users based on room type
        switch (room.type) {
          case "Open":
            setRequiredUsers(0);
            setMaxAdditionalUsers(0);
            break;
          case "Small Seminar":
            setRequiredUsers(2);
            setMaxAdditionalUsers(2);
            break;
          case "Large Seminar":
            setRequiredUsers(3);
            setMaxAdditionalUsers(3);
            break;
          default:
            setRequiredUsers(0);
            setMaxAdditionalUsers(0);
        }

        // Clear colleague emails if room type changes
        setColleagueEmail("");
        setFormData((prev) => ({ ...prev, colleagues: [] }));
        setFormError("");
        setSuccessMessage("Room details fetched successfully!");
      }
    } catch (error) {
      setFormError(
        error.response?.data?.message || "Error fetching room details.",
      );
      setRoomType(null);
      setRequiredUsers(0);
      setMaxAdditionalUsers(0);
      setFormData((prev) => ({ ...prev, colleagues: [] }));
    }
  };

  // Handle form changes for roomName, username, etc.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormError("");
    setSuccessMessage("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add a single colleague
  const handleAddColleague = () => {
    const email = colleagueEmail.trim();
    if (!email) {
      setFormError("Please enter a valid email address.");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    // Check if maximum number of colleagues is reached
    if (formData.colleagues.length >= maxAdditionalUsers) {
      setFormError(
        `You can only add up to ${maxAdditionalUsers} additional user(s).`,
      );
      return;
    }

    // Check for duplicate emails
    if (formData.colleagues.includes(email)) {
      setFormError("This email has already been added.");
      return;
    }

    // Add colleague
    setFormData((prev) => ({
      ...prev,
      colleagues: [...prev.colleagues, email],
    }));
    setColleagueEmail("");
    setFormError("");
    setSuccessMessage("Colleague added successfully!");
  };

  // Remove a colleague
  const handleRemoveColleague = (emailToRemove) => {
    setFormData((prev) => ({
      ...prev,
      colleagues: prev.colleagues.filter((email) => email !== emailToRemove),
    }));
    setFormError("");
    setSuccessMessage("Colleague removed.");
  };

  // Fetch monthly availability by roomName
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
      // Adjust the endpoint as per your backend
      const response = await api.get(
        `/room/rooms-by-name/${formData.roomName}/monthly-availability`,
      );
      if (response.status === 200) {
        setAvailability(response.data.availability || []);
        // Extract date strings
        const dateStrings = (response.data.availability || []).map(
          (day) => day.date,
        );
        setAvailableDates(dateStrings);
        setSuccessMessage("Availability fetched successfully!");
      }
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          `Unable to fetch availability for room: ${formData.roomName}`,
      );
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Callback when a date is selected and applied from the CustomDatepicker
  const handleDateSelected = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    console.log("Selected Date (Local):", dateStr); // Debugging log

    setFormData((prev) => ({
      ...prev,
      date: dateStr,
      startTime: "",
      endTime: "",
    }));

    if (availability) {
      const dayAvailability = availability.find((day) => day.date === dateStr);
      if (dayAvailability) {
        // Determine if the selected date is today
        const today = new Date();
        const isToday = dateStr === today.toISOString().split("T")[0];
        let updatedSlots = dayAvailability.slots;

        if (isToday) {
          const currentTime = today.getHours() * 60 + today.getMinutes(); // Current time in minutes
          // Map over slots to add 'isPast' flag
          updatedSlots = dayAvailability.slots.map((slot) => {
            const [endHour, endMinute] = slot.endTime.split(":").map(Number);
            const slotEndTimeInMinutes = endHour * 60 + endMinute;
            const isPast = slotEndTimeInMinutes <= currentTime;
            return { ...slot, isPast };
          });
        } else {
          // For future dates, none of the slots are past
          updatedSlots = dayAvailability.slots.map((slot) => ({
            ...slot,
            isPast: false,
          }));
        }

        setDisplaySlots(updatedSlots);
      } else {
        setDisplaySlots([]);
      }
    }
  };

  // When a timeslot is clicked, update formData if available and not past
  const handleSlotSelect = (slot) => {
    if (slot.status !== "Available" || slot.isPast) return;
    setFormData((prev) => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
    setFormError("");
  };

  // Validate form
  const validateForm = () => {
    if (!formData.roomName.trim()) return "Please enter a room name.";
    if (!formData.username.trim()) return "Please enter your username.";
    if (!formData.date) return "Please choose a date.";
    if (!formData.startTime || !formData.endTime)
      return "Please select a time slot.";

    // Validate required additional users
    if (
      roomType === "Small Seminar" &&
      formData.colleagues.length !== requiredUsers
    ) {
      return "Small Seminar rooms require exactly 2 additional users.";
    }
    if (
      roomType === "Large Seminar" &&
      formData.colleagues.length !== requiredUsers
    ) {
      return "Large Seminar rooms require exactly 3 additional users.";
    }

    return "";
  };

  // Create booking (by name) => POST to e.g. /api/book/booking/create-by-names
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
      const response = await api.post(
        "/book/booking/create-by-names",
        {
          username: formData.username.trim(),
          roomName: formData.roomName.trim(),
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          additionalUsers: formData.colleagues,
        },
      );
      if (response.status === 201) {
        setSuccessMessage(
          response.data.message || "Booking created successfully!",
        );
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
        setColleagueEmail("");
        setAvailability(null);
        setDisplaySlots([]);
        setAvailableDates([]);
        setRoomType(null);
        setRequiredUsers(0);
        setMaxAdditionalUsers(0);
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Error creating booking by names.",
      );
    } finally {
      setIsSubmitting(false);
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
        Create a Booking
      </h2>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section: Basic Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
            Booking Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Room Name <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Large Seminar Room A"
                />
              </div>
              <div className="mt-1">
                <button
                  type="button"
                  onClick={fetchRoomDetails}
                  className="px-6 py-3 rounded-lg shadow-md transition-colors bg-white text-green-500 hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400"
                >
                  Fetch Details
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g. jdoe"
              />
            </div>
          </div>
        </div>

        {/* Section: Additional Users */}
        <div>
          {roomType && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {roomType === "Open" ? (
                  "Additional users are not allowed for Open rooms."
                ) : (
                  <>
                    Add Additional User <span className="text-red-500">*</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (Exactly {requiredUsers} user
                      {requiredUsers > 1 ? "s" : ""} required)
                    </span>
                  </>
                )}
              </label>

              {roomType !== "Open" && (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={colleagueEmail}
                      onChange={(e) => {
                        setColleagueEmail(e.target.value);
                        setFormError("");
                        setSuccessMessage("");
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 
                          ${
                            formData.colleagues.length === requiredUsers
                              ? "border-green-500"
                              : "border-gray-300"
                          }`}
                      placeholder="Enter user email"
                      disabled={formData.colleagues.length >= requiredUsers}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleAddColleague}
                      disabled={
                        !colleagueEmail.trim() ||
                        formData.colleagues.length >= requiredUsers
                      }
                      className={`px-4 py-2 rounded-lg shadow-md transition-colors ${
                        !colleagueEmail.trim() ||
                        formData.colleagues.length >= requiredUsers
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                      }`}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-sm ${
                        formData.colleagues.length === requiredUsers
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formData.colleagues.length}/{requiredUsers} user
                      {requiredUsers > 1 ? "s" : ""} added
                    </p>
                    {formData.colleagues.length !== requiredUsers && (
                      <p className="text-sm text-red-600">
                        {requiredUsers - formData.colleagues.length} more user
                        {requiredUsers - formData.colleagues.length > 1
                          ? "s"
                          : ""}{" "}
                        required
                      </p>
                    )}
                  </div>
                  {formData.colleagues.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">
                        Added emails:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.colleagues.map((email, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                                bg-green-100 text-green-800"
                          >
                            {email}
                            <button
                              type="button"
                              onClick={() => handleRemoveColleague(email)}
                              className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                            >
                              <FaTimes size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section: Availability */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
            Check Availability
          </h3>
          <button
            type="button"
            onClick={fetchAvailability}
            disabled={loadingAvailability || !roomType}
            className={`px-6 py-3 rounded-lg shadow-md transition-colors ${
              loadingAvailability || !roomType
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-green-500 hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400"
            }`}
          >
            {loadingAvailability ? "Loading..." : "Fetch Availability"}
          </button>

          {availableDates.length > 0 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Date <span className="text-red-500">*</span>
              </label>
              <CustomDatepicker
                onDateChange={handleDateSelected}
                availableDates={availableDates}
              />
            </div>
          )}

          {/* Time Slots */}
          {formData.date && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Time Slot <span className="text-red-500">*</span>
              </label>
              {displaySlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {displaySlots.map((slot, index) => {
                    const isSelected =
                      formData.startTime === slot.startTime &&
                      formData.endTime === slot.endTime;

                    let slotStatus = "Available";

                    if (slot.status !== "Available") {
                      slotStatus = "Booked";
                    } else if (slot.isPast) {
                      slotStatus = "Past";
                    }

                    if (slotStatus !== "Available") {
                      return (
                        <div
                          key={index}
                          className="relative px-4 py-3 bg-gray-200 text-gray-500 border border-gray-300 rounded-lg flex items-center justify-center"
                          aria-label={`${slot.startTime} - ${slot.endTime} ${slotStatus}`}
                        >
                          <span className="line-through">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <div className="absolute bottom-0 right-2">
                            <span
                              className={`text-[10px] uppercase font-semibold ${
                                slotStatus === "Booked"
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {slotStatus}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        type="button"
                        className={`px-4 py-3 border rounded-lg transition ${
                          isSelected
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-white text-gray-800 border-gray-300 hover:bg-green-50"
                        }`}
                        disabled={slotStatus !== "Available"}
                        aria-pressed={isSelected}
                        aria-label={`${slot.startTime} - ${slot.endTime} ${slotStatus}`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-red-500">
                    No available slots for {formData.date}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section: Error and Success Messages */}
        <div className="text-center">
          {formError && (
            <Message
              message={formError}
              type="error"
              onClose={() => setFormError("")}
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
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              (roomType !== "Open" &&
                formData.colleagues.length !== requiredUsers)
            }
            className={`px-6 py-3 rounded-lg shadow-md transition-colors ${
              isSubmitting ||
              (roomType !== "Open" &&
                formData.colleagues.length !== requiredUsers)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-green-500 hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400"
            }`}
          >
            {isSubmitting
              ? "Creating..."
              : roomType !== "Open" &&
                  formData.colleagues.length !== requiredUsers
                ? `Add ${
                    requiredUsers - formData.colleagues.length
                  } More User${requiredUsers - formData.colleagues.length > 1 ? "s" : ""}`
                : "Create Booking"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateBookingByNamesForm;
