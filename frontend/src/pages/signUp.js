import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import ErrorMessage from "../components/Error_successMessage";
import AuthButton from "../components/AuthButton";
import AuthFooter from "../components/AuthFooter";
import headerImage from "../assets/header-bg.jpg";
import lapLogo from "../assets/laptop.png";
import collegeLogoWhite from "../assets/collegeLogoWhite.png";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const handleCloseError = () => {
    setGeneralError(''); // Clears the general error
    setErrors({}); // Clears specific field errors (like confirmPassword)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords does not match." });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        formData
      );
      console.log("Success:", response.data);
      alert("Sign-up successful!");
      navigate("/login");
    } catch (error) {
      const backendError =
        error.response?.data?.message || "An unexpected error occurred.";
      setGeneralError(backendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rightContent = (
    <>
      <div className="text-center">
              <h4 className="mb-4 text-lg font-semibold">LabBooker - Azrieli College of Engineering Jerusalem</h4>
              <p className="text-sm mb-4 ">LabBooker is your go-to platform for reserving study rooms. Sign up to get started and book your next study space today!</p>
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
        <h4 className="mb-8 mt-1 text-4xl font-extrabold text-white">
          LabBooker
        </h4>
      </div>
      <form onSubmit={handleSubmit}>
        <p className="mb-4 text-white font-semibold">Create a new account</p>
        <FormInput
          name="username"
          label="User Name"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />
        <FormInput
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          type="email"
        />
        <FormInput
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          type="password"
        />
        <FormInput
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          type="password"
        />
        <div className="mb-6 text-center">
        <AuthButton isSubmitting={isSubmitting} label="Sign Up" />
        <ErrorMessage message={generalError || errors.email ||errors.confirmPassword} onClose={() => handleCloseError()} />
        </div>
      </form>
      <AuthFooter isRegisterPage={true} onLoginRedirect={() => navigate("/login")} />
    </AuthLayout>
  );
};

export default SignUpPage;
