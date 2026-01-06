/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import * as jwtDecode from 'jwt-decode';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);

// Use jwt-decode when available, with robust fallbacks for different module shapes
const parseJwt = (t) => {
  try {
    // jwt-decode may be exported as a function or as { default: fn } depending on bundler interop
    const decoder = (typeof jwtDecode === 'function') ? jwtDecode : (jwtDecode && typeof jwtDecode.default === 'function') ? jwtDecode.default : null;
    if (decoder) return decoder(t);

    // Fallback: manual base64 decode (best-effort)
    const payload = t.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
};

// Extract user info from token
const extractUserFromToken = (t) => {
  const p = parseJwt(t);
  if (!p) return null;
  const roles = [];
  if (p.role) {
    if (Array.isArray(p.role)) roles.push(...p.role);
    else roles.push(p.role);
  }
  // Some tokens use ClaimTypes.Role which serializes as 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
  if (p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
    const r = p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (Array.isArray(r)) roles.push(...r); else roles.push(r);
  }
  return { email: p.unique_name || p.name || p.sub, fullName: p.FullName || p.fullName || null, roles };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Initialize user from stored token
  useEffect(() => {
    if (token) {
      const u = extractUserFromToken(token);
      setUser(u);
    } else {
      setUser(null);
    }
  }, [token]);

  // Login function
  const login = async (loginData) => {
    setLoading(true);
    setError(null);
    try {
      const newToken = await loginUser(loginData);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      const u = extractUserFromToken(newToken);
      setUser(u);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (registerData) => {
    setLoading(true);
    setError(null);
    try {
      const newToken = await registerUser(registerData);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      const u = extractUserFromToken(newToken);
      setUser(u);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setError(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const hasRole = (role) => user?.roles?.includes(role);

  const value = {
    token,
    user,
    isAuthenticated,
    hasRole,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

