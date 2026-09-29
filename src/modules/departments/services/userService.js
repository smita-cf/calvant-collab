import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_SP}/user-service/api`; // adjust to your backend

// Helper to get the token from sessionStorage
const getToken = () => sessionStorage.getItem("token");

// Axios config with Authorization header
const authConfig = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

// Get all users with JWT
export const getAllUsers = async () => {
  const res = await axios.get(`${API_URL}/users`, authConfig());
  return res.data;
};

// Get all departments with JWT
export const getDepartments = async () => {
  const res = await axios.get(`${API_URL}/departments`, authConfig());
  return res.data;
};
