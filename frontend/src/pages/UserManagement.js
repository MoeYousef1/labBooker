import React, { useEffect, useState, useCallback } from "react";
import { SidebarLayout } from "../components/SidebarLayout";
import { ShieldAlert, User, Trash2, Edit, Ban, CircleX } from "lucide-react";
import api from "../utils/axiosConfig";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import RoleEditModal from "../components/RoleEditModal";
import BlockUserModal from "../components/BlockUserModal";
import ConfirmationModal from "../components/cnfrmModal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async (page = pagination.page, role = selectedRole, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await api.get("/user/admin/users", {
        params: {
          page,
          limit: pagination.limit,
          role: role !== "all" ? role : undefined,
          search,
        },
      });
      
      setUsers(response.data.docs);
      setPagination(prev => ({
        ...prev,
        page: response.data.page,
        totalPages: response.data.totalPages,
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, selectedRole, searchTerm]);

  // Initial fetch on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, pagination.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, selectedRole, searchTerm);
  };

  const handleRoleUpdate = async (newRole) => {
    try {
      await api.patch(`/user/admin/users/${selectedUser._id}/role`, { role: newRole });
      toast.success("Role updated successfully");
      fetchUsers();
      setShowRoleModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleBlockUser = async (duration) => {
    try {
      await api.patch(`/user/admin/users/${selectedUser._id}/block`, { blockDuration: duration });
      toast.success("User blocked successfully");
      fetchUsers();
      setShowBlockModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block user");
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await api.patch(`/user/admin/users/${userId}/unblock`);
      toast.success("User unblocked successfully");
      fetchUsers();
      setShowUnblockModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock user");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      try {
        await api.delete(`/user/admin/users/${userId}`);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  return (
    <SidebarLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full p-6 sm:p-8 md:p-10"
      >
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="h-12 w-12 border-4 border-white border-t-transparent rounded-full"
            />
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-gray-800 mb-8"
          >
            User Management
          </motion.h1>
          
          {/* Search Form */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="flex flex-grow gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full p-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-green-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                Search
              </button>
            </div>
            <select
              className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </motion.form>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {users.map((user) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{user.name || user.username}</p>
                              <p className="text-sm text-gray-500">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            user.role === "admin" ? "bg-red-100 text-red-800" :
                            user.role === "manager" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.cancellationStats?.blockedUntil &&
                            new Date(user.cancellationStats.blockedUntil) > new Date() ? (
                              <span className="text-red-600 flex items-center gap-1.5">
                                <ShieldAlert size={16} />
                                Blocked
                              </span>
                            ) : (
                              <span className="text-green-600 flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Active
                              </span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedUser(user);
                                setShowRoleModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition-colors"
                            >
                              <Edit size={18} />
                            </motion.button>
                            {user.cancellationStats?.blockedUntil ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUnblockModal(true);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg text-green-600 transition-colors"
                              >
                                <CircleX size={18} />
                              </motion.button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowBlockModal(true);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg text-yellow-600 transition-colors"
                              >
                                <Ban size={18} />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(user._id)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center mt-6"
          >
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Previous
            </button>
            <span className="text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Modals */}
        <RoleEditModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          user={selectedUser}
          onSave={handleRoleUpdate}
        />

        <BlockUserModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          user={selectedUser}
          onConfirm={handleBlockUser}
        />

        <ConfirmationModal
          isOpen={showUnblockModal}
          onClose={() => setShowUnblockModal(false)}
          onConfirm={() => handleUnblock(selectedUser?._id)}
          message={`Are you sure you want to unblock ${selectedUser?.name || selectedUser?.username}?`}
          confirmText="Unblock"
          cancelText="Cancel"
        />
      </motion.div>
    </SidebarLayout>
  );
};

export default UserManagement;