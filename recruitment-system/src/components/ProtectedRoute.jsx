import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const userRoles = user?.roles || [];
    const allowed = roles.some((r) => userRoles.some(ur => String(ur).toLowerCase() === String(r).toLowerCase()));
    if (!allowed) {
      // Not authorized for this role
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

