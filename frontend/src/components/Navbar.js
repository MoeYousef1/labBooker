import React, { 
  useState, 
  useCallback, 
  useMemo, 
  useEffect 
} from 'react';
import { 
  Link, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  LogOut, 
  User, 
  Settings, 
  Bell 
} from 'lucide-react';

const Navbar = ({ userInfo, setUserInfo }) => {
  const [state, setState] = useState({
    mobileMenuOpen: false,
    profileDropdownOpen: false,
    activeHover: null
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownElement = document.getElementById('profile-dropdown');
      if (dropdownElement && !dropdownElement.contains(event.target)) {
        setState(prev => ({ ...prev, profileDropdownOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Profile menu items
  const profileMenuItems = useMemo(() => [
    { 
      label: 'Profile', 
      path: '/profile', 
      icon: <User className="w-5 h-5 mr-3" /> 
    },
    { 
      label: 'Settings', 
      path: '/accountSettings', 
      icon: <Settings className="w-5 h-5 mr-3" /> 
    }
  ], []);

  // Navigation links with hover effects
  const navLinks = useMemo(() => [
    { 
      label: 'Home', 
      path: '/homepage', 
      icon: <Home className="w-5 h-5 transition-transform group-hover:scale-110" /> 
    },
    { 
      label: 'Lab Rooms', 
      path: '/labrooms', 
      icon: <BookOpen className="w-5 h-5 transition-transform group-hover:scale-110" /> 
    },
    { 
      label: 'College Website', 
      href: 'https://www.jce.ac.il/', 
      external: true 
    }
  ], []);

  // Logout handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUserInfo(null);
    navigate('/login');
  }, [navigate, setUserInfo]);

  // Hover effect handler
  const handleHoverEffect = useCallback((key) => {
    setState(prev => ({ ...prev, activeHover: key }));
  }, []);

  const clearHoverEffect = useCallback(() => {
    setState(prev => ({ ...prev, activeHover: null }));
  }, []);

  // Render navigation link with advanced hover effects
  const renderNavLink = useCallback((link, index) => {
    const isActive = location.pathname === link.path;
    
    const linkClassName = `
      group relative flex items-center space-x-2 
      px-3 py-2 rounded-lg 
      transition-all duration-300 
      ${isActive 
        ? 'bg-blue-500/20 text-blue-500' 
        : 'text-gray-300 hover:text-white'
      }
      overflow-hidden
    `;

    const hoverEffectClassName = `
      absolute inset-0 z-0 
      bg-white/10 
      opacity-0 group-hover:opacity-100 
      transition-all duration-300 
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

    if (link.external) {
      return (
        <a
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
      );
    }

    return (
      <Link
        to={link.path}
        className={linkClassName}
        onMouseEnter={() => handleHoverEffect(index)}
        onMouseLeave={clearHoverEffect}
      >
        <div className={hoverEffectClassName}></div>
        {linkContent}
      </Link>
    );
  }, [location.pathname, handleHoverEffect, clearHoverEffect]);

  // Profile dropdown with enhanced hover
  const ProfileDropdown = useMemo(() => {
    if (!state.profileDropdownOpen || !userInfo) return null;

    return (
      <div 
        id="profile-dropdown"
        className="absolute right-0 mt-4 w-72 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden"
        onMouseEnter={() => setState(prev => ({ ...prev, profileDropdownOpen: true }))}
        onMouseLeave={() => setState(prev => ({ ...prev, profileDropdownOpen: false }))}
      >
        {/* User Avatar */}
        <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-t-lg">
          <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
            {userInfo.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{userInfo.username}</p>
            <p className="text-xs text-gray-400 truncate">{userInfo.email}</p>
          </div>
        </div>

        <div className="py-2">
          {profileMenuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="
                group relative flex items-center 
                px-4 py-2 text-gray-300 
                hover:text-white 
                overflow-hidden
              "
            >
              <div className="
                absolute inset-0 z-0 
                bg-white/10 
                opacity-0 group-hover:opacity-100 
                transition-all duration-300 
                transform -translate-x-full group-hover:translate-x-0
              "></div>
              <div className="relative z-10 flex items-center">
                {item.icon}
                <span className="ml-3 transition-all group-hover:translate-x-1">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center 
            px-4 py-2 
            text-red-400 hover:text-red-500 
            border-t border-gray-700 
            group relative
            overflow-hidden
          "
        >
          <div className="
            absolute inset-0 z-0 
            bg-red-500/10 
            opacity-0 group-hover:opacity-100 
            transition-all duration-300 
            transform -translate-x-full group-hover:translate-x-0
          "></div>
          <div className="relative z-10 flex items-center">
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </div>
        </button>
      </div>
    );
  }, [state.profileDropdownOpen, userInfo, profileMenuItems, handleLogout]);

  return (
    <nav 
      className="
        fixed top-0 left-0 right-0 z-50 
        bg-gray-900 // Solid background
      "
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo with hover effect */}
        <Link 
          to="/" 
          className="
            text-2xl font-bold text-blue-500 
            tracking-wider group relative
            hover:text-blue-400 transition-all
          "
        >
          <span className="relative z-10">LabBooker</span>
          <div className="
            absolute bottom-0 left-0 right-0 h-0.5 
            bg-blue-500 
            scale-x-0 group-hover:scale-x-100 
            transition-transform origin-left
          "></div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Navigation Links */}
          <div className="flex space-x-2">
            {navLinks.map((link, index) => (
              <React.Fragment key={index}>
                {renderNavLink(link, index)}
              </React.Fragment>
            ))}
          </div>

          {userInfo ? (
            <div className="relative">
              {/* Notification Button with hover */}
              <button 
                onClick={() => setState(prev => ({ ...prev, profileDropdownOpen: !prev.profileDropdownOpen }))}
                className="
                  relative text-gray-300 
                  hover:text-white 
                  hover:scale-110 
                  transition-all 
                  group
                "
              >
                <Bell className="w-6 h-6 transition-transform group-hover:rotate-12" />
                <span className="
                  absolute -top-2 -right-2 
                  bg-blue-500 text-white 
                  text-xs rounded-full 
                  px-2 py-0.5 
                  group-hover:animate-ping
                ">
                  3
                </span>
              </button>

              {ProfileDropdown}
            </div>
          ) : (
            <Link
              to="/login"
              className="
                bg-blue-500 text-white 
                px-4 py-2 rounded-lg 
                hover:bg-blue-600 
                transition-all 
                hover:shadow-lg 
                hover:translate-y-[-2px]
              "
            >
              Log In
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button 
          onClick={() => setState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))}
          className="
            md:hidden text-white 
            hover:text-blue-500 
            transition-colors 
            hover:scale-110
          "
        >
          {state.mobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu */}
        {state.mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 z-50">
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map((link, index) => (
                <React.Fragment key={index}>
                  {renderNavLink(link, index)}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default React.memo(Navbar);