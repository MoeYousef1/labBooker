import React from "react";
import Navbar from "./Navbar";
import Footer from "./footer";
import collegeImage1 from './assets/landingPageBackground1.avif';
import collegeImage from './assets/landingPagepic.avif';
import highFive from './assets/high-five.png';
import realTimeUpdate from './assets/real-time.png';
import reliability  from './assets/reliability.png';



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
                    className="px-6 py-3 bg-gradient-to-r from-purple-800 to-purple-300 text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
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

      <div className="bg-gradient-to-r from-purple-800 to-purple-300 py-10 border-[10px] px-6">
  <h3 className="text-2xl font-bold text-center mb-6">Why You'll Love It</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
    <div className="relative border-8 p-6 overflow-hidden">
      <img src={highFive} alt="Feature 1" className="mx-auto w-16 h-16" />
      <h4 className="text-lg font-bold mt-4 text-black !important">User-Friendly</h4>
      <p className="text-sm mt-2  text-black !important">Easy-to-navigate platform for hassle-free bookings.</p>
    </div>
    <div className="relative border-8 p-6 overflow-hidden">
      <img src={realTimeUpdate} alt="Feature 2" className="mx-auto w-16 h-16" />
      <h4 className="text-lg font-bold mt-4 text-black !important">Real-Time Updates</h4>
      <p className="text-sm mt-2 text-black !important">Get real-time availability status.</p>
    </div>
    <div className="relative border-8 p-6 overflow-hidden">
      <img src={reliability} alt="Feature 3" className="mx-auto w-16 h-16" />
      <h4 className="text-lg font-bold mt-4 text-black !important">Reliable</h4>
      <p className="text-sm mt-2 text-black !important">Always accurate and up-to-date information.</p>
    </div>
  </div>
</div>





      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
