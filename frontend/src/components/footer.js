import React from 'react';
//import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="py-3 px-6 bg-gradient-to-r from-blue-400 to-blue-800 hover:from-blue-800 hover:to-blue-400 text-white">
      <div className="mx-auto max-w-screen-xl text-center">
        {/* Links */}
        <ul className="flex justify-center items-center space-x-6">
          <li>
            <a href="/about" className="hover:underline text-sm text-white hover:text-blue-950">About</a>
          </li>
          <li>
            <a href="/faq" className="hover:underline text-sm text-white hover:text-blue-950">FAQs</a>
          </li>
          <li>
            <a href="/contact" className="hover:underline text-sm text-white hover:text-blue-950">Contact</a>
          </li>
        </ul>

        {/* Line Under Links */}
        <div className="border-b border-gray-500 my-3 w-1/4 mx-auto"></div>

        {/* Copyright */}
        <span className="text-xs text-gray-400 mt-4 block">
          © 2024-2025 <a href="/" className="hover:underline">LabBooker™</a>. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
