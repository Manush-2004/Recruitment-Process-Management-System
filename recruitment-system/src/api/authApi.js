import axiosInstance from './axiosConfig';
import { apiRoutes } from '../config/apiRoutes';

/**
 * Auth API Layer
 * Handles all authentication-related API calls
 * Matches backend AuthController endpoints exactly
 */

/**
 * Register a new user
 * @param {Object} registerData - RegisterRequest matching backend model
 * @param {string} registerData.FullName - User's full name
 * @param {string} registerData.Email - User's email
 * @param {string} registerData.Password - User's password
 * @param {string} registerData.Role - User's role
 * @returns {Promise<{token: string}>} Response with JWT token
 */
export const register = async (registerData) => {
  const payload = {
    FullName: registerData.FullName,
    Email: registerData.Email,
    Password: registerData.Password,
    Role: registerData.Role,
  };
  if (registerData.Phone) payload.Phone = registerData.Phone;
  if (registerData.Skills) payload.Skills = registerData.Skills;
  const response = await axiosInstance.post(apiRoutes.auth.register, payload);
  return response.data;
};

/**
 * Login user
 * @param {Object} loginData - LoginRequest matching backend model
 * @param {string} loginData.Email - User's email
 * @param {string} loginData.Password - User's password
 * @returns {Promise<{token: string}>} Response with JWT token
 */
export const login = async (loginData) => {
  const response = await axiosInstance.post(apiRoutes.auth.login, {
    Email: loginData.Email,
    Password: loginData.Password,
  });
  return response.data;
};

