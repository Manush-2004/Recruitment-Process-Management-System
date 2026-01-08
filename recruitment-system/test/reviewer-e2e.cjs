const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

(async () => {
  try {
    const base = 'http://localhost:5190';
    const email = `reviewer+${Date.now()}@example.com`;
    console.log('Registering reviewer...', email);
    await axios.post(`${base}/api/auth/register`, { FullName: 'E2E Reviewer', Email: email, Password: 'Pass123!', Role: 'Reviewer' });

    console.log('Logging in...');
    const l = await axios.post(`${base}/api/auth/login`, { Email: email, Password: 'Pass123!' });
    const token = l.data.token;
    console.log('Token length:', token.length);

    // Create candidate (use candidate creation as recruiter? We'll create candidate via public endpoint)
    // For simplicity, create candidate via POST /api/candidates (no auth role requirement)
    console.log('Create candidate...');
    const createForm = new FormData();
    createForm.append('fullName', 'E2E Candidate');
    createForm.append('email', `e2e+${Date.now()}@example.com`);
    createForm.append('cv', fs.createReadStream(__filename));
    const cand = await axios.post(`${base}/api/candidates`, createForm, { headers: { ...createForm.getHeaders() } });
    console.log('Candidate created:', cand.data.id);

    // Create job (using recruiter role is expected; we'll create job using a recruiter user instead)
    // For testing reviewer submit, create a job with id 1 exists; try to find a job or create one using admin creds.
    console.log('Create job as recruiter...');
    const r2 = await axios.post(`${base}/api/auth/register`, { FullName: 'E2E Recruiter', Email: `r+${Date.now()}@example.com`, Password: 'Pass123!', Role: 'Recruiter' });
    const l2 = await axios.post(`${base}/api/auth/login`, { Email: r2.data.email || `r+${Date.now()}@example.com`, Password: 'Pass123!' }).catch(() => null);
    // Fallback: try to use first job from /api/jobs
    const jobs = await axios.get(`${base}/api/jobs`);
    const jobId = jobs.data?.[0]?.id ?? null;

    if (!jobId) {
      console.error('No job available to screen; create one manually and re-run tests.');
      process.exit(1);
    }

    // Now perform screening as reviewer
    console.log('Submitting screening...');
    const payload = {
      candidateId: cand.data.id,
      jobId: jobId,
      reviewerName: 'E2E Reviewer',
      status: 'Shortlisted',
      comments: 'Looks good',
      skills: []
    };

    const res = await axios.post(`${base}/api/screenings`, payload, { headers: { Authorization: 'Bearer ' + token } });
    console.log('Screening submitted:', res.data.id);

    console.log('Get history (should include new screening)');
    const hist = await axios.get(`${base}/api/screenings/history`, { headers: { Authorization: 'Bearer ' + token } });
    console.log('History count:', hist.data.length);

    console.log('Check duplicate (should be true)');
    const chk = await axios.get(`${base}/api/screenings/check`, { params: { candidateId: cand.data.id, jobId }, headers: { Authorization: 'Bearer ' + token } });
    console.log('Already screened:', chk.data.already);

    console.log('Reviewer E2E completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Reviewer E2E error', { message: err.message, status: err.response?.status, data: err.response?.data });
    process.exit(1);
  }
})();