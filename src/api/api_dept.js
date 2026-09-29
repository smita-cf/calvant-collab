import axios from "axios";

const API = axios.create({
  baseURL: "https://api.calvant.com/user-service/api",
});

// Add JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  if (user.organization) config.headers["x-org"] = user.organization;

  return config;
});

export default API;
