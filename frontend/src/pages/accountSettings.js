import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/SideBar"; // Import the sidebar

const AccountSettings = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ email: "", username: "" });

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 sm:px-8 md:px-12 mt-16 sm:mt-0 sm:ml-64 py-10 mx-auto ">
        <div className="grid grid-cols-1 gap-4">
          {/* Main Content */}
          <div className="p-10 bg-gray-50 rounded-lg shadow-xl mb-4">
            <h1 className="text-2xl font-semibold">Account Settings</h1>
            <hr className="my-4" />

            {/* User Information Section */}
            <div>
              <p className="text-xl font-semibold">User Information</p>
              <div className="flex flex-col sm:flex-row items-center pt-4">
                <div className="text-center mb-4 sm:mb-0 sm:mr-10">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex justify-center items-center text-3xl font-bold">
                    {userInfo.username[0]} {/* First letter of username */}
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <p className="text-gray-600">
                    <strong>Username:</strong> {userInfo.username}
                  </p>
                  <p className="text-gray-600">
                    <strong>Email:</strong> {userInfo.email}
                  </p>
                </div>
              </div>
            </div>
            <hr className="my-4" />

            {/* Password Section */}
            <div>
              <p className="text-xl font-semibold">Password</p>
              <div className="flex flex-col space-y-3">
                <div className="text-center mt-4">
                  <button
                    onClick={() => navigate("/changepassword")}
                    className="bg-gradient-primaryToRight hover:bg-gradient-primaryToLeft text-white px-4 py-2 rounded-md transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
            <hr className="my-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
