import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FAQ = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("general");
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const sections = {
    general: [
      {
        id: 1,
        question: "How do I register for the lab booking system?",
        answer: "Go to the registration page...",
      },
      {
        id: 2,
        question: "What should I do if my username is not recognized?",
        answer: "Ensure you are using the exact username...",
      },
      {
        id: 3,
        question: "Can I use the app on multiple devices?",
        answer: "Yes, the app is accessible from any device...",
      },
      {
        id: 4,
        question: "What browsers are supported?",
        answer: "Our app supports all modern browsers including...",
      },
      {
        id: 5,
        question: "How do I delete my account?",
        answer: "Navigate to the Settings page...",
      },
    ],
    support: [
      {
        id: 6,
        question: "How do I contact support?",
        answer: "You can email support@collegebooking.com...",
      },
      {
        id: 7,
        question: "What should I do if I don’t receive the verification code?",
        answer: "Check your spam/junk folder...",
      },
      {
        id: 8,
        question: "How do I report an issue with my booking?",
        answer: "Go to the 'Contact Support' section...",
      },
      {
        id: 9,
        question: "Can I request additional lab resources?",
        answer: "Yes, use the 'Request Resources' form...",
      },
      {
        id: 10,
        question: "Is there live support available?",
        answer:
          "Yes, live support is available during college working hours...",
      },
    ],
    booking: [
      {
        id: 11,
        question: "How do I book a lab room?",
        answer: "After logging in, navigate to the 'Book a Room' page...",
      },
      {
        id: 12,
        question: "How long does it take for my booking to be confirmed?",
        answer: "Bookings are usually reviewed within 24 hours...",
      },
      {
        id: 13,
        question: "Can I cancel a booking?",
        answer: "Yes, go to 'My Bookings'...",
      },
      {
        id: 14,
        question: "What happens if I miss my booking time?",
        answer:
          "Missed bookings may affect your ability to book in the future...",
      },
      {
        id: 15,
        question: "How do I check available rooms?",
        answer: "Navigate to the 'Available Rooms' page...",
      },
    ],
    account: [
      {
        id: 16,
        question: "How do I update my profile information?",
        answer: "Go to the 'Settings' page...",
      },
      {
        id: 17,
        question: "Can I change my username?",
        answer: "No, your username is linked to your college website...",
      },
      {
        id: 18,
        question: "How do I change my email address?",
        answer:
          "Go to the 'Settings' page, update your email, and verify it...",
      },
      {
        id: 19,
        question: "How do I reset my account settings?",
        answer: "You can reset preferences from the 'Settings' page...",
      },
      {
        id: 20,
        question: "Can I view my booking history?",
        answer: "Yes, go to 'My Bookings'...",
      },
    ],
    privacy: [
      {
        id: 21,
        question: "Is my data secure?",
        answer: "Yes, we use advanced encryption...",
      },
      {
        id: 22,
        question: "Who has access to my data?",
        answer: "Only authorized administrators have access...",
      },
      {
        id: 23,
        question: "How do I request my data to be deleted?",
        answer: "Submit a request through the 'Privacy' section...",
      },
      {
        id: 24,
        question: "Do you share my data with third parties?",
        answer: "No, we do not share your data with any third parties...",
      },
      {
        id: 25,
        question: "How do I manage my data preferences?",
        answer: "Go to the 'Privacy Settings' page...",
      },
    ],
    feedback: [
      {
        id: 26,
        question: "How do I provide feedback about the app?",
        answer: "Use the 'Feedback' form available in the app...",
      },
      {
        id: 27,
        question: "Can I suggest new features?",
        answer:
          "Yes, submit your suggestions through the 'Request Features' section...",
      },
      {
        id: 28,
        question: "How is feedback used?",
        answer: "Your feedback helps us improve the app...",
      },
    ],
  };

  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  const handleScroll = (direction) => {
    const questions = sections[activeSection];
    if (direction === "up" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (
      direction === "down" &&
      currentQuestionIndex + 3 < questions.length
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Updated FAQ component with dark mode classes
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-between px-6 sm:px-8 md:px-12 py-12"
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

      <div className="mt-10">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg sm:text-xl">
            Have questions? Find your answers here.
          </p>
        </motion.div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sections Sidebar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:flex lg:flex-col w-full lg:w-1/4">
            {Object.keys(sections).map((section) => (
              <button
                key={section}
                onClick={() => {
                  setActiveSection(section);
                  setCurrentQuestionIndex(0);
                }}
                className={`px-4 py-3 text-center font-semibold text-lg rounded-lg transition-all ${
                  activeSection === section
                    ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          {/* Divider Line */}
          <div className="lg:w-px lg:h-auto lg:bg-gray-300 dark:lg:bg-gray-600 w-full h-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Questions */}
          <div className="relative flex-1">
            {/* Scroll Up Icon */}
            <button
              onClick={() => handleScroll("up")}
              disabled={currentQuestionIndex === 0}
              className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition disabled:opacity-50"
            >
              <FaChevronUp size={24} />
            </button>

            {/* Questions List */}
            <motion.div
              layout
              className="space-y-8 pt-10 pb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {sections[activeSection]
                .slice(currentQuestionIndex, currentQuestionIndex + 3)
                .map(({ id, question, answer }) => (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="accordion py-6 px-8 border-b border-solid border-gray-300 dark:border-gray-600 rounded-lg bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 hover:bg-gradient-to-l hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 shadow-md hover:shadow-lg transition-colors duration-300"
                  >
                    <button
                      onClick={() => toggleQuestion(id)}
                      className="accordion-toggle group inline-flex items-center justify-between leading-8 text-gray-900 dark:text-gray-100 w-full transition duration-500 text-left hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <h5 className="text-xl sm:text-2xl font-semibold">
                        {question}
                      </h5>
                      <svg
                        className={`text-gray-500 dark:text-gray-400 transition duration-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                          activeQuestion === id ? "rotate-180" : "rotate-0"
                        }`}
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.5 8.25L12.4142 12.3358C11.7475 13.0025 11.4142 13.3358 11 13.3358C10.5858 13.3358 10.2525 13.0025 9.58579 12.3358L5.5 8.25"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </button>
                    <AnimatePresence>
                      {activeQuestion === id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full px-0 overflow-hidden"
                        >
                          <p className="text-base text-gray-800 dark:text-gray-300 leading-6 mt-4">
                            {answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </motion.div>

            {/* Scroll Down Icon */}
            <button
              onClick={() => handleScroll("down")}
              disabled={
                currentQuestionIndex + 3 >= sections[activeSection].length
              }
              className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition disabled:opacity-50"
            >
              <FaChevronDown size={24} />
            </button>
          </div>
        </div>

        {/* Contact Customer Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Didn’t find your question?{" "}
            <a
              href="/contact"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Contact Customer Support
            </a>
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FAQ;
