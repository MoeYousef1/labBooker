import React from "react";
import { motion } from "framer-motion";

const RoomOperations = ({ setOperation, setRoomId, setRoomDetails }) => {
  const handleOperationChange = (operation) => {
    setOperation(operation);
    if (operation !== "create") {
      setRoomId("");
      setRoomDetails(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
    >
      {[
        { label: "Create Room", operation: "create" },
        { label: "Update Room", operation: "update" },
        { label: "Delete Room", operation: "delete" },
      ].map(({ label, operation }) => (
        <motion.button
          key={operation}
          onClick={() => handleOperationChange(operation)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-4 bg-green-500 text-white rounded-lg shadow-md hover:from-green-600 hover:to-teal-600 focus:ring-2 focus:ring-green-400 transition-all duration-300"
        >
          {label}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default RoomOperations;
