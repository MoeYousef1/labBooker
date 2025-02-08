import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../utils/axiosConfig";
import {
  Clock,
  Calendar,
  MapPin,
  Download,
  Calendar as CalendarIcon,
  X,
  CheckCircle,
  AlertTriangle,
  Lock,
  Activity,
} from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const NextBooking = ({ showToast, setIsModalOpen, setModalConfig, userInfo }) => {
  const [booking, setBooking] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [bookingState, setBookingState] = useState("upcoming");
  const [canCancel, setCanCancel] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRefetch, setShouldRefetch] = useState(true);
  const [lastCheckInReminder, setLastCheckInReminder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const intervalRef = useRef(null);
  const bookingRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    bookingRef.current = booking;
  }, [booking]);

  const formatTime = useCallback((seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleCheckIn = async () => {
    if (!booking) return;
    if (userInfo.email !== booking.userId.email) return;
    try {
      setIsUpdatingStatus(true);
      setBooking(prev => ({ ...prev, checkedIn: true }));
      setIsTransitioning(true);
      const response = await api.post(`/book/booking/${booking._id}/check-in`);
      if (response.data.success) {
        showToast("success", "Successfully checked in to the room");
        setIsTransitioning(true);
        const newTimeout = setTimeout(() => {
          setBooking((prev) => ({ ...prev, checkedIn: true }));
          setIsTransitioning(false);
          setLastCheckInReminder(null);
        }, 300);
        transitionTimeoutRef.current = newTimeout;
      }
      setShouldRefetch(true);
    } catch (error) {
      setBooking((prev) => ({ ...prev, checkedIn: true }));
      console.error("Error checking in:", error);
      showToast("error", error.response?.data?.message || "Failed to check in");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !userInfo) return;
    
    if (booking.userId.email !== userInfo.email) {
      showToast("error", "Only the booking owner can cancel the reservation");
      return;
    }

    try {
      setBooking(null);
      setIsTransitioning(true);
      setIsModalOpen(false);
      const response = await api.delete(`/book/booking/${booking._id}`);
      setShouldRefetch(true);

      if (response.status === 200) {
        showToast("success", "Booking cancelled successfully");
        setShouldRefetch(true);
      }
    } catch (error) {
      setBooking(booking);
      console.error("Error cancelling booking:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  };

  const handleDownloadICS = useCallback(() => {
    if (!booking) return;

    const eventTitle = `Lab Booking: ${booking.roomId.name}`;
    const eventStart = new Date(`${booking.date}T${booking.startTime}:00`);
    const eventEnd = new Date(`${booking.date}T${booking.endTime}:00`);

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LabBooker//EN",
      "BEGIN:VEVENT",
      `UID:${booking._id}@labbooker.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(eventStart)}`,
      `DTEND:${formatDate(eventEnd)}`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:Your lab booking for room ${booking.roomId.name}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "booking.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [booking]);

  const getGoogleCalendarUrl = useCallback((booking) => {
    if (!booking) return "";

    const eventTitle = encodeURIComponent(`Lab Booking: ${booking.roomId.name}`);
    const eventDetails = encodeURIComponent(
      `Your lab booking for room ${booking.roomId.name}`
    );
    const formatDateForGoogle = (dateStr, timeStr) => {
      const date = new Date(`${dateStr}T${timeStr}:00`);
      return date.toISOString().replace(/[-:.]/g, "");
    };
    const start = formatDateForGoogle(booking.date, booking.startTime);
    const end = formatDateForGoogle(booking.date, booking.endTime);

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${start}/${end}&details=${eventDetails}`;
  }, []);

  const showCheckInReminderToast = useCallback(() => {
    const now = new Date();
    if (!lastCheckInReminder || now - lastCheckInReminder >= 5 * 60 * 1000) {
      showToast("warning", "You have not checked in to your booking", {
        isPersistent: false,
        duration: 10000,
      });
      setLastCheckInReminder(now);
    }
  }, [lastCheckInReminder, showToast]);

  useEffect(() => {
    const fetchNextBooking = async () => {
      if (!shouldRefetch) return;
      
      try {
        setIsLoading(true);
        const response = await api.get("/book/booking/next");
        if (response.data.success) {
          const newBooking = response.data.booking;
          if (
            !bookingRef.current ||
            newBooking?._id !== bookingRef.current?._id
          ) {
            setIsTransitioning(true);
            const newTimeout = setTimeout(() => {
              setBooking(newBooking);
              setIsTransitioning(false);
              setShowLeaveAlert(false);
              setLastCheckInReminder(null);
              setIsUpdatingStatus(false);
            }, 300);
            transitionTimeoutRef.current = newTimeout;
          } else {
            setBooking(newBooking);
          }
        } else {
          setBooking(null);
        }
        setShouldRefetch(false);
      } catch (error) {
        console.error("Error fetching next booking:", error);
        showToast("error", "Failed to fetch booking details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextBooking();
  }, [shouldRefetch, showToast]);

  useEffect(() => {
    if (!booking) return;
    if (!booking.date || !booking.startTime || !booking.endTime) return;

    const updateBookingState = async () => {
      const now = new Date();
      const bookingStart = new Date(`${booking.date}T${booking.startTime}:00`);
      const bookingEnd = new Date(`${booking.date}T${booking.endTime}:00`);
      const timeToStart = bookingStart.getTime() - now.getTime();
      const timeToEnd = bookingEnd.getTime() - now.getTime();

     // 1) If booking end time is past, just clear it
  if (timeToEnd <= 0) {
    clearInterval(intervalRef.current);
    setShouldRefetch(true);
    setBooking(null);
    return;
  }
      

      if (timeToStart > 0) {
        setTimeRemaining(Math.floor(timeToStart / 1000));
        setBookingState("upcoming");
        setCanCancel(timeToStart > 2 * 60 * 60 * 1000);
        const totalWaitTime = bookingStart.getTime() - new Date(booking.createdAt).getTime();
        const elapsedWaitTime = now.getTime() - new Date(booking.createdAt).getTime();
        setProgress(Math.max(0, Math.min((elapsedWaitTime / totalWaitTime) * 100, 100)));
      } else {
        setTimeRemaining(Math.floor(timeToEnd / 1000));
        setBookingState("active");
        const totalDuration = bookingEnd.getTime() - bookingStart.getTime();
        const elapsed = now.getTime() - bookingStart.getTime();
        setProgress(Math.max(0, Math.min((elapsed / totalDuration) * 100, 100)));

        const minutesLeft = Math.floor(timeToEnd / (1000 * 60));
        if (!booking.checkedIn) {
          showCheckInReminderToast();
        } else if (minutesLeft <= 14 && minutesLeft > 2) {
          setShowLeaveAlert("warning");
        } else if (minutesLeft <= 3) {
          setShowLeaveAlert("urgent");
        }
      }
    };

    const newInterval = setInterval(updateBookingState, 1000);
    intervalRef.current = newInterval;
    updateBookingState();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [booking, showCheckInReminderToast, isUpdatingStatus]);

  useEffect(() => {
    const currentNotificationTimeout = notificationTimeoutRef.current;
    const currentTransitionTimeout = transitionTimeoutRef.current;
    const currentInterval = intervalRef.current;

    return () => {
      if (currentInterval) clearInterval(currentInterval);
      if (currentNotificationTimeout) clearTimeout(currentNotificationTimeout);
      if (currentTransitionTimeout) clearTimeout(currentTransitionTimeout);
    };
  }, []);

  useEffect(() => {
    const updateStatus = async () => {
      if (booking?.status === 'active' && timeRemaining <= 0) {
        setIsTransitioning(true);
        // Force immediate refresh
        setShouldRefetch(true);
      }
    };
    updateStatus();
  }, [booking?.status, timeRemaining]);

  const ModalContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-14 w-14 text-red-500">
          <AlertTriangle className="h-full w-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Confirm Booking Cancellation
        </h3>
        <div className="text-gray-500">
          Are you sure you want to cancel this booking? This action cannot be
          undone.
        </div>
      </div>
      {booking && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-700">
              Booking Details
            </h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500">Room</span>
                <span className="font-medium">{booking.roomId?.name}</span>
              </div>
              <div>
                <span className="block text-gray-500">Date</span>
                <span className="font-medium">{booking.date}</span>
              </div>
              <div>
                <span className="block text-gray-500">Time</span>
                <span className="font-medium">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
              <div>
                <span className="block text-gray-500">Status</span>
                <span className="font-medium">{booking.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAlerts = () => {
    if (!booking || bookingState !== "active" || !booking.checkedIn) return null;
    if (showLeaveAlert === "warning") {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <Clock className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your booking will end in less than 15 minutes. Please prepare to leave the room.
              </p>
            </div>
          </div>
        </div>
      );
    }
    if (showLeaveAlert === "urgent") {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Your booking ends in less than 3 minutes! Please leave the room immediately.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md mb-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-[6px] bg-blue-50 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-800 text-lg font-medium mb-2">Loading your booking</p>
          <p className="text-gray-500 text-sm">Please wait while we fetch your details</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md mb-8 transform transition-all duration-300 ease-in-out">
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Upcoming Bookings
          </h3>
          <p className="text-gray-600">
            You don't have any upcoming reservations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-md mb-8 transform  ease-in-out transition-opacity duration-300 ${
        isTransitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 space-x-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Clock className="w-6 h-6 mr-3 text-blue-600" />
            {bookingState === "active" ? "Current Booking" : "Upcoming Booking"}
          </h2>
          {bookingState === "active" && booking.checkedIn && (
            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Activity className="w-4 h-4 mr-1" />
              Currently Active
            </span>
          )}
        </div>
        <div className="w-20 h-20">
          <CircularProgressbar
            value={progress}
            text={`${Math.round(progress)}%`}
            styles={buildStyles({
              pathColor:
                bookingState === "active"
                  ? `rgba(22, 163, 74, ${progress / 100})`
                  : `rgba(59, 130, 246, ${progress / 100})`,
              textColor:
                bookingState === "active" ? "#15803d" : "#1e40af",
              trailColor: "#ddd",
            })}
          />
        </div>
      </div>

      {renderAlerts()}

      {/* Booking Details */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Date */}
        <div className="bg-blue-50/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold text-gray-800">{booking.date}</p>
            </div>
          </div>
        </div>
        {/* Room */}
        <div className="bg-green-50/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Room</p>
              <p className="font-semibold text-gray-800">{booking.roomId.name}</p>
            </div>
          </div>
        </div>
        {/* Time */}
        <div className="bg-purple-50/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {bookingState === "active" ? "Ends at" : "Starts at"}
              </p>
              <p className="font-semibold text-gray-800">
                {bookingState === "active" ? booking.endTime : booking.startTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Remaining */}
      <div className="bg-gray-50/50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {bookingState === "active" ? "Time Remaining" : "Time Until Start"}
          </span>
          <span
            className={`text-2xl font-bold ${
              bookingState === "active" ? "text-green-600" : "text-blue-600"
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {bookingState === "upcoming" && (
          <>
            {/* Cancel Button */}
            {canCancel && booking.userId.email === userInfo.email ? (
              <button
                onClick={() => {
                  setModalConfig({
                    title: "Cancel Booking",
                    message: <ModalContent />,
                    onConfirm: handleCancelBooking,
                    confirmText: "Cancel Booking",
                    cancelText: "Keep Booking"
                  });
                  setIsModalOpen(true);
                }}
                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Cancel Booking</span>
              </button>
            ) : (
              <div className="flex-1 bg-gray-100 text-gray-500 font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Cannot Cancel</span>
              </div>
            )}
            {/* Calendar Buttons */}
            <button
              onClick={handleDownloadICS}
              className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download ICS</span>
            </button>
            <a
              href={getGoogleCalendarUrl(booking)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Add to Google Calendar</span>
            </a>
          </>
        )}

{/* {bookingState === "active" && !booking.checkedIn && (
  <button
    disabled={userInfo.email !== booking.userId.email}
    className={`w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${userInfo.email !== booking.userId.email ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {userInfo.email !== booking.userId.email
      ? "Only main booker can check in"
      : "Check In"}
  </button>
)} */}

{bookingState === "active" && !booking.checkedIn && (
          <button
            onClick={handleCheckIn}
            disabled={userInfo.email !== booking.userId.email}
            className={`w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${userInfo.email !== booking.userId.email ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
            <CheckCircle className="w-5 h-5" />
            <span>{userInfo.email !== booking.userId.email
      ? "Only main booker can check in"
      : "I'm in the room"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default NextBooking;