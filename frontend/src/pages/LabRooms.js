import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import RoomsSection from "../components/roomsSection";
import { BookOpen } from 'lucide-react';
import api from '../utils/axiosConfig';


const LabRooms = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUserInfo({
            email: parsedUser.email || "",
            username: parsedUser.username || "",
            profilePicture: parsedUser.profilePicture || "",
            id: parsedUser._id || "",
          });
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        navigate("/login");
      }
    };

    checkAuthentication();
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/user/profile");
        setUserInfo(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Failed to fetch updated profile:", error);
        // handle error or redirect
      }
    };
  
    fetchProfile();
  }, []);

  // Prevent rendering if not authenticated
  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar 
        userInfo={userInfo} 
        setUserInfo={setUserInfo} 
      />

      {/* Main content with increased top padding and bottom margin */}
      <main className="flex-grow pt-24 pb-16 container mx-auto px-4">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <BookOpen className="mr-3 text-blue-500" />
                Lab Rooms
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                Browse and book available laboratory spaces
              </p>
            </div>
          </div>
        </section>

        {/* Rooms Section */}
        <RoomsSection userInfo={userInfo} />
      </main>

      <Footer />
    </div>
  );
};

export default LabRooms;