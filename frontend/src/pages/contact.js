import React, { useState } from "react";
import FormInput from "../components/FormInput"; // Ensure this is the correct import path

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  // const [errors, setErrors] = useState({});
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // setIsSubmitting(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grayLight to-grayDark flex justify-center items-center">
      <div className="bg-gray-200 p-8 rounded-lg w-full sm:w-4/5 md:w-3/5 lg:w-2/5">
        <h1 className="text-4xl font-bold text-gray-800">Get in Touch</h1>
        <p className="text-sm text-gray-600 mt-4">
          "Have questions regarding lab rooms, booking, or other lab-related
          inquiries? Feel free to reach out! We're here to assist you with any
          concerns you have and ensure you have the best experience in the lab."
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <FormInput
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            label="Your Name"
            // error={errors.name}
          />
          <FormInput
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            label="Your Email"
            // error={errors.email}
          />
          <FormInput
            type="textarea"
            name="message"
            value={formData.message}
            onChange={handleChange}
            label="Your Message"
            // error={errors.message}
          />

          <button
            type="submit"
            className="w-full py-3 text-white bg-gradient-to-r from-blueMid to-blueDark rounded-lg hover:bg-gradient-to-l transition duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
