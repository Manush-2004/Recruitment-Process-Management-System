import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../../api/hrApi.js';

const HRInterview = () => {
  const { id } = useParams(); // interview id
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [softSkills, setSoftSkills] = useState({ communication: 3, teamwork: 3, adaptability: 3 });
  const [cultureFit, setCultureFit] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const s = await api.getInterviewFeedbackSummary(id);
        setSummary(s);
      } catch (err) {
        console.error('Failed to load summary', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (!summary) return <p className="p-4">No feedback summary available.</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">HR Interview — {summary.interviewId}</h1>
      <div className="p-4 bg-white border rounded mb-4">
        <div className="mb-2"><strong>Feedback Snapshot</strong></div>
        <pre className="text-sm bg-gray-50 p-2 rounded">{JSON.stringify(summary, null, 2)}</pre>
      </div>

      <div className="p-4 bg-white border rounded">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Soft skills (average)</label>
          <div className="flex gap-3">
            <div>
              <div className="text-sm">Communication</div>
              <input type="range" min="1" max="5" value={softSkills.communication} onChange={(e)=>setSoftSkills({...softSkills, communication: Number(e.target.value)})} />
              <div className="text-sm">{softSkills.communication}/5</div>
            </div>
            <div>
              <div className="text-sm">Teamwork</div>
              <input type="range" min="1" max="5" value={softSkills.teamwork} onChange={(e)=>setSoftSkills({...softSkills, teamwork: Number(e.target.value)})} />
              <div className="text-sm">{softSkills.teamwork}/5</div>
            </div>
            <div>
              <div className="text-sm">Adaptability</div>
              <input type="range" min="1" max="5" value={softSkills.adaptability} onChange={(e)=>setSoftSkills({...softSkills, adaptability: Number(e.target.value)})} />
              <div className="text-sm">{softSkills.adaptability}/5</div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Cultural fit notes</label>
          <textarea value={cultureFit} onChange={(e)=>setCultureFit(e.target.value)} className="w-full p-2 border rounded" rows={4} />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Salary negotiation notes</label>
          <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full p-2 border rounded" rows={4} />
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          <button className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default HRInterview;