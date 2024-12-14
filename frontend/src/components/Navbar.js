import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <nav className="fixed w-full z-30 top-0 backdrop-blur-lg bg-transparent shadow-lg transition-all duration-300">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        {/* Brand Name */}
        <div className="inline-block">
          <Link
            to="/"
            onClick={() => setMobileDrawerOpen(false)}
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <span className="self-center text-2xl font-bold text-white tracking-wide">
              LabBooker
            </span>
          </Link>
        </div>

        {/* Buttons (e.g., Login) */}
        <div className="inline-block flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <Link
            to="/login"
            className="text-white bg-gradient-to-r from-[rgba(1,84,206,255)] via-[rgba(0,130,180,255)] to-[rgba(1,156,140,255)] hover:from-[rgba(0,100,180,255)] hover:via-[rgba(0,130,180,255)] hover:to-[rgba(1,156,140,255)] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 transition duration-300 shadow-md"
          >
            Log In
          </Link>

          
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
                className="block py-2 px-3 text-white rounded hover:bg-gradient-to-r hover:from-[rgba(1,84,206,255)] hover:via-[rgba(0,130,180,255)] hover:to-[rgba(1,156,140,255)] md:p-0 transition duration-300"
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
                className="block py-2 px-3 text-white rounded hover:bg-gradient-to-r hover:from-[rgba(1,84,206,255)] hover:via-[rgba(0,130,180,255)] hover:to-[rgba(1,156,140,255)] md:p-0 transition duration-300"
              >
                College Website
              </a>
            </li>
            <li>
              <a
                href="https://www.jce.ac.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 px-3 text-white rounded hover:bg-gradient-to-r hover:from-[rgba(1,84,206,255)] hover:via-[rgba(0,130,180,255)] hover:to-[rgba(1,156,140,255)] md:p-0 transition duration-300"
              >
                Portal
              </a>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => setMobileDrawerOpen(false)}
                className="block py-2 px-3 text-white rounded hover:bg-gradient-to-r hover:from-[rgba(1,84,206,255)] hover:via-[rgba(0,130,180,255)] hover:to-[rgba(1,156,140,255)] md:p-0 transition duration-300"
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
