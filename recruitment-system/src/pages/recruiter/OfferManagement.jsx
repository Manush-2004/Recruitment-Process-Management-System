import { useState } from 'react';
import { createOffer } from '../../api/recruiterApi';
import axiosInstance from '../../api/axiosConfig';

const OfferManagement = () => {
  const [interviewId, setInterviewId] = useState('');
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchSummary = async () => {
    if (!interviewId) return alert('Enter interview id');
    try {
      const res = await axiosInstance.get(`/api/feedback/interview/${interviewId}/summary`);
      setSummary(res.data);
      setMessage(null);
    } catch (e) {
      console.error('Fetch summary failed', e);
      setMessage(e.response?.status === 403 ? 'You do not have permission to view interview summaries (HR only).' : 'Failed to fetch summary');
    }
  };

  const onInitiate = async () => {
    if (!summary) return alert('Fetch interview summary first');
    try {
      const offerPayload = {
        candidateId: summary.candidateId,
        interviewId: parseInt(interviewId, 10),
        salary: summary.suggestedSalary ?? 0,
        startDate: new Date().toISOString()
      };
      const res = await createOffer(offerPayload);
      setMessage('Offer initiated — HR may need to finalize (if your account is allowed to create offers, this will complete).');
    } catch (e) {
      console.error('Initiate failed', e);
      if (e.response?.status === 403) setMessage('Only HR can create offers. Please request HR to initiate the offer.');
      else setMessage('Failed to initiate offer');
    }
  };

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Offer Management</h1>
      <div className="bg-white p-4 rounded-ds-card shadow-ds-card">
        <div className="flex gap-2 mb-3">
          <input placeholder="Interview id" value={interviewId} onChange={(e) => setInterviewId(e.target.value)} className="p-2 border rounded" />
          <button onClick={fetchSummary} className="px-3 py-1 bg-blue-600 text-white rounded">Fetch summary</button>
        </div>

        {message && <div className="mb-3 text-sm text-red-600">{message}</div>}

        {summary && (
          <div>
            <h2 className="font-medium">Interview Summary</h2>
            <p className="text-sm text-ds-text-secondary">Candidate: {summary.candidateName}</p>
            <p className="text-sm text-ds-text-secondary">Average score: {summary.averageScore}</p>
            <div className="mt-3">
              <button onClick={onInitiate} className="px-3 py-1 bg-green-600 text-white rounded">Initiate Offer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferManagement;