import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * NavigationBar Component
 * Sticky top navigation following design system specifications
 */
const NavigationBar = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white border-b border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 h-full flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <Link to="/dashboard" className="text-xl font-bold text-gray-900">
            RecruitHub
          </Link>
        </div>


        {/* Right: Auth Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="h-10 px-6 rounded-[10px] bg-ds-gradient text-white font-semibold text-sm flex items-center justify-center transition-all duration-200 hover:brightness-105"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;

