import { useEffect, useState } from "react";
import NavigationBar from "../../components/NavigationBar";
import {
  getMe,
  uploadDocument,
  updateMe,
  addSkills,
  deleteSkill,
} from "../../services/candidatesService";

const CandidateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState("Resume");
  const [editing, setEditing] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [newSkillText, setNewSkillText] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getMe();
        setProfile(p);
      } catch (e) {
        console.error(e);
        setError("Failed to load profile");
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
      await uploadDocument(f, type);
      const refreshed = await getMe();
      setProfile(refreshed);
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
              <p className="font-medium mb-3">
                {profile?.fullName ?? profile?.FullName}
              </p>

              <p className="text-sm text-ds-text-secondary">Email</p>
              <p className="font-medium mb-3">
                {profile?.email ?? profile?.Email}
              </p>

              <p className="text-sm text-ds-text-secondary">Phone</p>
              {!editing ? (
                <div className="flex items-center gap-4 mb-6">
                  <p className="font-medium">
                    {profile?.phone ?? profile?.Phone ?? "—"}
                  </p>
                  <button
                    onClick={() => {
                      setEditing(true);
                      setEditPhone(profile?.phone ?? profile?.Phone ?? "");
                    }}
                    className="px-2 py-1 text-sm border rounded"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      setSaving(true);
                      await updateMe({ phone: editPhone });
                      const refreshed = await getMe();
                      setProfile(refreshed);
                      setEditing(false);
                    } catch (err) {
                      console.error(err);
                      setError("Save failed");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="mb-6 flex items-center gap-2"
                >
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone"
                    className="p-2 border rounded"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-3 py-1 border rounded"
                  >
                    Cancel
                  </button>
                </form>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-ds-text-label mb-2">
                  Resume / Documents
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    onChange={handleFile}
                    disabled={uploading}
                  />
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="Resume">Resume</option>
                    <option value="Other">Other</option>
                  </select>
                  {uploading && (
                    <span className="text-sm text-ds-text-secondary">
                      Uploading...
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {(profile?.documents || profile?.Documents || []).map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {d.fileName ?? d.file_name ?? d.fileName}
                        </p>
                        <p className="text-xs text-ds-text-secondary">
                          {((d.size ?? d.sizeInBytes ?? 0) / 1024).toFixed(0)}{" "}
                          KB
                        </p>
                      </div>
                      <a
                        href={(d.filePath ?? d.FilePath ?? d.file_path) || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-ds-primary"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ds-text-label mb-2">
                  Skills
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(profile?.skills || profile?.Skills || []).map((s, i) => (
                    <div
                      key={s.id ?? s.Id ?? i}
                      className="flex items-center gap-2"
                    >
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {s.name ?? s.Name} · {s.years ?? s.Years}y
                      </span>
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this skill?")) return;
                          try {
                            setError(null);
                            await deleteSkill(s.id ?? s.Id);
                            const refreshed = await getMe();
                            setProfile(refreshed);
                          } catch (err) {
                            console.error("Delete skill failed", err);
                            setError("Delete skill failed");
                          }
                        }}
                        className="text-sm text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={newSkillText}
                    onChange={(e) => setNewSkillText(e.target.value)}
                    placeholder="Add skill e.g., React:2"
                    className="p-2 border rounded"
                  />
                  <button
                    onClick={async () => {
                      if (!newSkillText) return;
                      const parts = newSkillText
                        .split(";")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const skills = parts.map((p) => {
                        const seg = p.split(":").map((x) => x.trim());
                        return {
                          name: seg[0],
                          years: parseInt(seg[1] || "0", 10),
                        };
                      });
                      try {
                        await addSkills(skills);
                        const refreshed = await getMe();
                        setProfile(refreshed);
                        setNewSkillText("");
                      } catch (err) {
                        console.error("Add skills failed", err);
                        setError("Add skills failed");
                      }
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Add
                  </button>
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
