import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BlockUserModal = ({ isOpen, onClose, user, onConfirm }) => {
  const [selectedBlockDuration, setSelectedBlockDuration] = useState("24");
  const [customDuration, setCustomDuration] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedBlockDuration("24");
      setCustomDuration("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const duration = selectedBlockDuration === "custom" 
      ? parseInt(customDuration, 10)
      : parseInt(selectedBlockDuration, 10);
    
    if (duration > 0) {
      onConfirm(duration);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: -20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Block User</h3>
            <p className="mb-6 text-gray-600">
              Blocking <span className="font-semibold text-gray-800">{user?.name || user?.username}</span>. 
              Select duration:
            </p>

            <form onSubmit={handleSubmit}>
              <div className="space-y-2 mb-6">
                {[
                  { value: "24", label: "24 Hours" },
                  { value: "72", label: "3 Days (72 Hours)" },
                  { value: "168", label: "7 Days (168 Hours)" },
                  { value: "720", label: "30 Days (720 Hours)" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="blockDuration"
                      value={option.value}
                      checked={selectedBlockDuration === option.value}
                      onChange={(e) => setSelectedBlockDuration(e.target.value)}
                      className="h-4 w-4 text-green-500 border-gray-300 focus:ring-green-500"
                    />
                    <span className="flex-1 text-gray-700">{option.label}</span>
                  </label>
                ))}
                
                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="blockDuration"
                    value="custom"
                    checked={selectedBlockDuration === "custom"}
                    onChange={(e) => setSelectedBlockDuration(e.target.value)}
                    className="h-4 w-4 text-green-500 border-gray-300 focus:ring-green-500"
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-gray-700">Custom:</span>
                    <input
                      type="number"
                      min="1"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      disabled={selectedBlockDuration !== "custom"}
                      className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      placeholder="Hours"
                    />
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Block User
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