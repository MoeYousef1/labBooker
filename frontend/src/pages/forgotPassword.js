import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
// import AuthFooter from "../components/AuthFooter";
import collegeBuilding from "../assets/collegeBuilding.jpg";
//import axios from 'axios';


const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter code
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Manage form submission state
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Simulate a mock response
    setTimeout(() => {
      setSuccess("A verification code has been sent to your email.");
      setStep(2); // Move to step 2 for code entry
      setIsSubmitting(false);
    }, 1000); // Simulate a delay

    // In a real scenario, replace the setTimeout with actual API logic
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Simulate mock code verification
    setTimeout(() => {
      const mockSuccess = true; // Simulate success
      if (mockSuccess) {
        setSuccess("Code verified successfully! Redirecting to change password page.");
        navigate("/changepassword");
      } else {
        setError("Invalid code. Please try again.");
      }
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section
      className="min-h-screen"
      style={{
        backgroundImage: `url(${collegeBuilding})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="min-h-screen flex justify-center items-center">
      <div className="w-full sm:w-[640px] p-10 bg-black bg-opacity-30 shadow-lg rounded-lg flex flex-col lg:flex-row">
      <div className="w-full p-6">
            <div className="text-center">
            <h4 className="mb-4 text-4xl font-extrabold text-white">
                {step === 1 ? "Forgot password?" : "Enter Verification Code"}
              </h4>
              <p className="mt-2 text-sm text-white">
                {step === 1 ? (
                  <>
                  Enter your email address to reset your password. We'll send a verification code to your email.
                  </>
                ) : (
                  "Check your email for the verification code."
                )}
              </p>
            </div>

            <div className="mt-5">
              {step === 1 ? (
                <form onSubmit={handleEmailSubmit}>
                  <FormInput
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email address"
                    error={error}
                  />
                  {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
                  <AuthButton isSubmitting={isSubmitting} label="Reset password" />
                  {/* <AuthFooter isForgotPassword={true} onLoginRedirect={() => navigate("/login")} /> */}
                </form>
              ) : (
                <form onSubmit={handleCodeSubmit}>
                  <FormInput
                    type="text"
                    name="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    label="Verification Code"
                    error={error}
                  />
                  <AuthButton isSubmitting={isSubmitting} label="Verify Code" />
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;
