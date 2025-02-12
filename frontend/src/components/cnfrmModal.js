import React from 'react';
import { motion } from 'framer-motion';

const Modal = ({ isOpen, onClose, onConfirm, message, confirmText, cancelText }) => {
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
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full my-8 mx-auto"
      >
        {/* Scrollable Content */}
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="p-6">
            {message}
          </div>
        </div>

        {/* Fixed Actions */}
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm sm:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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