import React from "react";
import { motion } from "framer-motion";

const RoomOperations = ({ setOperation, setRoomId, setRoomDetails, operation }) => {
  const handleOperationChange = (newOperation) => {
    setOperation(newOperation);
    if (newOperation !== "create") {
      setRoomId("");
      setRoomDetails(null);
    }
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
    >
      {[
        { label: "Create Room", operation: "create" },
        { label: "Update Room", operation: "update" },
        { label: "Delete Room", operation: "delete" },
      ].map(({ label, operation: currentOperation }) => (
        <motion.button
          key={currentOperation}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleOperationChange(currentOperation)}
          className={`flex items-center justify-center p-6 bg-white text-gray-800 font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 group ${
            operation === currentOperation
              ? "ring-2 ring-green-500 bg-green-50 text-green-700"
              : ""
          }`}
        >
          {label}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default RoomOperations;
