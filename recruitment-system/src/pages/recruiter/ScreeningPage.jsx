import { useEffect, useState } from 'react';
import { getCandidates, getJobs, assignScreening } from '../../api/recruiterApi';

const ScreeningPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [reviewerName, setReviewerName] = useState('');
  const [status, setStatus] = useState('Shortlisted');
  const [comments, setComments] = useState('');
  const [skills, setSkills] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const cs = await getCandidates();
        const js = await getJobs();
        setCandidates(cs || []);
        setJobs(js || []);
      } catch (e) { console.error('Failed to load', e); }
    };
    load();
  }, []);

  useEffect(() => {
    // Prefill candidate/job from query params if available
    try {
      const params = new URLSearchParams(window.location.search);
      const candidateId = params.get('candidateId');
      const jobId = params.get('jobId');
      if (candidateId && candidates.length > 0) setSelectedCandidate(candidates.find(c => c.id === parseInt(candidateId, 10)));
      if (jobId && jobs.length > 0) setSelectedJob(jobs.find(j => j.id === parseInt(jobId, 10)));
    } catch (e) {
      // ignore in server-side or test environments
    }
  }, [candidates, jobs]);

  useEffect(() => {
    // when job changes, prefill skills from job
    if (selectedJob) {
      setSkills((selectedJob?.requiredSkills ?? []).map(s => ({ skillName: s.name, yearsOfExperience: 0, isApproved: false })));
    } else setSkills([]);
  }, [selectedJob]);

  const toggleSkill = (idx) => setSkills(s => s.map((sk, i) => i === idx ? { ...sk, isApproved: !sk.isApproved } : sk));
  const setYears = (idx, v) => setSkills(s => s.map((sk, i) => i === idx ? { ...sk, yearsOfExperience: parseInt(v||'0',10) } : sk));

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !selectedJob || !reviewerName) return alert('Select candidate, job and reviewer');
    const payload = {
      candidateId: selectedCandidate.id,
      jobId: selectedJob.id,
      reviewerName,
      status,
      comments,
      skills
    };

    try {
      const res = await assignScreening(payload);
      setMessage('Screening submitted');
    } catch (e) {
      console.error('Screening failed', e);
      setMessage('Screening failed');
    }
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Screening</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-ds-card shadow-ds-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <select value={selectedCandidate?.id ?? ''} onChange={(e) => setSelectedCandidate(candidates.find(c => c.id === parseInt(e.target.value,10)))} className="p-2 border rounded">
            <option value="">Select candidate</option>
            {candidates.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>)}
          </select>
          <select value={selectedJob?.id ?? ''} onChange={(e) => setSelectedJob(jobs.find(j => j.id === parseInt(e.target.value,10)))} className="p-2 border rounded">
            <option value="">Select job</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Reviewer name" className="p-2 border rounded" />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-ds-text-secondary mb-2">Skills</label>
          {skills.length === 0 ? (
            <p className="text-sm text-ds-text-secondary">Select a job to see required skills</p>
          ) : (
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
          <label className="block text-sm text-ds-text-secondary">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded">
            <option>Shortlisted</option>
            <option>Rejected</option>
            <option>On Hold</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm text-ds-text-secondary">Comments</label>
          <textarea value={comments} onChange={(e) => setComments(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Assign & Submit</button>
        </div>
        {message && <div className="mt-3 text-sm">{message}</div>}
      </form>
    </div>
  );
};

export default ScreeningPage;