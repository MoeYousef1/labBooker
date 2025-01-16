import React from "react";
import collegeLogo from "../assets/azraileLogo.png";
import Header from "../assets/header-bg.jpg";

const HeroSection = ({ userInfo }) => {
  const renderHeroContent = userInfo ? (
    <>
      <h1 className="text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold leading-tight">
        <span className="bg-gradient-primaryToRight text-transparent bg-clip-text">
          Welcome,
        </span>{" "}
        {userInfo.username}!
      </h1>
      <p className="mt-4 text-lg md:text-xl xl:text-2xl 2xl:text-3xl opacity-80">
        Simplify your study space planning with just a few clicks.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0">
        <button
          className="px-6 py-3 bg-gradient-primaryToRight text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 hover:bg-gradient-primaryToLeft transition-transform duration-300"
          onClick={() => (window.location.href = "/labrooms")}
        >
          Book Now
        </button>
        <button
          className="px-6 py-3 bg-gradient-primaryToRight text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 hover:bg-gradient-primaryToLeft transition-transform duration-300"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Dashboard
        </button>
      </div>
    </>
  ) : (
    <>
      <h1 className="text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold leading-tight">
        <span className="bg-gradient-primaryToRight text-transparent bg-clip-text">
          Book
        </span>{" "}
        Your Study Room with Ease
      </h1>
      <p className="mt-4 text-lg md:text-xl xl:text-2xl 2xl:text-3xl opacity-80">
        Simplify your study space planning with just a few clicks.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0">
        <button
          className="px-6 py-3 bg-gradient-primaryToRight text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 hover:bg-gradient-primaryToLeft transition-transform duration-300"
          onClick={() => (window.location.href = "/labrooms")}
        >
          Book Now
        </button>
        <button
          className="px-6 py-3 bg-gradient-primaryToRight text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 hover:bg-gradient-primaryToLeft transition-transform duration-300"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Dashboard
        </button>
      </div>
    </>
  );

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${Header})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />

      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16 min-h-screen flex flex-col items-center justify-center">
        {/* Logo & Text side by side on medium+ screens */}
        <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-8 xl:gap-16">
          {/* Logo Container */}
          <div className="flex justify-center items-center transform hover:scale-105 transition duration-300">
            <div className="relative w-64 h-64 md:w-80 md:h-80 xl:w-96 xl:h-96 bg-white shadow-2xl rounded-3xl overflow-hidden mt-20 sm:mt-0">
              <img
                src={collegeLogo}
                alt="College Logo"
                className="w-full h-full object-contain rounded-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30 rounded-3xl" />
            </div>
          </div>

          {/* Hero Text */}
          <div className="flex flex-col items-center text-center text-white max-w-2xl">
            {renderHeroContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
