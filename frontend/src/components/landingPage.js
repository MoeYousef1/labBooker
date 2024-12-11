import React from "react";
import Navbar from "./Navbar";
import Footer from "./footer";
import collegeImage1 from './assets/landingPageBackground1.avif';
import collegeImage from './assets/landingPagepic.avif';

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-screen w-full pt-16"> {/* Added pt-16 for navbar space */}

        {/* Background Div with Glass Effect */}
        <div
          className="absolute inset-0 bg-cover bg-center w-full"
          style={{
            backgroundImage: `url(${collegeImage})`,
          }}
        >
          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

          {/* Inner Wrapper for Left (Inner Frame) and Right (Text Content) */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between h-full w-full mt-8 pb-10"> {/* Added pb-10 here */}
            
            {/* Left Div - Inner Frame */}
            <div className="w-full md:w-1/2 h-1/2 flex justify-center items-center p-4">
              <div
                className="relative w-full md:w-4/5 h-4/5 bg-cover bg-center shadow-xl rounded-3xl transform hover:scale-105 transition-all duration-300 ease-in-out"
                style={{
                  backgroundImage: `url(${collegeImage1})`,
                  boxShadow: '0 0 10px rgba(128, 0, 128, 0.5), 0 0 25px rgba(138, 43, 226, 0.7), 0 0 50px rgba(75, 0, 130, 0.6)', // Purple gradient shadow
                }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black opacity-40 rounded-3xl"></div>
              </div>
            </div>

            {/* Right Div - Text Content */}
            <div className="w-full md:w-1/2 flex justify-center items-center text-white text-center p-4">
              <div className="space-y-6">
                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                  <span className="bg-gradient-to-r from-purple-700 to-purple-300 text-transparent bg-clip-text">Book</span> Your Study Room with Ease
                </h1>

                {/* Subtitle */}
                <p className="mt-4 text-lg md:text-xl opacity-80">
                  Simplify your study space planning with just a few clicks.
                </p>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
                  <button
                    className="px-6 py-4 bg-gradient-to-r from-purple-800 to-purple-300 text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
                    onClick={() => window.location.href = '/booking'}
                  >
                    Book Now
                  </button>
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-purple-800 to-purple-300 text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
                    onClick={() => window.location.href = '/login'}
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-10 mt-10">
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-xl font-semibold">Quick Booking</h3>
          <p className="mt-2 text-gray-600">Reserve study rooms in just a few clicks.</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-xl font-semibold">User Dashboard</h3>
          <p className="mt-2 text-gray-600">Manage your bookings with ease.</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-xl font-semibold">Real-Time Availability</h3>
          <p className="mt-2 text-gray-600">Check room availability instantly.</p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
