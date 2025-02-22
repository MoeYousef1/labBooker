import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Badge, X } from "lucide-react";

const RoleEditModal = ({ isOpen, onClose, user, onSave }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role);

  const handleSave = () => {
    onSave(selectedRole);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <User size={20} className="text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit {user?.name}'s Role
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Role
                </label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-3 pl-11 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                  >
                    <option value="user">
                      <span className="flex items-center gap-2">
                        <User size={16} /> User
                      </span>
                    </option>
                    <option value="admin">
                      <span className="flex items-center gap-2">
                        <Shield size={16} /> Admin
                      </span>
                    </option>
                    <option value="manager">
                      <span className="flex items-center gap-2">
                        <Badge size={16} /> Manager
                      </span>
                    </option>
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {selectedRole === "admin" ? (
                      <Shield size={20} />
                    ) : selectedRole === "manager" ? (
                      <Badge size={20} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoleEditModal;