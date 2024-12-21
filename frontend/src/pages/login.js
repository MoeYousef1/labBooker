import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import ErrorMessage from "../components/ErrorMessage";
import AuthButton from "../components/AuthButton";
import AuthFooter from "../components/AuthFooter";
import lapLogo from "../assets/laptop.png";
import headerImage from "../assets/header-bg.jpg";
import collegeLogoWhite from "../assets/collegeLogoWhite.png";

const LogInPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Used to capture the location
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Added password visibility toggle

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", formData);
      console.log("Success:", response.data);

      localStorage.setItem("token", response.data.token);
      const user = {
        email: formData.email,
        username: response.data.username,
      };
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect to the page the user came from or default to /homepage
      const from = location.state?.from || "/homepage";
      navigate(from);
    } catch (error) {
      const backendError = error.response?.data?.message || "An unexpected error occurred.";
      setGeneralError(backendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rightContent = (
    <>
      <div className="text-center">
        <h4 className="mb-4 text-lg font-semibold">LabBooker - Azrieli College of Engineering Jerusalem</h4>
        <p className="text-sm mb-4">LabBooker is your go-to platform for reserving study rooms. Sign up to get started and book your next study space today!</p>
      </div>
      <div className="mt-2">
        <img src={collegeLogoWhite} alt="collegeLogoWhite" />
      </div>
    </>
  );

  return (
    <AuthLayout headerImage={headerImage} rightContent={rightContent}>
      <div className="text-center">
        <img className="mx-auto w-48" src={lapLogo} alt="logo" />
        <h4 className="mb-8 mt-1 text-4xl font-extrabold text-white">LabBooker</h4>
      </div>
      <form onSubmit={handleSubmit}>
        <p className="mb-4 text-white font-semibold">Please login to your account</p>
        <FormInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          label="Email"
          error={errors.email}
        />
        <div className="relative">
          <FormInput
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            label="Password"
            error={errors.password}
          />
          <button
            type="button"
            className="absolute top-3 right-3 text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <div className="mb-6 text-center">
          <AuthButton isSubmitting={isSubmitting} label="Log In" />
          <ErrorMessage message={generalError} onClose={() => setGeneralError("")} />
        </div>
      </form>
      <AuthFooter
        isLoginPage={true}
        onLoginRedirect={() => navigate("/signup")}
        onForgotPasswordRedirect={() => navigate("/forgotpassword")}
      />
    </AuthLayout>
  );
};

export default LogInPage;
