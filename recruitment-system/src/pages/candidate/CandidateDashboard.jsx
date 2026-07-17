import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavigationBar from "../../components/NavigationBar";
import {
  getMe,
  getMyInterviews,
  getMyOffers,
  getMyStatusHistory,
} from "../../services/candidatesService";
import StatusTimeline from "../../components/StatusTimeline";

const CandidateDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMe();
        setProfile(p);
        const ivs = await getMyInterviews();
        setInterviews(ivs);
        const ofs = await getMyOffers();
        setOffers(ofs);
        const hs = await getMyStatusHistory();
        setHistory(hs);
      } catch (e) {
      console.error("API Error:", e);
    }
    })();
  }, []);

  // Calculate applied-jobs count following business rules described in the spec
  const computeAppliedCount = (hist = []) => {
    // Sort by ChangedAt ascending
    const sorted = (hist || [])
      .slice()
      .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
    let count = 0;
    for (const h of sorted) {
      const oldS = h.oldStatus ?? h.OldStatus ?? "";
      const newS = h.newStatus ?? h.NewStatus ?? "";
      // Check transitions
      if (
        oldS === "Applied" &&
        (newS === "Shortlisted" || newS === "On Hold")
      ) {
        count += 1;
      } else if (newS === "Rejected") {
        // If rejected at screening stage itself, don't decrement below 0
        if (oldS === "Screening" && count === 0) continue;
        count = Math.max(0, count - 1);
      }
    }
    return count;
  };

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <main className="max-w-[1200px] mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Candidate Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link
            to="/candidate/profile"
            className="block p-4 bg-ds-surface rounded-ds-card shadow-ds-card hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-ds-text-secondary">Applied Jobs</p>
            <p className="text-2xl font-semibold">
              {computeAppliedCount(history)}
            </p>
          </Link>
          <Link
            to="/candidate/interviews"
            className="block p-4 bg-ds-surface rounded-ds-card shadow-ds-card hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-ds-text-secondary">
              Interviews Scheduled
            </p>
            <p className="text-2xl font-semibold">{interviews.length}</p>
          </Link>
          <Link
            to="/candidate/offers"
            className="block p-4 bg-ds-surface rounded-ds-card shadow-ds-card hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-ds-text-secondary">Offers</p>
            <p className="text-2xl font-semibold">{offers.length}</p>
          </Link>
        </div>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-3">Latest Status Updates</h2>
          <StatusTimeline items={history.slice(0, 5)} />
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">Upcoming Interviews</h2>
          {interviews.length === 0 ? (
            <p className="text-sm text-ds-text-secondary">
              No upcoming interviews
            </p>
          ) : (
            <ul className="space-y-3">
              {interviews.map((iv) => (
                <li key={iv.id} className="p-4 bg-ds-surface rounded-ds-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {iv.roundType} - {iv.job?.title}
                      </p>
                      <p className="text-sm text-ds-text-secondary">
                        {new Date(iv.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-ds-text-secondary">
                      {iv.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default CandidateDashboard;
