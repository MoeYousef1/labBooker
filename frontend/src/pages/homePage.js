import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/footer";

const HomePage = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "",
    username: "",
  });

  const navigate = useNavigate(); // Use navigate for redirection

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserInfo({
          email: parsedUser.email || "",
          username: parsedUser.username || "",  // Get the username
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      navigate("/login"); // Redirect to login if no user data is found
    }
  }, [navigate]);

  const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserInfo({ email: "", username: "" });
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar
        profileDropdownOpen={profileDropdownOpen}
        toggleProfileDropdown={toggleProfileDropdown}
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        handleLogout={handleLogout} // Pass logout function to Navbar
      />
      <HeroSection userInfo={userInfo} />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default HomePage;
