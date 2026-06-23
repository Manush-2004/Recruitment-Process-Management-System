import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  createOffer,
  getCandidates,
  getJobs,
} from "../../services/recruiterService";
import axiosInstance from "../../api/axiosConfig";
import { useLocation } from "react-router-dom";

const OfferManagement = () => {
  const location = useLocation();

  const [interviewId, setInterviewId] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [jobId, setJobId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const cs = await getCandidates();
        const js = await getJobs();
        setCandidates(cs || []);
        setJobs(js || []);

        const qp = new URLSearchParams(location.search);
        const qCandidate = qp.get("candidateId");
        const qJob = qp.get("jobId");
        if (qCandidate) setCandidateId(qCandidate);
        if (qJob) setJobId(qJob);

        if (qCandidate && qJob) {
          try {
            const res = await axiosInstance.get(
              `/api/feedback/summary?candidateId=${qCandidate}&jobId=${qJob}`,
            );
            setSummary(res.data);
          } catch (e) {
            console.error("Fetch summary by candidate/job failed", e);
            setMessage("Failed to fetch summary by candidate/job");
          }
        }
      } catch (e) {
        console.error("Failed to load candidates/jobs", e);
      }
    };
    init();
  }, [location.search]);

  const fetchSummaryByInterview = async () => {
    if (!interviewId) return alert("Enter interview id");
    try {
      const res = await axiosInstance.get(
        `/api/feedback/interview/${interviewId}/summary`,
      );
      setSummary(res.data);
      setMessage(null);
    } catch (e) {
      console.error("Fetch summary failed", e);
      setMessage(
        e.response?.status === 403
          ? "You do not have permission to view interview summaries (HR only)."
          : "Failed to fetch summary",
      );
    }
  };

  const fetchSummaryByCandidateJob = async () => {
    if (!candidateId || !jobId) return alert("Enter candidate id and job id");
    try {
      const res = await axiosInstance.get(
        `/api/feedback/summary?candidateId=${candidateId}&jobId=${jobId}`,
      );
      setSummary(res.data);
      setMessage(null);
    } catch (e) {
      console.error("Fetch summary failed", e);
      setMessage(
        e.response?.status === 403
          ? "You do not have permission to view interview summaries (HR only)."
          : "Failed to fetch summary by candidate/job",
      );
    }
  };

  const onInitiate = async () => {
    if (!summary) return alert("Fetch interview summary first");
    try {
      const offerPayload = {
        candidateId: summary.candidateId,
        interviewId: summary.interviewId ?? null,
        salary: summary.suggestedSalary ?? summary.averageRating ?? 0,
        startDate: new Date().toISOString(),
      };
      const res = await createOffer(offerPayload);
      setMessage(
        "Offer initiated — HR may need to finalize (if your account is allowed to create offers, this will complete).",
      );
    } catch (e) {
      console.error("Initiate failed", e);
      if (e.response?.status === 403)
        setMessage(
          "Only HR can create offers. Please request HR to initiate the offer.",
        );
      else setMessage("Failed to initiate offer");
    }
  };

  const onMoveToHr = async () => {
    if (!summary?.candidateId) return alert("No candidate in summary");
    try {
      await axiosInstance.post(
        `/api/candidates/${summary.candidateId}/move-to-hr`,
      );
      setMessage("Candidate moved to HR stage");
    } catch (e) {
      console.error("Move to HR failed", e);
      setMessage("Failed to move candidate to HR");
    }
  };

  const { hasRole } = useAuth();

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Offer Management</h1>
      <div className="bg-white p-4 rounded-ds-card shadow-ds-card">
        <div className="flex gap-2 mb-3">
          <input
            placeholder="Interview id"
            value={interviewId}
            onChange={(e) => setInterviewId(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={fetchSummaryByInterview}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Fetch by Interview
          </button>
        </div>

        <div className="flex gap-2 mb-4 items-center">
          <select
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="p-2 border rounded w-48"
          >
            <option value="">Select candidate</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.email}) — id:{c.id}
              </option>
            ))}
          </select>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="p-2 border rounded w-48"
          >
            <option value="">Select job</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} — id:{j.id}
              </option>
            ))}
          </select>
          <button
            onClick={fetchSummaryByCandidateJob}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Fetch by Candidate+Job
          </button>
        </div>

        {message && <div className="mb-3 text-sm text-red-600">{message}</div>}

        {summary && (
          <div>
            <h2 className="font-medium">Interview Summary</h2>
            <p className="text-sm text-ds-text-secondary">
              Candidate: {summary.candidateName ?? summary.candidateName}
            </p>
            <p className="text-sm text-ds-text-secondary">
              Average score: {summary.averageRating ?? summary.averageRating}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onInitiate}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Initiate Offer
              </button>
              {hasRole && hasRole("Recruiter") && (
                <button
                  onClick={onMoveToHr}
                  className="px-3 py-1 bg-yellow-600 text-white rounded"
                >
                  Move to HR
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferManagement;
