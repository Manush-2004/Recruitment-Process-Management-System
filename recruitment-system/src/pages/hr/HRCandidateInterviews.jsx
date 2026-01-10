import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig.js';

const HRCandidateInterviews = () => {
  const { id } = useParams();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/interviews/for-candidate/${id}`);
        setInterviews(res.data || []);
      } catch (err) {
        console.error('Failed to load interviews for candidate', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (!interviews || interviews.length === 0) return <p className="p-4">No interviews for this candidate.</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Interviews for candidate #{id}</h1>
      <div className="space-y-3">
        {interviews.map(iv => (
          <div key={iv.id} className="p-3 bg-white border rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{iv.roundType} — {iv.scheduledAt ? new Date(iv.scheduledAt).toLocaleString() : ''}</div>
              <div className="text-sm text-ds-text-secondary">Interview id: {iv.id}</div>
            </div>
            <div>
              <Link to={`/hr/interview/${iv.id}`} className="text-sm text-indigo-600">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRCandidateInterviews;