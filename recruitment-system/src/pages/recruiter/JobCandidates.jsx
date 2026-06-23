import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getJob, getCandidatesForJob } from "../../services/recruiterService";

const SkillMatchBar = ({ matched, total }) => {
  const pct = total === 0 ? 0 : Math.round((matched / total) * 100);
  return (
    <div className="w-48 bg-gray-100 rounded overflow-hidden h-3">
      <div style={{ width: `${pct}%` }} className="bg-green-500 h-3" />
    </div>
  );
};

const JobCandidates = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const j = await getJob(id);
        setJob(j);
        const cs = await getCandidatesForJob(parseInt(id, 10));
        setCandidates(cs || []);
      } catch (e) {
        console.error("Failed to load job candidates", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Candidates for: {job?.title ?? "Job"}
      </h1>
      {loading ? (
        <p>Loading…</p>
      ) : candidates.length === 0 ? (
        <p className="text-sm text-ds-text-secondary">No linked candidates.</p>
      ) : (
        <ul className="space-y-3">
          {candidates.map((c) => {
            const matched =
              job?.requiredSkills?.filter((rs) =>
                c.skills?.some(
                  (cs) => cs.name === rs.name && cs.years >= rs.minYears,
                ),
              ).length ?? 0;
            const total = job?.requiredSkills?.length ?? 0;
            return (
              <li
                key={c.id}
                className="p-4 bg-white border rounded flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{c.fullName}</p>
                  <p className="text-sm text-ds-text-secondary">{c.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <SkillMatchBar matched={matched} total={total} />
                  <div className="text-sm text-ds-text-secondary">
                    {total === 0 ? "No skills" : `${matched}/${total}`}
                  </div>
                </div>
                <div className="ml-4">
                  <a
                    href={`/recruiter/screening?candidateId=${c.id}&jobId=${id}`}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Assign Screening
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default JobCandidates;
