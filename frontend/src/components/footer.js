import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="py-3 px-6 bg-gradient-to-r from-purple-800 to-purple-900 text-white">
      <div className="mx-auto max-w-screen-xl text-center">
        {/* Links */}
        <ul className="flex justify-center items-center space-x-6">
          <li>
            <a href="#" className="hover:underline text-sm">About</a>
          </li>
          <li>
            <a href="#" className="hover:underline text-sm">FAQs</a>
          </li>
          <li>
            <a href="#" className="hover:underline text-sm">Contact</a>
          </li>
        </ul>

        {/* Line Under Links */}
        <div className="border-b border-gray-500 my-3 w-1/4 mx-auto"></div>

        {/* Copyright */}
        <span className="text-xs text-gray-400 mt-4 block">
          © 2024-2025 <a href="#" className="hover:underline">LabBooker™</a>. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
