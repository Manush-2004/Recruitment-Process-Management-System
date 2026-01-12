import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCandidates, createCandidate, bulkUploadCandidates } from '../../api/recruiterApi';
import { useNotifications } from '../../contexts/NotificationContext';

const CandidateForm = ({ onSave, onCancel }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState('');
  const [cv, setCv] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('fullName', fullName);
    fd.append('email', email);
    if (phone) fd.append('phone', phone);
    if (password) fd.append('password', password);
    if (skills) fd.append('skills', skills);
    if (cv) fd.append('cv', cv);
    await onSave(fd);
  };

  return (
    <form onSubmit={submit} className="p-4 bg-white rounded-ds-card shadow-ds-card mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="p-2 border rounded" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-2 border rounded" required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="p-2 border rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="p-2 border rounded" required />
        <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (e.g., JS:3;React:2)" className="p-2 border rounded" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCv(e.target.files?.[0] ?? null)} />
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Create</button>
        </div>
      </div>
    </form>
  );
};

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [message, setMessage] = useState(null);

  const { notifications } = useNotifications();

  const load = async () => {
    setLoading(true);
    try {
      const cs = await getCandidates();
      setCandidates(cs || []);
    } catch (e) {
      console.error('Failed to load candidates', e);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    // when users are cleared elsewhere, refresh candidates list (notification sent by server)
    const latest = notifications?.[0];
    if (latest?.message === 'UsersCleared') {
      load();
    }
  }, [notifications]);

  const onSave = async (formData) => {
    try {
      await createCandidate(formData);
      const cs = await getCandidates();
      setCandidates(cs || []);
      setShowForm(false);
    } catch (e) {
      console.error('Create failed', e);
      alert('Create failed');
    }
  };

  const onBulkUpload = async () => {
    if (!bulkFile) return alert('Select a file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', bulkFile);
      const res = await bulkUploadCandidates(fd);
      setMessage(`Imported ${res.importedCount ?? 0}. Errors: ${res.errors?.length ?? 0}`);
      const cs = await getCandidates();
      setCandidates(cs || []);
    } catch (e) {
      console.error('Bulk failed', e);
      alert('Bulk upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Candidates</h1>
        <div>
          <button onClick={() => setShowForm((s) => !s)} className="px-4 py-2 rounded bg-blue-600 text-white">{showForm ? 'Close' : 'Create Candidate'}</button>
        </div>
      </div>

      {showForm && <CandidateForm onSave={onSave} onCancel={() => setShowForm(false)} />}

      <div className="mb-4 p-4 bg-white rounded-ds-card shadow-ds-card">
        <h2 className="font-medium mb-2">Bulk upload</h2>
        <input type="file" accept=".xlsx,.xls" onChange={(e) => setBulkFile(e.target.files?.[0] ?? null)} />
        <button onClick={onBulkUpload} className="ml-2 px-3 py-1 rounded bg-green-600 text-white" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</button>
        {message && <div className="mt-2 text-sm text-ds-text-secondary">{message}</div>}
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : candidates.length === 0 ? (
        <p className="text-sm text-ds-text-secondary">No candidates available.</p>
      ) : (
        <ul className="space-y-3">
          {candidates.map((c) => (
            <li key={c.id} className="p-4 bg-white border rounded flex items-center justify-between">
              <div>
                <p className="font-medium">{c.fullName} <span className="text-xs text-ds-text-secondary">(id:{c.id})</span></p>
                <p className="text-sm text-ds-text-secondary">{c.email}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/recruiter/candidate/${c.id}`} className="px-3 py-1 border rounded">View</Link>
                <Link to={`/recruiter/screening?candidateId=${c.id}`} className="px-3 py-1 bg-yellow-500 text-white rounded">Assign Screening</Link>
                <Link to={`/recruiter/offers?candidateId=${c.id}`} className="px-3 py-1 border rounded">View Feedback</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CandidatesPage;