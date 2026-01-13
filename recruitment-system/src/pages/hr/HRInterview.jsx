import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../api/hrApi.js';
import axiosInstance from '../../api/axiosConfig.js';

const HRInterview = () => {
  const { id } = useParams(); // interview id
  const [interview, setInterview] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load interview details
        const ivRes = await axiosInstance.get(`/api/interviews/${id}`);
        setInterview(ivRes.data);

        // Try to load feedback summary
        try {
          const s = await api.getInterviewFeedbackSummary(id);
          setSummary(s);
        } catch (err) {
          // No feedback yet - this is okay
          console.log('No feedback available yet for this interview');
        }
      } catch (err) {
        console.error('Failed to load interview', err);
        setError('Failed to load interview details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!interview) return <p className="p-6">Interview not found.</p>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/hr/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Back to HR Dashboard
        </Link>
        <h1 className="text-2xl font-semibold">Interview Feedback Summary</h1>
        <p className="text-sm text-ds-text-secondary mt-1">
          {interview.roundType} - {interview.candidate?.fullName || 'Candidate'}
        </p>
      </div>

      {/* Interview Details */}
      <div className="p-5 bg-white border rounded-lg mb-6">
        <h2 className="font-semibold text-lg mb-3">Interview Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-ds-text-secondary">Candidate:</span>
            <div className="font-medium">{interview.candidate?.fullName}</div>
            <div className="text-ds-text-secondary">{interview.candidate?.email}</div>
          </div>
          <div>
            <span className="text-ds-text-secondary">Job:</span>
            <div className="font-medium">{interview.job?.title || 'N/A'}</div>
          </div>
          <div>
            <span className="text-ds-text-secondary">Scheduled:</span>
            <div className="font-medium">{new Date(interview.scheduledAt).toLocaleString()}</div>
          </div>
          <div>
            <span className="text-ds-text-secondary">Mode:</span>
            <div className="font-medium">{interview.mode}</div>
          </div>
          {interview.meetingLink && (
            <div className="col-span-2">
              <span className="text-ds-text-secondary">Meeting Link:</span>
              <div className="font-medium">
                <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {interview.meetingLink}
                </a>
              </div>
            </div>
          )}
          {interview.interviewers && interview.interviewers.length > 0 && (
            <div className="col-span-2">
              <span className="text-ds-text-secondary">Panel:</span>
              <div className="font-medium">{interview.interviewers.map(i => i.name).join(', ')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Summary */}
      {summary ? (
        <div className="p-5 bg-white border rounded-lg mb-6">
          <h2 className="font-semibold text-lg mb-3">Feedback Summary</h2>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-ds-text-secondary">Average Rating:</span>
              <span className="text-2xl font-bold text-green-600">{summary.averageRating}/5</span>
            </div>
            <div className="text-sm text-ds-text-secondary">
              Based on {summary.totalFeedbacks} feedback submission{summary.totalFeedbacks !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {summary.feedbacks?.map((fb, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{fb.interviewerName}</span>
                  <span className="font-semibold">Rating: {fb.overallRating}/5</span>
                </div>
                <p className="text-sm text-ds-text-secondary mb-2">{fb.comments}</p>
                {fb.skills && fb.skills.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-ds-text-secondary mb-1">Skill Ratings:</p>
                    <div className="flex flex-wrap gap-2">
                      {fb.skills.map((skill, sidx) => (
                        <span key={sidx} className="text-xs bg-white px-2 py-1 rounded border">
                          {skill.skillName}: {skill.rating}/5
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
          <p className="text-sm text-yellow-800">
            No feedback has been submitted yet. Waiting for interviewers to provide their feedback.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {interview.candidateId && (
          <>
            <Link
              to={`/hr/candidate/${interview.candidateId}/documents`}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              View Documents
            </Link>
            <Link
              to={`/hr/offer/create?candidateId=${interview.candidateId}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Generate Offer
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default HRInterview;