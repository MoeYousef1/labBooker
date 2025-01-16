import { useState, useEffect } from "react";
import { MdDashboard } from "react-icons/md";
import { FaUser, FaHome } from "react-icons/fa";
import { IoIosSettings, IoIosArrowDown } from "react-icons/io";
import { RiLogoutBoxLine } from "react-icons/ri";
import { useNavigate, useLocation } from "react-router-dom";

/** 
 * Define dashboardPaths outside the component so 
 * it doesn't change on every render. This prevents 
 * the “missing dependency” warning in useEffect. 
 */
const DASHBOARD_PATHS = [
  "/dashboard",
  "/usermanagement",
  "/roomOperationpage",
  "/bookingmanagement",
  "/configmanagement",
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // mobile sidebar open/close
  const [showDashboardSubmenu, setShowDashboardSubmenu] = useState(false);
  const [userHasManuallyClosed, setUserHasManuallyClosed] = useState(false);

  const [, setUserInfo] = useState({ email: "", username: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Check user on mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    } else {
      try {
        const parsedUser = JSON.parse(user);
        setUserInfo({
          email: parsedUser.email || "",
          username: parsedUser.username || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [navigate]);

  // 2. On route change, decide if we auto-open or close the submenu
  useEffect(() => {
    const userIsOnDashboardRoute = DASHBOARD_PATHS.includes(location.pathname);

    if (userIsOnDashboardRoute) {
      // If the user is on a dashboard route but has NOT manually closed
      if (!userHasManuallyClosed) {
        setShowDashboardSubmenu(true);
      }
    } else {
      // If user left the dashboard route, close submenu & reset
      setShowDashboardSubmenu(false);
      setUserHasManuallyClosed(false);
    }
  }, [location.pathname, userHasManuallyClosed]);

  // Toggle entire sidebar (mobile only)
  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  // Close sidebar if clicking outside (mobile)
  const handleOutsideClick = (e) => {
    if (e.target.closest(".sidebar-container") === null) {
      setIsOpen(false);
    }
  };

  // 3. Toggling the dashboard submenu manually
  const handleToggleDashboardSubmenu = () => {
    if (showDashboardSubmenu) {
      // If it’s open, user is manually closing it
      setShowDashboardSubmenu(false);
      setUserHasManuallyClosed(true);
    } else {
      // If it’s closed, user is manually opening it
      setShowDashboardSubmenu(true);
      setUserHasManuallyClosed(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/login");
  };

  // Active check
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-full relative">
      {/* Sidebar */}
      <div
        className={`sidebar-container fixed top-0 left-0 h-screen w-auto bg-blueMid text-white p-4 shadow-xl transition-all duration-300 
          ${isOpen ? "z-50" : "hidden sm:block"}`}
      >
        {/* Header / Brand */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">LabBooker™</h2>
          <button className="sm:hidden p-2 text-white" onClick={toggleSidebar}>
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* NAV LINKS */}
        <ul className="space-y-1">
          {/* Dashboard w/ Submenu */}
          <li className="relative">
            <div
              className={`flex items-center justify-between py-2 px-4 rounded cursor-pointer hover:bg-blueExtraDark 
                ${showDashboardSubmenu ? "bg-blueExtraDark" : ""}`}
              onClick={handleToggleDashboardSubmenu}
            >
              <div className="flex items-center space-x-3">
                <MdDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
              <IoIosArrowDown
                className={`ml-2 w-4 h-4 transition-transform ${
                  showDashboardSubmenu ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Submenu */}
            {showDashboardSubmenu && (
              <ul className="mt-1 ml-6 space-y-1">
                <li
                  className={`py-2 px-4 rounded cursor-pointer hover:bg-blueExtraDark ${
                    isActive("/dashboard") ? "bg-blueExtraDark" : ""
                  }`}
                  onClick={() => navigate("/dashboard")}
                >
                  Overview
                </li>
                <li
                  className={`py-2 px-4 rounded cursor-pointer hover:bg-blueExtraDark ${
                    isActive("/usermanagement") ? "bg-blueExtraDark" : ""
                  }`}
                  onClick={() => navigate("/usermanagement")}
                >
                  Manage Users
                </li>
                <li
                  className={`py-2 px-4 rounded cursor-pointer hover:bg-blueExtraDark ${
                    isActive("/roomOperationpage") ? "bg-blueExtraDark" : ""
                  }`}
                  onClick={() => navigate("/roomOperationpage")}
                >
                  Manage Rooms
                </li>
                <li
                  className={`py-2 px-4 rounded cursor-pointer hover:bg-blueExtraDark ${
                    isActive("/bookingmanagement") ? "bg-blueExtraDark" : ""
                  }`}
                  onClick={() => navigate("/bookingmanagement")}
                >
                  Manage Bookings
                </li>
                <li
                  className={`py-2 px-4 rounded cursor-pointer hover:bg-blueExtraDark ${
                    isActive("/configmanagement") ? "bg-blueExtraDark" : ""
                  }`}
                  onClick={() => navigate("/configmanagement")}
                >
                  Configurations
                </li>
              </ul>
            )}
          </li>

          {/* My Profile */}
          <li
            className={`py-2 px-4 hover:bg-blueExtraDark cursor-pointer rounded ${
              isActive("/myprofile") ? "bg-blueExtraDark" : ""
            }`}
            onClick={() => navigate("/myprofile")}
          >
            <div className="flex items-center space-x-3">
              <FaUser className="w-5 h-5" />
              <span>My Profile</span>
            </div>
          </li>

          {/* Settings */}
          <li
            className={`py-2 px-4 hover:bg-blueExtraDark cursor-pointer rounded ${
              isActive("/accountsettings") ? "bg-blueExtraDark" : ""
            }`}
            onClick={() => navigate("/accountsettings")}
          >
            <div className="flex items-center space-x-3">
              <IoIosSettings className="w-5 h-5" />
              <span>Settings</span>
            </div>
          </li>

          {/* Home */}
          <li
            className={`py-2 px-4 hover:bg-blueExtraDark cursor-pointer rounded ${
              isActive("/homepage") ? "bg-blueExtraDark" : ""
            }`}
            onClick={() => navigate("/homepage")}
          >
            <div className="flex items-center space-x-3">
              <FaHome className="w-5 h-5" />
              <span>Home</span>
            </div>
          </li>
        </ul>

        {/* Logout */}
        <ul>
          <li className="py-2 px-4 hover:bg-blueExtraDark cursor-pointer rounded absolute bottom-10">
            <div className="flex items-center space-x-3" onClick={handleLogout}>
              <RiLogoutBoxLine className="w-5 h-5" />
              <span>Log Out</span>
            </div>
          </li>
        </ul>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 sm:hidden"
          onClick={handleOutsideClick}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        className="sm:hidden p-3 text-white bg-blueMid absolute"
        onClick={toggleSidebar}
      >
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 6h16M4 12h16m-7 6h7" 
          />
        </svg>
      </button>
    </div>
  );
}
