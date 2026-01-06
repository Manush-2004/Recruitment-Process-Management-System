import { useEffect, useState } from 'react';
import NavigationBar from '../../components/NavigationBar';
import { getMe, uploadDocument } from '../../api/candidatesApi';

const CandidateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getMe();
        setProfile(p);
      } catch (e) {
        console.error(e);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setUploading(true);
    setError(null);
    try {
      await uploadDocument(f);
      const refreshed = await getMe();
      setProfile(refreshed);
    } catch (err) {
      console.error(err);
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <main className="max-w-[900px] mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>

        <div className="p-6 bg-ds-surface rounded-ds-card">
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-ds-error-bg border p-3">
              <p className="text-sm text-ds-error">{error}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-ds-text-secondary">Full name</p>
              <p className="font-medium mb-3">{profile?.fullName ?? profile?.FullName}</p>

              <p className="text-sm text-ds-text-secondary">Email</p>
              <p className="font-medium mb-3">{profile?.email ?? profile?.Email}</p>

              <p className="text-sm text-ds-text-secondary">Phone</p>
              <p className="font-medium mb-6">{profile?.phone ?? profile?.Phone ?? '—'}</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-ds-text-label mb-2">Resume / Documents</label>
                <div className="flex items-center gap-3">
                  <input type="file" onChange={handleFile} disabled={uploading} />
                  {uploading && <span className="text-sm text-ds-text-secondary">Uploading...</span>}
                </div>
                <div className="mt-3 space-y-2">
                  {(profile?.documents || profile?.Documents || []).map((d) => (
                    <div key={d.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{d.fileName ?? d.file_name ?? d.fileName}</p>
                        <p className="text-xs text-ds-text-secondary">{(((d.size ?? d.sizeInBytes) ?? 0)/1024).toFixed(0)} KB</p>
                      </div>
                      <a href={(d.filePath ?? d.FilePath ?? d.file_path) || '#'} target="_blank" rel="noreferrer" className="text-sm text-ds-primary">View</a>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ds-text-label mb-2">Skills</label>
                <div className="flex gap-2 flex-wrap">
                  {(profile?.skills || profile?.Skills || []).map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{s.name ?? s.Name} · {s.years ?? s.Years}y</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CandidateProfile;
