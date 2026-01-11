const axios = require('axios');

(async () => {
  try {
    const base = 'http://localhost:5190';
    const adminEmail = `admin+${Date.now()}@example.com`;
    console.log('Registering admin...', adminEmail);
    await axios.post(`${base}/api/auth/register`, { FullName: 'E2E Admin', Email: adminEmail, Password: 'Pass123!', Role: 'Admin' });
    console.log('Login admin...');
    const la = await axios.post(`${base}/api/auth/login`, { Email: adminEmail, Password: 'Pass123!' });
    const token = la.data.token;

    console.log('Get users (should return list)');
    const users = (await axios.get(`${base}/api/admin/users`, { headers: { Authorization: 'Bearer ' + token } })).data;
    console.log('Users count:', users.length);

    console.log('Create a new role and user');
    await axios.post(`${base}/api/admin/roles`, { role: 'DataAnalyst' }, { headers: { Authorization: 'Bearer ' + token } });
    const newUser = (await axios.post(`${base}/api/admin/users`, { FullName: 'Report Bot', Email: `report+${Date.now()}@example.com`, Password: 'Pass123!', Role: 'Recruiter' }, { headers: { Authorization: 'Bearer ' + token } })).data;
    console.log('Created user:', newUser);

    console.log('Assigning role DataAnalyst to new user');
    await axios.post(`${base}/api/admin/users/${newUser.id}/roles`, { role: 'DataAnalyst' }, { headers: { Authorization: 'Bearer ' + token } });

    console.log('Fetch position-wise report');
    const pos = (await axios.get(`${base}/api/reports/position-wise`, { headers: { Authorization: 'Bearer ' + token } })).data;
    console.log('Position report samples:', pos.slice(0,3));

    console.log('Admin E2E completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Admin E2E error', { message: err.message, status: err.response?.status, data: err.response?.data });
    process.exit(1);
  }
})();