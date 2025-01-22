// src/utils/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000 // 5 seconds timeout
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log('Making request to:', config.url);
    console.log('With token:', token ? 'Bearer ' + token.substring(0, 20) + '...' : 'No token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Server is not running or not accessible');
      return Promise.reject(new Error('Unable to connect to server. Please check if the server is running.'));
    }

    if (error.response?.status === 400) {
      console.error('Bad Request:', error.response.data);
    }

    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;