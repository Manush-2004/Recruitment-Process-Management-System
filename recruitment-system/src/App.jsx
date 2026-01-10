import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';

import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import CandidateInterviews from './pages/candidate/CandidateInterviews';
import CandidateDocuments from './pages/candidate/CandidateDocuments';
import CandidateOffers from './pages/candidate/CandidateOffers';
import CandidateNotifications from './pages/candidate/CandidateNotifications';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import JobsPage from './pages/recruiter/JobsPage';
import JobCandidates from './pages/recruiter/JobCandidates';
import CandidatesPage from './pages/recruiter/CandidatesPage';
import ScreeningPage from './pages/recruiter/ScreeningPage';
import InterviewScheduling from './pages/recruiter/InterviewScheduling';
import OfferManagement from './pages/recruiter/OfferManagement';
import RecruiterCandidate from './pages/recruiter/RecruiterCandidate';
import NotificationsPage from './pages/Notifications';

// Reviewer pages
import ReviewerDashboard from './pages/reviewer/ReviewerDashboard';
import ReviewerScreening from './pages/reviewer/ScreeningPage';
import ScreeningHistory from './pages/reviewer/ScreeningHistory';

// Interviewer pages
import InterviewerDashboard from './pages/interviewer/InterviewerDashboard';
import InterviewDetails from './pages/interviewer/InterviewDetails';
import FeedbackPage from './pages/interviewer/FeedbackPage';

// HR pages
import HRDashboard from './pages/hr/HRDashboard';
import HRInterview from './pages/hr/HRInterview';
import DocumentVerification from './pages/hr/DocumentVerification';
import OfferGeneration from './pages/hr/OfferGeneration';
import HRCandidateInterviews from './pages/hr/HRCandidateInterviews';
import FeedbackList from './pages/interviewer/FeedbackList';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              // <ProtectedRoute>
                <DashboardPage />
              // </ProtectedRoute>
            }
          />

          {/* Candidate-specific routes (protected by role) */}
          <Route path="/candidate/dashboard" element={<ProtectedRoute roles={["Candidate"]}><CandidateDashboard/></ProtectedRoute>} />
          <Route path="/candidate/profile" element={<ProtectedRoute roles={["Candidate"]}><CandidateProfile/></ProtectedRoute>} />
          <Route path="/candidate/interviews" element={<ProtectedRoute roles={["Candidate"]}><CandidateInterviews/></ProtectedRoute>} />
          <Route path="/candidate/documents" element={<ProtectedRoute roles={["Candidate"]}><CandidateDocuments/></ProtectedRoute>} />
          <Route path="/candidate/offers" element={<ProtectedRoute roles={["Candidate"]}><CandidateOffers/></ProtectedRoute>} />
          <Route path="/candidate/notifications" element={<ProtectedRoute roles={["Candidate"]}><CandidateNotifications/></ProtectedRoute>} />

          {/* Recruiter routes */}
          <Route path="/recruiter/dashboard" element={<ProtectedRoute roles={["Recruiter"]}><RecruiterDashboard/></ProtectedRoute>} />
          <Route path="/recruiter/jobs" element={<ProtectedRoute roles={["Recruiter"]}><JobsPage/></ProtectedRoute>} />
          <Route path="/recruiter/job/:id/candidates" element={<ProtectedRoute roles={["Recruiter"]}><JobCandidates/></ProtectedRoute>} />
          <Route path="/recruiter/candidates" element={<ProtectedRoute roles={["Recruiter"]}><CandidatesPage/></ProtectedRoute>} />
          <Route path="/recruiter/screening" element={<ProtectedRoute roles={["Recruiter"]}><ScreeningPage/></ProtectedRoute>} />
          <Route path="/recruiter/interviews" element={<ProtectedRoute roles={["Recruiter"]}><InterviewScheduling/></ProtectedRoute>} />
          <Route path="/recruiter/offers" element={<ProtectedRoute roles={["Recruiter"]}><OfferManagement/></ProtectedRoute>} />
          <Route path="/recruiter/candidate/:id" element={<ProtectedRoute roles={["Recruiter"]}><RecruiterCandidate/></ProtectedRoute>} />

          {/* Reviewer routes */}
          <Route path="/reviewer/dashboard" element={<ProtectedRoute roles={["Reviewer"]}><ReviewerDashboard/></ProtectedRoute>} />
          <Route path="/reviewer/screening" element={<ProtectedRoute roles={["Reviewer"]}><ReviewerScreening/></ProtectedRoute>} />
          <Route path="/reviewer/history" element={<ProtectedRoute roles={["Reviewer"]}><ScreeningHistory/></ProtectedRoute>} />

          {/* Interviewer routes */}
          <Route path="/interviewer/dashboard" element={<ProtectedRoute roles={["Interviewer"]}><InterviewerDashboard/></ProtectedRoute>} />
          <Route path="/interviewer/interviews" element={<ProtectedRoute roles={["Interviewer"]}><InterviewerDashboard/></ProtectedRoute>} />
          <Route path="/interviewer/interview/:id" element={<ProtectedRoute roles={["Interviewer"]}><InterviewDetails/></ProtectedRoute>} />
          <Route path="/interviewer/feedback" element={<ProtectedRoute roles={["Interviewer"]}><FeedbackList/></ProtectedRoute>} />
          <Route path="/interviewer/feedback/:id" element={<ProtectedRoute roles={["Interviewer"]}><FeedbackPage/></ProtectedRoute>} />

          {/* HR routes */}
          <Route path="/hr/dashboard" element={<ProtectedRoute roles={["HR"]}><HRDashboard/></ProtectedRoute>} />
          <Route path="/hr/interview/:id" element={<ProtectedRoute roles={["HR"]}><HRInterview/></ProtectedRoute>} />
          <Route path="/hr/candidate/:id/documents" element={<ProtectedRoute roles={["HR"]}><DocumentVerification/></ProtectedRoute>} />
          <Route path="/hr/candidate/:id/interviews" element={<ProtectedRoute roles={["HR"]}><HRCandidateInterviews/></ProtectedRoute>} />
          <Route path="/hr/offer/create" element={<ProtectedRoute roles={["HR"]}><OfferGeneration/></ProtectedRoute>} />
          <Route path="/hr/offers/:id" element={<ProtectedRoute roles={["HR"]}><OfferGeneration/></ProtectedRoute>} />

          {/* Notifications (any authenticated user) */}
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage/></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
