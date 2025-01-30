import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Message from "./Error_successMessage";
import Modal from "./cnfrmModal"; // Make sure you have the Modal component

const DeleteRoomForm = ({ operation, onSuccess }) => {
  const [roomsList, setRoomsList] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [relatedBookings, setRelatedBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Reset messages
  const resetMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // Reset form
  const resetForm = () => {
    setRoomId("");
    resetMessages();
  };

  // Fetch all rooms for the dropdown
  useEffect(() => {
    const fetchAllRooms = async () => {
      setLoadingRooms(true);
      try {
        const response = await axios.get("http://localhost:5000/api/room/rooms");
        setRoomsList(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load rooms list.");
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchAllRooms();
  }, []);

  const handleRoomSelect = (e) => {
    const selectedRoomId = e.target.value;
    setRoomId(selectedRoomId);
    resetMessages();
    if (selectedRoomId) {
      fetchRelatedBookings(selectedRoomId);
    } else {
      setRelatedBookings([]);
    }
  };

  // Initial delete handler - opens confirmation modal
  const handleDeleteClick = () => {
    if (!roomId) {
      setError("Please select a room first.");
      return;
    }
    setIsModalOpen(true);
  };

  const fetchRelatedBookings = async (roomName) => {
    setLoadingBookings(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/book/bookings/by-room/${roomName}`
      );
      if (response.data.success) {
        setRelatedBookings(response.data.bookings);
      } else {
        setRelatedBookings([]);
      }
    } catch (err) {
      setRelatedBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Actual delete handler after confirmation
  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    setLoading(true);
    resetMessages();

    try {
      // Delete room (this should cascade delete bookings on the backend)
      const response = await axios.delete(
        `http://localhost:5000/api/room/rooms/${roomId}`
      );
      
      if (response.status === 200) {
        const deletedRoom = roomsList.find(room => room.name === roomId);
        const successMsg = (
          <div className="space-y-2">
            <p>Room and associated bookings successfully deleted!</p>
            <div className="text-sm bg-green-50 p-3 rounded-md">
              <p className="font-medium text-green-800">Deleted Room Details:</p>
              <ul className="mt-1 text-green-700">
                <li>Name: {deletedRoom.name}</li>
                <li>Type: {deletedRoom.type}</li>
                <li>Capacity: {deletedRoom.capacity}</li>
              </ul>
              <p className="mt-2 font-medium text-green-800">
                Number of deleted bookings: {relatedBookings.length}
              </p>
            </div>
          </div>
        );

        setRoomsList((prev) => prev.filter((room) => room.name !== roomId));
        resetForm();
        setSuccessMessage(successMsg);
        onSuccess?.();
        setTimeout(resetMessages, 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting room.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Modal content component
  const ModalContent = () => {
    const selectedRoom = roomsList.find(room => room.name === roomId);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 text-red-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-full w-full"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Confirm Room Deletion
          </h3>
          <p className="text-gray-500">
            Are you sure you want to delete this room? This action cannot be undone.
          </p>
        </div>

        {selectedRoom && (
          <div className="space-y-4">
            {/* Room Details */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">Room Details</h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500 uppercase">Name</span>
                    <p className="text-sm font-medium text-gray-900">{selectedRoom.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500 uppercase">Type</span>
                    <p className="text-sm font-medium text-gray-900">{selectedRoom.type}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500 uppercase">Capacity</span>
                    <p className="text-sm font-medium text-gray-900">{selectedRoom.capacity}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Bookings */}
            {relatedBookings.length > 0 && (
              <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                <div className="px-4 py-3 bg-red-100 border-b border-red-200">
                  <h4 className="text-sm font-medium text-red-700">
                    Associated Bookings to be Deleted ({relatedBookings.length})
                  </h4>
                </div>
                <div className="p-4">
                  <div className="max-h-40 overflow-y-auto">
                    {relatedBookings.map((booking, index) => (
                      <div 
                        key={booking._id}
                        className={`text-sm p-2 ${
                          index % 2 === 0 ? 'bg-red-50' : 'bg-white'
                        }`}
                      >
                        <p className="text-red-700">
                          Date: {booking.date} | Time: {booking.startTime}-{booking.endTime} |
                          User: {booking.username}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            <svg 
              className="w-4 h-4 inline mr-1 -mt-0.5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            This will permanently delete the room and {relatedBookings.length} associated booking(s)
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto p-10 bg-gray-50 rounded-lg shadow-xl mb-4"
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Delete Room
        </h2>

        <div className="space-y-6">
          {/* Room Selection */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Select Room
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Rooms
              </label>
              <select
                value={roomId}
                onChange={handleRoomSelect}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                disabled={loadingRooms}
              >
                <option value="" disabled>Choose a Room</option>
                {roomsList.map((room) => (
                  <option key={room._id} value={room.name}>
                    {room.name} - {room.type} (Capacity: {room.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Room Details Preview */}
            {roomId && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Room Details</h4>
                {(() => {
                  const selectedRoom = roomsList.find(room => room.name === roomId);
                  return selectedRoom ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="block text-gray-500">Name</span>
                        <span className="font-medium">{selectedRoom.name}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500">Type</span>
                        <span className="font-medium">{selectedRoom.type}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500">Capacity</span>
                        <span className="font-medium">{selectedRoom.capacity}</span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="text-center">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Message 
                    message={error} 
                    type="error" 
                    onClose={() => setError("")}
                  />
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Message 
                    message={successMessage} 
                    type="success" 
                    onClose={() => setSuccessMessage("")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            {roomId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={loading || !roomId}
              className={`px-6 py-3 rounded-lg shadow-md transition-colors
                ${loading || !roomId
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-400'
                }`}
            >
              {loading ? "Deleting..." : "Delete Room"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title=""
        message={<ModalContent />}
        confirmText={loading ? "Deleting..." : "Delete Room"}
        cancelText="Cancel"
      />
    </>
  );
};

export default DeleteRoomForm;