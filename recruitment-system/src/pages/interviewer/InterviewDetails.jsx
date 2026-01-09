import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../api/interviewerApi.js';

const InterviewDetails = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getInterview(id);
        setInterview(data);
      } catch (err) {
        console.error('Failed to load interview', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (!interview) return <p className="p-4">Interview not found.</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Interview Details</h1>

      <div className="p-4 bg-white border rounded mb-4">
        <div className="mb-2"><strong>Candidate:</strong> {interview.candidate?.fullName ?? '—'}</div>
        <div className="mb-2"><strong>Job:</strong> {interview.job?.title ?? '—'}</div>
        <div className="mb-2"><strong>Round:</strong> {interview.roundType}</div>
        <div className="mb-2"><strong>Scheduled At:</strong> {new Date(interview.scheduledAt).toLocaleString()}</div>
        <div className="mb-2"><strong>Panel:</strong>
          <ul className="ml-4 list-disc">
            {interview.interviewers?.map((p, idx) => (
              <li key={idx}>{p.name} ({p.email})</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <Link to={`/interviewer/feedback/${interview.id}`} className="px-4 py-2 bg-green-600 text-white rounded">Give Feedback</Link>
      </div>
    </div>
  );
};

export default InterviewDetails;