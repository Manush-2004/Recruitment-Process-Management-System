import { useEffect, useState } from 'react';
import * as api from '../../api/reviewerApi.js';

const ScreeningHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const h = await api.getHistory();
        setHistory(h || []);
      } catch (e) { console.error('Failed to load history', e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Screening History</h1>
      {loading ? <p>Loading…</p> : history.length === 0 ? <p className="text-sm text-ds-text-secondary">No history.</p> : (
        <ul className="space-y-3">
          {history.map(h => (
            <li key={h.id} className="p-3 bg-white rounded-ds-card shadow-ds-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{h?.candidate?.fullName ?? 'Candidate'} — {h?.job?.title ?? 'Job'}</div>
                  <div className="text-sm text-ds-text-secondary">Status: {h.status} • {new Date(h.screenedAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-ds-text-secondary">Reviewer: {h.reviewerName}</div>
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium">Comments</div>
                <div className="text-sm text-ds-text-secondary">{h.comments ?? '—'}</div>
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium">Skills</div>
                <ul className="mt-1">
                  {h.skills?.map((s, idx) => (
                    <li key={idx} className="text-sm">{s.skillName}: {s.yearsOfExperience}y — {s.isApproved ? 'Approved' : 'Not approved'}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ScreeningHistory;