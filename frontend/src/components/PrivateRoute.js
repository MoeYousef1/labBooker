import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem("user"); // Check if the user is logged in

  // If the user is not logged in, redirect to the login page
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
