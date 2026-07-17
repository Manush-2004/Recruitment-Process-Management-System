import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import * as api from "../../services/hrService.js";
import axiosInstance from "../../api/axiosConfig.js";

const OfferGeneration = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const candidateId = Number(params.get("candidateId")) || null;

  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true);
      try {
        if (candidateId) {
          const [candRes, jobsRes] = await Promise.all([
            axiosInstance.get(`/api/candidates/${candidateId}`),
            axiosInstance.get("/api/jobs"),
          ]);
          setCandidate(candRes.data);
          setJobs(jobsRes.data || []);

          // Pre-select job if candidate has applied to jobs
          if (candRes.data?.candidateJobs?.length > 0) {
            setJobId(candRes.data.candidateJobs[0].jobId.toString());
          }
        }
      } catch (err) {
      console.error("API Error:", err);
    } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [candidateId]);

  const submit = async () => {
    if (!candidateId || !jobId || !salary || !joiningDate) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        candidateId,
        jobId: parseInt(jobId, 10),
        salary: parseFloat(salary),
        joiningDate,
        notes,
      };
      const res = await api.generateOffer(payload);
      alert("Offer generated successfully!");
      // Open PDF preview if backend returns a path
      if (res.offerPdfPath) window.open(res.offerPdfPath, "_blank");
      navigate("/hr/dashboard");
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          to="/hr/dashboard"
          className="text-sm text-blue-600 hover:underline mb-2 inline-block"
        >
          ← Back to HR Dashboard
        </Link>
        <h1 className="text-2xl font-semibold">Generate Offer</h1>
        {candidate && (
          <p className="text-sm text-ds-text-secondary mt-1">
            For: {candidate.fullName} ({candidate.email})
          </p>
        )}
      </div>

      <div className="p-6 bg-white border rounded-lg shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Job Position *
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a job</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} - {j.companyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Salary (Annual) *
            </label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., 1200000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Joining Date *
            </label>
            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Any additional terms or conditions..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              disabled={loading}
              onClick={submit}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Offer"}
            </button>
            <button
              onClick={() => navigate("/hr/dashboard")}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferGeneration;
