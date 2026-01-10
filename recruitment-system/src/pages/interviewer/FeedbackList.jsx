import { useEffect, useState } from 'react';
import * as api from '../../api/interviewerApi.js';
import { Link } from 'react-router-dom';

const FeedbackList = () => {
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

  if (loading) return <p className="p-4">Loading…</p>;
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">My Feedback</h1>
      <div className="space-y-3">
        {assigned.map(iv => (
          <div key={iv.id} className="p-3 bg-white border rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{iv.roundType} — {iv.candidate?.fullName}</div>
              <div className="text-sm text-ds-text-secondary">{new Date(iv.scheduledAt).toLocaleString()}</div>
            </div>
            <div>
              <Link to={`/interviewer/feedback/${iv.id}`} className="text-sm text-green-600">Give/View Feedback</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;