import axiosInstance from "../api/axiosConfig";

/**
 * Auth Service Layer
 * Business logic abstraction for authentication
 * Pages should only call services, never APIs directly
 */

/**
 * Register a new user
 * @param {Object} registerData - RegisterRequest data
 * @returns {Promise<string>} JWT token
 * @throws {Error} If registration fails
 */
export const registerUser = async (registerData) => {
  try {
    const payload = {
      FullName: registerData.FullName,
      Email: registerData.Email,
      Password: registerData.Password,
      Role: registerData.Role,
    };
    if (registerData.Phone) payload.Phone = registerData.Phone;
    if (registerData.Skills) payload.Skills = registerData.Skills;
    const response = await axiosInstance.post("/api/auth/register", payload);
    return response.data.token;
  } catch (error) {
    // Transform API errors to user-friendly messages
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.status === 400 && error.response?.data) {
      // Handle validation errors or custom error messages
      const errorMessage = error.response.data.title || error.response.data;
      throw new Error(errorMessage);
    }
    if (
      error.message === "User already exists" ||
      error.response?.data?.includes("already exists")
    ) {
      throw new Error("User already exists");
    }
    throw new Error("Registration failed. Please try again.");
  }
};

/**
 * Login user
 * @param {Object} loginData - LoginRequest data
 * @returns {Promise<string>} JWT token
 * @throws {Error} If login fails
 */
export const loginUser = async (loginData) => {
  try {
    const response = await axiosInstance.post("/api/auth/login", {
      Email: loginData.Email,
      Password: loginData.Password,
    });
    return response.data.token;
  } catch (error) {
    // Transform API errors to user-friendly messages
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.status === 400 || error.response?.status === 401) {
      throw new Error("Invalid credentials");
    }
    if (
      error.message?.includes("Invalid credentials") ||
      error.response?.data?.includes("Invalid credentials")
    ) {
      throw new Error("Invalid credentials");
    }
    throw new Error("Login failed. Please try again.");
  }
};
