import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "../components/SideBar";

// Components for booking operations
import BookingOperations from "../components/bookingOperations";
import CretaeBooking from "../components/createBooking";
import UpdateBooking from "../components/updateBooking";
import DeleteBooking from "../components/deleteBooking";

const BookingPage = () => {
  const [operation, setOperation] = useState("create"); // "create", "update", "delete"
  const [bookingId, setBookingId] = useState("");       // ID for update/delete
  const [bookingDetails, setBookingDetails] = useState(null);

  // Called when forms successfully complete an action
  const handleSuccess = (message) => {
    console.log(message);
    setBookingId("");
    setBookingDetails(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 md:px-12 mt-16 sm:mt-0 sm:ml-64"
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-gray-800 text-center mb-8 mt-4"
        >
          Booking Management
        </motion.h1>

        {/* Booking Operations */}
        <div className="w-full max-w-4xl">
          <BookingOperations
            setOperation={setOperation}
            setBookingId={setBookingId}
            setBookingDetails={setBookingDetails}
            operation={operation}
          />
        </div>

        {/* Forms */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mt-6"
        >
          {operation === "create" && (
            <CretaeBooking operation={operation} onSuccess={handleSuccess} />
          )}
          {operation === "update" && (
            <UpdateBooking
              operation={operation}
              bookingId={bookingId}
              bookingDetails={bookingDetails}
              setBookingId={setBookingId}
              setBookingDetails={setBookingDetails}
              onSuccess={handleSuccess}
            />
          )}
          {operation === "delete" && (
            <DeleteBooking
              operation={operation}
              onSuccess={handleSuccess}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BookingPage;
