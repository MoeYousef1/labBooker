import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/axiosConfig";

// Import assets
import collegeLogoWhite from "../assets/collegeLogoWhite.png";

// FormInput Component
const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder,
  required,
  maxLength,
  className,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 
          text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
          focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          transition-all duration-300 ${className}
        `}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

// ErrorMessage Component
const ErrorMessage = ({ message, onClose, className }) => {
  if (!message) return null;

  return (
    <div
      className={`bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mt-4 ${className}`}
    >
      <div className="flex justify-between items-center">
        <p className="text-sm">{message}</p>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-400 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// AuthButton Component
const AuthButton = ({ isSubmitting, label, className }) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`
        w-full flex justify-center items-center px-4 py-3 rounded-lg
        text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
        bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5
        ${className}
      `}
    >
      {isSubmitting ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        label
      )}
    </button>
  );
};

const LogInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stage, setStage] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
  });
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          await api.get("/auth/verify-token");
          navigate("/homepage");
        } catch (error) {
          console.error("Session validation failed:", error);
          localStorage.clear();
        }
      }
    };

    checkAuth();
  }, [navigate]);

  // Handle resend timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }

    return () => clearInterval(interval);
  }, [resendTimer]);
  const handleError = (error) => {
    console.error("Operation failed:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.response) {
      switch (error.response.status) {
        case 401:
          setGeneralError("Invalid verification code");
          break;
        case 404:
          setGeneralError("Email not found");
          break;
        case 429:
          setGeneralError("Too many attempts. Please try again later");
          setResendDisabled(true);
          setResendTimer(60);
          break;
        default:
          setGeneralError(
            error.response.data.message || "An unexpected error occurred"
          );
      }
    } else if (error.request) {
      setGeneralError("Network error. Please check your connection.");
    } else {
      setGeneralError("An unexpected error occurred");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setGeneralError("");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneralError("");

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setGeneralError("Please enter a valid email address");
        return;
      }

       await api.post("/auth/login", {
        email: formData.email,
      });

      setStage("verification");
      setResendDisabled(true);
      setResendTimer(30);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneralError("");

    try {
      const response = await api.post("/auth/verify-login", {
        email: formData.email,
        code: formData.verificationCode,
      });

      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const from = location.state?.from?.pathname || "/homepage";
      navigate(from);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendDisabled) return;
    setIsSubmitting(true);
    setGeneralError("");

    try {
      await api.post("/auth/request-code", {
        email: formData.email,
      });

      setResendDisabled(true);
      setResendTimer(30);
      setGeneralError("New verification code sent!");
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEmailForm = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl text-white font-semibold mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-sm">Sign in to your account</p>
      </div>

      <FormInput
        type="email"
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        required
      />

      <AuthButton isSubmitting={isSubmitting} label="Continue" />

      {generalError && (
        <ErrorMessage
          message={generalError}
          onClose={() => setGeneralError("")}
        />
      )}
    </form>
  );

  const renderVerificationForm = () => (
    <form onSubmit={handleVerificationSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl text-white font-semibold mb-2">
          Enter Verification Code
        </h2>
        <p className="text-gray-400 text-sm">
          Enter the code sent to
          <br />
          <span className="font-medium text-gray-300">{formData.email}</span>
        </p>
      </div>

      <FormInput
        name="verificationCode"
        label="Verification Code"
        value={formData.verificationCode}
        onChange={handleChange}
        placeholder="Enter 6-digit code"
        maxLength={6}
        required
        className="text-center tracking-widest text-lg"
      />

      <div className="space-y-4">
        <AuthButton isSubmitting={isSubmitting} label="Verify" />

        <div className="flex flex-col space-y-2">
          <button
            type="button"
            className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
            onClick={() => setStage("email")}
          >
            ← Back to Email
          </button>
          <button
            type="button"
            className={`text-sm ${
              resendDisabled
                ? "text-gray-500 cursor-not-allowed"
                : "text-blue-400 hover:text-blue-300 transition-colors duration-300"
            }`}
            onClick={handleResendCode}
            disabled={resendDisabled}
          >
            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
          </button>
        </div>

        {generalError && (
          <ErrorMessage
            message={generalError}
            onClose={() => setGeneralError("")}
          />
        )}
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <img
            className="w-16 md:w-20 h-auto object-contain drop-shadow-xl"
            src={collegeLogoWhite}
            alt="logo"
          />
          <div className="border-l border-gray-600 pl-3">
            <h4 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
              LabBooker
            </h4>
            <p className="text-xs md:text-sm text-gray-400">
              Azrieli College of Engineering
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl shadow-2xl px-4 py-8 sm:px-10">
          {stage === "email" ? renderEmailForm() : renderVerificationForm()}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogInPage;
