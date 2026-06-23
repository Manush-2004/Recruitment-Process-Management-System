import axiosInstance from "../api/axiosConfig";

export const getUsers = async () => {
  const res = await axiosInstance.get("/api/users");
  return res.data;
};

export const getUsersByRole = async (role) => {
  const res = await axiosInstance.get("/api/users", { params: { role } });
  return res.data;
};

export default { getUsers, getUsersByRole };
