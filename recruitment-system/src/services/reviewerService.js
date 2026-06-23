import axiosInstance from "../api/axiosConfig.js";

export const getAssigned = async () => {
  const res = await axiosInstance.get("/api/screenings/assigned");
  return res.data;
};

export const getHistory = async () => {
  const res = await axiosInstance.get("/api/screenings/history");
  return res.data;
};

export const getForCandidate = async (candidateId) => {
  const res = await axiosInstance.get(
    `/api/screenings/for-candidate/${candidateId}`,
  );
  return res.data;
};

export const checkAlreadyScreened = async (candidateId, jobId) => {
  const res = await axiosInstance.get(`/api/screenings/check`, {
    params: { candidateId, jobId },
  });
  return res.data?.already ?? false;
};

export const screenCandidate = async (payload) => {
  const res = await axiosInstance.post("/api/screenings", payload);
  return res.data;
};

export const updateScreening = async (id, payload) => {
  const res = await axiosInstance.patch(`/api/screenings/${id}`, payload);
  return res.data;
};

export default {
  getAssigned,
  getHistory,
  getForCandidate,
  checkAlreadyScreened,
  screenCandidate,
};
