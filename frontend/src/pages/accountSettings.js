import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import axios from "axios";
import Message from "../components/Error_successMessage"; // Import the Message component
import { Sidebar } from "../components/SideBar"; // Import the sidebar

const AccountSettings = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ email: "", username: "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState({
    bookingConfirmations: true,
    reminders: true,
    labUpdates: true,
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserInfo({
          email: parsedUser.email || "",
          username: parsedUser.username || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      navigate("/login"); // Redirect to login if no user data is found
    }
  }, [navigate]);

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error
    setSuccess(""); // Clear previous success
    setIsSubmitting(true);

    if (!currentPassword || !newPassword) {
      setError("Both fields are required");
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
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
        }
      );

      if (response.status === 200) {
        setSuccess(response.data.message || "Password changed successfully");
        setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
      }
    } catch (error) {
      console.error("API error:", error);
      if (error.response) {
        setError(error.response.data.message || "Something went wrong. Please try again.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  return (
    <div className="flex flex-wrap sm:flex-nowrap">
      {/* Sidebar */}
      <div className="w-full sm:w-1/4">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="w-full sm:w-3/4 mx-4 min-h-screen max-w-screen-xl sm:mx-8 xl:mx-auto mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 pt-3 sm:grid-cols-10">
          {/* Main Content */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-8 overflow-hidden rounded-xl sm:bg-gray-50 sm:px-8 sm:shadow">
            <div className="pt-4">
              <h1 className="py-2 text-2xl font-semibold">Account Settings</h1>
            </div>
            <hr className="mt-4 mb-8" />

            {/* User Information Section */}
            <div>
              <p className="py-2 text-xl font-semibold">User Information</p>
              <div className="flex flex-row sm:flex-row items-center pt-4">
                <div className="text-center mr-10 mb-4 sm:mb-0">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex justify-center items-center text-3xl font-bold">
                    {userInfo.username[0]} {/* Display the first letter of the username */}
                  </div>
                </div>

                {/* User Info Section (Username and Email combined) */}
                <div className="sm:text-left">
                  <p className="text-gray-600">
                    <strong>Username:</strong> {userInfo.username}
                  </p>
                  <p className="text-gray-600">
                    <strong>Email:</strong> {userInfo.email}
                  </p>
                </div>
              </div>
            </div>
            <hr className="mt-4 mb-8" />

            {/* Password Section */}
            <div>
              <p className="py-2 text-xl font-semibold">Password</p>
              <div className="flex flex-col space-y-3">
                <form onSubmit={handleSubmitPasswordChange}>
                  <div className="flex flex-col sm:flex-row sm:space-x-4"> {/* Adjust layout for smaller screens */}
                    <div className="flex-1">
                      <FormInput
                        type="password"
                        name="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        label="Current Password"
                      />
                    </div>
                    <div className="flex-1">
                      <FormInput
                        type="password"
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        label="New Password"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    {error && <Message message={error} type="error" onClose={() => setError("")} />}
                    {success && <Message message={success} type="success" onClose={() => setSuccess("")} />}
                  </div>

                  <div className="flex justify-between mt-4">
                    <AuthButton isSubmitting={isSubmitting} label="Apply Changes" />
                  </div>
                </form>
              </div>
            </div>

            <hr className="mt-4 mb-8" />

            {/* Notification Settings Section */}
            <div className="mb-5">
              <p className="py-2 text-xl font-semibold">Notification Settings</p>
              <p className="text-gray-600 text-sm mb-4">
                You can manage the types of notifications you receive below. You will always receive booking confirmations.
              </p>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow-sm">
                  <label className="flex items-center space-x-3 text-gray-700 font-medium">
                    <div className="w-32 text-sm font-semibold">Booking Confirmations</div>
                    <span className="text-gray-500 text-sm">You will always receive booking confirmations.</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="bookingConfirmations"
                      checked={notifications.bookingConfirmations}
                      onChange={handleNotificationChange}
                      className="mr-2"
                      disabled
                    />
                    <span className="text-gray-400">Disabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md shadow-sm hover:bg-gray-100 transition">
                  <label className="flex items-center space-x-3 text-gray-700 font-medium">
                    <div className="w-32 text-sm font-semibold">Reminders</div>
                    <span className="text-gray-500 text-sm">Receive reminders about your bookings.</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="reminders"
                      checked={notifications.reminders}
                      onChange={handleNotificationChange}
                      className="mr-2"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md shadow-sm hover:bg-gray-100 transition">
                  <label className="flex items-center space-x-3 text-gray-700 font-medium">
                    <div className="w-32 text-sm font-semibold">Lab Updates</div>
                    <span className="text-gray-500 text-sm">Get updates regarding lab changes or maintenance.</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="labUpdates"
                      checked={notifications.labUpdates}
                      onChange={handleNotificationChange}
                      className="mr-2"
                    />
                  </div>
                </div>
              </div>

              {/* Button Section */}
              <div className="flex flex-row justify-between mt-4">
                <div>
                  <button
                    onClick={() => navigate("/homepage")}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                  >
                    Close
                  </button>
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => {
                      // Save logic here
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      // Reset logic here
                      setNotifications({
                        bookingConfirmations: true,
                        reminders: true,
                        labUpdates: true,
                      });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
