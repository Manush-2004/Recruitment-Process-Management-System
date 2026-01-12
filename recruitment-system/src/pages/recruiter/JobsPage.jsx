import { useEffect, useState } from 'react';
import { getJobs, createJob, updateJob, deleteJob } from '../../api/recruiterApi';
import JobForm from './JobForm';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const js = await getJobs();
        setJobs(js || []);
      } catch (e) {
        console.error('Failed to load jobs', e);
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onCreate = () => { setEditing(null); setShowForm(true); };

  const onSave = async (payload) => {
    try {
      if (editing) {
        await updateJob(editing.id, payload);
      } else {
        await createJob(payload);
      }
      const js = await getJobs();
      setJobs(js || []);
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      console.error('Save failed', e);
      setError('Save failed');
    }
  };

  const onEdit = (job) => { setEditing(job); setShowForm(true); };

  const onDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      setJobs((s) => s.filter((j) => j.id !== id));
    } catch (e) {
      console.error('Delete failed', e);
      setError('Delete failed');
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <div>
          <button onClick={onCreate} className="px-4 py-2 rounded bg-blue-600 text-white">Create Job</button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {showForm && <JobForm initial={editing} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={onSave} />}

      {loading ? (
        <p>Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-ds-text-secondary">No jobs available.</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((j) => (
            <li key={j.id} className="p-4 bg-white border rounded flex items-center justify-between">
              <div>
                <p className="font-medium">{j.title} <span className="text-xs text-ds-text-secondary">(id:{j.id})</span></p>
                <p className="text-sm text-ds-text-secondary">{j.description}</p>
                <div className="text-xs text-ds-text-secondary mt-1">Required: {j.requiredSkills?.map(s => s.name).join(', ')}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(j)} className="px-3 py-1 border rounded">Edit</button>
                <button onClick={() => onDelete(j.id)} className="px-3 py-1 text-red-600 border rounded">Delete</button>
                <a href={`/recruiter/job/${j.id}/candidates`} className="px-3 py-1 border rounded">View Candidates</a>
                <a href={`/recruiter/offers?jobId=${j.id}`} className="px-3 py-1 border rounded">View Feedback</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobsPage;