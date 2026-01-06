/**
 * AnalyticsSection Component
 * 4-column grid with analytics cards
 */

const AnalyticsCard = ({ icon, value, label, trend, iconBg }) => {
  return (
    <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600 mb-2">{label}</div>
      {trend && (
        <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
          {trend}
        </div>
      )}
    </div>
  );
};

const AnalyticsSection = () => {
  const ChartIcon = () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l8-5 8 5M3 21l8-5 8 5M3 8l8-5 8 5" />
    </svg>
  );

  const ClockIcon = () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const CheckCircleIcon = () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const TrendingUpIcon = () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Real-Time <span className="text-blue-600">Analytics</span>
          </h2>
          <p className="text-[15px] sm:text-base text-gray-600">
            Track your recruitment performance with comprehensive metrics and insights.
          </p>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            icon={<ChartIcon />}
            value="1,234"
            label="Total Applications"
            trend="+12%"
            iconBg="bg-blue-50 text-blue-600"
          />
          <AnalyticsCard
            icon={<ClockIcon />}
            value="89"
            label="Interviews Scheduled"
            trend="+8%"
            iconBg="bg-purple-50 text-purple-600"
          />
          <AnalyticsCard
            icon={<CheckCircleIcon />}
            value="156"
            label="Offers Extended"
            trend="+15%"
            iconBg="bg-green-50 text-green-600"
          />
          <AnalyticsCard
            icon={<TrendingUpIcon />}
            value="92%"
            label="Conversion Rate"
            trend="+5%"
            iconBg="bg-orange-50 text-orange-600"
          />
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;

