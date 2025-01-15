import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API requests
import Message from "./Error_successMessage"; // Import the Message component

const RoomCardBookingForm = ({ room, activeRoom, userInfo, handleStartBooking }) => {
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
          }
        );

        if (response.status === 201) {
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

  const closeModal = () => {
    handleStartBooking();
    setFormData({
      colleagues: room.type === "Large Seminar" ? ["", "", ""] : room.type === "Small Seminar" ? ["", ""] : [],
      date: "",
      startTime: "",
      endTime: "",
      reason: "",
    });
    setFormError("");
    setSuccessMessage("");
  };

  if (activeRoom !== room._id) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="w-full max-w-xs sm:max-w-xl med:max-w-2xl lg:max-w-3xl p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-sm sm:text-lg med:text-xl font-bold text-gray-800">
           Booking form for {room.name}
          </h2>
          <button
            className="text-gray-500 hover:text-red-500 text-2xl"
            onClick={closeModal}
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
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
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
                  required
                />
              </div>
            ))}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
              required
            />
          </div>

          <div>
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
              className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
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

          {/* <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              Why do you want to book this room?
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="p-3 w-full h-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
            />
          </div> */}

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
            className="py-4 px-4 text-xs med:text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            onClick={handleProceedBooking}
            disabled={isSubmitting}
          >
            Proceed with booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCardBookingForm;
