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
      console.error("API Error:", error);
      throw error;
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
      console.error("API Error:", error);
      throw error;
    }
};
