import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Add Authorization Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Expiry and Refresh
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    if (error.response?.status === 401 && error.response.data.code === "TOKEN_EXPIRED") {
      try {
        console.warn("Access token expired. Attempting to refresh...");

        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token found.");
        }

        // Refresh the token
        const refreshResponse = await axios.post("http://localhost:5000/api/auth/refresh-token", { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Update tokens in localStorage
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        console.log("Token refreshed successfully.");

        // Retry the original request with the new access token
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return api.request(error.config);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Clear tokens and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.alert("Your session has expired. Please log in again.");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    console.error("API Response Error:", error);
    return Promise.reject(error);
  }
);

export default api;
