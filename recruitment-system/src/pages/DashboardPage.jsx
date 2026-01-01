import NavigationBar from '../components/NavigationBar';
import HeroSection from '../components/HeroSection';
import MetricsSection from '../components/MetricsSection';
import FeatureComparisonSection from '../components/FeatureComparisonSection';
import AnalyticsSection from '../components/AnalyticsSection';
import Footer from '../components/Footer';

/**
 * Dashboard Page Component
 * Main dashboard page following design system specifications
 * Composes all sections in vertical layout
 */
const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      
      <main className="max-w-[1200px] mx-auto">
        <HeroSection />
        <MetricsSection />
        <FeatureComparisonSection />
        <AnalyticsSection />
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
