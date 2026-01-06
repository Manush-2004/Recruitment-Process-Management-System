const BASE = 'http://localhost:5190';

async function register() {
  const res = await fetch(BASE + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ FullName: 'Test Candidate', Email: 'test.candidate@example.com', Password: 'Password123!', Role: 'Candidate' })
  });
  const txt = await res.text();
  console.log('Register status', res.status, txt);
}

async function login() {
  const res = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Email: 'test.candidate@example.com', Password: 'Password123!' })
  });
  const data = await res.json();
  console.log('Login status', res.status, data);
  return data.token;
}

async function me(token) {
  const res = await fetch(BASE + '/api/candidates/me', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  console.log('Me status', res.status, data);
}

(async () => {
  try {
    await register();
  } catch (e) { console.log('Register failed', e.message); }
  try {
    const token = await login();
    if (token) await me(token);
  } catch (e) { console.log('Login/Me failed', e.message); }
})();