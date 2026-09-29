import axios from "axios";

// ✅ CRITICAL FIX: Vite uses 'import.meta.env'. 
// We use a safe check so it doesn't crash if 'process' is missing.
const getBaseUrl = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  return null;
};

const BASE_URL = getBaseUrl() || "https://api.calvant.com/user-service/api";
//const BASE_URL = "http://localhost:4000/api";
import { isTokenExpired, clearAuthAndRedirect } from "../utils/authUtils";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  // Prevent duplicate region resolution
  if (config._regionResolved) return config;
  config._regionResolved = true;

  // Check if token has expired
  if (isTokenExpired()) {
    clearAuthAndRedirect();
    return Promise.reject(new Error("Token expired"));
  }

  // JWT
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Organization
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  if (user.organization) {
    config.headers["x-org"] = user.organization;
  }

  // ---------- REGION LOGIC ----------
  let region = "US";
  const manualRegion = sessionStorage.getItem("selected_region");

  if (manualRegion && manualRegion !== "AUTO") {
    region = manualRegion;
  } else if (user.region) {
    region = user.region;
  } else if (manualRegion === "AUTO" && navigator.geolocation) {
    await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (latitude >= 8 && latitude <= 37 && longitude >= 68 && longitude <= 97) {
            region = "INDIA";
          } else if (latitude >= 35 && latitude <= 70 && longitude >= -10 && longitude <= 40) {
            region = "EU";
          } else {
            region = "US";
          }
          user.region = region;
          sessionStorage.setItem("user", JSON.stringify(user));
          resolve();
        },
        () => resolve(),
        { timeout: 4000 } // ✅ FIX: Don't hang forever if user ignores prompt
      );
    });
  }

  config.headers["x-region"] = region;
  return config;
});

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid on the server side
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  }
);

export default api;