import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as api from '../../api/hrApi.js';

const OfferGeneration = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const candidateId = Number(params.get('candidateId')) || null;

  const [jobId, setJobId] = useState(null);
  const [salary, setSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const payload = { candidateId, jobId, salary, joiningDate, notes };
      const res = await api.generateOffer(payload);
      // Open PDF preview if backend returns a path
      if (res.offerPdfPath) window.open(res.offerPdfPath, '_blank');
      navigate('/hr/dashboard');
    } catch (err) {
      console.error('Failed to generate offer', err);
      alert('Failed to generate offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Generate Offer</h1>

      <div className="p-4 bg-white border rounded mb-4">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Salary</label>
          <input type="text" value={salary} onChange={(e)=>setSalary(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Joining Date</label>
          <input type="date" value={joiningDate} onChange={(e)=>setJoiningDate(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full p-2 border rounded" rows={4} />
        </div>

        <div className="flex gap-3">
          <button disabled={loading} onClick={submit} className="px-4 py-2 bg-indigo-600 text-white rounded">Generate Offer</button>
          <button onClick={()=>navigate('/hr/dashboard')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default OfferGeneration;