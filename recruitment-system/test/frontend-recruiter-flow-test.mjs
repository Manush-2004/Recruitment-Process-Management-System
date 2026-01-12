import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import axiosInstance from '../src/api/axiosConfig.js';
import * as api from '../src/api/recruiterApi.js';

const mock = new MockAdapter(axiosInstance);

async function run() {
  mock.onGet('/api/jobs').reply(200, [{ id: 1, title: 'SWE', requiredSkills: [] }]);
  mock.onGet('/api/candidates').reply(200, [{ id: 1, fullName: 'Test', email: 't@e' }]);
  mock.onPost('/api/jobs').reply(201, { id: 2, title: 'New Job' });
  mock.onPost('/api/candidates').reply(201, { id: 5, fullName: 'Created' });
  mock.onPost('/api/screenings/assign').reply(200, { id: 1, status: 'Shortlisted' });
  mock.onPost('/api/interviews').reply(200, { id: 2, scheduledAt: new Date().toISOString() });

  console.log('Testing recruiter API client...');

  const jobs = await api.getJobs();
  console.log('jobs', jobs.length === 1 ? 'OK' : 'FAIL');

  const cands = await api.getCandidates();
  console.log('candidates', cands.length === 1 ? 'OK' : 'FAIL');

  const newJob = await api.createJob({ title: 'New Job', description: 'x', requiredSkills: [] });
  console.log('createJob', newJob?.id ? 'OK' : 'FAIL');

  const fd = new FormData(); fd.append('fullName', 'Created'); fd.append('email', 'c@c');
  const created = await api.createCandidate(fd);
  console.log('createCandidate', created?.id ? 'OK' : 'FAIL');

  const screening = await api.assignScreening({ candidateId: 1, jobId: 1, reviewerName: 'R', status: 'Shortlisted', skills: [] });
  console.log('assignScreening', screening?.id ? 'OK' : 'FAIL');

  const interview = await api.scheduleInterview({ candidateId: 1, jobId: 1, roundType: 'Tech', scheduledAt: new Date().toISOString(), interviewers: [] });
  console.log('scheduleInterview', interview?.id ? 'OK' : 'FAIL');

  console.log('Recruiter flow (mock) PASSED');
}

run().catch((e) => { console.error('Test failed', e); process.exitCode = 1; });