import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { RiUserSettingsLine } from "react-icons/ri";
import { useNotifications } from "../hooks/useNotifications";
import api from "../utils/axiosConfig";
import { Menu, X, Home, BookOpen, LogOut, Bell } from "lucide-react";

const Navbar = ({
  userInfo,
  setUserInfo,
  enableTransparentOnScroll = false,
}) => {
  const [state, setState] = useState({
    mobileMenuOpen: false,
    profileDropdownOpen: false,
    notificationDropdownOpen: false,
    activeHover: null,
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    notifications,
    clearAllNotifications,
    markNotificationAsRead,
    deleteNotification,
    fetchNotifications,
    unreadCount,
  } = useNotifications();

  // Handle navbar background transparency on scroll
  useEffect(() => {
    if (!enableTransparentOnScroll) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enableTransparentOnScroll]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const handleNotificationClick = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setState((prev) => ({
      ...prev,
      notificationDropdownOpen: !prev.notificationDropdownOpen,
      profileDropdownOpen: false,
    }));
  }, [navigate]);

  // Responsive screen size hook
  const useScreenSize = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 460);
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 460);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return isMobile;
  };
  const isMobile = useScreenSize();

  const navBgClass = useMemo(
    () =>
      !enableTransparentOnScroll
        ? "bg-gray-900"
        : isScrolled
          ? "bg-gray-900"
          : "bg-transparent",
    [enableTransparentOnScroll, isScrolled],
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileDropdown = document.getElementById("profile-dropdown");
      const notificationDropdown = document.getElementById(
        "notification-dropdown",
      );
      const profileTrigger = document.getElementById("profile-trigger");
      const notificationTrigger = document.getElementById(
        "notification-trigger",
      );
      if (
        profileDropdown &&
        profileTrigger &&
        !profileDropdown.contains(event.target) &&
        !profileTrigger.contains(event.target)
      ) {
        setState((prev) => ({ ...prev, profileDropdownOpen: false }));
      }
      if (
        notificationDropdown &&
        notificationTrigger &&
        !notificationDropdown.contains(event.target) &&
        !notificationTrigger.contains(event.target)
      ) {
        setState((prev) => ({ ...prev, notificationDropdownOpen: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileMenuItems = useMemo(
    () => [
      {
        label: "Profile & Settings",
        path: "/accountSettings",
        icon: <RiUserSettingsLine className="w-5 h-5" />,
      },
    ],
    [],
  );

  const navLinks = useMemo(
    () => [
      {
        label: "Home",
        path: "/homepage",
        icon: (
          <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
        ),
      },
      {
        label: "Lab Rooms",
        path: "/labrooms",
        icon: (
          <BookOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
        ),
      },
      {
        label: "College Website",
        href: "https://www.jce.ac.il/",
        external: true,
      },
    ],
    [],
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/login");
  }, [navigate, setUserInfo]);

  const handleHoverEffect = useCallback(
    (key) => setState((prev) => ({ ...prev, activeHover: key })),
    [],
  );
  const clearHoverEffect = useCallback(
    () => setState((prev) => ({ ...prev, activeHover: null })),
    [],
  );

  const renderNavLink = useCallback(
    (link, index) => {
      const isActive = location.pathname === link.path;
      const linkClassName = `
        group relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300
        ${isActive ? "bg-blue-500/20 text-blue-500" : "text-gray-300 hover:text-white"}
        overflow-hidden
      `;
      const hoverEffectClassName = `
        absolute inset-0 z-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 
        transform -translate-x-full group-hover:translate-x-0
      `;
      const linkContent = (
        <div className="relative z-10 flex items-center space-x-2">
          {link.icon}
          <span className="transition-all duration-300 group-hover:tracking-wider">
            {link.label}
          </span>
        </div>
      );
      return link.external ? (
        <a
          key={index}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          onMouseEnter={() => handleHoverEffect(index)}
          onMouseLeave={clearHoverEffect}
        >
          <div className={hoverEffectClassName}></div>
          {linkContent}
        </a>
      ) : (
        <Link
          key={index}
          to={link.path}
          className={linkClassName}
          onMouseEnter={() => handleHoverEffect(index)}
          onMouseLeave={clearHoverEffect}
        >
          <div className={hoverEffectClassName}></div>
          {linkContent}
        </Link>
      );
    },
    [location.pathname, handleHoverEffect, clearHoverEffect],
  );

  const ProfileDropdown = useMemo(() => {
    if (!state.profileDropdownOpen || !userInfo) return null;
    return (
      <div
        id="profile-dropdown"
        className={`absolute bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50 ${
          isMobile ? "w-72 left-1/2 -translate-x-[90%]" : "w-72 right-0"
        }`}
        style={{ maxHeight: isMobile ? "80vh" : "auto" }}
        onMouseEnter={() =>
          setState((prev) => ({ ...prev, profileDropdownOpen: true }))
        }
        onMouseLeave={() =>
          setState((prev) => ({ ...prev, profileDropdownOpen: false }))
        }
      >
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white p-0.5 hover:border-blue-500 transition-colors">
              <div className="w-full h-full rounded-full overflow-hidden">
                {userInfo.profilePicture ? (
                  <img
                    src={userInfo.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-xl">
                    {userInfo.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userInfo.username}
              </p>
              <p className="text-xs text-gray-400 truncate">{userInfo.email}</p>
            </div>
          </div>
        </div>
        <div className="py-2">
          {profileMenuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={() =>
                setState((prev) => ({ ...prev, profileDropdownOpen: false }))
              }
              className="flex items-center px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700 transition-all group"
            >
              <span className="p-1.5 rounded-lg bg-gray-800 transition-colors group-hover:bg-blue-500/20">
                {item.icon}
              </span>
              <span className="ml-3 text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-t border-gray-700 transition-all group"
        >
          <span className="p-1.5 rounded-lg bg-red-500/10 transition-colors group-hover:bg-red-500/20">
            <LogOut className="w-5 h-5" />
          </span>
          <span className="ml-3 text-sm font-medium">Logout</span>
        </button>
      </div>
    );
  }, [
    state.profileDropdownOpen,
    userInfo,
    profileMenuItems,
    handleLogout,
    isMobile,
  ]);

  const NotificationDropdown = useMemo(() => {
    if (!state.notificationDropdownOpen || !userInfo) return null;
    const unreadCount = notifications.filter((notif) => !notif.isRead).length;
    return (
      <div
        id="notification-dropdown"
        className={`absolute bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50 ${
          isMobile
            ? "w-80 left-1/2 -translate-x-[70%] mt-4"
            : "w-80 right-0 mt-2"
        }`}
        style={{ maxHeight: isMobile ? "80vh" : "auto" }}
      >
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between bg-gray-800">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-white">
              Notifications
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs text-gray-300">
              {unreadCount}
            </span>
          </div>
          {notifications.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={clearAllNotifications}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors px-2 py-1 rounded-md hover:bg-blue-500/10"
              >
                Clear All
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.put("/notifications/read-all");
                    fetchNotifications();
                  } catch (error) {
                    console.error(
                      "Failed to mark all notifications as read:",
                      error,
                    );
                  }
                }}
                className="text-xs text-green-400 hover:text-green-300 hover:underline transition-colors px-2 py-1 rounded-md hover:bg-green-500/10"
              >
                Mark All as Read
              </button>
            </div>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`flex items-center justify-between px-4 py-3 border-b border-gray-700 transition-colors ${
                  notif.isRead ? "bg-gray-700 opacity-70" : "hover:bg-gray-600"
                }`}
              >
                <span className="text-sm mr-4 text-gray-300">
                  {notif.message}
                </span>
                <div className="flex space-x-2">
                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationAsRead(notif._id)}
                      className="p-1 text-xs bg-gray-700 rounded hover:bg-green-600 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif._id)}
                    className="p-1 text-xs bg-gray-700 rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No new notifications</p>
            </div>
          )}
        </div>
      </div>
    );
  }, [
    state.notificationDropdownOpen,
    notifications,
    clearAllNotifications,
    markNotificationAsRead,
    deleteNotification,
    isMobile,
    fetchNotifications,
    userInfo,
  ]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 text-white transition-colors duration-300 ${navBgClass}`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-500 tracking-wider relative group hover:text-blue-400 transition-all"
        >
          <span className="relative z-10">LabBooker</span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </Link>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link, index) => renderNavLink(link, index))}
          </div>
          {userInfo ? (
            <>
              <div className="relative">
                <button
                  id="notification-trigger"
                  onClick={handleNotificationClick}
                  className="text-gray-300 hover:text-white hover:scale-110 transition-all focus:outline-none relative"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {NotificationDropdown}
              </div>
              <div className="relative">
                <button
                  id="profile-trigger"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      profileDropdownOpen: !prev.profileDropdownOpen,
                      notificationDropdownOpen: false,
                    }))
                  }
                  className="focus:outline-none"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-white p-0.5 hover:border-blue-500 transition-all transform hover:scale-105">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      {userInfo.profilePicture ? (
                        <img
                          src={userInfo.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                          {userInfo.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
                {ProfileDropdown}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              Log In
            </Link>
          )}
          <button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                mobileMenuOpen: !prev.mobileMenuOpen,
              }))
            }
            className="md:hidden text-white hover:text-blue-500 transition-colors hover:scale-110 focus:outline-none"
          >
            {state.mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {state.mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 z-40">
          <div className="flex flex-col p-4 space-y-2">
            {navLinks.map((link, index) => renderNavLink(link, index))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default React.memo(Navbar);
