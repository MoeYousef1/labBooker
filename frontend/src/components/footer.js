import React from 'react';

const currentYear = new Date().getFullYear();

function Footer() {
  return (
    <footer className="py-6 px-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-gray-300">
      <div className="mx-auto max-w-screen-xl text-center">
        {/* Links */}
        <ul className="flex justify-center items-center space-x-6">
          <li>
            <a href="/about" className="hover:underline text-sm text-gray-300 hover:text-white">
              About
            </a>
          </li>
          <li>
            <a href="/faq" className="hover:underline text-sm text-gray-300 hover:text-white">
              FAQs
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:underline text-sm text-gray-300 hover:text-white">
              Contact
            </a>
          </li>
        </ul>

        {/* Line Under Links */}
        <div className="border-b border-gray-600 my-4 w-1/3 mx-auto"></div>

        {/* Copyright */}
        <span className="text-xs text-gray-400 mt-4 block">
          © {currentYear} <a href="/" className="hover:underline text-gray-300 hover:text-white">LabBooker™</a>. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
