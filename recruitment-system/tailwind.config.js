/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Design System Colors
        'ds-bg': '#F9FAFB',
        'ds-surface': '#FFFFFF',
        'ds-text-primary': '#111827',
        'ds-text-secondary': '#6B7280',
        'ds-text-label': '#374151',
        'ds-border': '#E5E7EB',
        'ds-border-focus': '#6366F1',
        'ds-border-error': '#EF4444',
        'ds-placeholder': '#9CA3AF',
        'ds-icon': '#9CA3AF',
        'ds-icon-hover': '#6B7280',
        'ds-primary': '#4F46E5',
        'ds-error': '#DC2626',
        'ds-error-bg': '#FEF2F2',
        'ds-error-border': '#FECACA',
        'ds-selected-bg': 'rgba(99, 102, 241, 0.05)',
      },
      boxShadow: {
        'ds-card': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'ds-card-signup': '0 6px 18px 0 rgba(0, 0, 0, 0.08)',
        'ds-focus': '0 0 0 2px rgba(99, 102, 241, 0.2)',
      },
      backgroundImage: {
        'ds-gradient': 'linear-gradient(90deg, #2563EB, #7C3AED)',
      },
      borderRadius: {
        'ds-card': '12px',
        'ds-input': '8px',
        'ds-button': '8px',
        'ds-role-card': '10px',
      },
      spacing: {
        'ds-input-h': '46px',
        'ds-input-h-lg': '47px',
        'ds-button-h': '48px',
      },
    },
  },
  plugins: [],
}

