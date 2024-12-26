import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import collegeBuilding from "../assets/collegeBuilding.jpg";
import Message from "../components/Error_successMessage"; // Import the Message component
import axios from "axios";

const ForgotPasswordPage = () => {
const [email, setEmail] = useState("");
const [code, setCode] = useState("");
const [step, setStep] = useState(1);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const navigate = useNavigate();

const handleEmailSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setIsSubmitting(true);

  try {
    const response = await axios.post("http://localhost:5000/api/settings/forgot-password", {
      email,
    });

    if (response.data && response.status === 200) {
      setSuccess(response.data.message);
      setStep(2); // Move to step 2 for code entry
      localStorage.setItem("email", email); // Store email in localStorage
    }
  } catch (err) {
    setError(err.response?.data?.message || "Failed to send verification email. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


const handleCodeSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setIsSubmitting(true);

  const storedEmail = localStorage.getItem("email"); // Retrieve email from localStorage

  try {
    const response = await axios.post("http://localhost:5000/api/settings/validate-code", {
      email: storedEmail, // Send the email that was stored earlier
      code, // Just send the code
    });

    if (response.data && response.status === 200) {
      setSuccess(response.data.message);
      setTimeout(() => navigate("/resetpassword"), 2000); // Redirect after a delay
    }
  } catch (err) {
    console.log(err.response?.data); // Log the error response for debugging
    setError(err.response?.data?.message || "Invalid verification code. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
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
                {step === 1
                  ? "Enter your email address to reset your password. We'll send a verification code to your email."
                  : "Check your email for the verification code."}
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
                  <div className="text-center">
                  {error && <Message message={error} type="error" onClose={() => setError("")} />}
                  {success && <Message message={success} type="success" onClose={() => setSuccess("")} />}
                  </div>
                    <div className="mt-4">
                  <AuthButton isSubmitting={isSubmitting} label="Reset password" />
                    </div>
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
                  <div className="text-center">
                  {error && <Message message={error} type="error" onClose={() => setError("")} />}
                  {success && <Message message={success} type="success" onClose={() => setSuccess("")} />}
                  </div>
                    <div className="mt-4">
                  <AuthButton isSubmitting={isSubmitting} label="Verify Code" />
                    </div>
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
