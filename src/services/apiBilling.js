import axios from "axios";

import { isTokenExpired, clearAuthAndRedirect } from "../utils/authUtils";

// Same "safe getBaseUrl" pattern as api.js — Vite uses import.meta.env, so we
// guard against `process` not existing at all in this build.
const getBillingBaseUrl = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_BILLING_API_BASE_URL;
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env.REACT_APP_BILLING_API_BASE_URL;
  }
  return null;
};

// billing-service, not user-service — see api.js/api_dept.js, both of which
// point at ".../user-service/api". Trial-extension data (Subscription,
// TrialExtensionRequest) lives in billing-service instead.
const BASE_URL = getBillingBaseUrl() || "https://api.calvant.com/billing-service/api";

const apiBilling = axios.create({
  baseURL: BASE_URL,
});

// Same JWT + 401 handling as api_dept.js. billing-service resolves "which
// tenant" from the JWT itself for tenant-scoped calls — the trial-extension
// overview/approve/reject endpoints used here are super_admin-only and
// cross-tenant, so no x-org header is needed for them.
apiBilling.interceptors.request.use((config) => {
  if (isTokenExpired()) {
    clearAuthAndRedirect();
    return Promise.reject(new Error("Token expired"));
  }

  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

apiBilling.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  }
);

export default apiBilling;
