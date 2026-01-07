/**
 * Centralized API Routes Configuration
 * All API endpoints should be defined here
 * Works in both browser (Vite) and Node (tests)
 */

// Try Vite-style env first, otherwise fall back to node env or a sensible default.
const viteBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : undefined;

export const API_BASE_URL = viteBase || process.env.VITE_API_BASE_URL || 'http://localhost:5190';

export const apiRoutes = {
  // Auth endpoints
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
  },
};

export default apiRoutes;

