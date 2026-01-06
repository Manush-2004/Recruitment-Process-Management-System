const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

(async () => {
  try {
    const base = 'http://localhost:5190';
    const email = `e2e+${Date.now()}@example.com`;
    console.log('Registering candidate...', email);
    const r = await axios.post(`${base}/api/auth/register`, { FullName: 'E2E Candidate', Email: email, Password: 'Pass123!', Role: 'Candidate' });
    console.log('Registered:', r.data);

    console.log('Logging in...');
    const l = await axios.post(`${base}/api/auth/login`, { Email: email, Password: 'Pass123!' });
    console.log('Login:', l.data);
    const token = l.data.token;

    // Create candidate profile (the Auth register does not automatically create a Candidate entity)
    console.log('Create candidate profile (POST /api/candidates)');
    const FormData = require('form-data');
    const createForm = new FormData();
    createForm.append('fullName', 'E2E Candidate');
    createForm.append('email', email);
    // attach a small file as cv if needed
    createForm.append('cv', fs.createReadStream(__filename));
    await axios.post(`${base}/api/candidates`, createForm, { headers: { Authorization: 'Bearer ' + token, ...createForm.getHeaders() } });

    console.log('Get /me');
    const me = await axios.get(`${base}/api/candidates/me`, { headers: { Authorization: 'Bearer ' + token } });
    console.log('/me', me.data);

    console.log('Get interviews');
    const iv = await axios.get(`${base}/api/candidates/me/interviews`, { headers: { Authorization: 'Bearer ' + token } });
    console.log('interviews', iv.data);

    console.log('Get offers');
    const offers = await axios.get(`${base}/api/candidates/me/offers`, { headers: { Authorization: 'Bearer ' + token } });
    console.log('offers', offers.data);

    console.log('Get status history');
    const sh = await axios.get(`${base}/api/candidates/me/status-history`, { headers: { Authorization: 'Bearer ' + token } });
    console.log('status history', sh.data);

    console.log('Upload document');
    const form = new FormData();
    form.append('file', fs.createReadStream(__filename));
    const upload = await axios.post(`${base}/api/candidates/me/documents`, form, { headers: { Authorization: 'Bearer ' + token, ...form.getHeaders() } });
    console.log('upload', upload.data);

    console.log('E2E test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('E2E error', {
      message: err.message,
      stack: err.stack,
      responseStatus: err.response?.status,
      responseData: err.response?.data,
      responseHeaders: err.response?.headers,
    });
    process.exit(1);
  }
})();