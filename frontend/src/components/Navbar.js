import { Menu, X, User, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ userInfo, setUserInfo }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle mobile navbar visibility
  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Handle logout action
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/login");
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen((prevState) => !prevState);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown") && !event.target.closest(".profile-icon")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="fixed w-full z-30 top-0 backdrop-blur-lg bg-transparent shadow-lg transition-all duration-300">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Brand Name */}
        <Link to="/" onClick={() => setMobileDrawerOpen(false)} className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-bold text-white tracking-wide">LabBooker</span>
        </Link>

        {/* Buttons (Login or Profile) */}
        <div className="flex items-center md:order-2 space-x-3 md:space-x-6 rtl:space-x-reverse">
          {userInfo ? (
            <div className="relative flex items-center space-x-4">
              {/* Notification Icon */}
              <button className="relative text-white hover:bg-gray-700 rounded-lg p-2">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Profile Icon */}
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 text-white bg-gradient-to-r from-blue-400 to-blue-800 hover:from-blue-800 hover:to-blue-400 p-2 rounded-full shadow-lg transition-transform transform hover:scale-105 profile-icon"
                >
                  <User className="w-6 h-6" />
                  <span className="hidden md:block font-medium">Profile</span>
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg p-4 profile-dropdown">
                {/* User Info */}
                <div className="flex items-center p-4 bg-gray-100 rounded-lg space-x-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    {userInfo.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{userInfo.username}</p>
                    <p className="text-sm text-gray-500">{userInfo.email}</p>
                  </div>
                </div>
              
                {/* Navigation Sections */}
                <div className="mt-4">
                  {/* Dashboard Section */}
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition duration-300"
                  >
                    <User className="w-5 h-5 text-blue-500 mr-3" />
                    Dashboard
                  </Link>
              
                  {/* Settings Section */}
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition duration-300"
                  >
                    <User className="w-5 h-5 text-green-500 mr-3" />
                    Account Settings
                  </Link>
              
                  {/* Profile Section */}
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition duration-300"
                  >
                    <User className="w-5 h-5 text-purple-500 mr-3" />
                    My Profile
                  </Link>
              
                  {/* Penalties Section */}
                  <Link
                    to="/penalties"
                    className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition duration-300"
                  >
                    <User className="w-5 h-5 text-red-500 mr-3" />
                    Penalties
                  </Link>
                </div>
              
                {/* Logout Button */}
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 w-full text-gray-800 hover:bg-red-100 hover:text-red-500 rounded-lg transition duration-300"
                  >
                    <X className="w-5 h-5 text-red-500 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
              
              )}
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-white bg-gradient-to-r from-blue-400 to-blue-800 hover:from-blue-800 hover:to-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 transition duration-300 shadow-md"
            >
              Log In
            </Link>
          )}

          {/* Hamburger Button */}
          <button
            onClick={toggleNavbar}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition duration-300"
            aria-controls="navbar-sticky"
            aria-expanded={mobileDrawerOpen}
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Links Section */}
        <div
          className={`${
            mobileDrawerOpen ? "block" : "hidden"
          } items-center justify-between w-full md:flex md:w-auto md:order-1`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-transparent md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
            <li>
              <Link
                to="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="block py-2 px-3 text-white rounded hover:bg-gradient-to-r  hover:from-blue-400  hover:to-blue-800 md:p-0 transition duration-300"
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <li>
              <a
                href="https://www.jce.ac.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 px-3 text-white rounded hover:bg-gradient-to-r hover:from-blue-400  hover:to-blue-800 md:p-0 transition duration-300"
              >
                College Website
              </a>
            </li>
            <li>
              <a
                href="https://www.jce.ac.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 px-3 text-white rounded hover:bg-gradient-to-r  hover:from-blue-400  hover:to-blue-800 md:p-0 transition duration-300"
              >
                Portal
              </a>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => setMobileDrawerOpen(false)}
                className="block py-2 px-3 text-white rounded hover:bg-gradient-to-r  hover:from-blue-400  hover:to-blue-800 md:p-0 transition duration-300"
              >
                Lab Rooms
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
