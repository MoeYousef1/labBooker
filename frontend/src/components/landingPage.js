import React from "react";
import Navbar from "./Navbar";
import Footer from "./footer";
import highFive from './assets/high-five.png';
import realTimeUpdate from './assets/real-time.png';
import reliability  from './assets/reliability.png';
import Header from './assets/header-bg.jpg'
import collegeLogo from './assets/azraileLogo.png'




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
            backgroundImage: `url(${Header})`,
          }}
        >
          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

          {/* Inner Wrapper for Left (Inner Frame) and Right (Text Content) */}
          <div className="relative z-10 flex flex-col md:flex-row items-center  h-full w-full mt-8 pb-10"> {/* Added pb-10 here */}
            
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
               {/* Responsive Image */}
               <img
                 src={collegeLogo}
                 alt="College Logo"
                 className="w-full h-full object-contain rounded-3xl"
               />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black opacity-30 rounded-3xl">
                </div>
             </div>
           </div>


            {/* Right Div - Text Content */}
            <div className="w-full md:w-1/2 flex justify-center items-center text-white text-center p-4">
              <div className="space-y-6">
                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                  <span className="bg-gradient-to-r from-[rgba(1,84,206,1)] via-[rgba(0,130,180,1)] to-[rgba(1,156,140,1)] text-transparent bg-clip-text">
                    Book
                  </span>{" "}
                  Your Study Room with Ease
                </h1>

                {/* Subtitle */}
                <p className="mt-4 text-lg md:text-xl opacity-80">
                  Simplify your study space planning with just a few clicks.
                </p>

                {/* CTA Buttons */}
                <div className="mt-8 flex justify-center items-center space-x-4">
                 <div>
                   <button
                     className="px-6 py-4 bg-gradient-to-r from-[rgba(1,84,206,1)] via-[rgba(0,130,180,1)] to-[rgba(1,156,140,1)] text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
                     onClick={() => window.location.href = '/booking'}
                   >
                     Book Now
                   </button>
                 </div>
                 <div>
                   <button
                     className="px-6 py-3 bg-gradient-to-r from-[rgba(1,84,206,1)] via-[rgba(0,130,180,1)] to-[rgba(1,156,140,1)] text-white font-medium text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
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

      </div>

      <div className="py-10 border-[10px] px-6"
     style={{
       background: 'linear-gradient(to right, rgba(1, 84, 206, 0.7), rgba(0, 130, 180, 0.7), rgba(1, 156, 140, 0.7))', // Gradient with your colors
     }}>

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
