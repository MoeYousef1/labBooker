import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Twitter,
  Linkedin,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

const currentYear = new Date().getFullYear();

function Footer() {
  const socialLinks = [
    {
      icon: <Instagram className="w-5 h-5" />,
      href: "https://instagram.com/labbooker",
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      href: "https://twitter.com/labbooker",
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      href: "https://linkedin.com/company/labbooker",
    },
  ];

  const footerLinks = [
    { label: "About", path: "/about" },
    { label: "FAQs", path: "/faq" },
    { label: "Contact", path: "/contact" },
    { label: "Privacy Policy", path: "/privacypolicy" },
    { label: "Terms of Service", path: "/termsofservice" },
    { label: "Report Issue", path: "/issuereport" },
  ];

  const contactInfo = [
    {
      icon: <MapPin className="w-5 h-5 text-emerald-500" />,
      text: "Azrieli College of Engineering, Jerusalem",
    },
    {
      icon: <Mail className="w-5 h-5 text-blue-500" />,
      text: "support@labbooker.com",
    },
    {
      icon: <Phone className="w-5 h-5 text-indigo-500" />,
      text: "+972 (0)2-123-4567",
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">LabBooker</h3>
            <p className="text-sm text-gray-400 mb-6">
              Revolutionizing lab room bookings and management for educational
              institutions.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-gray-400 
                    hover:text-white 
                    transition-colors 
                    duration-300 
                    hover:scale-110 
                    inline-block
                  "
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="
                      text-gray-400 
                      hover:text-white 
                      hover:translate-x-1 
                      transition-all 
                      duration-300 
                      inline-block
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              {contactInfo.map((contact, index) => (
                <li
                  key={index}
                  className="flex items-center space-x-3 text-gray-400"
                >
                  {contact.icon}
                  <span className="text-sm">{contact.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Stay Updated
            </h4>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="
                  w-full px-3 py-2 
                  bg-gray-800 text-white 
                  rounded-l-lg 
                  focus:outline-none 
                  focus:ring-2 focus:ring-blue-500
                "
              />
              <button
                type="submit"
                className="
                  bg-blue-600 text-white 
                  px-4 py-2 
                  rounded-r-lg 
                  hover:bg-blue-700 
                  transition-colors
                "
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Subscribe to get the latest updates and news
            </p>
          </div>
        </div>

        {/* Copyright and Trademark */}
        <div className="mt-12 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-500">
            © {currentYear} <span className="text-white">LabBooker™</span>.
            All Rights Reserved.
            <span className="hidden md:inline mx-2">|</span>
            <br className="md:hidden" />
            <a
              href="/"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              Developed by Azrieli College of Engineering
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
