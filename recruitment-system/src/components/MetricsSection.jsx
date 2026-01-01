/**
 * MetricsSection Component
 * 3-column horizontal grid with metric cards
 */

const MetricCard = ({ icon, value, label, iconBg }) => {
  return (
    <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
};

const MetricsSection = () => {
  // Placeholder icons - replace with actual icons
  const BriefcaseIcon = () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .414-.336.75-.75.75h-4.5a.75.75 0 01-.75-.75v-4.25m0 0v-4.25m0 4.25h.008m-.008 0h.008m-4.5 0H9.75a.75.75 0 01-.75-.75v-4.25m0 0v-4.25m0 4.25h.008m-.008 0h.008m-4.5 0H3.375a.75.75 0 01-.75-.75v-4.25m0 0V9.375c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v.375m0 0H21m-8.625-4.5H12m-6.375 0H3.375c-.621 0-1.125.504-1.125 1.125v.375m0 0H21m-8.625 0h-4.5c-.621 0-1.125.504-1.125 1.125v.375m0 0H21" />
    </svg>
  );

  const UsersIcon = () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-1.135 4.5 4.5 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );

  const ChartIcon = () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l8-5 8 5M3 21l8-5 8 5M3 8l8-5 8 5" />
    </svg>
  );

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 lg:gap-14">
          <MetricCard
            icon={<BriefcaseIcon />}
            value="500+"
            label="Active Job Postings"
            iconBg="bg-blue-50 text-blue-600"
          />
          <MetricCard
            icon={<UsersIcon />}
            value="2,500+"
            label="Registered Candidates"
            iconBg="bg-purple-50 text-purple-600"
          />
          <MetricCard
            icon={<ChartIcon />}
            value="85%"
            label="Match Accuracy Rate"
            iconBg="bg-green-50 text-green-600"
          />
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;

