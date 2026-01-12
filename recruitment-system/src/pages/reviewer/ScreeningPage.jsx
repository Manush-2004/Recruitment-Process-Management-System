import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../api/reviewerApi.js';
import axiosInstance from '../../api/axiosConfig.js';
import { API_BASE_URL } from '../../config/apiRoutes.js';

const ScreeningPage = () => {
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [skills, setSkills] = useState([]);
  const [status, setStatus] = useState('Shortlisted');
  const [comments, setComments] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [message, setMessage] = useState(null);
  const [duplicate, setDuplicate] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const candidateId = params.get('candidateId');
    const jobId = params.get('jobId');

    const load = async () => {
      try {
        if (candidateId) {
          const res = await axiosInstance.get(`/api/candidates/${candidateId}`);
          setCandidate(res.data);
        }
        if (jobId) {
          const res2 = await axiosInstance.get(`/api/jobs/${jobId}`);
          setJob(res2.data);
          setSkills((res2.data.requiredSkills || []).map(s => ({ skillName: s.name, yearsOfExperience: 0, isApproved: false })));
        }

        // check duplicate
        if (candidateId && jobId) {
          const already = await api.checkAlreadyScreened(parseInt(candidateId, 10), parseInt(jobId, 10));
          setDuplicate(already);
        }
      } catch (e) {
        console.error('Failed to load screening context', e);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const toggleSkill = (idx) => setSkills(s => s.map((sk, i) => i === idx ? { ...sk, isApproved: !sk.isApproved } : sk));
  const setYears = (idx, v) => setSkills(s => s.map((sk, i) => i === idx ? { ...sk, yearsOfExperience: parseInt(v||'0',10) } : sk));

  const validate = () => {
    if (!reviewerName) return false;
    if (status === 'Shortlisted' && !skills.some(s => s.isApproved)) return false;
    return true;
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!validate()) return alert('Validation failed: ensure reviewer name and at least one approved skill for Shortlisted status.');
    const payload = {
      candidateId: candidate?.id, //
      jobId: job?.id,//
      reviewerName,
      status,
      comments,
      skills
    };
    try {
      await api.screenCandidate(payload);
      setMessage('Screening submitted');
      // go back to dashboard
      setTimeout(() => navigate('/reviewer/dashboard'), 800);
    } catch (err) {
      console.error('Submit failed', err);
      setMessage('Submit failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const cvUrl = candidate?.documents?.[0]?.filePath ? (API_BASE_URL + candidate.documents[0].filePath) : null;

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Screening</h1>
      {loading ? <p>Loading…</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white p-4 rounded-ds-card shadow-ds-card">
            <div className="mb-3">
              <label className="block text-sm text-ds-text-secondary">Candidate</label>
              <div className="font-medium">{candidate?.fullName} ({candidate?.email})</div>
              {cvUrl && <div className="mt-2"><a href={cvUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600">Open CV</a></div>}
            </div>

            <div className="mb-3">
              <label className="block text-sm text-ds-text-secondary">Skills</label>
              {skills.length === 0 ? <p className="text-sm text-ds-text-secondary">No required skills listed for this job.</p> : (
                <div className="space-y-2">
                  {skills.map((sk, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <label className="flex-1">{sk.skillName}</label>
                      <input type="number" min={0} value={sk.yearsOfExperience} onChange={(e) => setYears(idx, e.target.value)} className="w-20 p-2 border rounded" />
                      <label className="flex items-center gap-2"><input type="checkbox" checked={sk.isApproved} onChange={() => toggleSkill(idx)} /> Approve</label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-sm text-ds-text-secondary">Comments</label>
              <textarea value={comments} onChange={(e) => setComments(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-ds-text-secondary">(You may edit this screening later from your history)</label>
            </div>

            <div className="flex gap-2">
              <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={!validate()}>Submit Screening</button>
              <button onClick={() => navigate('/reviewer/dashboard')} className="px-4 py-2 border rounded">Cancel</button>
            </div>
            {message && <div className="mt-3 text-sm">{message}</div>}
          </div>

          <div className="bg-white p-4 rounded-ds-card shadow-ds-card">
            <div className="text-sm text-ds-text-secondary mb-2">Context</div>
            <div className="mb-2"><strong>Job:</strong> {job?.title}</div>
            <div className="mb-2"><strong>Duplicate Screening:</strong> {duplicate ? <span className="text-red-600">Already screened for this job</span> : <span className="text-green-600">No previous screening</span>}</div>
            <div className="mb-3">
              <label className="block text-sm text-ds-text-secondary">Reviewer Name</label>
              <input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Your name" className="p-2 border rounded w-full" />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-ds-text-secondary">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded w-full">
                <option>Shortlisted</option>
                <option>Rejected</option>
                <option>On Hold</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreeningPage;