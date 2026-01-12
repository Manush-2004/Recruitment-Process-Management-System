const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

(async () => {
  try {
    const base = 'http://localhost:5190';

    // Register HR and login
    const hrEmail = `hr+${Date.now()}@example.com`;
    console.log('Registering HR...', hrEmail);
    await axios.post(`${base}/api/auth/register`, { FullName: 'E2E HR', Email: hrEmail, Password: 'Pass123!', Role: 'HR' });
    console.log('Logging in HR...');
    const lhr = await axios.post(`${base}/api/auth/login`, { Email: hrEmail, Password: 'Pass123!' });
    const tokenHr = lhr.data.token;

    // Create candidate without CV (we'll register candidate user and upload as 'me')
    console.log('Create candidate...');
    const candidateEmail = `e2e+${Date.now()}@example.com`;
    const createFormNoCv = new FormData();
    createFormNoCv.append('fullName', 'E2E Candidate HR');
    createFormNoCv.append('email', candidateEmail);
    const cand = (await axios.post(`${base}/api/candidates`, createFormNoCv, { headers: { ...createFormNoCv.getHeaders() } })).data;
    console.log('Candidate created:', cand.id);

    // Register candidate user (so we can upload document as the candidate)
    console.log('Register candidate user...');
    await axios.post(`${base}/api/auth/register`, { FullName: 'E2E Candidate HR', Email: candidateEmail, Password: 'Pass123!', Role: 'Candidate' });
    console.log('Login candidate...');
    const lcan = await axios.post(`${base}/api/auth/login`, { Email: candidateEmail, Password: 'Pass123!' });
    const tokenCan = lcan.data.token;

    // Upload a document as the candidate (me)
    console.log('Upload document as candidate...');
    const upForm = new FormData();
    upForm.append('file', fs.createReadStream(__filename));
    await axios.post(`${base}/api/candidates/me/documents`, upForm, { headers: { Authorization: 'Bearer ' + tokenCan, ...upForm.getHeaders() } });
    console.log('Document uploaded');

    // Ensure there's at least one job
    const jobs = (await axios.get(`${base}/api/jobs`)).data;
    const jobId = jobs?.[0]?.id;
    if (!jobId) {
      console.error('No job available; create one manually and re-run tests.');
      process.exit(1);
    }

    // As HR: list candidates at HR stage (likely empty, but should succeed)
    console.log('Get candidates at HR stage...');
    const atHr = (await axios.get(`${base}/api/candidates/hr-stage?stage=HR`, { headers: { Authorization: 'Bearer ' + tokenHr } })).data;
    console.log('Candidates at HR stage count:', atHr.length);

    // Get candidate documents
    console.log('Get candidate documents...');
    const docsRes = await axios.get(`${base}/api/candidates/${cand.id}/documents`, { headers: { Authorization: 'Bearer ' + tokenHr } });
    console.log('GET /api/candidates/:id/documents status:', docsRes.status);
    const docs = docsRes.data;
    console.log('Documents response:', docs);
    console.log('Document count:', Array.isArray(docs) ? docs.length : 'non-array');
    if (!docs || docs.length === 0) {
      console.error('Expected at least one document for candidate');
      process.exit(1);
    }

    const doc = docs[0];

    // Verify the document
    console.log('Verify document...');
    const verified = (await axios.post(`${base}/api/candidates/${cand.id}/documents/${doc.id}/verify`, { verified: true }, { headers: { Authorization: 'Bearer ' + tokenHr } })).data;
    console.log('Verified doc:', verified.id, 'Verified:', verified.verified);

    // Re-fetch documents to confirm
    const docs2 = (await axios.get(`${base}/api/candidates/${cand.id}/documents`, { headers: { Authorization: 'Bearer ' + tokenHr } })).data;
    const doc2 = docs2.find(d => d.id === doc.id);
    console.log('Verified after:', doc2.verified);
    if (!doc2.verified) {
      console.error('Document was not marked as verified');
      process.exit(1);
    }

    // Schedule an interview for this candidate as HR
    console.log('Schedule interview as HR...');
    const scheduled = (await axios.post(`${base}/api/interviews`, { candidateId: cand.id, jobId, roundType: 'HR Round', scheduledAt: new Date().toISOString(), interviewers: [{ name: 'E2E Interviewer HR', email: 'hr-int+${Date.now()}@example.com' }] }, { headers: { Authorization: 'Bearer ' + tokenHr } })).data;
    console.log('Interview scheduled for HR:', scheduled.id);

    // Register interviewer, login and submit feedback
    console.log('Registering interviewer and submitting feedback...');
    const interviewerEmail = `hr-int+${Date.now()}@example.com`;
    await axios.post(`${base}/api/auth/register`, { FullName: 'E2E Interviewer HR', Email: interviewerEmail, Password: 'Pass123!', Role: 'Interviewer' });
    const lint = await axios.post(`${base}/api/auth/login`, { Email: interviewerEmail, Password: 'Pass123!' });
    const tokenInt = lint.data.token;
    const me = (await axios.get(`${base}/api/auth/me`, { headers: { Authorization: 'Bearer ' + tokenInt } })).data;
    await axios.post(`${base}/api/feedback`, { interviewId: scheduled.id, interviewerUserId: me.id, interviewerName: me.fullName || me.email, overallRating: 5, comments: 'Solid candidate', skills: [{ skillName: 'Communication', rating: 5 }] }, { headers: { Authorization: 'Bearer ' + tokenInt } });
    console.log('Feedback submitted by interviewer');

    // As HR: fetch feedback summary for the scheduled interview
    console.log('HR fetching feedback summary...');
    const hrSummary = (await axios.get(`${base}/api/feedback/summary?candidateId=${cand.id}&jobId=${jobId}`, { headers: { Authorization: 'Bearer ' + tokenHr } })).data;
    console.log('HR feedback summary:', hrSummary);

    // Generate an offer
    console.log('Generate offer...');
    const offer = (await axios.post(`${base}/api/offers`, { candidateId: cand.id, jobId, salary: 70000, joiningDate: new Date().toISOString(), notes: 'Welcome aboard' }, { headers: { Authorization: 'Bearer ' + tokenHr } })).data;
    console.log('Offer created:', offer.id, 'PdfPath:', offer.offerPdfPath);

    console.log('HR E2E completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('HR E2E error', { message: err.message, status: err.response?.status, data: err.response?.data });
    process.exit(1);
  }
})();