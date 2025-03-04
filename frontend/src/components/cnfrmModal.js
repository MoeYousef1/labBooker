import React from "react";
import { motion } from "framer-motion";

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmText,
  cancelText,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full my-8 mx-auto transition-colors duration-300"
      >
        {/* Scrollable Content */}
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="p-6 dark:text-gray-100">{message}</div>
        </div>

        {/* Fixed Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-300"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm sm:text-base bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-300"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Modal;
