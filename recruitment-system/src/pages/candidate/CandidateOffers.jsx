import { useEffect, useState } from "react";
import NavigationBar from "../../components/NavigationBar";
import { getMyOffers } from "../../services/candidatesService";

const CandidateOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const of = await getMyOffers();
        setOffers(of);
      } catch (e) {
      console.error("API Error:", e);
    } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <main className="max-w-[900px] mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Offers</h1>
        {loading ? (
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-ds-error-bg border p-3 mb-3">
            <p className="text-sm text-ds-error">{error}</p>
          </div>
        ) : offers.length === 0 ? (
          <p className="text-sm text-ds-text-secondary">
            No offers at this time.
          </p>
        ) : (
          <ul className="space-y-3">
            {offers.map((o) => (
              <li
                key={o.id}
                className="p-4 bg-ds-surface rounded-ds-card flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">
                    Salary:{" "}
                    {Number(o.salary ?? o.Salary).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                  <p className="text-sm text-ds-text-secondary">
                    Joining:{" "}
                    {new Date(
                      o.joiningDate ?? o.JoiningDate,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <a
                    href={o.offerPdfPath ?? o.offerPdfPath}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ds-primary"
                  >
                    Download Offer
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default CandidateOffers;
