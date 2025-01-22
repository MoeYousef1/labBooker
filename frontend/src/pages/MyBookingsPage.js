import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../utils/axiosConfig';
import Navbar from "../components/Navbar";
import { Calendar, Clock, RefreshCw, X, AlertCircle, CalendarIcon } from 'lucide-react';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

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

  const handleCancelBooking = async (bookingId) => {
    try {
      if (!window.confirm('Are you sure you want to cancel this booking?')) {
        return;
      }

      const response = await api.patch(`/book/booking/${bookingId}/status`, {
        status: 'Canceled'
      });

      if (response.data.booking) {
        alert('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      
      if (error.response?.status === 403) {
        alert('Cannot cancel this booking - it may be in the past or already cancelled');
      } else if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const getFilteredAndSortedBookings = () => {
    return [...bookings]
      .filter(booking => {
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
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
  };

  const filteredBookings = getFilteredAndSortedBookings();

  // ... Rest of your JSX remains the same ...

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
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
                          onClick={() => handleCancelBooking(booking._id)}
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
                Past bookings cannot be modified.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookingsPage;