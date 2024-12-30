import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import AuthFooter from "../components/AuthFooter";
import collegeBuilding from "../assets/collegeBuilding.jpg";
import axios from "axios";
import Message from "../components/Error_successMessage"; // Import the Message component

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error
    setSuccess(""); // Clear previous success
    setIsSubmitting(true);

    if (!currentPassword || !newPassword) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to change your password.");
      setIsSubmitting(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = user?.email;
    if (!userEmail) {
      setError("Unable to retrieve email. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/settings/change-password",
        {
          email: userEmail,
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 200) {
        setSuccess(response.data.message || "Password changed successfully");
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
                Change Password
              </h4>
              <p className="mt-2 text-sm text-white">
                Please enter your current password and new password to update
                your credentials.
              </p>
            </div>

            <div className="mt-5">
              <form onSubmit={handleSubmit}>
                <FormInput
                  type="password"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  label="Current Password"
                />
                <FormInput
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  label="New Password"
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
                    label="Apply Changes"
                  />
                </div>
              </form>
            </div>
            <AuthFooter
              isForgotPassword={false}
              onLoginRedirect={() => navigate("/login")}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChangePasswordPage;
