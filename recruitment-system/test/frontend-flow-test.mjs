import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:5190';
const JWT_KEY = 'THIS_IS_A_VERY_SECRET_KEY_12345_1234567890';

const mock = new MockAdapter(axios, { delayResponse: 50 });

function genToken(email, fullname, role) {
  const payload = {
    unique_name: email,
    FullName: fullname,
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': role,
    role: role,
  };
  return jwt.sign(payload, JWT_KEY, { issuer: 'RecruitmentSystem', audience: 'RecruitmentSystemUsers', expiresIn: '1h' });
}

// Mock register
mock.onPost(`${API_BASE}/api/auth/register`).reply((config) => {
  const body = JSON.parse(config.data);
  const token = genToken(body.Email, body.FullName, body.Role);
  return [200, { token }];
});

// Mock login
mock.onPost(`${API_BASE}/api/auth/login`).reply((config) => {
  const body = JSON.parse(config.data);
  const token = genToken(body.Email, 'E2E Candidate', 'Candidate');
  return [200, { token }];
});

// Mock candidate endpoints
mock.onGet(`${API_BASE}/api/candidates/me`).reply((config) => {
  const auth = config.headers.Authorization || '';
  const token = auth.replace('Bearer ', '');
  try {
    jwt.verify(token, JWT_KEY, { issuer: 'RecruitmentSystem', audience: 'RecruitmentSystemUsers' });
    return [200, { email: 'e2e@example.com', fullName: 'E2E Candidate' }];
  } catch {
    return [401, { message: 'Unauthorized' }];
  }
});

mock.onGet(`${API_BASE}/api/candidates/me/interviews`).reply(200, [{ id: 1, interviewer: 'Jane Doe', status: 'Scheduled' }]);
mock.onGet(`${API_BASE}/api/candidates/me/offers`).reply(200, [{ id: 1, jobTitle: 'Software Engineer', salary: '$120k' }]);
mock.onGet(`${API_BASE}/api/candidates/me/status-history`).reply(200, [{ id: 1, status: 'Applied', date: new Date().toISOString() }]);
mock.onPost(`${API_BASE}/api/candidates/me/documents`).reply(200, { id: 1, fileName: 'resume.pdf', url: '/uploads/resume.pdf' });

(async () => {
  try {
    console.log('Registering (mock)...');
    const reg = await axios.post(`${API_BASE}/api/auth/register`, { FullName: 'E2E Candidate', Email: 'e2e@example.com', Password: 'Pass123!', Role: 'Candidate' });
    const token = reg.data.token;
    console.log('Received token length:', token.length);

    const decoded = jwt.decode(token);
    console.log('Decoded token roles (checks):', decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);

    console.log('Login (mock)...');
    const lg = await axios.post(`${API_BASE}/api/auth/login`, { Email: 'e2e@example.com', Password: 'Pass123!' });
    const token2 = lg.data.token;
    const p = jwt.decode(token2);
    if (!((p.role && p.role === 'Candidate') || p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Candidate')) throw new Error('Role missing or incorrect');

    console.log('/me (mock)...');
    const me = await axios.get(`${API_BASE}/api/candidates/me`, { headers: { Authorization: 'Bearer ' + token2 } });
    console.log('/me response:', me.data);

    console.log('Interviews (mock)...');
    const iv = await axios.get(`${API_BASE}/api/candidates/me/interviews`, { headers: { Authorization: 'Bearer ' + token2 } });
    console.log('Interviews:', iv.data);

    console.log('Upload (mock)...');
    const upload = await axios.post(`${API_BASE}/api/candidates/me/documents`, {}, { headers: { Authorization: 'Bearer ' + token2 } });
    console.log('Upload result:', upload.data);

    console.log('Frontend flow test PASSED (mock)');
    process.exit(0);
  } catch (err) {
    console.error('Frontend flow test FAILED', err);
    process.exit(1);
  }
})();