import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  // Get user data from localStorage
  const userData = localStorage.getItem("user");

  // Parse user object if exists
  const user = userData ? JSON.parse(userData) : null;

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role (if specified)
  // components/PrivateRoute.js
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/homepage" replace />;
  }

  // If all checks pass, render children
  return children;
};

export default PrivateRoute;
