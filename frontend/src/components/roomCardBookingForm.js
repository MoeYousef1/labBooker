// RoomCardBookingForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Message from "./Error_successMessage"; // For error/success messages
import CustomDatepicker from "../utils/datePicker"; // Your custom datepicker component

const RoomCardBookingForm = ({ room, activeRoom, userInfo, handleStartBooking }) => {
  // Form data holds booking information
  const [formData, setFormData] = useState({
    colleagues: [],
    date: "",
    startTime: "",
    endTime: "",
    reason: ""
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for backend availability (timeslot data)
  const [availability, setAvailability] = useState(null);
  // List of timeslots for the selected date
  const [displaySlots, setDisplaySlots] = useState([]);

  // Fetch backend availability when form is active
  useEffect(() => {
    if (activeRoom === room._id) {
      axios
        .get(`http://localhost:5000/api/room/rooms/${room._id}/monthly-availability`)
        .then((res) => {
          // Expected response:
          // { room: room.name, availability: [ { date, slots: [{ startTime, endTime, status }] }, ... ] }
          setAvailability(res.data.availability);
        })
        .catch((error) => {
          console.error("Error fetching room availability:", error);
          const errMsg =
            (error.response && error.response.data && error.response.data.message) ||
            "Unable to fetch room availability. Please try again later.";
          setFormError(errMsg);
        });
    }
  }, [activeRoom, room._id]);

  // Compute available date strings from the availability data
  const availableDates = availability ? availability.map(day => day.date) : [];

  // Initialize colleague emails based on room type
  useEffect(() => {
    const initialColleagues =
      room.type === "Large Seminar" ? ["", "", ""] :
      room.type === "Small Seminar" ? ["", ""] : [];
    setFormData((prev) => ({ ...prev, colleagues: initialColleagues }));
  }, [room.type]);

  // Reset form when activeRoom changes
  useEffect(() => {
    if (activeRoom !== room._id) {
      const initialColleagues =
        room.type === "Large Seminar" ? ["", "", ""] :
        room.type === "Small Seminar" ? ["", ""] : [];
      setFormData({ colleagues: initialColleagues, date: "", startTime: "", endTime: "", reason: "" });
      setFormError("");
      setSuccessMessage("");
      setDisplaySlots([]);
    }
  }, [activeRoom, room._id, room.type]);

  // Clear form after a successful booking submission
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        const initialColleagues =
          room.type === "Large Seminar" ? ["", "", ""] :
          room.type === "Small Seminar" ? ["", ""] : [];
        setFormData({ colleagues: initialColleagues, date: "", startTime: "", endTime: "", reason: "" });
        setSuccessMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, room.type]);

  // Handle input changes (colleague emails and other fields)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("colleague")) {
      const index = parseInt(name.split("_")[1], 10);
      setFormData((prev) => {
        const updatedColleagues = [...prev.colleagues];
        updatedColleagues[index] = value;
        return { ...prev, colleagues: updatedColleagues };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setFormError("");
  };

  // Callback when a date is selected and applied from the CustomDatepicker
  const handleDateSelected = (date) => {
    const dateStr = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    setFormData((prev) => ({ ...prev, date: dateStr, startTime: "", endTime: "" }));
    if (availability) {
      const dayAvailability = availability.find((day) => day.date === dateStr);
      if (dayAvailability) {
        setDisplaySlots(dayAvailability.slots);
      } else {
        setDisplaySlots([]);
      }
    }
  };

  // When a timeslot is clicked, update formData if available
  const handleSlotSelect = (slot) => {
    if (slot.status !== "Available") return;
    setFormData((prev) => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime
    }));
    setFormError("");
  };

  // Validate form fields before submission
  const validateForm = () => {
    if (room.type !== "Open" && formData.colleagues.some((c) => !c))
      return "Please enter all colleague emails.";
    if (!formData.date)
      return "Please choose an available date.";
    if (!formData.startTime || !formData.endTime)
      return "Please select a time slot.";
    return "";
  };

  // Submit the booking request
  const handleProceedBooking = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      setSuccessMessage("");
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:5000/api/book/booking", {
        roomId: room._id,
        userId: userInfo.id,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        additionalUsers: formData.colleagues
      });
      if (response.status === 201) {
        setSuccessMessage(response.data.message);
        setFormError("");
      } else {
        setFormError(response.data.message);
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error booking the room:", error);
      const errMsg =
        (error.response && error.response.data && error.response.data.message) ||
        "An error occurred while processing your booking.";
      setFormError(errMsg);
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close the booking modal and reset form states
  const closeModal = () => {
    handleStartBooking();
    const initialColleagues =
      room.type === "Large Seminar" ? ["", "", ""] :
      room.type === "Small Seminar" ? ["", ""] : [];
    setFormData({ colleagues: initialColleagues, date: "", startTime: "", endTime: "", reason: "" });
    setFormError("");
    setSuccessMessage("");
    setDisplaySlots([]);
  };

  if (activeRoom !== room._id) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Booking: {room.name}</h2>
          <button className="text-gray-500 hover:text-red-500 text-3xl" onClick={closeModal}>
            &times;
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Colleague Emails (if applicable) */}
          {room.type !== "Open" &&
            formData.colleagues.map((colleague, index) => (
              <div key={`colleague_${index}`} className="flex flex-col">
                <label className="text-gray-700 mb-1">Colleague {index + 1} Email</label>
                <input
                  type="email"
                  name={`colleague_${index}`}
                  value={colleague}
                  onChange={handleInputChange}
                  className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}

          {/* Custom Datepicker */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Select Date</label>
            <CustomDatepicker
              onDateChange={handleDateSelected}
              availableDates={availableDates}
            />
          </div>

          {/* Time Slot Selector */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Select Time Slot</label>
            {formData.date ? (
              displaySlots.length > 0 ? (
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
                <p className="text-red-500">No available time slots for this date.</p>
              )
            ) : (
              <p className="text-gray-500">Please select a date first.</p>
            )}
          </div>

          {/* Error and Success Messages */}
          {(formError || successMessage) && (
            <div className="text-center">
              {formError && (
                <Message message={formError} type="error" onClose={() => setFormError("")} />
              )}
              {successMessage && (
                <Message message={successMessage} type="success" onClose={() => setSuccessMessage("")} />
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleProceedBooking}
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          >
            {isSubmitting ? "Booking..." : "Proceed with Booking"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCardBookingForm;
