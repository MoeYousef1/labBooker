import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import { BookOpen, Calendar, Activity, Clock } from 'lucide-react';
import api from '../utils/axiosConfig';
import NextBooking from "../components/NextBooking";
import Toast from '../components/errsucModal';
import Modal from '../components/cnfrmModal';

const HomePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState({ 
    isVisible: false, 
    type: '', 
    message: '', 
    isPersistent: false,
    duration: 5000 
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  // const [showMissedBookingPrompt, setShowMissedBookingPrompt] = useState(false);
  // const [missedBooking, setMissedBooking] = useState(null);
  const navigate = useNavigate();

  const showToast = (type, message, options = {}) => {
    const { isPersistent = false, duration = 5000 } = options;
    setToast({ 
      isVisible: true, 
      type, 
      message, 
      isPersistent,
      duration 
    });

    if (!isPersistent) {
      setTimeout(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
      }, duration);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
  const checkAuthentication = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        navigate("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUserInfo(parsedUser);
    } catch (error) {
      console.error("Authentication error:", error);
      navigate("/login");
    }
  };

  checkAuthentication();
}, [navigate]);

  // Second useEffect for profile updates
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/user/profile");
        setUserInfo(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Failed to fetch updated profile:", error);
      }
    };
  
    fetchProfile();
  }, []);
  

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Missed bookings check effect
// useEffect(() => {
//   const checkMissedBookings = async () => {
//     try {
//       const response = await api.get("/book/booking/missed");
//       if (response.data.success && response.data.booking) {
//         setMissedBooking(response.data.booking);
//         setShowMissedBookingPrompt(true);
//       }
//     } catch (error) {
//       console.error("Error checking missed bookings:", error);
//     }
//   };
//   checkMissedBookings();
// }, []);


  // const handleLateCheckIn = async (wasPresent) => {
  //   try {
  //     const response = await api.post(`/book/booking/${missedBooking._id}/late-check-in`, {
  //       wasPresent
  //     });
  
  //     if (response.data.success) {
  //       showToast(
  //         wasPresent ? 'success' : 'warning',
  //         wasPresent 
  //           ? 'Booking has been marked as completed' 
  //           : 'Booking has been marked as missed',
  //         { duration: 5000 }
  //       );
  //       setShowMissedBookingPrompt(false);
  //       setMissedBooking(null);
  //     }
  //   } catch (error) {
  //     showToast('error', 'Failed to process late check-in', { duration: 5000 });
  //   }
  // };

  // const MissedBookingPrompt = () => (
  //   <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  //     <div className="bg-white rounded-lg p-6 max-w-md mx-4 relative transform transition-all duration-300 ease-out">
  //       <div className="mb-6">
  //         <h3 className="text-lg font-bold text-gray-900 mb-2">
  //           Missed Booking Check
  //         </h3>
  //         <p className="text-gray-600">
  //           We noticed you didn't check in to your booking for room{' '}
  //           <span className="font-semibold">{missedBooking.roomId.name}</span> on{' '}
  //           <span className="font-semibold">{missedBooking.date}</span> at{' '}
  //           <span className="font-semibold">{missedBooking.startTime}</span>.
  //         </p>
  //         <p className="mt-2 text-gray-600">
  //           Were you present for this booking?
  //         </p>
  //       </div>
  //       <div className="flex justify-end space-x-4">
  //         <button
  //           onClick={() => handleLateCheckIn(false)}
  //           className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
  //         >
  //           No, I Missed It
  //         </button>
  //         <button
  //           onClick={() => handleLateCheckIn(true)}
  //           className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
  //         >
  //           Yes, I Was There
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar userInfo={userInfo} setUserInfo={setUserInfo} />

      <main className="flex-grow pt-24 pb-16 container mx-auto px-4">
        {/* Welcome Section */}
        <section className="bg-white/70 backdrop-blur-sm shadow-md rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">{formatTime(currentTime)}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-sm font-medium">{formatDate(currentTime)}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">
                Welcome, {userInfo.username}
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your lab bookings and explore available rooms.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-blue-100/50 p-4 rounded-full shadow-md">
                <Activity className="w-12 h-12 text-blue-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Next Booking Section */}
        <NextBooking 
          showToast={showToast}
          setIsModalOpen={setIsModalOpen}
          setModalConfig={setModalConfig}
          userInfo={userInfo}
        />

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Book a Room Card */}
          <div 
            onClick={() => navigate("/labrooms")}
            className="
              bg-white/70 backdrop-blur-sm rounded-xl p-6 
              shadow-md hover:shadow-xl 
              transition-all duration-300
              cursor-pointer group
              flex items-center space-x-6
              border border-transparent hover:border-blue-200
              relative overflow-hidden
            "
          >
            <div className="
              bg-blue-100/50 text-blue-600 
              rounded-full p-4 
              group-hover:bg-blue-200/50
              transition-colors
              shadow-md
            ">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 
                group-hover:text-blue-600 transition-colors">
                Book a Room
              </h2>
              <p className="text-gray-600">
                Find and reserve available lab rooms
              </p>
            </div>
            <div className="
              absolute bottom-0 right-0 
              bg-blue-50 w-24 h-24 
              -rotate-45 translate-x-1/2 translate-y-1/2
              opacity-0 group-hover:opacity-100 
              transition-opacity duration-300
            "></div>
          </div>

          {/* My Bookings Card */}
          <div 
            onClick={() => navigate("/bookings")}
            className="
              bg-white/70 backdrop-blur-sm rounded-xl p-6 
              shadow-md hover:shadow-xl 
              transition-all duration-300
              cursor-pointer group
              flex items-center space-x-6
              border border-transparent hover:border-green-200
              relative overflow-hidden
            "
          >
            <div className="
              bg-green-100/50 text-green-600 
              rounded-full p-4 
              group-hover:bg-green-200/50
              transition-colors
              shadow-md
            ">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2
                group-hover:text-green-600 transition-colors">
                My Bookings
              </h2>
              <p className="text-gray-600">
                View and manage your current bookings
              </p>
            </div>
            <div className="
              absolute bottom-0 right-0 
              bg-green-50 w-24 h-24 
              -rotate-45 translate-x-1/2 translate-y-1/2
              opacity-0 group-hover:opacity-100 
              transition-opacity duration-300
            "></div>
          </div>
        </div>
      </main>

      <Footer className="mt-auto" />

      {/* Modals and Toasts */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        {...modalConfig}
      />

      {/* {showMissedBookingPrompt && missedBooking && <MissedBookingPrompt />} */}

      {toast.isVisible && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;