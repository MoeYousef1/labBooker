import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../utils/axiosConfig';
import Navbar from "../components/Navbar";
import { Calendar, Clock, RefreshCw, X, AlertCircle, CalendarIcon } from 'lucide-react';
import Footer from "../components/footer";
import Modal from '../components/cnfrmModal'; // Adjust the path as needed
import Toast from '../components/errsucModal'; // Adjust the path as needed


const MyBookingsPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    // State for Toast
      const [toast, setToast] = useState({ isVisible: false, type: '', message: '' });

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isBookingPast = (bookingDate, bookingEndTime) => {
    const today = new Date();
    const bookingDateTime = new Date(bookingDate);
    const [hours, minutes] = bookingEndTime.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    return bookingDateTime < today;
  };

  const isBookingCancelable = (booking) => {
    return (
      booking.status.toLowerCase() !== 'canceled' && 
      !isBookingPast(booking.date, booking.endTime)
    );
  };

  const getBookingStatusDisplay = (booking) => {
    if (booking.status.toLowerCase() === 'canceled') {
      return {
        color: 'bg-red-100 text-red-800',
        text: 'Canceled'
      };
    }
    
    if (isBookingPast(booking.date, booking.endTime)) {
      return {
        color: 'bg-gray-100 text-gray-800',
        text: 'Completed'
      };
    }

    if (booking.status.toLowerCase() === 'pending') {
      return {
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Pending'
      };
    }

    return {
      color: 'bg-green-100 text-green-800',
      text: 'Confirmed'
    };
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      
      const response = await api.get('/book/my-bookings', {
        params: {
          userId: user.id,
          email: user.email,
          page: 1,
          limit: 50 // Adjust as needed
        }
      });

      if (response.data.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.response?.data?.message || 'Failed to load bookings');
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    try {
      const bookingId = selectedBookingId;
      setIsModalOpen(false);
      setSelectedBookingId(null);
  
      const response = await api.delete(`/book/booking/${bookingId}`);
      
      if (response.status === 200) {
        // Just update the status to 'Canceled'
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId 
              ? {
                  ...booking,
                  status: 'Canceled'
                }
              : booking
          )
        );
  
        setToast({ 
          isVisible: true, 
          type: 'success', 
          message: 'Booking cancelled successfully. It will be permanently deleted in 3 days.' 
        });
  
        setTimeout(() => {
          setToast({ isVisible: false, type: '', message: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      
      if (error.response?.status === 403) {
        setToast({ 
          isVisible: true, 
          type: 'error', 
          message: 'Cannot cancel this booking - it may be in the past' 
        });
      } else if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setToast({ 
          isVisible: true, 
          type: 'error', 
          message: error.response?.data?.message || 'Failed to cancel booking' 
        });
      }
    }
  };

  const openCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  const getFilteredAndSortedBookings = () => {
    if (!bookings || bookings.length === 0) return [];
  
    return [...bookings]
      .filter(booking => {
        if (!booking || !booking.date || !booking.endTime) return false;
  
        switch(filter) {
          case 'upcoming':
            return !isBookingPast(booking.date, booking.endTime) && 
                   booking.status.toLowerCase() !== 'canceled';
          case 'past':
            return isBookingPast(booking.date, booking.endTime) || 
                   booking.status.toLowerCase() === 'canceled';
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (!a || !a.date) return 1;
        if (!b || !b.date) return -1;
        
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
  };

  const filteredBookings = getFilteredAndSortedBookings();

  // Authentication check
    useEffect(() => {
      const checkAuthentication = () => {
        try {
          const storedUser = localStorage.getItem("user");
          const token = localStorage.getItem("token");
  
          if (storedUser && token) {
            const parsedUser = JSON.parse(storedUser);
            setUserInfo({
              email: parsedUser.email || "",
              username: parsedUser.username || "",
              id: parsedUser.id || "",
            });
          } else {
            navigate("/login");
          }
        } catch (error) {
          console.error("Authentication error:", error);
          navigate("/login");
        }
      };
  
      checkAuthentication();
    }, [navigate]);
  
    // Prevent rendering if not authenticated
    if (!userInfo) {
      return null;
    }

    const ModalContent = () => {
      const selectedBooking = bookings.find(b => b._id === selectedBookingId);
      
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
          Confirm Booking Cancellation
        </h3>
        <div className="text-gray-500">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </div>
      </div>
  
          {selectedBooking && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">Booking Details</h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-500">Room</span>
                    <span className="font-medium">{selectedBooking.roomId?.name}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Date</span>
                    <span className="font-medium">{formatDate(selectedBooking.date)}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Time</span>
                    <span className="font-medium">
                      {selectedBooking.startTime} - {selectedBooking.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Status</span>
                    <span className="font-medium">{selectedBooking.status}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
  
  <div className="text-center">
  <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
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
    This booking will be cancelled and permanently deleted after 3 days
  </div>
</div>
    </div>
  );
};

  // ... Rest of your JSX remains the same ...

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
              userInfo={userInfo} 
              setUserInfo={setUserInfo} 
            />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl pt-20">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 sticky top-20 z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-md text-gray-600 mt-2">
                Manage your lab room reservations
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/labrooms")}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow flex-1 md:flex-none justify-center"
              >
                <CalendarIcon className="w-5 h-5" />
                New Booking
              </button>
              
              <button
                onClick={fetchBookings}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow flex-1 md:flex-none justify-center"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${filter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${filter === 'upcoming' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${filter === 'past' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading your bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {filter === 'all' 
                ? 'No bookings found' 
                : filter === 'upcoming' 
                  ? 'No upcoming bookings' 
                  : 'No past bookings'}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              {filter === 'all' && "Ready to book your first lab room?"}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate("/labrooms")}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-lg"
              >
                Book a Room Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => {
                const statusDisplay = getBookingStatusDisplay(booking);
                const isPast = isBookingPast(booking.date, booking.endTime);
                const canCancel = isBookingCancelable(booking);

                return (
                  <div
                    key={booking._id}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden
                      ${isPast ? 'opacity-75' : ''}`}
                  >
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.roomId?.name || 'Coding Room'}
                        </h3>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <span className="text-base">
                          {formatDate(booking.date)}
                          {isPast && (
                            <span className="ml-2 text-sm text-gray-500">(Past)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="text-base">{booking.startTime} - {booking.endTime}</span>
                      </div>

                      {booking.additionalUsers?.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <p>Additional Users:</p>
                          <ul className="list-disc pl-5">
                            {booking.additionalUsers.map((user, index) => (
                              <li key={index}>{user.email}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {canCancel ? (
                        <button
                          onClick={() => openCancelModal(booking._id)}
                          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                        >
                          <X className="w-4 h-4" />
                          Cancel Booking
                        </button>
                      ) : (
                        <div className="mt-4 text-sm text-gray-500 text-center">
                          {booking.status.toLowerCase() === 'canceled' 
                            ? 'This booking has been canceled'
                            : isPast 
                              ? 'This booking has already passed'
                              : 'This booking cannot be canceled'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
  <p className="text-center text-blue-800 text-sm">
    You can cancel bookings up until their scheduled time.
    Past bookings cannot be modified. Cancelled bookings will be automatically deleted after 3 days.
  </p>
</div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <Modal
  isOpen={isModalOpen}
  onClose={() => { setIsModalOpen(false); setSelectedBookingId(null); }}
  onConfirm={handleCancelBooking}
  message={<ModalContent />}
  confirmText={
    <span className="flex items-center">
      <svg 
        className="w-4 h-4 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
        />
      </svg>
      Cancel Booking
    </span>
  }
  cancelText="Close"
/>
      
            {/* Toast Notification */}
            {toast.isVisible && (
              <Toast
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ ...toast, isVisible: false })}
              />
            )}

      <Footer />
    </div>
  );
};

export default MyBookingsPage;