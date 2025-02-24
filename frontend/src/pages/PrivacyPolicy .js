import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 relative"
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
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Header Card */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Privacy Policy
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Policy Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-8"
        >
          <div className="space-y-6">
            {/* Introduction */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                1. Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We are committed to protecting your personal information and 
                your right to privacy. This Privacy Policy explains how we collect, 
                use, and protect your information when you use our lab booking services.
              </p>
            </section>

            {/* Data Collection */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                2. Data We Collect
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We may collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Personal identification information (Name, email, student ID)</li>
                <li>Booking history and preferences</li>
                <li>Device and usage data (IP address, browser type)</li>
                <li>Technical logs and error reports</li>
              </ul>
            </section>

            {/* Data Use */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                3. How We Use Your Data
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>To provide and maintain our services</li>
                <li>To process lab bookings and reservations</li>
                <li>To communicate with users about their bookings</li>
                <li>To improve system security and performance</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                4. Data Sharing
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We do not share your personal information with third parties except:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements</li>
                <li>To protect rights and safety of users</li>
                <li>With authorized college administrators</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                5. Data Security
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We implement appropriate security measures including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure server infrastructure</li>
                <li>Regular security audits</li>
                <li>Access control restrictions</li>
              </ul>
            </section>

            {/* User Rights */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                6. Your Rights
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request data portability</li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                7. Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We use essential cookies for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>User authentication</li>
                <li>Session management</li>
                <li>System performance monitoring</li>
              </ul>
            </section>

            {/* Policy Changes */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                8. Policy Changes
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We may update this policy periodically. Significant changes will be 
                notified through our platform or via email.
              </p>
            </section>

            {/* Contact */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                9. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                For privacy-related inquiries, contact our Data Protection Officer at:
              </p>
              <div className="mt-2">
                <a
                  href="mailto:privacy@labbookings.com"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  privacy@labbookings.com
                </a>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              This document was last updated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;