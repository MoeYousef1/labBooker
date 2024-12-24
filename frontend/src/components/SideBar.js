import React, { useState } from 'react';

  
export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className="flex h-full relative">
      {/* Sidebar */}
      <div
        className={`sidebar-container h-screen w-64 bg-gradient-to-r from-blue-400 to-blue-800 text-white p-4 shadow-xl transition-all duration-300 
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
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span>Dashboard</span>
            </div>
          </li>
          <li className="py-2 px-4 hover:bg-blue-950 cursor-pointer rounded">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h6M6 12v6h6" />
              </svg>
              <span>Profile</span>
            </div>
          </li>
          <li className="py-2 px-4 hover:bg-blue-950 cursor-pointer rounded">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10l5 5-5 5M13 10l5 5-5 5" />
              </svg>
              <span>Settings</span>
            </div>
          </li>
          <li className="py-2 px-4 hover:bg-blue-950 cursor-pointer rounded">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10l5 5-5 5M13 10l5 5-5 5" />
              </svg>
              <span>Log Out</span>
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