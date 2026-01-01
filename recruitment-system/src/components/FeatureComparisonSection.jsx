/**
 * FeatureComparisonSection Component
 * Two-column feature list for Job-Seekers and Employers
 */

const FeatureItem = ({ icon, title, description, iconBg }) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-[15px] sm:text-base font-semibold text-gray-900 mb-1">
          {title}
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const FeatureColumn = ({ title, features, accentColor, underlineColor }) => {
  // Icons for features
  const SparklesIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );

  const DocumentIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );

  const EyeIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const ChatIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );

  const FilterIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  );

  const WorkflowIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5m-16.5-15h16.5" />
    </svg>
  );

  const UsersIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-1.135 4.5 4.5 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );

  const BellIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );

  const iconMap = {
    'Smart Job Recommendations': <SparklesIcon />,
    'Profile & Resume Management': <DocumentIcon />,
    'Transparent Application Tracking': <EyeIcon />,
    'Interview & Feedback Visibility': <ChatIcon />,
    'Intelligent Candidate Screening': <FilterIcon />,
    'End-to-End Hiring Workflow': <WorkflowIcon />,
    'Panel Interview & Feedback System': <UsersIcon />,
    'Real-Time Notifications & Analytics': <BellIcon />,
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl sm:text-[22px] font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <div className={`h-0.5 ${underlineColor} w-full`}></div>
      </div>
      {features.map((feature, index) => (
        <FeatureItem
          key={index}
          icon={iconMap[feature.title] || <SparklesIcon />}
          title={feature.title}
          description={feature.description}
          iconBg={accentColor}
        />
      ))}
    </div>
  );
};

const FeatureComparisonSection = () => {
  const jobSeekersFeatures = [
    {
      title: 'Smart Job Recommendations',
      description: 'Get automatically matched with relevant job openings based on your skills, experience, and preferences. The system highlights roles where you have the highest chance of selection.',
    },
    {
      title: 'Profile & Resume Management',
      description: 'Create and manage your professional profile in one place. Upload resumes, update skills, and keep your information ready for recruiters at all times.',
    },
    {
      title: 'Transparent Application Tracking',
      description: 'Track your application status in real time — from Applied to Shortlisted, Interview Scheduled, and Offer Released, with clear updates at every stage.',
    },
    {
      title: 'Interview & Feedback Visibility',
      description: 'View interview schedules, receive notifications, and access structured feedback after interviews to understand strengths and improvement areas.',
    },
  ];

  const employersFeatures = [
    {
      title: 'Intelligent Candidate Screening',
      description: 'Automatically filter and shortlist candidates using skill matching, experience criteria, and screening evaluations to save time and improve hiring accuracy.',
    },
    {
      title: 'End-to-End Hiring Workflow',
      description: 'Manage the complete hiring lifecycle — job posting, screening, interview scheduling, feedback collection, and offer generation — from a single platform.',
    },
    {
      title: 'Panel Interview & Feedback System',
      description: 'Support multi-interviewer evaluations with independent feedback, skill-wise ratings, and aggregated interview scores for fair and data-driven decisions.',
    },
    {
      title: 'Real-Time Notifications & Analytics',
      description: 'Receive instant notifications for status changes and track hiring performance through dashboards showing candidate progress, interview outcomes, and offer conversions.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built for <span className="text-blue-600">Job-Seekers</span> and{' '}
            <span className="text-purple-600">Employers</span>
          </h2>
          <p className="text-[15px] sm:text-base text-gray-600">
            Comprehensive features designed to streamline the recruitment process for both candidates and hiring teams.
          </p>
        </div>

        {/* Two-Column Feature List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <FeatureColumn
            title="For Job-Seekers"
            features={jobSeekersFeatures}
            accentColor="bg-blue-50 text-blue-600"
            underlineColor="bg-blue-600"
          />
          <FeatureColumn
            title="For Employers"
            features={employersFeatures}
            accentColor="bg-purple-50 text-purple-600"
            underlineColor="bg-purple-600"
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureComparisonSection;

