import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Login Page Component
 * Handles user login with Email and Password
 * Matches backend LoginRequest model exactly
 * Strictly follows Design System JSON specifications
 */

// Password visibility toggle icons (outline style, 18-20px)
const EyeIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 01-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error, clearError, hasRole } = useAuth();
  
  const [formData, setFormData] = useState({
    Email: '',
    Password: '',
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to role-specific dashboards
      if (hasRole && hasRole('Candidate')) navigate('/candidate/dashboard', { replace: true });
      else if (hasRole && hasRole('Recruiter')) navigate('/recruiter/dashboard', { replace: true });
      else if (hasRole && hasRole('Reviewer')) navigate('/reviewer/dashboard', { replace: true });
      else if (hasRole && hasRole('Interviewer')) navigate('/interviewer/dashboard', { replace: true });
      else if (hasRole && hasRole('HR')) navigate('/hr/dashboard', { replace: true });
      else if (hasRole && hasRole('Admin')) navigate('/admin/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, hasRole]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validate = () => {
    const errors = {};
    
    if (!formData.Email.trim()) {
      errors.Email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      errors.Email = 'Please enter a valid email address';
    }
    
    if (!formData.Password) {
      errors.Password = 'Password is required';
    } else if (formData.Password.length < 6) {
      errors.Password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (!validate()) {
      return;
    }

    const result = await login({
      Email: formData.Email.trim(),
      Password: formData.Password,
    });

    if (result.success) {
      if (hasRole && hasRole('Candidate')) navigate('/candidate/dashboard', { replace: true });
      else if (hasRole && hasRole('Recruiter')) navigate('/recruiter/dashboard', { replace: true });
      else if (hasRole && hasRole('Reviewer')) navigate('/reviewer/dashboard', { replace: true });
      else if (hasRole && hasRole('Interviewer')) navigate('/interviewer/dashboard', { replace: true });
      else if (hasRole && hasRole('HR')) navigate('/hr/dashboard', { replace: true });
      else if (hasRole && hasRole('Admin')) navigate('/admin/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-ds-bg">
      {/* Card Container - Design System: Mobile 90-95% width, Desktop 360-420px, centered, 12px border radius, soft shadow */}
      <div className="w-[92%] sm:w-[360px] max-w-[420px] p-6 sm:p-8 bg-ds-surface rounded-ds-card shadow-ds-card">
        {/* Heading Section - Design System: 20-22px, weight 600, color #1F2937, center aligned */}
        <div className="mb-6">
          <h2 className="text-center font-semibold text-[22px] font-semibold text-gray-800 mb-2">
            Sign in to your account
          </h2>
          {/* Optional subheading - Design System: 14px, weight 400, color #6B7280 */}
          <p className="text-center text-sm text-ds-text-secondary">
            Enter your credentials to continue
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Form Fields - Design System: field spacing 12-16px */}
          <div className="flex flex-col gap-4">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="Email"
                className="block text-sm font-medium text-ds-text-label mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <input
                  id="Email"
                  name="Email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.Email}
                  onChange={handleChange}
                  className={`w-full transition-all duration-200 placeholder:text-ds-placeholder h-[46px] rounded-ds-input px-4 text-sm text-ds-text-primary outline-none ${
                    validationErrors.Email 
                      ? 'border border-ds-border-error focus:border-ds-border-error focus:ring-2 focus:ring-red-200' 
                      : 'border border-ds-border focus:border-ds-border-focus focus:shadow-ds-focus'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {validationErrors.Email && (
                <p className="mt-1.5 text-xs text-ds-error">
                  {validationErrors.Email}
                </p>
              )}
            </div>
            
            {/* Password Field */}
            <div>
              <label 
                htmlFor="Password"
                className="block text-sm font-medium text-ds-text-label mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="Password"
                  name="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.Password}
                  onChange={handleChange}
                  className={`w-full transition-all duration-200 placeholder:text-ds-placeholder h-[46px] rounded-ds-input pr-12 pl-4 text-sm text-ds-text-primary outline-none ${
                    validationErrors.Password 
                      ? 'border border-ds-border-error focus:border-ds-border-error focus:ring-2 focus:ring-red-200' 
                      : 'border border-ds-border focus:border-ds-border-focus focus:shadow-ds-focus'
                  }`}
                  placeholder="Enter your password"
                />
                {/* Password Visibility Toggle - Design System: icon position right inside input */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full flex items-center justify-center px-4 text-ds-icon hover:text-ds-icon-hover cursor-pointer border-none bg-transparent outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.Password && (
                <p className="mt-1.5 text-xs text-ds-error">
                  {validationErrors.Password}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button - Design System: 48px height, gradient, 8px border radius */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-ds-button rounded-ds-button bg-ds-gradient text-white font-semibold text-[15px] border-none mt-6 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-105 active:scale-[0.98]"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Link to Signup - Design System: secondaryText button */}
          <div className="text-center mt-5">
            <p className="text-sm text-ds-text-secondary">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-ds-primary font-medium no-underline hover:underline transition-all"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
