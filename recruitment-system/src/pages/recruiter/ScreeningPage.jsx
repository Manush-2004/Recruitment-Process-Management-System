import { useEffect, useState } from 'react';
import { getCandidates, getJobs, assignScreening } from '../../api/recruiterApi';
import { getUsersByRole } from '../../api/usersApi';
import { useAuth } from '../../contexts/AuthContext';
import * as reviewerApi from '../../api/reviewerApi';
import ScreeningList from './ScreeningList';


const ScreeningPage = () => {
  
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [assignToReviewer, setAssignToReviewer] = useState(false);
  const [status, setStatus] = useState('Shortlisted');
  const [comments, setComments] = useState('');
  const [skills, setSkills] = useState([]);
  const [message, setMessage] = useState(null);
  const [candidateScreenings, setCandidateScreenings] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const cs = await getCandidates();
        const js = await getJobs();
        const revs = await getUsersByRole('Reviewer');
        setCandidates(cs || []);
        setJobs(js || []);
        setReviewers(revs || []);
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
      if (candidateId && candidates.length > 0) setSelectedCandidate(candidates.find(c => c.id === parseInt(candidateId, 10)));  //
      if (jobId && jobs.length > 0) setSelectedJob(jobs.find(j => j.id === parseInt(jobId, 10))); //
    } catch (e) {
      // ignore in server-side or test environments
    }
  }, [candidates, jobs]);

  useEffect(() => {
    // load screenings for selected candidate
    const load = async () => {
      if (!selectedCandidate) return setCandidateScreenings([]);
      try {
        const list = await reviewerApi.getForCandidate(selectedCandidate.id); //
        setCandidateScreenings(list || []);
      } catch (err) {
        console.error('Failed to load candidate screenings', err);
      }
    };
    load();
  }, [selectedCandidate]);

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
    if (!selectedCandidate || !selectedJob) return alert('Select candidate and job');
    if (assignToReviewer && !selectedReviewerId) return alert('Select a reviewer to assign to');
    const reviewer = reviewers.find(r => String(r.id) === String(selectedReviewerId));
    // ensure we always send a non-empty reviewerName when assigning
    const reviewerName = reviewer?.fullName ?? reviewer?.full_name ?? reviewer?.email ?? (reviewer?.id ? String(reviewer.id) : undefined);

    const payload = {
      candidateId: selectedCandidate.id, //
      jobId: selectedJob.id, //
      reviewerName 
    };
    // only include status when not assigning (avoid sending `status: null` which can produce model-binding issues)
    if (!assignToReviewer) payload.status = status;

    try {
      console.debug('Assign payload:', payload);
      await assignScreening(payload);
      // reload candidate screenings so recruiter immediately sees assignment
      if (selectedCandidate) {
        try {
          const list = await reviewerApi.getForCandidate(selectedCandidate.id); //
          setCandidateScreenings(list || []);
        } catch (err) {
          console.error('Failed to reload candidate screenings', err);
        }
      }
      setMessage(assignToReviewer ? 'Screening assigned' : 'Screening submitted');
    } catch (e) {
      console.error('Screening failed', e, e.response?.data);
      const serverMsg = e?.response?.data && (typeof e.response.data === 'string' ? e.response.data : (e.response.data?.message || JSON.stringify(e.response.data)));
      setMessage(serverMsg || ('Screening failed: ' + (e.message || 'Unknown error')));
    }
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Screening</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-ds-card shadow-ds-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <select value={selectedCandidate?.id ?? ''} onChange={(e) => setSelectedCandidate(candidates.find(c => c.id === parseInt(e.target.value,10)))} className="p-2 border rounded">  //
            <option value="">Select candidate</option>
            {candidates.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>)}
          </select>
          <select value={selectedJob?.id ?? ''} onChange={(e) => setSelectedJob(jobs.find(j => j.id === parseInt(e.target.value,10)))} className="p-2 border rounded">  //
            <option value="">Select job</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <select value={selectedReviewerId} onChange={(e) => setSelectedReviewerId(e.target.value)} className="p-2 border rounded" disabled={!assignToReviewer}>
            <option value="">Select reviewer</option>
            {reviewers.map(r => <option key={r.id} value={r.id}>{r.fullName} ({r.email})</option>)}
          </select>
        </div>

        <div className="mb-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={assignToReviewer} onChange={() => setAssignToReviewer(a => !a)} /> Assign to reviewer
          </label>
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
                  <label className="flex items-center gap-2"><input type="checkbox" checked={sk.isApproved} onChange={() => toggleSkill(idx)} disabled={assignToReviewer} /> Approve</label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="block text-sm text-ds-text-secondary">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded" disabled={assignToReviewer}>
            <option>Shortlisted</option>
            <option>Rejected</option>
            <option>On Hold</option>
          </select>
          {assignToReviewer && <p className="text-sm text-ds-text-secondary mt-1">The selected reviewer will complete the screening and set the status.</p>}
        </div>

        <div className="mb-3">
          <label className="block text-sm text-ds-text-secondary">Comments</label>
          <textarea value={comments} onChange={(e) => setComments(e.target.value)} className="w-full p-2 border rounded" disabled={assignToReviewer} />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={(assignToReviewer && !selectedReviewerId) || !selectedCandidate || !selectedJob}>{assignToReviewer ? 'Assign' : 'Submit Screening'}</button>
        </div>
        {message && <div className="mt-3 text-sm">{message}</div>}
      </form>

      {/* Candidate's screenings (view-only list for recruiter) */}
      {selectedCandidate && (
        <div className="mt-6 max-w-[1000px] mx-auto">
          <h2 className="text-xl font-semibold mb-3">Screenings for {selectedCandidate.fullName}</h2>
          <ScreeningList candidateId={selectedCandidate.id} onUpdated={() => {  //
            const reload = async () => {
              const list = await reviewerApi.getForCandidate(selectedCandidate.id); //
              setCandidateScreenings(list || []);
            };
            reload();
          }} />
        </div>
      )}
    </div>
  );
};

export default ScreeningPage;

// Expose reviewerApi helpers for simple reloads in tests or pages that import this file (keeps test harness small)
window.__reviewerApi__ = window.__reviewerApi__ || {
  getForCandidate: (id) => reviewerApi.getForCandidate(id)
};