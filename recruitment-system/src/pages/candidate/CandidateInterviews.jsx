import { useEffect, useState } from 'react';
import NavigationBar from '../../components/NavigationBar';
import { getMyInterviews } from '../../api/candidatesApi';

const CandidateInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const ivs = await getMyInterviews();
        setInterviews(ivs);
      } catch (e) {
        console.error(e);
        setError('Failed to load interviews');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <main className="max-w-[900px] mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Your Interviews</h1>

            {loading ? (
            <div className="space-y-3">
              <div className="h-16 bg-gray-100 rounded" />
              <div className="h-16 bg-gray-100 rounded" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-ds-error-bg border p-3 mb-3">
              <p className="text-sm text-ds-error">{error}</p>
            </div>
          ) : interviews.length === 0 ? (
            <p className="text-sm text-ds-text-secondary">No interviews scheduled.</p>
          ) : (
            <ul className="space-y-3">
              {interviews.map((iv) => (
                <li className="p-4 bg-ds-surface rounded-ds-card" key={iv.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{iv.roundType ?? iv.round_type} — {iv.job?.title ?? iv.job?.Title}</p>
                      <p className="text-sm text-ds-text-secondary">{new Date(iv.scheduledAt ?? iv.scheduled_at).toLocaleString()}</p>
                      <p className="text-sm text-ds-text-secondary">Mode: {iv.mode ?? iv.mode} {iv.meetingLink && (<a href={iv.meetingLink ?? iv.meeting_link} className="text-ds-primary ml-2">Join</a>)}</p>
                    </div>
                    <div className="text-sm font-medium">{iv.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

      </main>
    </div>
  );
};

export default CandidateInterviews;
