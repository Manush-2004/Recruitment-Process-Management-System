import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RoleSelectionCard from '../components/RoleSelectionCard';

/**
 * Signup Page Component
 * Handles user registration with FullName, Email, Password, and Role
 * Matches backend RegisterRequest model exactly
 * Strictly follows Design System JSON specifications
 */

// Password visibility toggle icons (outline style, 18-22px)
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

// Role icons (outline style)
const UserIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .414-.336.75-.75.75h-4.5a.75.75 0 01-.75-.75v-4.25m0 0v-4.25m0 4.25h.008m-.008 0h.008m-4.5 0H9.75a.75.75 0 01-.75-.75v-4.25m0 0v-4.25m0 4.25h.008m-.008 0h.008m-4.5 0H3.375a.75.75 0 01-.75-.75v-4.25m0 0V9.375c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v.375m0 0H21m-8.625-4.5H12m-6.375 0H3.375c-.621 0-1.125.504-1.125 1.125v.375m0 0H21m-8.625 0h-4.5c-.621 0-1.125.504-1.125 1.125v.375m0 0H21" />
  </svg>
);

const UsersIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-1.135 4.5 4.5 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const ClipboardDocumentCheckIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M9.75 9.75l-.01-.01M9.75 9.75l3.5 3.5m0 0l3.5-3.5M13.25 9.75H9.75m3.5 0v3.5m-3.5-3.5v3.5m-3.5-3.5h3.5m0 0v-3.5m0 3.5h3.5m-7 0V9.75m0 0H6.75m0 0h3.5m0 0V6.25m0 3.5v3.5m0-3.5h3.5m-3.5 0h3.5" />
  </svg>
);

const UserCircleIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Available roles for recruitment system
const AVAILABLE_ROLES = [
  { value: 'Recruiter', label: 'Recruiter', icon: <BriefcaseIcon /> },
  { value: 'HR Manager', label: 'HR Manager', icon: <UsersIcon /> },
  { value: 'Interviewer', label: 'Interviewer', icon: <UserIcon /> },
  { value: 'Reviewer', label: 'Reviewer', icon: <ClipboardDocumentCheckIcon /> },
  { value: 'Candidate', label: 'Candidate', icon: <UserCircleIcon /> },
  { value: 'Admin', label: 'Admin', icon: <ShieldCheckIcon /> },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    Password: '',
    Role: '',
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

  // Handle role selection
  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      Role: role,
    }));
    if (validationErrors.Role) {
      setValidationErrors((prev) => ({
        ...prev,
        Role: '',
      }));
    }
  };

  // Validate form
  const validate = () => {
    const errors = {};
    
    if (!formData.FullName.trim()) {
      errors.FullName = 'Full name is required';
    } else if (formData.FullName.trim().length < 2) {
      errors.FullName = 'Full name must be at least 2 characters';
    }
    
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
    
    if (!formData.Role) {
      errors.Role = 'Please select a role';
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

    const result = await register({
      FullName: formData.FullName.trim(),
      Email: formData.Email.trim(),
      Password: formData.Password,
      Role: formData.Role,
    });

    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-ds-bg">
      {/* Card Container - Design System: 420-460px width, centered, 12px border radius, soft shadow */}
      <div className="w-[92%] sm:w-[420px] max-w-[460px] p-7 sm:p-8 bg-ds-surface rounded-ds-card shadow-ds-card-signup">
        {/* Heading Section - Design System: 22-24px, weight 600, color #1F2937, center aligned */}
        <div className="mb-6">
          <h2 className="text-center font-semibold text-2xl text-gray-800 mb-2">
            Create your account
          </h2>
          {/* Subheading - Design System: 14px, weight 400, color #6B7280 */}
          <p className="text-center text-sm text-ds-text-secondary">
            Get started with your recruitment account
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="rounded-md mb-6 bg-ds-error-bg border border-ds-error-border p-3 mb-6">
              <p className="text-[13px] text-ds-error font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Form Fields - Design System: field spacing 14-18px */}
          <div className="flex flex-col gap-[18px]">
            {/* FullName Field */}
            <div>
              <label 
                htmlFor="FullName"
                className="block text-sm font-medium text-ds-text-label mb-2"
              >
                Full Name
              </label>
              <input
                id="FullName"
                name="FullName"
                type="text"
                autoComplete="name"
                required
                value={formData.FullName}
                onChange={handleChange}
                className={`w-full transition-all duration-200 placeholder:text-ds-placeholder h-[47px] rounded-ds-input px-[14px] text-sm text-ds-text-primary outline-none ${
                  validationErrors.FullName 
                    ? 'border border-ds-border-error focus:border-ds-border-error focus:ring-2 focus:ring-red-200' 
                    : 'border border-ds-border focus:border-ds-border-focus focus:shadow-ds-focus'
                }`}
                placeholder="Enter your full name"
              />
              {validationErrors.FullName && (
                <p className="mt-1.5 text-xs text-ds-error">
                  {validationErrors.FullName}
                </p>
              )}
            </div>
            
            {/* Email Field */}
            <div>
              <label 
                htmlFor="Email"
                className="block text-sm font-medium text-ds-text-label mb-2"
              >
                Email address
              </label>
              <input
                id="Email"
                name="Email"
                type="email"
                autoComplete="email"
                required
                value={formData.Email}
                onChange={handleChange}
                className={`w-full transition-all duration-200 placeholder:text-ds-placeholder h-[47px] rounded-ds-input px-[14px] text-sm text-ds-text-primary outline-none ${
                  validationErrors.Email 
                    ? 'border border-ds-border-error focus:border-ds-border-error focus:ring-2 focus:ring-red-200' 
                    : 'border border-ds-border focus:border-ds-border-focus focus:shadow-ds-focus'
                }`}
                placeholder="Enter your email"
              />
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
                  autoComplete="new-password"
                  required
                  value={formData.Password}
                  onChange={handleChange}
                  className={`w-full transition-all duration-200 placeholder:text-ds-placeholder h-[47px] rounded-ds-input pr-12 pl-[14px] text-sm text-ds-text-primary outline-none ${
                    validationErrors.Password 
                      ? 'border border-ds-border-error focus:border-ds-border-error focus:ring-2 focus:ring-red-200' 
                      : 'border border-ds-border focus:border-ds-border-focus focus:shadow-ds-focus'
                  }`}
                  placeholder="Create a password"
                />
                {/* Password Visibility Toggle */}
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

            {/* Role Selection - Design System: two-column grid, selectionCard */}
            <div>
              <label className="block text-sm font-medium text-ds-text-label mb-3">
                Select your role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_ROLES.map((role) => (
                  <RoleSelectionCard
                    key={role.value}
                    role={role.value}
                    label={role.label}
                    icon={role.icon}
                    isSelected={formData.Role === role.value}
                    onSelect={handleRoleSelect}
                  />
                ))}
              </div>
              {validationErrors.Role && (
                <p className="mt-1.5 text-xs text-ds-error">
                  {validationErrors.Role}
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          {/* Link to Login - Design System: secondaryText button */}
          <div className="text-center mt-5">
            <p className="text-sm text-ds-text-secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-ds-primary font-medium no-underline hover:underline transition-all"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
