import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../api/interviewerApi.js';
import { getJob, getCandidatesForJob } from '../../api/recruiterApi.js';

const emptySkill = (name = '') => ({ skillName: name, rating: 0 });

const FeedbackPage = () => {
  const { id } = useParams(); // interview id
  const navigate = useNavigate();
  const { user } = useAuth();

  const [interview, setInterview] = useState(null);
  const [skills, setSkills] = useState([emptySkill('Communication'), emptySkill('Problem Solving')]);
  const [overall, setOverall] = useState(3);
  const [comments, setComments] = useState('');
  const [already, setAlready] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const iv = await api.getInterview(id);
        setInterview(iv);
        const done = await api.hasSubmittedFeedback(id);
        setAlready(done);
      } catch (err) {
        console.error('Failed to load interview or check feedback', err);
      }
    };
    load();
  }, [id]);

  const setSkillRating = (idx, val) => {
    const copy = [...skills];
    copy[idx] = { ...copy[idx], rating: Number(val) };
    setSkills(copy);
  };

  const submit = async () => {
    if (already) return;
    setSaving(true);
    try {
      const payload = {
        interviewId: Number(id),
        interviewerUserId: user?.id ?? 0, // backend expects the numeric id; if not present this should be set by server in future
        interviewerName: user?.fullName ?? user?.email ?? 'Interviewer',
        overallRating: Number(overall),
        comments,
        skills: skills.map(s => ({ skillName: s.skillName, rating: s.rating }))
      };
      await api.submitFeedback(payload);
      setAlready(true);
      navigate('/interviewer/dashboard');
    } catch (err) {
      console.error('Failed to submit feedback', err);
      alert('Failed to submit feedback: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (!interview) return <p className="p-4">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Feedback — {interview.candidate?.fullName ?? ''}</h1>

      <div className="p-4 bg-white border rounded mb-4">
        <div className="mb-2"><strong>Round:</strong> {interview.roundType}</div>
        <div className="mb-2"><strong>Scheduled At:</strong> {new Date(interview.scheduledAt).toLocaleString()}</div>
        <div className="mb-2"><strong>Panel:</strong> {interview.interviewers?.map(i=>i.name).join(', ')}</div>
      </div>

      <div className="p-4 bg-white border rounded">
        {already ? (
          <div className="text-sm text-ds-text-secondary">You have already submitted feedback for this interview.</div>
        ) : (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Overall Rating</label>
              <input type="range" min="1" max="5" value={overall} onChange={(e)=>setOverall(e.target.value)} />
              <div className="text-sm mt-1">{overall}/5</div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Skills</label>
              <div className="space-y-2">
                {skills.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-48">{s.skillName}</div>
                    <input type="range" min="1" max="5" value={s.rating} onChange={(e)=>setSkillRating(idx, e.target.value)} />
                    <div className="w-8 text-center">{s.rating}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Comments</label>
              <textarea value={comments} onChange={(e)=>setComments(e.target.value)} className="w-full p-2 border rounded" rows={5}></textarea>
            </div>

            <div className="flex gap-3">
              <button disabled={saving} onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit Feedback</button>
              <button onClick={()=>navigate('/interviewer/dashboard')} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;