import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, Clock, X, AlertTriangle } from "lucide-react";

const BlockUserModal = ({ isOpen, onClose, user, onConfirm }) => {
  const [selectedBlockDuration, setSelectedBlockDuration] = useState("24");
  const [customDuration, setCustomDuration] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedBlockDuration("24");
      setCustomDuration("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const duration =
      selectedBlockDuration === "custom"
        ? parseInt(customDuration, 10)
        : parseInt(selectedBlockDuration, 10);

    if (!duration || duration <= 0) {
      setError("Please enter a valid duration (minimum 1 hour)");
      return;
    }

    onConfirm(duration);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 my-8"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                  <Ban size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  Block {user?.name || user?.username}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Select duration for blocking this user account. During this
                period, the user will not be able to{" "}
                <span className="text-red-600/80 dark:text-red-400">
                  Book Any Room
                </span>
              </p>

              <div className="space-y-3">
                {[
                  { value: "24", label: "24 Hours", time: "1 Day" },
                  { value: "72", label: "72 Hours", time: "3 Days" },
                  { value: "168", label: "168 Hours", time: "7 Days" },
                  { value: "720", label: "720 Hours", time: "30 Days" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg cursor-pointer transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <input
                      type="radio"
                      name="blockDuration"
                      value={option.value}
                      checked={selectedBlockDuration === option.value}
                      onChange={(e) => {
                        setSelectedBlockDuration(e.target.value);
                        setError("");
                      }}
                      className="h-4 w-4 text-red-500 border-gray-300 focus:ring-red-500 dark:border-gray-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {option.time}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {option.label}
                      </p>
                    </div>
                    <Clock
                      size={18}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  </label>
                ))}

                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="blockDuration"
                      value="custom"
                      checked={selectedBlockDuration === "custom"}
                      onChange={(e) => {
                        setSelectedBlockDuration(e.target.value);
                        setError("");
                      }}
                      className="h-4 w-4 text-red-500 border-gray-300 focus:ring-red-500 dark:border-gray-500"
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      Custom Duration
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3 pl-7">
                    <input
                      type="number"
                      min="1"
                      value={customDuration}
                      onChange={(e) => {
                        setCustomDuration(e.target.value);
                        setError("");
                      }}
                      disabled={selectedBlockDuration !== "custom"}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 disabled:opacity-50 text-sm bg-white dark:bg-gray-700 dark:text-gray-200"
                      placeholder="Enter hours"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap sm:self-center">
                      Hours
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg mt-3">
                    <AlertTriangle size={16} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-row justify-end gap-3 sm:space-y-0 space-y-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm sm:text-base bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlockUserModal;
