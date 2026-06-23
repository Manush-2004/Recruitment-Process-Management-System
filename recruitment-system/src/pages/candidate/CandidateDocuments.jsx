import { useState } from "react";
import NavigationBar from "../../components/NavigationBar";
import { uploadDocument } from "../../services/candidatesService";

const CandidateDocuments = () => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // show message or error as small alerts
  const [type, setType] = useState("Resume");

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setUploading(true);
    setMessage(null);
    setError(null);
    try {
      await uploadDocument(f, type);
      setMessage("Uploaded successfully");
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <main className="max-w-[900px] mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Upload Documents</h1>
        <div className="p-6 bg-ds-surface rounded-ds-card">
          <div className="flex items-center gap-3">
            <input type="file" onChange={handleFile} disabled={uploading} />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="Resume">Resume</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {uploading && (
            <p className="text-sm text-ds-text-secondary">Uploading...</p>
          )}
          {message && <p className="text-sm mt-3">{message}</p>}
          {error && (
            <div className="mt-3 rounded-md bg-ds-error-bg border p-3">
              <p className="text-sm text-ds-error">{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CandidateDocuments;
