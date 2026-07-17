import { useEffect, useState } from "react";
import * as api from "../../services/adminService.js";

const AdminDashboard = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [candidateSummary, setCandidateSummary] = useState(null);
  const [positionReport, setPositionReport] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const users = await api.getUsers();
        setUsersCount(users.length);
      } catch (err) {
      console.error("API Error:", err);
    }

      try {
        const jobs = await fetch("/api/jobs").then((r) => r.json());
        setJobsCount(jobs?.length ?? 0);
      } catch (err) {
      console.error("API Error:", err);
    }

      try {
        const cs = await api.getCandidateSummary();
        setCandidateSummary(cs);
      } catch (err) {
      console.error("API Error:", err);
    }

      try {
        const pr = await api.getPositionWise();
        setPositionReport(pr);
      } catch (err) {
      console.error("API Error:", err);
    }
    };
    load();
  }, []);

  // Placeholder for real-time system events via SignalR/NotificationContext

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-ds-text-secondary">Users</div>
          <div className="text-2xl font-bold">{usersCount}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-ds-text-secondary">Jobs</div>
          <div className="text-2xl font-bold">{jobsCount}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-ds-text-secondary">
            Candidates (with docs)
          </div>
          <div className="text-2xl font-bold">
            {candidateSummary?.withDocs ?? "—"}
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-medium mb-2">
          Position-wise candidate distribution
        </h2>
        <div className="space-y-2">
          {positionReport.map((p) => (
            <div key={p.position} className="flex justify-between">
              <div>{p.position}</div>
              <div className="font-medium">{p.candidateCount}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-medium mb-2">
          Recent system events (placeholder)
        </h2>
        <div className="text-sm text-ds-text-secondary">
          Real-time events will appear here (SignalR)
        </div>
        <ul className="mt-2 list-disc list-inside">
          {events.length === 0 ? (
            <li>No recent events</li>
          ) : (
            events.map((e, idx) => <li key={idx}>{e}</li>)
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
