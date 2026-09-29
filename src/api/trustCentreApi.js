

const TC_URL = process.env.REACT_APP_TRUST_CENTRE_URL || "https://api.calvant.com/trust-service";

const BASE      = `${TC_URL}/api/trust-centre`;
const PREVIEW   = `${TC_URL}/api/preview`;
const AR_BASE   = `${TC_URL}/api/access-requests`;
const TEAM_BASE = `${TC_URL}/api/team-access`;


const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const getTrustCentre = () =>
  fetch(BASE, { headers: authHeaders() }).then((r) => r.json());

export const upsertTrustCentre = (data) =>
  fetch(BASE, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

// ── Publish / Unpublish ───────────────────────────────────────────────────────

export const publishTrustCentre = () =>
  fetch(`${BASE}/publish`, {
    method: "POST",
    headers: authHeaders(),
  }).then((r) => r.json());

export const unpublishTrustCentre = () =>
  fetch(`${BASE}/unpublish`, {
    method: "POST",
    headers: authHeaders(),
  }).then((r) => r.json());

// ── Logo ──────────────────────────────────────────────────────────────────────

export const uploadLogo = (file) => {
  const form = new FormData();
  form.append("file", file);
  return fetch(`${BASE}/logo`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  }).then((r) => r.text());
};

export const getLogoUrl = (organization) =>
  `${BASE}/logo/${organization}`;

// ── Trusted By ────────────────────────────────────────────────────────────────

export const addTrustedBy = (companyName, iconFile) => {
  const form = new FormData();
  form.append("companyName", companyName);
  if (iconFile) form.append("icon", iconFile);
  return fetch(`${BASE}/trusted-by`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  }).then((r) => r.json());
};

export const removeTrustedBy = (companyName) =>
  fetch(`${BASE}/trusted-by?companyName=${encodeURIComponent(companyName)}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((r) => r.json());

// ── Policies ──────────────────────────────────────────────────────────────────

export const uploadPolicy = (policyName, file) => {
  const form = new FormData();
  form.append("policyName", policyName);
  form.append("file", file);
  return fetch(`${BASE}/policies`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  }).then((r) => r.text());
};

export const downloadPolicy = (policyName, organization) => {
  const url = `${BASE}/policies/${encodeURIComponent(policyName)}/download?organization=${encodeURIComponent(organization)}`;
  return fetch(url, { headers: authHeaders() }).then((r) => r.blob());
};

export const removePolicy = (policyName) =>
  fetch(`${BASE}/policies?policyName=${encodeURIComponent(policyName)}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((r) => r.text());

// ── Sub-Processors ────────────────────────────────────────────────────────────

export const addSubProcessor = (sp) =>
  fetch(`${BASE}/sub-processors`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(sp),
  }).then((r) => r.json());

export const removeSubProcessor = (name) =>
  fetch(`${BASE}/sub-processors?name=${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((r) => r.text());

// ── Custom Domain ─────────────────────────────────────────────────────────────

export const setCustomDomain = (customDomain) =>
  fetch(`${BASE}/custom-domain`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ customDomain }),
  }).then((r) => r.json());

export const verifyCustomDomain = () =>
  fetch(`${BASE}/custom-domain/verify`, {
    method: "POST",
    headers: authHeaders(),
  }).then((r) => r.json());

export const removeCustomDomain = () =>
  fetch(`${BASE}/custom-domain`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((r) => r.text());

// ── Internal Preview ──────────────────────────────────────────────────────────

export const getInternalPreview = () =>
  fetch(`${PREVIEW}/internal`, { headers: authHeaders() }).then((r) => r.json());

// ── Share Link ────────────────────────────────────────────────────────────────

/**
 * Enable or disable the public shareable link.
 * Trust Centre must be PUBLISHED first.
 * Body: { enabled: true | false }
 * Returns: { shareEnabled, shareToken }
 */
export const toggleShare = (enabled) =>
  fetch(`${BASE}/share/toggle`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  }).then((r) => r.json());

/**
 * Invalidate the current share token and issue a new one.
 * All previously shared URLs will stop working immediately.
 * Returns: { shareToken, shareEnabled }
 */
export const regenerateShareToken = () =>
  fetch(`${BASE}/share/regenerate`, {
    method: "POST",
    headers: authHeaders(),
  }).then((r) => r.json());

// ── Access Requests ───────────────────────────────────────────────────────────

/**
 * List access requests for the admin's org.
 * @param {string} [status] — optional filter: "PENDING" | "APPROVED" | "REJECTED"
 * Returns: AccessRequest[]
 */
export const listAccessRequests = (status) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return fetch(`${AR_BASE}${query}`, {
    headers: authHeaders(),
  }).then((r) => r.json());
};

/**
 * Fetch a single access request by ID.
 * Returns: AccessRequest
 */
export const getAccessRequest = (id) =>
  fetch(`${AR_BASE}/${id}`, {
    headers: authHeaders(),
  }).then((r) => r.json());

/**
 * Approve a pending access request.
 * Creates a TeamAccess record for the requester.
 * Returns: AccessRequest (status = APPROVED)
 */
export const approveAccessRequest = (id) =>
  fetch(`${AR_BASE}/${id}/approve`, {
    method: "POST",
    headers: authHeaders(),
  }).then((r) => r.json());

/**
 * Reject a pending access request.
 * Returns: AccessRequest (status = REJECTED)
 */
export const rejectAccessRequest = (id) =>
  fetch(`${AR_BASE}/${id}/reject`, {
    method: "POST",
    headers: authHeaders(),
  }).then((r) => r.json());

// ── Team Access ───────────────────────────────────────────────────────────────

/**
 * List all approved users / companies for the admin's org Trust Centre.
 * Returns: TeamAccess[]
 */
export const getTeamAccess = () =>
  fetch(TEAM_BASE, {
    headers: authHeaders(),
  }).then((r) => r.json());