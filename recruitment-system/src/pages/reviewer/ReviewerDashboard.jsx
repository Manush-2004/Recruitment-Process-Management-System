import { useEffect, useState } from "react";
import * as api from "../../services/reviewerService.js";
import { Link } from "react-router-dom";

const ReviewerDashboard = () => {
  const [assigned, setAssigned] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const a = await api.getAssigned();
        const h = await api.getHistory();
        setAssigned(a || []);
        setHistory(h || []);
      } catch (e) {
        console.error("Failed to load reviewer dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pending = assigned.length;
  const reviewed = history.length;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Reviewer Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-ds-card shadow-ds-card">
          <div className="text-sm text-ds-text-secondary">Assigned</div>
          <div className="text-2xl font-bold">{pending}</div>
        </div>
        <div className="p-4 bg-white rounded-ds-card shadow-ds-card">
          <div className="text-sm text-ds-text-secondary">Reviewed</div>
          <div className="text-2xl font-bold">{reviewed}</div>
        </div>
        <div className="p-4 bg-white rounded-ds-card shadow-ds-card">
          <div className="text-sm text-ds-text-secondary">Quick Actions</div>
          <div className="mt-2 flex gap-2">
            <Link
              to="/reviewer/screening"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              New Screening
            </Link>
            <Link to="/reviewer/history" className="px-3 py-1 border rounded">
              History
            </Link>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Assigned (Pending)</h2>
      {loading ? (
        <p>Loading…</p>
      ) : assigned.length === 0 ? (
        <p className="text-sm text-ds-text-secondary">
          No assigned screenings.
        </p>
      ) : (
        <ul className="space-y-3">
          {assigned.map((s) => (
            <li
              key={s.id}
              className="p-3 bg-white rounded-ds-card shadow-ds-card flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {s?.candidate?.fullName ?? "Candidate"} —{" "}
                  {s?.job?.title ?? "Job"}
                </div>
                <div className="text-sm text-ds-text-secondary">
                  Assigned: {s?.reviewerName}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/reviewer/screening?candidateId=${s.candidateId}&jobId=${s.jobId}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Open
                </Link>
                <Link
                  to={`/recruiter/candidate/${s.candidateId}`}
                  className="px-3 py-1 border rounded"
                >
                  Candidate
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReviewerDashboard;
