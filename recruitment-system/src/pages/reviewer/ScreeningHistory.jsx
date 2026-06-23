import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/reviewerService.js";

const ScreeningHistory = () => {
  const { user, hasRole } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("Shortlisted");
  const [editComments, setEditComments] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const h = await api.getHistory();
        setHistory(h || []);
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Screening History</h1>
      {loading ? (
        <p>Loading…</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-ds-text-secondary">No history.</p>
      ) : (
        <ul className="space-y-3">
          {history.map((h) => (
            <li
              key={h.id}
              className="p-3 bg-white rounded-ds-card shadow-ds-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {h?.candidate?.fullName ?? "Candidate"} —{" "}
                    {h?.job?.title ?? "Job"}
                  </div>
                  <div className="text-sm text-ds-text-secondary">
                    Status: {h.status} •{" "}
                    {new Date(h.screenedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-ds-text-secondary">
                  Reviewer: {h.reviewerName}
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium">Comments</div>
                {editingId === h.id ? (
                  <div className="mt-2 flex gap-2">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option>Shortlisted</option>
                      <option>Rejected</option>
                      <option>On Hold</option>
                    </select>
                    <input
                      value={editComments}
                      onChange={(e) => setEditComments(e.target.value)}
                      className="p-2 border rounded"
                    />
                    <button
                      onClick={async () => {
                        try {
                          await api.updateScreening(h.id, {
                            status: editStatus,
                            comments: editComments,
                          });
                          setEditingId(null);
                          const h2 = await api.getHistory();
                          setHistory(h2 || []);
                        } catch (e) {
                          console.error("Update failed", e);
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 border rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-ds-text-secondary">
                    {h.comments ?? "—"}
                  </div>
                )}
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium">Skills</div>
                <ul className="mt-1">
                  {h.skills?.map((s, idx) => (
                    <li key={idx} className="text-sm">
                      {s.skillName}: {s.yearsOfExperience}y —{" "}
                      {s.isApproved ? "Approved" : "Not approved"}
                    </li>
                  ))}
                </ul>
              </div>
              {editingId !== h.id && (
                <div className="mt-2">
                  {/* only allow reviewer who owns this, or recruiters/admins */}
                  {user?.fullName === h.reviewerName ||
                  hasRole("Recruiter") ||
                  hasRole("Admin") ? (
                    <button
                      onClick={() => {
                        setEditingId(h.id);
                        setEditStatus(h.status || "Shortlisted");
                        setEditComments(h.comments || "");
                      }}
                      className="px-3 py-1 border rounded"
                    >
                      Edit
                    </button>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ScreeningHistory;
