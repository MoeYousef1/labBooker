import React, { useState } from "react";
import { motion } from "framer-motion";
import FormInput from "../components/FormInput";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

const ContactPage = () => {
    const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-6 sm:px-8 md:px-12 py-12 relative"
    >
      {/* Back Button */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-6 left-4 sm:left-6"
            >
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors shadow-sm border border-gray-200 dark:border-gray-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl w-full mt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Contact Support
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Have questions about lab bookings or need assistance? We're here to help!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Visit Us</h3>
                  <p className="text-gray-600 dark:text-gray-400">123 Lab Street</p>
                  <p className="text-gray-600 dark:text-gray-400">Science Campus, CA 98765</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FiPhone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Call Us</h3>
                  <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
                  <p className="text-gray-600 dark:text-gray-400">Mon-Fri, 9am-5pm PST</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Email Us</h3>
                  <p className="text-gray-600 dark:text-gray-400">support@labbookings.com</p>
                  <p className="text-gray-600 dark:text-gray-400">Response within 24 hours</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl shadow-lg"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                label="Your Name"
                darkModeClass="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <FormInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                label="Your Email"
                darkModeClass="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <FormInput
                type="textarea"
                name="message"
                value={formData.message}
                onChange={handleChange}
                label="Your Message"
                darkModeClass="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="5"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 text-white bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactPage;