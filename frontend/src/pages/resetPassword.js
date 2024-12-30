import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import collegeBuilding from "../assets/collegeBuilding.jpg";
import Message from "../components/Error_successMessage"; // Import the Message component
import axios from "axios";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error
    setSuccess(""); // Clear previous success
    setIsSubmitting(true);

    // Retrieve stored email from localStorage inside handleSubmit
    const storedEmail = localStorage.getItem("email");

    if (!confirmNewPassword || !newPassword) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (!storedEmail) {
      setError("Unable to retrieve email. Please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/settings/reset-password",
        {
          email: storedEmail,
          newPassword,
          confirmNewPassword,
        },
      );

      if (response.status === 200) {
        setSuccess(response.data.message || "Password reset successfully");
        localStorage.removeItem("email"); // Clear the email after resetting password
        setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
      }
    } catch (error) {
      console.error("API error:", error);
      if (error.response) {
        setError(
          error.response.data.message ||
            "Something went wrong. Please try again.",
        );
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem("email"); // Clear the email after resetting password
    navigate("/homepage"); // Redirect to home or any other page you prefer
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
                Reset Password
              </h4>
              <p className="mt-2 text-sm text-white">
                Please enter your new password and confirm it to reset your
                credentials.
              </p>
            </div>

            <div className="mt-5">
              <form onSubmit={handleSubmit}>
                <FormInput
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  label="New Password"
                />
                <FormInput
                  type="password"
                  name="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  label="Confirm New Password"
                />

                <div className="text-center">
                  {error && (
                    <Message
                      message={error}
                      type="error"
                      onClose={() => setError("")}
                    />
                  )}
                  {success && (
                    <Message
                      message={success}
                      type="success"
                      onClose={() => setSuccess("")}
                    />
                  )}
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mr-2 w-5/12 py-2 px-4 bg-gradient-grayToRight hover:bg-gradient-grayToLeft text-white rounded-md"
                  >
                    Cancel
                  </button>
                  <AuthButton
                    isSubmitting={isSubmitting}
                    label="Reset Password"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPasswordPage;
