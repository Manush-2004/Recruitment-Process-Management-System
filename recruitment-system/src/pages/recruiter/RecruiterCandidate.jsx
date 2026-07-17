import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';

const RecruiterCandidate = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/candidates/${id}`);
        setCandidate(res.data);
      } catch (e) {
      console.error("API Error:", e);
    }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!candidate) return <div className="p-6">Candidate not found</div>;

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{candidate.fullName}</h1>
      <p className="text-sm text-ds-text-secondary">{candidate.email} {candidate.phone && `• ${candidate.phone}`}</p>

      <div className="mt-4 bg-white p-4 rounded-ds-card shadow-ds-card">
        <h3 className="font-medium mb-2">Documents</h3>
        {candidate.documents?.length === 0 ? <p className="text-sm text-ds-text-secondary">No documents</p> : (
          <ul>
            {candidate.documents.map(d => (
              <li key={d.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{d.fileName}</div>
                  <div className="text-xs text-ds-text-secondary">{d.size} bytes</div>
                </div>
                <a href={d.filePath} className="text-sm text-blue-600" target="_blank" rel="noreferrer">Download</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecruiterCandidate;