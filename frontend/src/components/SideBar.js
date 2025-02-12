import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  User,
  Home,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/usermanagement",
  "/roomOperationpage",
  "/bookingOperationpage",
  "/configmanagement",
];

export function Sidebar({ isExpanded, toggleSidebar, isMobile }) {
  const [showDashboardSubmenu, setShowDashboardSubmenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-open submenu if current path is in DASHBOARD_PATHS
  useEffect(() => {
    if (DASHBOARD_PATHS.includes(location.pathname)) {
      setShowDashboardSubmenu(true);
    }
  }, [location.pathname]);

  const handleToggleDashboardSubmenu = () => {
    if (!isExpanded) toggleSidebar();
    setShowDashboardSubmenu((prev) => !prev);
  };

  const handleNavigation = (path) => {
    if (!isExpanded) toggleSidebar();
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
  className="fixed top-0 left-0 h-screen z-40 transition-all duration-300 bg-white border-r border-gray-200 shadow-xl"
  style={{ 
    width: isExpanded ? 225 : 80,
    transform: isMobile && !isExpanded ? 'translateX(calc(-100% + 80px))' : 'none',
  }}
>
      {/* Toggle Button positioned within the sidebar */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-5 bg-white p-1.5 rounded-full shadow-md border border-gray-200 hover:bg-gray-100 z-50"
      >
        {isExpanded ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>

      <div className="h-full flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2
            className={`text-xl font-bold text-gray-800 transition-opacity ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            LabBooker
          </h2>
        </div>

        {/* Navigation Items */}
        <ul className="flex-1 py-4">
          <li>
            <div
              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 ${
                showDashboardSubmenu ? "bg-gray-100" : ""
              }`}
              onClick={handleToggleDashboardSubmenu}
            >
              <LayoutDashboard className="w-6 h-6 text-green-500 min-w-[24px]" />
              <span
                className={`ml-3 transition-opacity ${
                  isExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                Dashboard
              </span>
              <ChevronDown
                className={`ml-auto w-4 h-4 transition-transform ${
                  showDashboardSubmenu ? "rotate-180" : ""
                } ${isExpanded ? "opacity-100" : "opacity-0"}`}
              />
            </div>

            {showDashboardSubmenu && isExpanded && (
              <ul className="bg-gray-50 py-2">
                {[
                  { path: "/dashboard", label: "Overview" },
                  { path: "/usermanagement", label: "Manage Users" },
                  { path: "/roomOperationpage", label: "Manage Rooms" },
                  { path: "/bookingOperationpage", label: "Manage Bookings" },
                  { path: "/configmanagement", label: "Configurations" },
                ].map((item) => (
                  <li
                    key={item.path}
                    className={`px-12 py-2 cursor-pointer hover:bg-gray-100 ${
                      isActive(item.path)
                        ? "bg-green-50 text-green-600"
                        : "text-gray-700"
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </li>

          {[
            { icon: User, label: "Profile", path: "/accountSettings" },
            { icon: Home, label: "Home", path: "/homepage" },
          ].map((item) => (
            <li
              key={item.path}
              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 ${
                isActive(item.path)
                  ? "bg-green-50 text-green-600"
                  : "text-gray-800"
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="w-6 h-6 text-green-500 min-w-[24px]" />
              <span
                className={`ml-3 transition-opacity ${
                  isExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="border-t border-gray-200">
          <div
            className="flex items-center px-4 py-4 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <LogOut className="w-6 h-6 text-red-500 min-w-[24px]" />
            <span
              className={`ml-3 transition-opacity ${
                isExpanded ? "opacity-100" : "opacity-0"
              }`}
            >
              Log Out
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
