import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Import assets
import lapLogo from "../assets/laptop.png";
import headerImage from "../assets/header-bg.jpg";
import collegeLogoWhite from "../assets/collegeLogoWhite.png";

// Import components
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import ErrorMessage from "../components/Error_successMessage";
import AuthButton from "../components/AuthButton";
import AuthFooter from "../components/AuthFooter";

// Create a robust axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api/auth",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptors for logging
api.interceptors.request.use(
  (config) => {
    console.log("Request URL:", config.url);
    console.log("Request Data:", config.data);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("Response Data:", response.data);
    return response;
  },
  (error) => {
    console.error("Full Error Object:", error);
    console.error("Error Response:", error.response?.data);
    console.error("Error Status:", error.response?.status);
    return Promise.reject(error);
  }
);

const SignUpPage = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState("details"); // 'details' or 'verification'
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    verificationCode: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const handleError = (error) => {
    console.error("SignUp Error:", error);

    if (error.response) {
      const errorMessage =
        error.response.data.message || "An unexpected error occurred";
      setGeneralError(errorMessage);
    } else if (error.request) {
      setGeneralError("No response from the server. Please check your network.");
    } else {
      setGeneralError("Error setting up the request. Please try again.");
    }
  };

  // Step 1: Submit user details
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setGeneralError("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      const response = await api.post("/signup", {
        username: formData.username,
        name: formData.name,
        email: formData.email,
      });

      console.log("Signup successful:", response.data);
      alert(
        "A verification code has been sent to your email. Please check your inbox."
      );
      setStage("verification"); // Move to verification step
      setGeneralError("");
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit verification code
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post("/verify-signup", {
        email: formData.email,
        code: formData.verificationCode,
      });

      console.log("Verification successful:", response.data);
      navigate("/login"); // Redirect to login page
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Right side content for AuthLayout
  const rightContent = (
    <>
      <div className="text-center">
        <h4 className="mb-4 text-lg font-semibold">
          LabBooker - Azrieli College of Engineering Jerusalem
        </h4>
        <p className="text-sm mb-4">
          LabBooker is your go-to platform for reserving study rooms. Sign up to
          get started and book your next study space today!
        </p>
      </div>
      <div className="mt-2">
        <img
          src={collegeLogoWhite}
          alt="College Logo"
          className="mx-auto max-h-20"
        />
      </div>
    </>
  );

  // Render user details form
  const renderDetailsForm = () => (
    <form onSubmit={handleDetailsSubmit}>
      <p className="mb-4 text-white font-semibold">Create a new account</p>
      <FormInput
        name="username"
        label="User Name"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
      />
      <FormInput
        name="name"
        label="Full Name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />
      <FormInput
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        type="email"
      />
      <div className="mb-6 text-center">
        <AuthButton isSubmitting={isSubmitting} label="Continue" />
        <ErrorMessage
          message={generalError}
          onClose={() => setGeneralError("")}
        />
      </div>
    </form>
  );

  // Render verification code form
  const renderVerificationForm = () => (
    <form onSubmit={handleVerificationSubmit}>
      <p className="mb-4 text-white font-semibold">Verify Your Email</p>
      <p className="mb-4 text-gray-300 text-sm">
        A verification code has been sent to {formData.email}.
      </p>
      <FormInput
        name="verificationCode"
        label="Verification Code"
        value={formData.verificationCode}
        onChange={handleChange}
        error={errors.verificationCode}
      />
      <div className="mb-6 text-center">
        <AuthButton isSubmitting={isSubmitting} label="Verify" />
        <button
          type="button"
          className="text-sm text-blue-300 hover:text-blue-200 mt-2 block mx-auto"
          onClick={() => setStage("details")}
        >
          Back to Details
        </button>
        <ErrorMessage
          message={generalError}
          onClose={() => setGeneralError("")}
        />
      </div>
    </form>
  );

  return (
    <AuthLayout headerImage={headerImage} rightContent={rightContent}>
      <div className="text-center">
        <img className="mx-auto w-48" src={lapLogo} alt="logo" />
        <h4 className="mb-8 mt-1 text-4xl font-extrabold text-white">
          LabBooker
        </h4>
      </div>
      {stage === "details" ? renderDetailsForm() : renderVerificationForm()}
      <AuthFooter
        isRegisterPage={true}
        onLoginRedirect={() => navigate("/login")}
      />
    </AuthLayout>
  );
};

export default SignUpPage;
