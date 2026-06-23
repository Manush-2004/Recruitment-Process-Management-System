import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as reviewerApi from "../../services/reviewerService";

const ScreeningList = ({ candidateId, onUpdated }) => {
  const { hasRole, user } = useAuth();
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("Shortlisted");
  const [editComments, setEditComments] = useState("");

  // Pull list when candidateId changes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!candidateId) return setList([]);
      try {
        const l = await reviewerApi.getForCandidate(candidateId);
        if (!mounted) return;
        setList(l || []);
      } catch (e) {
        console.error("Failed to load screenings for candidate", e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [candidateId]);

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditStatus(s.status || "Shortlisted");
    setEditComments(s.comments || "");
  };

  const saveEdit = async (id) => {
    try {
      await reviewerApi.updateScreening(id, {
        status: editStatus,
        comments: editComments,
      });
      setEditingId(null);
      if (onUpdated) onUpdated();
      const l = await reviewerApi.getForCandidate(candidateId);
      setList(l || []);
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  return (
    <div className="bg-white p-4 rounded-ds-card shadow-ds-card">
      {list.length === 0 ? (
        <p className="text-sm text-ds-text-secondary">
          No screenings for this candidate
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((s) => (
            <div key={s.id} className="p-3 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <strong>{s.reviewerName}</strong>{" "}
                  <span className="text-sm text-ds-text-secondary">
                    {s.job?.title}
                  </span>
                </div>
                <div className="text-sm">
                  {s.screenedAt ? (
                    <span className="text-green-600">{s.status}</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </div>
              </div>
              <div className="text-sm text-ds-text-secondary mt-2">
                {s.comments ?? "—"}
              </div>

              {editingId === s.id ? (
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
                    onClick={() => saveEdit(s.id)}
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
                ((hasRole("Recruiter") && s.screenedAt) ||
                  (hasRole("Reviewer") &&
                    user?.fullName === s.reviewerName)) && (
                  <div className="mt-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="px-3 py-1 border rounded"
                    >
                      Edit
                    </button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScreeningList;
