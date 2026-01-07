import axios from 'axios';
import { API_BASE_URL } from '../config/apiRoutes.js';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (guarded for Node tests)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (guard redirects in Node)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login (if in browser)
      if (typeof localStorage !== 'undefined') localStorage.removeItem('token');
      if (typeof window !== 'undefined' && typeof window.location !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 

