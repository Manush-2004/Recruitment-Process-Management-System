const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

(async () => {
  try {
    const base = 'http://localhost:5190';

    // Create interviewer and login
    const interviewerEmail = `interviewer+${Date.now()}@example.com`;
    console.log('Registering interviewer...', interviewerEmail);
    await axios.post(`${base}/api/auth/register`, { FullName: 'E2E Interviewer', Email: interviewerEmail, Password: 'Pass123!', Role: 'Interviewer' });
    console.log('Logging in interviewer...');
    const lint = await axios.post(`${base}/api/auth/login`, { Email: interviewerEmail, Password: 'Pass123!' });
    const tokenInt = lint.data.token;
    console.log('Interviewer token length:', tokenInt.length);

    // Create candidate
    console.log('Create candidate...');
    const createForm = new FormData();
    createForm.append('fullName', 'E2E Candidate');
    createForm.append('email', `e2e+${Date.now()}@example.com`);
    createForm.append('cv', fs.createReadStream(__filename));
    const cand = await axios.post(`${base}/api/candidates`, createForm, { headers: { ...createForm.getHeaders() } });
    console.log('Candidate created:', cand.data.id);

    // Find job
    const jobs = (await axios.get(`${base}/api/jobs`)).data;
    const jobId = jobs?.[0]?.id;
    if (!jobId) {
      console.error('No job available to screen; create one manually and re-run tests.');
      process.exit(1);
    }

    // Schedule interview as recruiter (ensure we login the recruiter we created)
    console.log('Schedule interview (POST /api/interviews)');
    const recruiterEmail = `r+${Date.now()}@example.com`;
    await axios.post(`${base}/api/auth/register`, { FullName: 'E2E Recruiter', Email: recruiterEmail, Password: 'Pass123!', Role: 'Recruiter' });
    const lrec = await axios.post(`${base}/api/auth/login`, { Email: recruiterEmail, Password: 'Pass123!' });
    const recruiterToken = lrec.data.token;
    const interview = await axios.post(`${base}/api/interviews`, { candidateId: cand.data.id, jobId, roundType: 'Tech', scheduledAt: new Date().toISOString(), interviewers: [{ name: 'E2E Interviewer', email: interviewerEmail }] }, { headers: { Authorization: 'Bearer ' + recruiterToken } });
    console.log('Interview scheduled:', interview.data);

    // Get assigned interviews as interviewer
    console.log('Get assigned (should include the scheduled interview)');
    const assigned = (await axios.get(`${base}/api/interviews/assigned`, { headers: { Authorization: 'Bearer ' + tokenInt } })).data;
    console.log('Assigned count:', assigned.length);
    const iv = assigned.find(a => a.candidateId === cand.data.id);
    if (!iv) {
      console.error('Interview not found in assigned list');
      process.exit(1);
    }

    // Details
    console.log('Fetch interview details');
    const details = (await axios.get(`${base}/api/interviews/${iv.id}`, { headers: { Authorization: 'Bearer ' + tokenInt } })).data;
    console.log('Interview details:', { id: details.id, round: details.roundType });

    // Check duplicate
    console.log('Check has-submitted (should be false)');
    const chk = (await axios.get(`${base}/api/feedback/interview/${iv.id}/has-submitted`, { headers: { Authorization: 'Bearer ' + tokenInt } })).data;
    console.log('Has submitted:', chk.hasSubmitted);

    // Get interviewer user info to obtain numeric ID
    const me = (await axios.get(`${base}/api/auth/me`, { headers: { Authorization: 'Bearer ' + tokenInt } })).data;
    console.log('Me:', me);

    // Submit feedback
    console.log('Submit feedback...');
    const payload = {
      interviewId: iv.id,
      interviewerUserId: me.id,
      interviewerName: me.fullName || me.email,
      overallRating: 4,
      comments: 'Solid candidate',
      skills: [{ skillName: 'Problem Solving', rating: 4 }, { skillName: 'Communication', rating: 4 }]
    };
    await axios.post(`${base}/api/feedback`, payload, { headers: { Authorization: 'Bearer ' + tokenInt } });
    console.log('Feedback submitted');

    // Check duplicate now
    const chk2 = (await axios.get(`${base}/api/feedback/interview/${iv.id}/has-submitted`, { headers: { Authorization: 'Bearer ' + tokenInt } })).data;
    console.log('Has submitted (after):', chk2.hasSubmitted);

    console.log('Interviewer E2E completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Interviewer E2E error', { message: err.message, status: err.response?.status, data: err.response?.data });
    process.exit(1);
  }
})();