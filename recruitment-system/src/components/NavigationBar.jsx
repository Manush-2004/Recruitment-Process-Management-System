import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * NavigationBar Component
 * Sticky top navigation following design system specifications
 */
const NavigationBar = () => {
  const { logout, isAuthenticated, hasRole, user } = useAuth();
  const { unread, markAllRead } = useNotifications();
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
            <>
              {/* Candidate quick links */}
              {hasRole && hasRole('Candidate') && (
                <div className="hidden sm:flex items-center gap-3">
                  <Link to="/candidate/dashboard" className="text-sm text-gray-700 hover:text-gray-900">Dashboard</Link>
                  <Link to="/candidate/profile" className="text-sm text-gray-700 hover:text-gray-900">Profile</Link>
                  <Link to="/candidate/interviews" className="text-sm text-gray-700 hover:text-gray-900">Interviews</Link>
                  <Link to="/candidate/offers" className="text-sm text-gray-700 hover:text-gray-900">Offers</Link>
                </div>
              )}

              {/* Recruiter quick links */}
              {hasRole && hasRole('Recruiter') && (
                <div className="hidden sm:flex items-center gap-3">
                  <Link to="/recruiter/dashboard" className="text-sm text-gray-700 hover:text-gray-900">Dashboard</Link>
                  <Link to="/recruiter/jobs" className="text-sm text-gray-700 hover:text-gray-900">Jobs</Link>
                  <Link to="/recruiter/candidates" className="text-sm text-gray-700 hover:text-gray-900">Candidates</Link>
                  <Link to="/recruiter/screening" className="text-sm text-gray-700 hover:text-gray-900">Screening</Link>
                  <Link to="/recruiter/interviews" className="text-sm text-gray-700 hover:text-gray-900">Interviews</Link>
                  <Link to="/recruiter/offers" className="text-sm text-gray-700 hover:text-gray-900">Offers</Link>                  
                </div>
              )}
              {/* Reviewer quick links */}
              {hasRole && hasRole('Reviewer') && (
                <div className="hidden sm:flex items-center gap-3">
                  <Link to="/reviewer/dashboard" className="text-sm text-gray-700 hover:text-gray-900">Dashboard</Link>
                  <Link to="/reviewer/screening" className="text-sm text-gray-700 hover:text-gray-900">Screening</Link>
                  <Link to="/reviewer/history" className="text-sm text-gray-700 hover:text-gray-900">History</Link>
                </div>
              )}

              {/* Interviewer quick links */}
              {hasRole && hasRole('Interviewer') && (
                <div className="hidden sm:flex items-center gap-3">
                  <Link to="/interviewer/dashboard" className="text-sm text-gray-700 hover:text-gray-900">Dashboard</Link>
                  <Link to="/interviewer/dashboard" className="text-sm text-gray-700 hover:text-gray-900">Interviews</Link>
                  <Link to="/interviewer/dashboard" className="text-sm text-gray-700 hover:text-gray-900">Feedback</Link>
                </div>
              )}
              {/* Notification badge */}
              <div className="relative">
                <button onClick={() => { markAllRead(); navigate('/notifications'); }} className="text-sm text-gray-700 hover:text-gray-900">
                  Notifications
                </button>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{unread}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link to="/candidate/profile" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">{(user?.fullName || user?.FullName || user?.email || user?.Email || '').split(' ')[0]?.[0] ?? 'U'}</div>
                  <span className="hidden sm:inline text-sm text-gray-700">{user?.fullName ?? user?.FullName ?? user?.email ?? user?.Email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
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

