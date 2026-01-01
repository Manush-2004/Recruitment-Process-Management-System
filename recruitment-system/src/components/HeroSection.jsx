import { Link } from 'react-router-dom';

/**
 * HeroSection Component
 * Centered hero section with gradient text following design system
 */
const HeroSection = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[720px] mx-auto px-6 sm:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold leading-[1.15] mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
            Transform Your Hiring Process
          </span>
          <span className="text-gray-900 block ">With Intelligent Recruitment</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-[680px] mx-auto">
          Streamline your recruitment workflow with AI-powered candidate matching, 
          automated screening, and comprehensive interview management—all in one platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="h-12 px-6 rounded-[10px] bg-ds-gradient text-white font-semibold text-sm transition-all duration-200 hover:brightness-105 active:scale-[0.98] w-full sm:w-auto flex items-center justify-center"
          >
            Get Started
          </Link>
          <button className="h-12 px-6 rounded-[10px] border border-gray-200 bg-white text-gray-700 font-semibold text-sm transition-all duration-200 hover:bg-gray-50 w-full sm:w-auto">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

