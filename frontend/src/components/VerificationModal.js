// components/VerificationModal.jsx
import React from "react";
import { X } from "lucide-react";
import Message from "./Error_successMessage";

const VerificationModal = ({
  isOpen,
  email,
  code,
  error,
  onCodeChange,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Close button */}
          <div className="flex justify-end p-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-6 pb-6 pt-2">
            <h3 className="text-center text-xl font-semibold text-gray-800">
              Verify Email Change
            </h3>
            <p className="mt-2 text-center text-gray-600">
              Please enter the verification code sent to:
              <span className="block font-medium text-gray-800">{email}</span>
            </p>

            <div className="mt-4">
              <input
                type="text"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="000000"
              />
            </div>

            {/* Display modal-specific error */}
            {error && (
              <div className="my-4 text-center">
                <Message
                  message={error}
                  type="error"
                  onClose={() =>
                    // Clear the modal error when user dismisses the message
                    onCodeChange("") ||
                    onClose() // or just remove the error field if you prefer
                  }
                />
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-4">
              <button
                type="button"
                onClick={onConfirm}
                className="w-full sm:w-auto px-6 py-3 bg-white text-green-500 rounded-lg shadow-md hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400 transition-all duration-300"
              >
                Verify
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 focus:ring-2 focus:ring-green-400 border border-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
