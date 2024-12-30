import React, { useState } from "react";

// Reusable AccordionItem Component
const AccordionItem = ({ question, answer, isActive, onToggle }) => {
  return (
    <div className="accordion py-8 px-6 border-b border-solid border-gray-200 transition-all duration-500 rounded-2xl hover:bg-indigo-50">
      <button
        onClick={onToggle}
        className="accordion-toggle group inline-flex items-center justify-between leading-8 text-gray-900 w-full transition duration-500 text-left hover:text-blueDark"
      >
        <h5>{question}</h5>
        <svg
          className={`text-gray-500 transition duration-500 group-hover:text-blueDark ${
            isActive ? "rotate-180" : "rotate-0"
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
      <div
        className="accordion-content w-full px-0 overflow-hidden transition-max-height duration-500"
        style={{
          maxHeight: isActive ? "200px" : "0",
        }}
      >
        <p className="text-base text-gray-900 leading-6">{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const questions = [
    {
      id: 1,
      question: "How do I reset my password?",
      answer:
        "To reset your password, go to the Forgot Password page, enter your email, and follow the instructions sent to your inbox.",
    },
    {
      id: 2,
      question: "How can I contact customer support?",
      answer:
        "You can contact customer support via the 'Help' section in the app or by emailing support@yourapp.com.",
    },
    {
      id: 3,
      question: "How do I update my profile information?",
      answer:
        "Navigate to your profile settings page, edit the required fields, and click 'Save Changes' to update your information.",
    },
  ];

  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-4xl font-manrope text-center font-bold text-gray-900 leading-[3.25rem]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="accordion-group">
          {questions.map(({ id, question, answer }) => (
            <AccordionItem
              key={id}
              question={question}
              answer={answer}
              isActive={activeQuestion === id}
              onToggle={() => toggleQuestion(id)}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-8">
        <button
          onClick={() => (window.location.href = "/homepage")}
          className="px-6 py-3 bg-gradient-primaryToRight hover:bg-gradient-primaryToLeft text-white rounded-lg shadow-md transition duration-300"
        >
          Back to Home
        </button>
      </div>
    </section>
  );
};

export default FAQ;
