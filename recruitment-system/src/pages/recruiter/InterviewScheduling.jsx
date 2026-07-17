import { useEffect, useState } from "react";
import {
  getCandidates,
  getJobs,
  scheduleInterview,
} from "../../services/recruiterService";

const InterviewScheduling = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidateId, setCandidateId] = useState("");
  const [jobId, setJobId] = useState("");
  const [roundType, setRoundType] = useState("Technical");
  const [scheduledAt, setScheduledAt] = useState("");
  const [mode, setMode] = useState("Online");
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewers, setInterviewers] = useState([]);
  const [availableInterviewers, setAvailableInterviewers] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const cs = await getCandidates();
        const js = await getJobs();
        // fetch available interviewers
        const res = await (
          await import("../../services/usersService")
        ).getUsersByRole("Interviewer");
        setCandidates(cs || []);
        setJobs(js || []);
        setAvailableInterviewers(res || []);
        // initialize one interviewer select
        setInterviewers([{ userId: res?.[0]?.id ?? "" }]);
      } catch (e) {
      console.error("API Error:", e);
    }
    };
    load();
  }, []);

  const addInterviewer = () => setInterviewers((s) => [...s, { userId: "" }]);
  const updateInterviewer = (i, val) =>
    setInterviewers((s) => s.map((it, idx) => (idx === i ? val : it)));
  const removeInterviewer = (i) =>
    setInterviewers((s) => s.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    if (!candidateId || !jobId || !scheduledAt)
      return alert("Select candidate, job and date");
    // resolve interviewer ids to objects
    const interviewerObjects = interviewers
      .map((i) =>
        availableInterviewers.find((u) => String(u.id) === String(i.userId)),
      )
      .filter(Boolean)
      .map((u) => ({ name: u.fullName ?? u.full_name, email: u.email }));

    // Ensure datetime-local value has seconds (format: "2024-01-15T14:30:00")
    const formattedDateTime =
      scheduledAt.length === 16 ? `${scheduledAt}:00` : scheduledAt;

    const payload = {
      candidateId: parseInt(candidateId, 10),
      jobId: parseInt(jobId, 10),
      roundType,
      // Send datetime without timezone - backend will store as-is
      scheduledAt: formattedDateTime,
      mode,
      meetingLink,
      interviewers: interviewerObjects,
    };
    try {
      const res = await scheduleInterview(payload);
      setMessage("Interview scheduled");
    } catch (e) {
      console.error("API Error:", e);
    }
  };

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Schedule Interview</h1>
      <form
        onSubmit={submit}
        className="bg-white p-4 rounded-ds-card shadow-ds-card"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <select
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select candidate</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select job</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <select
            value={roundType}
            onChange={(e) => setRoundType(e.target.value)}
            className="p-2 border rounded"
          >
            <option>Technical</option>
            <option>HR</option>
          </select>
        </div>

        <div className="mb-3">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-ds-text-secondary mb-2">
            Interviewers
          </label>
          {interviewers.map((it, idx) => (
            <div key={idx} className="flex gap-2 items-center mb-2">
              <select
                value={it.userId}
                onChange={(e) =>
                  updateInterviewer(idx, { userId: e.target.value })
                }
                className="flex-1 p-2 border rounded"
              >
                <option value="">Select interviewer</option>
                {availableInterviewers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeInterviewer(idx)}
                className="text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInterviewer}
            className="text-sm text-blue-600"
          >
            Add interviewer
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-sm text-ds-text-secondary mb-2">
            Mode & Link
          </label>
          <div className="flex gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="p-2 border rounded w-40"
            >
              <option>Online</option>
              <option>Onsite</option>
            </select>
            <input
              placeholder="Meeting link (optional)"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="p-2 border rounded flex-1"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Schedule
          </button>
        </div>
        {message && <div className="mt-3 text-sm">{message}</div>}
      </form>
    </div>
  );
};

export default InterviewScheduling;
