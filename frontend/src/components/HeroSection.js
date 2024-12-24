import React from "react";
import collegeLogo from '../assets/azraileLogo.png';
import Header from '../assets/header-bg.jpg';

const HeroSection = ({ userInfo }) => {
  // If userInfo is available (after login), display a personalized message
  const renderHeroContent = userInfo ? (
    <>
      <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
        <span className="bg-gradient-to-r from-blue-400 to-blue-800 text-transparent bg-clip-text">
          Welcome, 
        </span>{" "}
        {userInfo.username}!
      </h1>
      <p className="mt-4 text-lg md:text-xl opacity-80">
        Simplify your study space planning with just a few clicks.
      </p>
      <div className="mt-8 flex justify-center items-center space-x-4">
        <div>
          <button
            className="px-6 py-4 bg-gradient-to-r from-blue-400 to-blue-800 hover:from-blue-800 hover:to-blue-400  text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
            onClick={() => window.location.href = '/booking'}
          >
            Book Now
          </button>
        </div>
        <div>
          <button
            className="px-6 py-4 bg-gradient-to-r from-blue-400 to-blue-800 hover:from-blue-800 hover:to-blue-400  text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
            onClick={() => window.location.href = '/dashboard'}
          >
            Dashboard
          </button>
        </div>
      </div>
    </>
  ) : (
    // If userInfo is not available (before login), display a general message
    <>
      <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
        <span className="bg-gradient-to-r from-blue-400 to-blue-800 text-transparent bg-clip-text">
          Book
        </span>{" "}
        Your Study Room with Ease
      </h1>
      <p className="mt-4 text-lg md:text-xl opacity-80">
        Simplify your study space planning with just a few clicks.
      </p>
      <div className="mt-8 flex justify-center items-center space-x-4">
        <div>
          <button
            className="px-6 py-4 bg-gradient-to-r from-blue-400 to-blue-800 hover:from-blue-800 hover:to-blue-400  text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
            onClick={() => window.location.href = '/booking'}
          >
            Book Now
          </button>
        </div>
        <div>
          <button
            className="px-6 py-4 bg-gradient-to-r from-blue-400 to-blue-800 hover:from-blue-800 hover:to-blue-400  text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
            onClick={() => window.location.href = '/login'}
          >
            Login
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative h-screen w-full pt-16">
      <div
        className="absolute inset-0 bg-cover bg-center w-full"
        style={{
          backgroundImage: `url(${Header})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center h-full w-full mt-8 pb-10">
          {/* Left Div - Inner Frame */}
          <div className="w-full md:w-1/2 h-1/2 flex justify-center items-center p-4">
            <div
              className="relative w-full md:w-4/5 h-4/5 bg-white shadow-xl rounded-3xl transform hover:scale-105 transition-all duration-300 ease-in-out"
              style={{
                boxShadow: `
                  0 0 10px rgba(1, 84, 206, 0.7),
                  0 0 20px rgba(0, 130, 180, 0.7),
                  0 0 40px rgba(1, 156, 140, 0.7)
                `,
              }}
            >
              <img
                src={collegeLogo}
                alt="College Logo"
                className="w-full h-full object-contain rounded-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black opacity-30 rounded-3xl"></div>
            </div>
          </div>

          {/* Right Div - Text Content */}
          <div className="w-full md:w-1/2 flex justify-center items-center text-white text-center p-4">
            <div className="space-y-6">
              {renderHeroContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
