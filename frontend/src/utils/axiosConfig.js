// src/utils/axiosConfig.js

import axios from "axios";

// Create an Axios instance with default configurations
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // Use environment variable
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // 5 seconds timeout
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Log request details in development mode only
    if (process.env.NODE_ENV === "development") {
      console.log("Making request to:", config.url);
      console.log(
        "With token:",
        token ? `Bearer ${token.substring(0, 20)}...` : "No token"
      );
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("Request error:", error);
    }
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network or server errors
    if (!error.response) {
      if (process.env.NODE_ENV === "development") {
        console.error("Network or server error:", error);
      }
      return Promise.reject(
        new Error(
          "Network error: Unable to reach the server. Please try again later."
        )
      );
    }

    const { status, data } = error.response;

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        if (process.env.NODE_ENV === "development") {
          console.error("Bad Request:", data);
        }
        return Promise.reject(
          new Error(data.message || "Bad Request. Please check your input.")
        );
      case 401:
        if (process.env.NODE_ENV === "development") {
          console.error("Unauthorized:", data);
        }
        localStorage.clear();
        window.location.href = "/login"; // Redirect to login
        return Promise.reject(new Error("Unauthorized. Redirecting to login."));
      case 403:
        if (process.env.NODE_ENV === "development") {
          console.error("Forbidden:", data);
        }
        return Promise.reject(
          new Error(data.message || "Forbidden. You don't have access.")
        );
      case 404:
        if (process.env.NODE_ENV === "development") {
          console.error("Not Found:", data);
        }
        return Promise.reject(
          new Error(data.message || "Resource not found.")
        );
      case 500:
        if (process.env.NODE_ENV === "development") {
          console.error("Internal Server Error:", data);
        }
        return Promise.reject(
          new Error(
            data.message || "Internal Server Error. Please try again later."
          )
        );
      default:
        if (process.env.NODE_ENV === "development") {
          console.error(`Unhandled error [${status}]:`, data);
        }
        return Promise.reject(
          new Error(data.message || "An unexpected error occurred.")
        );
    }
  }
);

export default api;
