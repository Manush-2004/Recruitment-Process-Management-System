import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig.js";
import * as hrApi from "../../services/hrService.js";

const HRCandidateInterviews = () => {
  const { id } = useParams();
  const [interviews, setInterviews] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [mode, setMode] = useState("Online");
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewers, setInterviewers] = useState([{ name: "", email: "" }]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [interviewsRes, candidateRes, jobsRes] = await Promise.all([
          axiosInstance.get(`/api/interviews/for-candidate/${id}`),
          axiosInstance.get(`/api/candidates/${id}`),
          axiosInstance.get("/api/jobs"),
        ]);
        setInterviews(interviewsRes.data || []);
        setCandidate(candidateRes.data);
        setJobs(jobsRes.data || []);

        // Auto-select job if candidate has applied to jobs
        if (candidateRes.data?.candidateJobs?.length > 0) {
          setSelectedJobId(candidateRes.data.candidateJobs[0].jobId.toString());
        }
      } catch (err) {
        console.error("Failed to load data for candidate", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const addInterviewer = () =>
    setInterviewers((s) => [...s, { name: "", email: "" }]);
  const updateInterviewer = (i, field, value) => {
    setInterviewers((s) =>
      s.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)),
    );
  };
  const removeInterviewer = (i) =>
    setInterviewers((s) => s.filter((_, idx) => idx !== i));

  const handleSchedule = async (e) => {
    e.preventDefault();

    // Validation
    if (!scheduledAt) {
      alert("Please select date and time");
      return;
    }

    if (!selectedJobId) {
      alert("Please select a job position for this interview");
      return;
    }

    const validInterviewers = interviewers.filter((i) => i.name && i.email);
    if (validInterviewers.length === 0) {
      alert("Please add at least one interviewer with name and email");
      return;
    }

    // Ensure datetime-local value has seconds (format: "2024-01-15T14:30:00")
    const formattedDateTime =
      scheduledAt.length === 16 ? `${scheduledAt}:00` : scheduledAt;

    const payload = {
      candidateId: parseInt(id, 10),
      jobId: parseInt(selectedJobId, 10),
      roundType: "HR Round",
      // Send datetime without timezone - backend will store as-is
      scheduledAt: formattedDateTime,
      mode,
      meetingLink: meetingLink || null,
      interviewers: validInterviewers,
    };

    console.log("Scheduling interview with payload:", payload);

    try {
      const response = await axiosInstance.post("/api/interviews", payload);
      console.log("Interview scheduled successfully:", response.data);
      setMessage("Interview scheduled successfully!");
      setShowScheduleForm(false);

      // Reload interviews
      const res = await axiosInstance.get(
        `/api/interviews/for-candidate/${id}`,
      );
      setInterviews(res.data || []);

      // Reset form
      setSelectedJobId(candidate?.candidateJobs?.[0]?.jobId?.toString() || "");
      setScheduledAt("");
      setMode("Online");
      setMeetingLink("");
      setInterviewers([{ name: "", email: "" }]);

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Failed to schedule interview", err);
      console.error("Error response:", err.response?.data);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to schedule interview. Please try again.";
      setMessage(`Error: ${errorMsg}`);
      alert(`Failed to schedule interview: ${errorMsg}`);
    }
  };

  const handleUpdateResult = async (interviewId, result) => {
    try {
      await hrApi.updateInterviewResult(interviewId, result);
      setMessage(`Interview marked as ${result}!`);

      // Reload interviews
      const res = await axiosInstance.get(
        `/api/interviews/for-candidate/${id}`,
      );
      setInterviews(res.data || []);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update interview result", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to update result";
      setMessage(`Error: ${errorMsg}`);
      alert(`Failed to update result: ${errorMsg}`);
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          to="/hr/dashboard"
          className="text-sm text-blue-600 hover:underline mb-2 inline-block"
        >
          ← Back to HR Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Interviews for {candidate?.fullName || `Candidate #${id}`}
            </h1>
            <p className="text-sm text-ds-text-secondary mt-1">
              {candidate?.email}
            </p>
          </div>
          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showScheduleForm ? "Cancel" : "Schedule HR Interview"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.toLowerCase().includes("error") ||
            message.toLowerCase().includes("failed")
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-green-50 border border-green-200 text-green-800"
          }`}
        >
          {message}
        </div>
      )}

      {showScheduleForm && (
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            Schedule New HR Interview
          </h2>

          <form onSubmit={handleSchedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Job Position *
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a job position</option>
                {candidate?.candidateJobs && candidate.candidateJobs.length > 0
                  ? candidate.candidateJobs.map((cj) => (
                      <option key={cj.jobId} value={cj.jobId}>
                        {cj.job?.title || `Job #${cj.jobId}`}{" "}
                        {cj.job?.companyName ? `- ${cj.job.companyName}` : ""}
                      </option>
                    ))
                  : jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}{" "}
                        {job.companyName ? `- ${job.companyName}` : ""}
                      </option>
                    ))}
              </select>
              {(!candidate?.candidateJobs ||
                candidate.candidateJobs.length === 0) && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ This candidate hasn't applied to any specific job. Showing
                  all available jobs.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option>Online</option>
                  <option>Onsite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Meeting Link
                </label>
                <input
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Interviewers
              </label>
              {interviewers.map((interviewer, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    placeholder="Name"
                    value={interviewer.name}
                    onChange={(e) =>
                      updateInterviewer(idx, "name", e.target.value)
                    }
                    className="flex-1 p-2 border rounded"
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    value={interviewer.email}
                    onChange={(e) =>
                      updateInterviewer(idx, "email", e.target.value)
                    }
                    className="flex-1 p-2 border rounded"
                  />
                  {interviewers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInterviewer(idx)}
                      className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addInterviewer}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add Interviewer
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Schedule Interview
              </button>
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Scheduled Interviews</h2>
        {!interviews || interviews.length === 0 ? (
          <p className="text-sm text-ds-text-secondary p-4 bg-white border rounded">
            No interviews scheduled yet.
          </p>
        ) : (
          interviews.map((iv) => (
            <div key={iv.id} className="p-4 bg-white border rounded">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium">{iv.roundType}</div>
                  <div className="text-sm text-ds-text-secondary">
                    {iv.scheduledAt
                      ? new Date(iv.scheduledAt).toLocaleString()
                      : "Not scheduled"}
                  </div>
                  <div className="text-sm text-ds-text-secondary">
                    Mode: {iv.mode} {iv.meetingLink && `• ${iv.meetingLink}`}
                  </div>
                  {iv.interviewers && iv.interviewers.length > 0 && (
                    <div className="text-sm text-ds-text-secondary">
                      Panel: {iv.interviewers.map((i) => i.name).join(", ")}
                    </div>
                  )}
                  <div className="text-sm mt-1">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        iv.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : iv.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {iv.status}
                    </span>
                    {iv.result && (
                      <span
                        className={`inline-block ml-2 px-2 py-1 rounded text-xs font-medium ${
                          iv.result === "Selected"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {iv.result}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/hr/interview/${iv.id}`}
                    className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
                  >
                    View Feedback
                  </Link>
                </div>
              </div>

              {/* Decision buttons for HR Round interviews without result */}
              {iv.roundType === "HR Round" && !iv.result && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm text-gray-600 mb-2">Make a decision:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateResult(iv.id, "Selected")}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      ✓ Select Candidate
                    </button>
                    <button
                      onClick={() => handleUpdateResult(iv.id, "Rejected")}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      ✗ Reject Candidate
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HRCandidateInterviews;
