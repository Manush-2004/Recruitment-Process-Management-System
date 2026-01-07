const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

(async () => {
  try {
    const base = 'http://localhost:5190';
    const email = `recruiter+${Date.now()}@example.com`;
    console.log('Registering recruiter...', email);
    const r = await axios.post(`${base}/api/auth/register`, { FullName: 'E2E Recruiter', Email: email, Password: 'Pass123!', Role: 'Recruiter' });
    console.log('Registered:', r.data);

    console.log('Logging in...');
    const l = await axios.post(`${base}/api/auth/login`, { Email: email, Password: 'Pass123!' });
    console.log('Login:', l.data);
    const token = l.data.token;

    console.log('Create job (POST /api/jobs)');
    const job = await axios.post(`${base}/api/jobs`, { title: 'E2E Job', description: 'Test job', requiredSkills: [] }, { headers: { Authorization: 'Bearer ' + token } });
    console.log('Job created:', job.data);

    console.log('Create candidate (POST /api/candidates)');
    const createForm = new FormData();
    createForm.append('fullName', 'E2E Candidate');
    createForm.append('email', `e2e+${Date.now()}@example.com`);
    createForm.append('cv', fs.createReadStream(__filename));
    const cand = await axios.post(`${base}/api/candidates`, createForm, { headers: { Authorization: 'Bearer ' + token, ...createForm.getHeaders() } });
    console.log('Candidate created:', cand.data);

    console.log('Get candidates (GET /api/candidates)');
    const cands = await axios.get(`${base}/api/candidates`, { headers: { Authorization: 'Bearer ' + token } });
    console.log('Candidates count:', cands.data.length);

    console.log('Schedule interview (POST /api/interviews)');
    const interview = await axios.post(`${base}/api/interviews`, { candidateId: cand.data.id, jobId: job.data.id, roundType: 'Tech', scheduledAt: new Date().toISOString(), interviewers: [{ name: 'Interviewer One', email: 'int1@example.com' }] }, { headers: { Authorization: 'Bearer ' + token } });
    console.log('Interview scheduled:', interview.data);

    console.log('Attempt to create offer (should be 403 for Recruiter)');
    try {
      const offer = await axios.post(`${base}/api/offers`, { candidateId: cand.data.id, jobId: job.data.id, salary: 100000 }, { headers: { Authorization: 'Bearer ' + token } });
      console.log('Offer created (unexpected):', offer.data);
    } catch (err) {
      console.log('Create offer response (expected failure):', err.response?.status, err.response?.data || err.message);
    }

    console.log('Recruiter E2E completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Recruiter E2E error', {
      message: err.message,
      stack: err.stack,
      responseStatus: err.response?.status,
      responseData: err.response?.data,
      responseHeaders: err.response?.headers,
    });
    process.exit(1);
  }
})();