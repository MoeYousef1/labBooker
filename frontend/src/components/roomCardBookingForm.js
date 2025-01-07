import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API requests
import Message from "./Error_successMessage"; // Import the Message component

const RoomCardBookingForm = ({ room, activeRoom, userInfo }) => {
  const [formData, setFormData] = useState({
    colleagues: [],
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setFormError(""); // Clear error on input change
  };

  const handleTimeSlotChange = (e) => {
    const selectedTimeSlot = e.target.value;
    const [start, end] = selectedTimeSlot.split("-");

    if (start && end) {
      const formatTime = (time) => {
        const [hour, minute] = time.split(":").map(Number);
        return `${hour < 10 ? "0" + hour : hour}:${minute < 10 ? "0" + minute : minute}`;
      };

      setFormData((prev) => ({
        ...prev,
        startTime: formatTime(start.trim() + ":00"),
        endTime: formatTime(end.trim() + ":00"),
      }));
    }
  };

  const validateForm = () => {
    if (
      room.type !== "Open" &&
      formData.colleagues.some((colleague) => !colleague)
    ) {
      return "Please enter all colleague emails.";
    }
    if (!formData.date) return "Please choose a date.";
    if (!formData.startTime || !formData.endTime)
      return "Please select a time slot.";
    return "";
  };

  const handleProceedBooking = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      setSuccessMessage(""); // Clear success message
    } else {
      setFormError(""); // Clear error message
      setIsSubmitting(true);
      try {
        const response = await axios.post(
          "http://localhost:5000/api/book/booking",
          {
            roomId: room._id,
            userId: userInfo.id,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            additionalUsers: formData.colleagues,
          },
        );

        if (response.data.status === 201) {
          setSuccessMessage(response.data.message);
          setFormError(""); // Clear error message
        } else {
          setFormError(response.data.message);
          setSuccessMessage(""); // Clear success message
        }
      } catch (error) {
        console.error("Error booking the room:", error);
        setFormError("An error occurred while processing your booking.");
        setSuccessMessage(""); // Clear success message
      }
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const initialColleagues =
      room.type === "Large Seminar"
        ? ["", "", ""]
        : room.type === "Small Seminar"
          ? ["", ""]
          : [];
    setFormData((prev) => ({ ...prev, colleagues: initialColleagues }));
  }, [room.type]);

  useEffect(() => {
    if (activeRoom !== room._id) {
      const initialColleagues =
        room.type === "Large Seminar"
          ? ["", "", ""]
          : room.type === "Small Seminar"
            ? ["", ""]
            : [];
      setFormData({
        colleagues: initialColleagues,
        date: "",
        startTime: "",
        endTime: "",
        reason: "",
      });
      setFormError("");
      setSuccessMessage("");
    }
  }, [activeRoom, room._id, room.type]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        const initialColleagues =
          room.type === "Large Seminar"
            ? ["", "", ""]
            : room.type === "Small Seminar"
              ? ["", ""]
              : [];
        setFormData({
          colleagues: initialColleagues,
          date: "",
          startTime: "",
          endTime: "",
          reason: "",
        });
        setSuccessMessage("");
      }, 2000);
    }
  }, [successMessage, room.type]);

  return (
    <div className="lg:w-1/3 w-full p-6 flex flex-col justify-between bg-white shadow-lg rounded-lg relative">
      {activeRoom !== room._id && (
        <div className="absolute inset-0 bg-white/30 backdrop-blur-md border border-white/20 shadow-lg flex flex-col items-center justify-center text-center rounded-xl z-10">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-800 drop-shadow-md">
            Click <span className="text-gray-900">"Book Now"</span> to Start
          </h2>
          <p className="mt-2 text-sm lg:text-base font-normal text-gray-500 drop-shadow-sm">
            Unlock the booking form and reserve your space.
          </p>
        </div>
      )}

      <h5 className="text-2xl font-bold mb-6 text-center text-gray-700">
        Book This Room
      </h5>

      <div className="flex flex-col space-y-6">
        {room.type !== "Open" &&
          formData.colleagues.map((colleague, index) => (
            <div key={`colleague_${index}`} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Colleague {index + 1} Email
              </label>
              <input
                type="email"
                name={`colleague_${index}`}
                value={colleague}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
                required
              />
            </div>
          ))}

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Select Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            required
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Select Time Slot
          </label>
          <select
            value={
              formData.startTime && formData.endTime
                ? `${formData.startTime}-${formData.endTime}`
                : ""
            }
            onChange={handleTimeSlotChange}
            className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
          >
            <option value="" disabled>
              Select Time Slot
            </option>
            <option value="8-10">8:00 AM - 10:00 AM</option>
            <option value="10-12">10:00 AM - 12:00 PM</option>
            <option value="12-2">12:00 PM - 2:00 PM</option>
            <option value="2-4">2:00 PM - 4:00 PM</option>
            <option value="4-6">4:00 PM - 6:00 PM</option>
            <option value="6-8">6:00 PM - 8:00 PM</option>
            <option value="8-10">8:00 PM - 10:00 PM</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Why do you want to book this room?
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            className="p-3 w-full h-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
          />
        </div>

        {/* Error and Success Message */}
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

        <button
          className={`py-3 px-6 bg-gradient-grayMidToRight text-white font-semibold text-lg rounded-lg focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 ${activeRoom !== room._id ? "pointer-events-none opacity-50" : ""}`}
          onClick={handleProceedBooking}
          disabled={isSubmitting}
        >
          Proceed with booking
        </button>
      </div>
    </div>
  );
};

export default RoomCardBookingForm;
