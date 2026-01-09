import { useEffect, useState } from 'react';
import * as api from '../../api/interviewerApi.js';
import { Link } from 'react-router-dom';

const InterviewerDashboard = () => {
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const a = await api.getAssignedInterviews();
        setAssigned(a || []);
      } catch (err) {
        console.error('Failed to load assigned interviews', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingFeedback = assigned.filter(iv => !iv.feedbackSubmitted);
  const completed = assigned.filter(iv => iv.feedbackSubmitted);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Interviewer Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white border rounded"> 
          <div className="text-sm text-ds-text-secondary">Assigned</div>
          <div className="text-xl font-bold">{assigned.length}</div>
        </div>
        <div className="p-4 bg-white border rounded"> 
          <div className="text-sm text-ds-text-secondary">Pending Feedback</div>
          <div className="text-xl font-bold">{pendingFeedback.length}</div>
        </div>
        <div className="p-4 bg-white border rounded"> 
          <div className="text-sm text-ds-text-secondary">Completed</div>
          <div className="text-xl font-bold">{completed.length}</div>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Assigned Interviews</h2>
        {loading ? <p>Loading…</p> : assigned.length === 0 ? <p className="text-sm text-ds-text-secondary">No assigned interviews.</p> : (
          <div className="space-y-3">
            {assigned.map(iv => (
              <div key={iv.id} className="p-4 bg-white border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{iv.roundType} — {iv.candidate?.fullName ?? 'Candidate'}</div>
                  <div className="text-sm text-ds-text-secondary">{new Date(iv.scheduledAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Link to={`/interviewer/interview/${iv.id}`} className="text-sm text-blue-600">Details</Link>
                  <Link to={`/interviewer/feedback/${iv.id}`} className="text-sm text-green-600">Give Feedback</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default InterviewerDashboard;