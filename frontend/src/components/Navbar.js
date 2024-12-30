import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { RiLogoutBoxLine } from "react-icons/ri";
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDropupCircle,
} from "react-icons/io";
import { MdNotificationsActive } from "react-icons/md";

const Navbar = ({ userInfo, setUserInfo }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/login");
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".profile-dropdown") &&
        !event.target.closest(".profile-icon")
      ) {
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
        <Link
          to="/"
          onClick={() => setMobileDrawerOpen(false)}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <span className="self-center text-2xl font-bold text-white tracking-wide">
            LabBooker
          </span>
        </Link>

        {/* Buttons (Login or Profile) */}
        <div className="flex items-center md:order-2 space-x-3 md:space-x-6 rtl:space-x-reverse">
          {userInfo ? (
            <div className="relative flex items-center space-x-4">
              {/* Notification Icon */}
              <button className="relative text-white hover:bg-blueMid rounded-full p-2 transition-transform transform hover:scale-105">
                <MdNotificationsActive className="w-6 h-6" />
              </button>

              {/* Profile Icon */}
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 text-white hover:bg-blueMid p-2 rounded-full transition-transform transform hover:scale-105 profile-icon"
                >
                  {profileDropdownOpen ? (
                    <IoIosArrowDropupCircle className="w-6 h-6 pointer-events-none" />
                  ) : (
                    <IoIosArrowDropdownCircle className="w-6 h-6 pointer-events-none" />
                  )}
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg p-4 profile-dropdown">
                    {/* User Info */}
                    <div className="flex items-center p-4 bg-gray-100 rounded-lg space-x-4">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold relative">
                        {userInfo.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-grayDark">
                          {userInfo.username}
                        </p>
                        <p
                          className="text-sm text-tertiary truncate max-w-full"
                          title={userInfo.email}
                        >
                          {userInfo.email}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Sections */}
                    <div className="mt-4">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-grayDark hover:bg-gray-100 rounded-lg transition duration-300"
                      >
                        <MdDashboard className="w-5 h-5 mr-3" /> Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-grayDark hover:bg-gray-100 rounded-lg transition duration-300"
                      >
                        <FaUser className="w-5 h-5 mr-3" /> My Profile
                      </Link>

                      <Link
                        to="/accountsettings"
                        className="flex items-center px-4 py-2 text-grayDark hover:bg-gray-100 rounded-lg transition duration-300"
                      >
                        <IoIosSettings className="w-5 h-5 mr-3" /> Settings
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 w-full text-grayDark hover:bg-red-100 hover:text-red-500 rounded-lg transition duration-300"
                      >
                        <RiLogoutBoxLine className="w-5 h-5 mr-3" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-white bg-gradient-primaryToRight hover:bg-gradient-primaryToLeft focus:ring-4 font-medium rounded-lg text-sm px-4 py-2 transition duration-300 shadow-md"
            >
              Log In
            </Link>
          )}

          {/* Hamburger Button */}
          <button
            onClick={toggleNavbar}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-tertiary transition duration-300"
            aria-controls="navbar-sticky"
            aria-expanded={mobileDrawerOpen}
          >
            {mobileDrawerOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
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
                to="/homepage"
                onClick={() => setMobileDrawerOpen(false)}
                className="block py-2 px-3 text-white rounded hover:bg-gradient-primaryToLeft md:p-0 transition duration-300"
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
                className="block py-2 px-3 text-white rounded hover:bg-gradient-primaryToLeft md:p-0 transition duration-300"
              >
                College Website
              </a>
            </li>
            <li>
              <a
                href="https://www.jce.ac.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 px-3 text-white rounded hover:bg-gradient-primaryToLeft md:p-0 transition duration-300"
              >
                Portal
              </a>
            </li>
            <li>
              <Link
                to="/labrooms"
                onClick={() => setMobileDrawerOpen(false)}
                className="block py-2 px-3 text-white rounded hover:bg-gradient-primaryToLeft md:p-0 transition duration-300"
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
