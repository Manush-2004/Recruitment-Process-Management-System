import axiosInstance from './axiosConfig.js';

export const getCandidatesAtHR = async () => {
  const res = await axiosInstance.get('/api/candidates/hr-stage');
  return res.data;
};

export const getOffers = async () => {
  const res = await axiosInstance.get('/api/offers');
  return res.data;
};

export const generateOffer = async (payload) => {
  // payload: { candidateId, jobId, salary, joiningDate, notes }
  const res = await axiosInstance.post('/api/offers', payload);
  return res.data;
};

export const getInterviewFeedbackSummary = async (interviewId) => {
  const res = await axiosInstance.get(`/api/feedback/interview/${interviewId}/summary`);
  return res.data;
};

export const getInterviewFeedbackSummaryByCandidateJob = async (candidateId, jobId) => {
  const res = await axiosInstance.get(`/api/feedback/summary?candidateId=${candidateId}&jobId=${jobId}`);
  return res.data;
};

export const getCandidateDocuments = async (candidateId) => {
  const res = await axiosInstance.get(`/api/candidates/${candidateId}/documents`);
  return res.data;
};

export const verifyDocument = async (candidateId, documentId, isVerified) => {
  const res = await axiosInstance.post(`/api/candidates/${candidateId}/documents/${documentId}/verify`, { verified: isVerified });
  return res.data;
};

export default {
  getCandidatesAtHR,
  getOffers,
  generateOffer,
  getInterviewFeedbackSummary,
  getCandidateDocuments,
  verifyDocument,
};