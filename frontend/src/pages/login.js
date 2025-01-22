import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from '../utils/axiosConfig';

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
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          await api.get('/auth/verify-token');
          navigate("/homepage");
        } catch (error) {
          console.error('Session validation failed:', error);
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
    console.error('Operation failed:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
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
          setGeneralError(error.response.data.message || "An unexpected error occurred");
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
    setErrors((prev) => ({ ...prev, [name]: "" }));
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

      console.log('Requesting login code for:', formData.email);

      const response = await api.post('/auth/login', { 
        email: formData.email 
      });

      console.log('Login request response:', response.data);
      
      setStage('verification');
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
      console.log('Submitting verification with:', {
        email: formData.email,
        code: formData.verificationCode
      });

      const response = await api.post('/auth/verify-login', { 
        email: formData.email, 
        code: formData.verificationCode 
      });

      console.log('Verification response:', response.data);

      const { user, accessToken, refreshToken } = response.data;

      if (!accessToken || !refreshToken) {
        throw new Error('Invalid server response - missing tokens');
      }

      // Store authentication data
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      console.log('Authentication data stored:', {
        user: user.email,
        tokenPreview: `${accessToken.substring(0, 10)}...`,
        refreshTokenPreview: `${refreshToken.substring(0, 10)}...`
      });

      // Test authentication
      try {
        const testResponse = await api.get('/auth/test');
        console.log('Authentication test:', testResponse.data);
      } catch (testError) {
        console.error('Authentication test failed:', testError);
      }

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
      console.log('Requesting new code for:', formData.email);

      await api.post('/auth/request-code', { 
        email: formData.email 
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

  const renderEmailForm = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <p className="mb-4 text-white font-semibold">Login to your account</p>
      <FormInput
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        label="Email"
        error={errors.email}
        placeholder="Enter your email"
        required
      />
      <div className="mb-6 text-center">
        <AuthButton 
          isSubmitting={isSubmitting} 
          label="Continue" 
        />
        {generalError && (
          <ErrorMessage
            message={generalError}
            onClose={() => setGeneralError("")}
          />
        )}
      </div>
    </form>
  );

  const renderVerificationForm = () => (
    <form onSubmit={handleVerificationSubmit} className="space-y-4">
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
        placeholder="Enter 6-digit code"
        required
      />
      <div className="mb-6 text-center space-y-2">
        <AuthButton 
          isSubmitting={isSubmitting} 
          label="Verify" 
        />
        <button
          type="button"
          className="text-sm text-blue-300 hover:text-blue-200 block mx-auto"
          onClick={() => setStage('email')}
        >
          Back to Email
        </button>
        <button
          type="button"
          className={`text-sm ${
            resendDisabled 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-300 hover:text-blue-200'
          } block mx-auto`}
          onClick={handleResendCode}
          disabled={resendDisabled}
        >
          {resendTimer > 0 
            ? `Resend code in ${resendTimer}s` 
            : 'Resend code'}
        </button>
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