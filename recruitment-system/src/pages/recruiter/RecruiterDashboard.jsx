import { useEffect, useState } from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import { getJobs } from "../../services/recruiterService";
import { getCandidates } from "../../services/recruiterService";

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications, unread } = useNotifications();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const js = await getJobs();
        setJobs(js || []);
        const cs = await getCandidates();
        setCandidates(cs || []);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Recruiter Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-ds-surface rounded-ds-card shadow-ds-card">
          <p className="text-sm text-ds-text-secondary">Jobs</p>
          <p className="text-2xl font-semibold">
            {loading ? "..." : jobs.length}
          </p>
        </div>
        <div className="p-4 bg-ds-surface rounded-ds-card shadow-ds-card">
          <p className="text-sm text-ds-text-secondary">Active Candidates</p>
          <p className="text-2xl font-semibold">
            {loading ? "..." : candidates.length}
          </p>
        </div>
        <div className="p-4 bg-ds-surface rounded-ds-card shadow-ds-card">
          <p className="text-sm text-ds-text-secondary">Interviews Scheduled</p>
          <p className="text-2xl font-semibold">
            {/* backend endpoint required */ "—"}
          </p>
        </div>
        <div className="p-4 bg-ds-surface rounded-ds-card shadow-ds-card">
          <p className="text-sm text-ds-text-secondary">Offers Released</p>
          <p className="text-2xl font-semibold">
            {/* backend endpoint required */ "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-ds-card shadow-ds-card">
          <h2 className="text-lg font-medium mb-3">Recent Candidates</h2>
          {loading ? (
            <p>Loading candidates…</p>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-ds-text-secondary">No candidates yet</p>
          ) : (
            <ul className="space-y-2">
              {candidates.slice(0, 8).map((c) => (
                <li key={c.id} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{c.fullName}</p>
                      <p className="text-sm text-ds-text-secondary">
                        {c.email}
                      </p>
                    </div>
                    <div className="text-sm text-ds-text-secondary">
                      Added {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-4 rounded-ds-card shadow-ds-card">
          <h2 className="text-lg font-medium mb-3">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-ds-text-secondary">No notifications</p>
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 6).map((n) => (
                <li key={n.id} className="text-sm">
                  {n.message}{" "}
                  <div className="text-xs text-ds-text-secondary">
                    {new Date(n.receivedAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {unread > 0 && (
            <div className="mt-3 text-sm text-red-600">{unread} unread</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
