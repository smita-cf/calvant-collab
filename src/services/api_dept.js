import axios from "axios";

import { isTokenExpired, clearAuthAndRedirect } from "../utils/authUtils";

const API = axios.create({
  baseURL: "https://api.calvant.com/user-service/api",
});

// Add JWT token to requests
API.interceptors.request.use((config) => {
  // Check if token has expired
  if (isTokenExpired()) {
    clearAuthAndRedirect();
    return Promise.reject(new Error("Token expired"));
  }

  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  if (user.organization) config.headers["x-org"] = user.organization;

  return config;
});

// Response interceptor to handle 401 Unauthorized globally
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  }
);

export default API;