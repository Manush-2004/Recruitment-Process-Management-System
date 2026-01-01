/**
 * Footer Component
 * Centered column footer following design system
 */
const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">RecruitHub</h3>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 max-w-[520px] mb-6">
            Streamline your recruitment process with intelligent candidate matching, 
            automated screening, and comprehensive interview management.
          </p>

          {/* Meta Text */}
          <p className="text-xs text-gray-400">
            © 2024 RecruitHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

