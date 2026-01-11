import { useEffect, useState } from 'react';
import * as api from '../../api/adminApi.js';

const Reports = () => {
  const [position, setPosition] = useState([]);
  const [tech, setTech] = useState([]);
  const [candidateSummary, setCandidateSummary] = useState(null);
  const [interviewerSummary, setInterviewerSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      try { setPosition(await api.getPositionWise()); } catch (err) { console.error(err); }
      try { setTech(await api.getTechnologyWise()); } catch (err) { console.error(err); }
      try { setCandidateSummary(await api.getCandidateSummary()); } catch (err) { console.error(err); }
      try { setInterviewerSummary(await api.getInterviewerSummary()); } catch (err) { console.error(err); }
    };
    load();
  }, []);

  const exportCsv = (data, filename = 'report.csv') => {
    if (!data) return;
    const rows = [Object.keys(data[0] || {}).join(','), ...data.map(r => Object.values(r).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-2">Position-wise report</h2>
          <button onClick={() => exportCsv(position, 'position_report.csv')} className="px-3 py-1 bg-gray-100 rounded mb-2">Export CSV</button>
          <ul>{position.map(p => <li key={p.position}>{p.position} — {p.candidateCount}</li>)}</ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-2">Technology-wise report</h2>
          <button onClick={() => exportCsv(tech, 'technology_report.csv')} className="px-3 py-1 bg-gray-100 rounded mb-2">Export CSV</button>
          <ul>{tech.map(t => <li key={t.skill}>{t.skill} — {t.candidateCount}</li>)}</ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-2">Candidate summary</h2>
          <div>Total candidates: {candidateSummary?.total}</div>
          <div>With documents: {candidateSummary?.withDocs}</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-2">Interviewer summary</h2>
          <pre className="text-sm">{JSON.stringify(interviewerSummary, null, 2)}</pre>
        </div>

      </div>
    </div>
  );
};

export default Reports;