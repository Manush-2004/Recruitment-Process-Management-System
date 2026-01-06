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
