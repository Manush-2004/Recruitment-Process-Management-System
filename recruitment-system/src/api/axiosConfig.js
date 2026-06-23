import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("token")
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof localStorage !== "undefined") localStorage.removeItem("token");
      if (
        typeof window !== "undefined" &&
        typeof window.location !== "undefined"
      )
        window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
