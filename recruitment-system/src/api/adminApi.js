import axiosInstance from './axiosConfig.js';

export const getUsers = async () => {
  const res = await axiosInstance.get('/api/admin/users');
  return res.data;
};

export const createUser = async (payload) => {
  const res = await axiosInstance.post('/api/admin/users', payload);
  return res.data;
};

export const clearUsers = async () => {
  const res = await axiosInstance.post('/api/admin/clear-users');
  return res.data;
};

export const updateUser = async (id, payload) => {
  const res = await axiosInstance.put(`/api/admin/users/${id}`, payload);
  return res.data;
};

export const assignRole = async (id, role) => {
  const res = await axiosInstance.post(`/api/admin/users/${id}/roles`, { role });
  return res.data;
};

export const removeRole = async (id, role) => {
  const res = await axiosInstance.delete(`/api/admin/users/${id}/roles/${role}`);
  return res.data;
};

export const getRoles = async () => {
  const res = await axiosInstance.get('/api/admin/roles');
  return res.data;
};

export const createRole = async (role) => {
  const res = await axiosInstance.post('/api/admin/roles', { role });
  return res.data;
};

// Reports
export const getPositionWise = async () => {
  const res = await axiosInstance.get('/api/reports/position-wise');
  return res.data;
};

export const getTechnologyWise = async () => {
  const res = await axiosInstance.get('/api/reports/technology-wise');
  return res.data;
};

export const getCandidateSummary = async () => {
  const res = await axiosInstance.get('/api/reports/candidates/summary');
  return res.data;
};

export const getInterviewerSummary = async () => {
  const res = await axiosInstance.get('/api/reports/interviewer-summary');
  return res.data;
};

export default {
  getUsers,
  createUser,
  updateUser,
  assignRole,
  removeRole,
  getRoles,
  createRole,
  getPositionWise,
  getTechnologyWise,
  getCandidateSummary,
  getInterviewerSummary,
};