import React, { useState, useEffect } from "react";
import Navbar from "../components/NavBar2";
import HeroSection from "../components/HeroSection2";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/footer";

const HomePage = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "", // Now only storing email
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserInfo({
          email: parsedUser.email || "", // Only set email
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem("user");
    console.log("Logging out...");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar
        profileDropdownOpen={profileDropdownOpen}
        toggleProfileDropdown={toggleProfileDropdown}
        handleLogout={handleLogout}
        userInfo={userInfo}
      />
      <HeroSection userInfo={userInfo} />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default HomePage;
