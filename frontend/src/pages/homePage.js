import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import { BookOpen, Calendar, Activity } from 'lucide-react';

const HomePage = () => {
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
            id: parsedUser.id || "",
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

  // Prevent rendering if not authenticated
  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100/50">
      <Navbar 
        userInfo={userInfo} 
        setUserInfo={setUserInfo} 
      />

      {/* Main content with increased top padding and bottom margin */}
      <main className="flex-grow pt-24 pb-16 container mx-auto px-4">
        {/* Welcome Section with more breathing room */}
        <section className="bg-white/70 backdrop-blur-sm shadow-md rounded-xl p-6 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">
                Welcome, {userInfo.username}
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your lab bookings and explore available rooms.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-blue-100/50 p-4 rounded-full shadow-md">
                <Activity className="w-12 h-12 text-blue-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid with increased gap */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Book a Room Card - Enhanced Interaction */}
          <div 
            onClick={() => navigate("/labrooms")}
            className="
              bg-white/70 backdrop-blur-sm rounded-xl p-6 
              shadow-md hover:shadow-xl 
              transition-all duration-300
              cursor-pointer group
              flex items-center space-x-6
              border border-transparent hover:border-blue-200
              relative overflow-hidden
            "
          >
            <div className="
              bg-blue-100/50 text-blue-600 
              rounded-full p-4 
              group-hover:bg-blue-200/50
              transition-colors
              shadow-md
            ">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 
                group-hover:text-blue-600 transition-colors">
                Book a Room
              </h2>
              <p className="text-gray-600">
                Find and reserve available lab rooms
              </p>
            </div>
            <div className="
              absolute bottom-0 right-0 
              bg-blue-50 w-24 h-24 
              -rotate-45 translate-x-1/2 translate-y-1/2
              opacity-0 group-hover:opacity-100 
              transition-opacity duration-300
            "></div>
          </div>

          {/* My Bookings Card - Similar Enhanced Style */}
          <div 
            onClick={() => navigate("/bookings")}
            className="
              bg-white/70 backdrop-blur-sm rounded-xl p-6 
              shadow-md hover:shadow-xl 
              transition-all duration-300
              cursor-pointer group
              flex items-center space-x-6
              border border-transparent hover:border-green-200
              relative overflow-hidden
            "
          >
            <div className="
              bg-green-100/50 text-green-600 
              rounded-full p-4 
              group-hover:bg-green-200/50
              transition-colors
              shadow-md
            ">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2
                group-hover:text-green-600 transition-colors">
                My Bookings
              </h2>
              <p className="text-gray-600">
                View and manage your current bookings
              </p>
            </div>
            <div className="
              absolute bottom-0 right-0 
              bg-green-50 w-24 h-24 
              -rotate-45 translate-x-1/2 translate-y-1/2
              opacity-0 group-hover:opacity-100 
              transition-opacity duration-300
            "></div>
          </div>
        </div>

        {/* Quick Stats Section with more spacing */}
        <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { 
              title: "Active Bookings", 
              value: 0, 
              color: "text-blue-500",
              icon: <BookOpen className="w-8 h-8 text-blue-500" />
            },
            { 
              title: "Available Rooms", 
              value: 0, 
              color: "text-green-500",
              icon: <Activity className="w-8 h-8 text-green-500" />
            }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="
                bg-white/70 backdrop-blur-sm rounded-xl p-6 
                shadow-md hover:shadow-lg 
                transition-all duration-300 
                transform hover:-translate-y-2
                flex items-center space-x-6
              "
            >
              <div className="
                bg-gray-100/50 rounded-full p-3
                shadow-sm
              ">
                {stat.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  {stat.title}
                </h3>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Add margin-top to Footer to create more separation */}
      <Footer className="mt-16" />
    </div>
  );
};

export default HomePage;