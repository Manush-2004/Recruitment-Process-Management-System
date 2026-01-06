const axios = require('axios');
const { exec } = require('child_process');

const url = 'http://localhost:5190/swagger/index.html';
let attempts = 0;
const maxAttempts = 60; // poll for up to 60s

(async function poll() {
  try {
    attempts++;
    console.log(`Checking backend availability (attempt ${attempts}/${maxAttempts})...`);
    await axios.get(url, { timeout: 2000 });
    console.log('Backend is up — running E2E tests...');
    exec('node test/test-e2e.cjs', (err, stdout, stderr) => {
      if (err) {
        console.error('E2E script failed:', err.message);
        console.error(stderr);
        process.exit(1);
      }
      console.log(stdout);
      process.exit(0);
    });
  } catch (e) {
    if (attempts >= maxAttempts) {
      console.error('Backend did not become available in time. Aborting.');
      process.exit(1);
    }
    setTimeout(poll, 1000);
  }
})();