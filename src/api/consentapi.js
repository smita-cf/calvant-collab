/**
 * consentApi.js
 * API layer for the Consent Management microservice.
 * Follows the same fetch + authHeaders pattern as trustCentreApi.js.
 *
 * Base URL: http://localhost:8085  (swap VITE_CONSENT_SERVICE_URL for prod)
 */

// const CONSENT_BASE_URL =
//   (typeof import.meta !== "undefined" && import.meta.env?.VITE_CONSENT_SERVICE_URL) ||
//   "https://api.calvant.com/consent-service";

/**
 * consentApi.js
 * API layer for the Consent Management microservice.
 * Follows the same fetch + authHeaders pattern as trustCentreApi.js.
 *
 * Base URL: http://localhost:8085  (swap VITE_CONSENT_SERVICE_URL for prod)
 */

const CONSENT_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_CONSENT_SERVICE_URL) ||
  "https://api.calvant.com/consent-service";

const BASE = `${CONSENT_BASE_URL}/api/v1`;

const getToken = () => localStorage.getItem("token");

const authHeaders = (extra = {}) => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
  ...extra,
});

/** Generic response handler — throws on non-2xx */
const handle = async (res) => {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message || body.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────────────────────────────────────

/** List all clients */
export const listClients = () =>
  fetch(`${BASE}/admin/clients`, { headers: authHeaders() }).then(handle);

/** Create a new client — payload: { name, contactEmail, allowedDomains: string[] } */
export const createClient = (data) =>
  fetch(`${BASE}/admin/clients`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handle);

/** Deactivate a client */
export const deactivateClient = (clientId) =>
  fetch(`${BASE}/admin/clients/${clientId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handle);

// ─────────────────────────────────────────────────────────────────────────────
// CONSENT DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

/** List definitions for a client */
export const listDefinitions = (clientId) =>
  fetch(`${BASE}/admin/clients/${clientId}/definitions`, {
    headers: authHeaders(),
  }).then(handle);

/** Create a definition under a client */
export const createDefinition = (clientId, data) =>
  fetch(`${BASE}/admin/clients/${clientId}/definitions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handle);

/** Deactivate a definition */
export const deactivateDefinition = (clientId, definitionId) =>
  fetch(`${BASE}/admin/clients/${clientId}/definitions/${definitionId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handle);

// ─────────────────────────────────────────────────────────────────────────────
// CONSENT RECORDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List all consent records (admin).
 * @param {Object} filters  Optional: { clientId, definitionId, endUserRef, status }
 */
export const listConsents = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.append(k, v);
  });
  const qs = params.toString();
  return fetch(`${BASE}/admin/consents${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  }).then(handle);
};

/**
 * Get consents by form.
 * @param {string} clientId
 * @param {string} formId
 */
export const getConsentsByForm = (clientId, formId) => {
  const params = new URLSearchParams({ clientId, formId });
  return fetch(`${BASE}/admin/consents/form?${params}`, {
    headers: authHeaders(),
  }).then(handle);
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT HISTORY
// ─────────────────────────────────────────────────────────────────────────────

/** Get audit history for a single consent record */
export const getConsentHistory = (consentRecordId) =>
  fetch(`${BASE}/admin/consents/${consentRecordId}/history`, {
    headers: authHeaders(),
  }).then(handle);

/**
 * Get full audit history for a user across a client.
 * @param {string} clientId
 * @param {string} endUserRef
 */
export const getUserAuditHistory = (clientId, endUserRef) => {
  const params = new URLSearchParams({ clientId, endUserRef });
  return fetch(`${BASE}/admin/consents/user/history?${params}`, {
    headers: authHeaders(),
  }).then(handle);
};