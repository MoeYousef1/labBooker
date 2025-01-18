import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

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

// Create a more robust axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptors for comprehensive logging
api.interceptors.request.use(
  config => {
    console.log('Request URL:', config.url);
    console.log('Request Data:', config.data);
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log('Response Data:', response.data);
    return response;
  },
  error => {
    console.error('Full Error Object:', error);
    console.error('Error Response:', error.response?.data);
    console.error('Error Status:', error.response?.status);
    return Promise.reject(error);
  }
);

const LogInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stage, setStage] = useState('email');
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: ""
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comprehensive error handler
  const handleError = (error) => {
    console.error('Login Error:', error);
    
    if (error.response) {
      const errorMessage = error.response.data.message || 
                           "An unexpected error occurred";
      setGeneralError(errorMessage);
      
      console.error('Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      setGeneralError("No response received from server. Please check your network connection.");
      console.error('No response received:', error.request);
    } else {
      setGeneralError("Error setting up the request. Please try again.");
      console.error('Error:', error.message);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/homepage");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneralError("");

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setGeneralError("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      // Attempt to request code
      const response = await api.post('/request-code', { 
        email: formData.email 
      });

      console.log("Code request successful:", response.data);

      // Move to verification stage
      setStage('verification');
      setGeneralError("");
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
      const response = await api.post('/verify-code', { 
        email: formData.email, 
        code: formData.verificationCode 
      });

      // Store user data
      const user = response.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      
      // Store token (adjust based on your backend response)
      const token = response.data.token || Math.random().toString(36).substr(2);
      localStorage.setItem("token", token);

      // Redirect to homepage
      const from = location.state?.from || "/homepage";
      navigate(from);
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

  // Email input form
  const renderEmailForm = () => (
    <form onSubmit={handleEmailSubmit}>
      <p className="mb-4 text-white font-semibold">Login to your account</p>
      <FormInput
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        label="Email"
        error={errors.email}
      />
      <div className="mb-6 text-center">
        <AuthButton 
          isSubmitting={isSubmitting} 
          label="Continue" 
        />
        <ErrorMessage
          message={generalError}
          onClose={() => setGeneralError("")}
        />
      </div>
    </form>
  );

  // Verification code form
  const renderVerificationForm = () => (
    <form onSubmit={handleVerificationSubmit}>
      <p className="mb-4 text-white font-semibold">
        Enter Verification Code
      </p>
      <p className="mb-4 text-gray-300 text-sm">
        A verification code has been sent to {formData.email}
      </p>
      <FormInput
        type="text"
        name="verificationCode"
        value={formData.verificationCode}
        onChange={handleChange}
        label="Verification Code"
        error={errors.verificationCode}
        maxLength={6}
      />
      <div className="mb-6 text-center">
        <AuthButton 
          isSubmitting={isSubmitting} 
          label="Verify" 
        />
        <button
          type="button"
          className="text-sm text-blue-300 hover:text-blue-200 mt-2 block mx-auto"
          onClick={() => setStage('email')}
        >
          Back to Email
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
      
      {stage === 'email' 
        ? renderEmailForm() 
        : renderVerificationForm()}

      <AuthFooter
        isLoginPage={true}
        onLoginRedirect={() => navigate("/signup")}
        onForgotPasswordRedirect={() => navigate("/forgotpassword")}
      />
    </AuthLayout>
  );
};

export default LogInPage;