import axiosInstance from './axiosConfig.js';

export const getAssignedInterviews = async () => {
  const res = await axiosInstance.get('/api/interviews/assigned');
  return res.data;
};

export const getInterview = async (id) => {
  const res = await axiosInstance.get(`/api/interviews/${id}`);
  return res.data;
};

export const hasSubmittedFeedback = async (interviewId) => {
  const res = await axiosInstance.get(`/api/feedback/interview/${interviewId}/has-submitted`);
  return res.data?.hasSubmitted ?? false;
};

export const submitFeedback = async (payload) => {
  // payload shape: { interviewId, interviewerUserId, interviewerName, overallRating, comments, skills: [{skillName, rating}] }
  const res = await axiosInstance.post('/api/feedback', payload);
  return res.data;
};

export default {
  getAssignedInterviews,
  getInterview,
  hasSubmittedFeedback,
  submitFeedback,
};