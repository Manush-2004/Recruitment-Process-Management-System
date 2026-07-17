import { useEffect, useState } from "react";
import * as api from "../../services/hrService.js";
import { Link } from "react-router-dom";

const HRDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const c = await api.getCandidatesAtHR();
        const o = await api.getOffers();
        setCandidates(c || []);
        setOffers(o || []);
      } catch (err) {
      console.error("API Error:", err);
    } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">HR Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white border rounded">
          <div className="text-sm text-ds-text-secondary">
            Candidates at HR stage
          </div>
          <div className="text-xl font-bold">{candidates.length}</div>
        </div>
        <div className="p-4 bg-white border rounded">
          <div className="text-sm text-ds-text-secondary">Offers pending</div>
          <div className="text-xl font-bold">
            {offers.filter((o) => o.status === "Pending").length}
          </div>
        </div>
        <div className="p-4 bg-white border rounded">
          <div className="text-sm text-ds-text-secondary">Joining pipeline</div>
          <div className="text-xl font-bold">
            {offers.filter((o) => o.status === "Accepted").length}
          </div>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Candidates at HR stage</h2>
        {loading ? (
          <p>Loading…</p>
        ) : candidates.length === 0 ? (
          <p className="text-sm text-ds-text-secondary">
            No candidates at HR stage.
          </p>
        ) : (
          <div className="space-y-3">
            {candidates.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-white border rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{c.fullName}</div>
                  <div className="text-sm text-ds-text-secondary">
                    {c.email}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/hr/candidate/${c.id}/documents`}
                    className="text-sm text-blue-600"
                  >
                    Documents
                  </Link>
                  <Link
                    to={`/hr/candidate/${c.id}/interviews`}
                    className="text-sm text-green-600"
                  >
                    Interview
                  </Link>
                  <Link
                    to={`/hr/offer/create?candidateId=${c.id}`}
                    className="text-sm text-indigo-600"
                  >
                    Create Offer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Offers</h2>
        {loading ? (
          <p>Loading…</p>
        ) : offers.length === 0 ? (
          <p className="text-sm text-ds-text-secondary">No offers.</p>
        ) : (
          <div className="space-y-2">
            {offers.map((o) => (
              <div
                key={o.id}
                className="p-3 bg-white border rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {o.candidate?.fullName} — {o.job?.title}
                  </div>
                  <div className="text-sm text-ds-text-secondary">
                    {o.status} — {o.salary}
                  </div>
                </div>
                <div>
                  <Link
                    to={`/hr/offers/${o.id}`}
                    className="text-sm text-indigo-600"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HRDashboard;
