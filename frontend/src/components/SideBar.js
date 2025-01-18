import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  User, 
  Home, 
  Settings, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/usermanagement",
  "/roomOperationpage",
  "/bookingmanagement",
  "/configmanagement",
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDashboardSubmenu, setShowDashboardSubmenu] = useState(false);
  const [userHasManuallyClosed, setUserHasManuallyClosed] = useState(false);

  const [, setUserInfo] = useState({ email: "", username: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication and user check
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

  // Route-based submenu management
  useEffect(() => {
    const userIsOnDashboardRoute = DASHBOARD_PATHS.includes(location.pathname);

    if (userIsOnDashboardRoute) {
      if (!userHasManuallyClosed) {
        setShowDashboardSubmenu(true);
      }
    } else {
      setShowDashboardSubmenu(false);
      setUserHasManuallyClosed(false);
    }
  }, [location.pathname, userHasManuallyClosed]);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleToggleDashboardSubmenu = () => {
    setShowDashboardSubmenu(prev => {
      setUserHasManuallyClosed(!prev);
      return !prev;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-full relative">
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 
          bg-white border-r border-gray-200 
          shadow-xl 
          transition-all duration-300 
          z-40
          ${isOpen ? "block" : "hidden sm:block"}
        `}
      >
        {/* Header / Brand */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">LabBooker</h2>
          <button className="sm:hidden p-2 text-gray-600" onClick={toggleSidebar}>
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
        <ul className="py-4">
          {/* Dashboard w/ Submenu */}
          <li className="relative">
            <div
              className={`
                flex items-center justify-between 
                py-3 px-6 
                cursor-pointer 
                hover:bg-gray-100
                ${showDashboardSubmenu ? "bg-gray-100" : ""}
              `}
              onClick={handleToggleDashboardSubmenu}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-5 h-5 text-green-500" />
                <span className="text-gray-800">Dashboard</span>
              </div>
              <ChevronDown
                className={`
                  w-4 h-4 
                  text-gray-500 
                  transition-transform 
                  ${showDashboardSubmenu ? "rotate-180" : ""}
                `}
              />
            </div>

            {/* Submenu */}
            {showDashboardSubmenu && (
              <ul className="space-y-1 bg-gray-50 py-2">
                {[
                  { path: "/dashboard", label: "Overview" },
                  { path: "/usermanagement", label: "Manage Users" },
                  { path: "/roomOperationpage", label: "Manage Rooms" },
                  { path: "/bookingmanagement", label: "Manage Bookings" },
                  { path: "/configmanagement", label: "Configurations" }
                ].map((item) => (
                  <li
                    key={item.path}
                    className={`
                      py-2 px-12 
                      cursor-pointer 
                      hover:bg-gray-100
                      ${isActive(item.path) ? "bg-green-50 text-green-600" : "text-gray-700"}
                    `}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Other Menu Items */}
          {[
            { 
              icon: User, 
              label: "My Profile", 
              path: "/myprofile" 
            },
            { 
              icon: Settings, 
              label: "Settings", 
              path: "/accountsettings" 
            },
            { 
              icon: Home, 
              label: "Home", 
              path: "/homepage" 
            }
          ].map((item) => (
            <li
              key={item.path}
              className={`
                py-3 px-6 
                hover:bg-gray-100 
                cursor-pointer 
                flex items-center 
                space-x-3
                ${isActive(item.path) ? "bg-green-50 text-green-600" : "text-gray-800"}
              `}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-5 h-5 text-green-500" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="absolute bottom-0 w-full border-t border-gray-200">
          <div
            className="
              py-4 px-6 
              flex items-center 
              space-x-3 
              cursor-pointer 
              hover:bg-gray-100
              text-gray-800
            "
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span>Log Out</span>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="
            fixed inset-0 
            bg-black bg-opacity-50 
            sm:hidden 
            z-30
          "
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={toggleSidebar}
      >
        <svg
          className="w-6 h-6 text-gray-600"
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