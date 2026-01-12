import axiosInstance from './axiosConfig.js';

// Jobs
export const getJobs = async () => {
  const res = await axiosInstance.get('/api/jobs');
  return res.data;
};

export const getJob = async (id) => {
  const res = await axiosInstance.get(`/api/jobs/${id}`);
  return res.data;
};

export const createJob = async (payload) => {
  const res = await axiosInstance.post('/api/jobs', payload);
  return res.data;
};

export const updateJob = async (id, payload) => {
  const res = await axiosInstance.put(`/api/jobs/${id}`, payload);
  return res.status === 204;
};

export const deleteJob = async (id) => {
  const res = await axiosInstance.delete(`/api/jobs/${id}`);
  return res.status === 204;
};

// Candidates
export const getCandidates = async () => {
  const res = await axiosInstance.get('/api/candidates');
  return res.data;
};

export const createCandidate = async (formData) => {
  // formData expected to be FormData with fields: fullName, email, phone, cv
  const res = await axiosInstance.post('/api/candidates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const bulkUploadCandidates = async (formData) => {
  // formData contains 'file'
  const res = await axiosInstance.post('/api/candidates/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getCandidatesForJob = async (jobId) => {
  // Backend does not have a dedicated endpoint; fetch all candidates and filter client-side using CandidateJob links returned
  const res = await axiosInstance.get('/api/candidates');
  return res.data.filter((c) => c.candidateJobs?.some((cj) => cj.jobId === jobId));
};

// Screenings
export const assignScreening = async (payload) => {
  // Recruiter assign endpoint
  // payload: { candidateId, jobId, reviewerName, status, comments, skills: [{skillName, yearsOfExperience, isApproved}] }
  const res = await axiosInstance.post('/api/screenings/assign', payload);
  return res.data;
};

// Interviews
export const scheduleInterview = async (payload) => {
  const res = await axiosInstance.post('/api/interviews', payload);
  return res.data;
};

// Offers
export const createOffer = async (payload) => {
  // HR-only endpoint; callers should handle 403
  const res = await axiosInstance.post('/api/offers', payload);
  return res.data;
};

export default {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getCandidates,
  createCandidate,
  bulkUploadCandidates,
  getCandidatesForJob,
  assignScreening,
  scheduleInterview,
  createOffer
};