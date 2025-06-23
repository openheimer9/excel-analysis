// src/api/axios.js
import axios from 'axios';

// Base URL for your API
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api"

// Create an axios instance/API
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Set to true if you're using cookies/JWT auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Get the token from local storage
    const token = localStorage.getItem('token');
    if (token) {
      // Attach the token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // Handle the error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Handle the error
    if (error.response && error.response.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;