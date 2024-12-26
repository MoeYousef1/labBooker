import { useState, useEffect } from "react";
import { MdDashboard } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { RiLogoutBoxLine } from "react-icons/ri";
import {useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setUserInfo] = useState({ email: "", username: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserInfo({
          email: parsedUser.email || "",
          username: parsedUser.username || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      navigate("/login"); // Redirect to login if no user data is found
    }
  }, [navigate]);

  // Toggle sidebar state
  const toggleSidebar = () => {
    setIsOpen(prevState => !prevState); // Toggle the state between open and closed
  };

  // Close sidebar when clicked outside
  const handleOutsideClick = (e) => {
    // Only close if the click is outside the sidebar
    if (e.target.closest('.sidebar-container') === null) {
      setIsOpen(false);
    }
  };

  const handleBackHomeClick = () => {
    navigate("/homepage");
  };

   // Handle logout action
   const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/login");
  };

  return (
    <div className="flex h-full relative">
      {/* Sidebar */}
      <div
        className={`sidebar-container h-screen w-auto bg-gradient-to-r from-blue-400 to-blue-800 text-white p-4 shadow-xl transition-all duration-300 
          ${isOpen ? 'block fixed top-0 left-0 z-50' : 'hidden sm:block sm:static'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">LabBooker™</h2>
          <button 
            className="sm:hidden p-2 text-white"
            onClick={toggleSidebar} // Close the sidebar when the close button is clicked
          >
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul>
          <li className="py-2 px-4 hover:bg-blue-950 cursor-pointer rounded">
            <div className="flex items-center space-x-3">
            <MdDashboard className="w-5 h-5" />
            <button
                onClick={() => navigate("/dashboard")} // Use navigate to go to the homepage
              >
                Dashboard
              </button>
            </div>
          </li>
          <li className="py-2 px-4 hover:bg-blue-950 cursor-pointer rounded">
            <div className="flex items-center space-x-3">
            <FaUser className="w-5 h-5" />
            <button
                onClick={() => navigate("/myprofile")} // Use navigate to go to the homepage
              >
               My Profile
              </button>
            </div>
          </li>
          <li className="py-2 px-4 hover:bg-blue-950 cursor-pointer rounded">
            <div className="flex items-center space-x-3">
            <IoIosSettings className="w-5 h-5" />
            <button
                onClick={() => navigate("/accountsettings")} // Use navigate to go to the homepage
              >
                Settings
              </button>
            </div>
          </li>
          <li className="py-2 px-4 hover:bg-blue-950 cursor-pointer rounded">
            <div className="flex items-center space-x-3">
            <FaHome className="w-5 h-5" />
            <button
                    onClick={handleBackHomeClick} >
                    Home

                  </button>
            </div>
          </li>
        </ul>
        <ul>
        <li className="py-2 px-4 hover:bg-blue-950 cursor-pointer rounded absolute bottom-10 ">
            <div className="flex items-center space-x-3">
            <RiLogoutBoxLine className="w-5 h-5" />
            <button
                    onClick={handleLogout} >
                    Log Out

                  </button>
            </div>
          </li>
        </ul>
      </div>

        {/* Mobile Menu Overlay (For closing the sidebar on click outside) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 sm:hidden"
          onClick={handleOutsideClick} // Close sidebar when clicked outside
        ></div>
      )}

      {/* Mobile Menu Toggle Button */}
      <button 
        className="sm:hidden p-4 text-white bg-gradient-to-r from-blue-400 to-blue-800 shadow-lg rounded-md"
        onClick={toggleSidebar} // Toggle sidebar visibility on mobile
      >
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
    </div>
  );
}