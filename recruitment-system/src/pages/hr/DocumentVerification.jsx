import { useEffect, useState } from "react";
import * as api from "../../services/hrService.js";
import { useParams } from "react-router-dom";

const DocumentVerification = () => {
  const { id } = useParams(); // candidate id
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const d = await api.getCandidateDocuments(id);
        setDocs(d || []);
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const toggleVerify = async (docId, cur) => {
    try {
      await api.verifyDocument(id, docId, !cur);
      setDocs(docs.map((d) => (d.id === docId ? { ...d, verified: !cur } : d)));
    } catch (err) {
      console.error("Failed to update document", err);
      alert("Failed to update document");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Document Verification</h1>
      {loading ? (
        <p>Loading…</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-ds-text-secondary">No documents uploaded.</p>
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <div
              key={d.id}
              className="p-3 bg-white border rounded flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{d.filename}</div>
                <div className="text-sm text-ds-text-secondary">
                  {d.uploadedAt}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600"
                >
                  View
                </a>
                <button
                  onClick={() => toggleVerify(d.id, d.verified)}
                  className={`px-3 py-1 rounded ${d.verified ? "bg-green-600 text-white" : "border"}`}
                >
                  {d.verified ? "Verified" : "Verify"}
                </button>
                <div className="text-sm text-ds-text-secondary">
                  BG Check: {d.backgroundCheckStatus || "Pending"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;
