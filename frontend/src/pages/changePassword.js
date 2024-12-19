import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import AuthFooter from "../components/AuthFooter";
import collegeBuilding from "../assets/collegeBuilding.jpg"; // Reuse the background image
//import axios from 'axios';

const ChangePasswordPage = () => {
  const [CurrentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(false);
  
    // Frontend validation
    if (!CurrentPassword || !newPassword) {
      setError("All fields are required");
      return;
    }
  
    setIsSubmitting(true); // Proceed with submission only if validation passes
  
    try {
      // Mock success response
      console.log("Mocking API call...");
      const mockResponse = { status: 200, data: { message: "Password updated successfully." } };
  
      if (mockResponse.status === 200) {
        setSuccess(mockResponse.data.message);
        navigate("/login"); // Redirect to login page after success
      }
    } catch (error) {
      // Simulate a backend error
      setError("Mock error: Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  const handleCancel = () => {
    navigate("/"); // Redirect to home or any other page you prefer
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
        <div className="w-full sm:w-[640px] p-10 bg-black bg-opacity-30 shadow-lg rounded-lg flex flex-col">
          <div className="w-full p-6">
            <div className="text-center">
              <h4 className="mb-4 text-4xl font-extrabold text-white">
                Change Password
              </h4>
              <p className="mt-2 text-sm text-white">
                Please enter your current password and new password to update your credentials.
              </p>
            </div>

            <div className="mt-5">
              <form onSubmit={handleSubmit}>
                <FormInput
                  type="password"
                  name="CurrentPassword"
                  value={CurrentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  label="Current Password"
                  error={error}
                />
                <FormInput
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  label="New Password"
                  error={error}
                />

                {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mr-2 w-5/12 py-2 px-4 bg-gray-400 text-white rounded-md"
                  >
                    Cancel
                  </button>
                  <AuthButton isSubmitting={isSubmitting} label="Apply Changes" />
                </div>
              </form>
            </div>
            <AuthFooter isForgotPassword={false} onLoginRedirect={() => navigate("/login")} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChangePasswordPage;
