import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
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
                  Terms of Service
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
                  Effective Date: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Terms Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-8"
        >
          <div className="space-y-6">
            {/* Acceptance of Terms */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                By accessing or using the Lab Booking System, you agree to be bound by these Terms of Service. 
                If you disagree with any part, you may not access the service.
              </p>
            </section>

            {/* User Responsibilities */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                2. User Responsibilities
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Provide accurate registration information</li>
                <li>Maintain account security</li>
                <li>Use services only for lawful purposes</li>
                <li>Report unauthorized use immediately</li>
                <li>Comply with all college policies</li>
              </ul>
            </section>

            {/* Bookings */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                3. Lab Bookings
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Users agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Book only available time slots</li>
                <li>Cancel unused reservations promptly</li>
                <li>Follow lab safety protocols</li>
                <li>Report equipment issues immediately</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                4. Intellectual Property
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                All system content, features, and functionality are exclusive property 
                of the college and protected by intellectual property laws.
              </p>
            </section>

            {/* Termination */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                5. Termination
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We may terminate or suspend access immediately for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Violations of these terms</li>
                <li>Security or technical issues</li>
                <li>Fraudulent or illegal activity</li>
              </ul>
            </section>

            {/* Disclaimers */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                6. Disclaimers
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                The service is provided "as-is" without warranties of any kind. 
                We do not guarantee uninterrupted access or error-free operation.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                The college shall not be liable for any indirect, incidental, 
                or consequential damages arising from service use.
              </p>
            </section>

            {/* Governing Law */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                8. Governing Law
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                These terms shall be governed by the laws of [Your State/Country] 
                without regard to conflict of law principles.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                9. Changes to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We reserve the right to modify these terms at any time. 
                Continued use after changes constitutes acceptance.
              </p>
            </section>

            {/* Contact */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                10. Contact Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                For questions about these Terms:
              </p>
              <div className="mt-2">
                <a
                  href="mailto:support@labbookings.com"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  support@labbookings.com
                </a>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              These terms were last updated on {new Date().toLocaleDateString()}
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

export default TermsOfService;