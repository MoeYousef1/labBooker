// BookingOperations.jsx
import React from "react";
import { motion } from "framer-motion";
import { Calendar, Edit, Trash } from 'lucide-react'; // Added icons for better mobile display

const BookingOperations = ({
  setOperation,
  setBookingId,
  setBookingDetails,
  operation
}) => {
  const handleOperationChange = (newOperation) => {
    setOperation(newOperation);
    if (newOperation !== "create") {
      setBookingId("");
      setBookingDetails(null);
    }
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  const operations = [
    { label: "Create Booking", operation: "create", icon: Calendar },
    { label: "Update Booking", operation: "update", icon: Edit },
    { label: "Delete Booking", operation: "delete", icon: Trash },
  ];

  return (
      <motion.div
        initial="initial"
        animate="animate"
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8"
      >
        {operations.map(({ label, operation: currentOperation, icon: Icon }) => (
          <motion.button
            key={currentOperation}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleOperationChange(currentOperation)}
            className={`min-h-[64px] sm:min-h-0 flex flex-col sm:flex-row items-center justify-center p-4 sm:p-6 bg-white text-gray-800 font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 group ${
              operation === currentOperation
                ? "ring-2 ring-green-500 bg-green-50 text-green-700"
                : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0" />
              <span className="text-xs sm:text-sm md:text-base text-center sm:text-left">
                {label}
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    );
};

export default BookingOperations;