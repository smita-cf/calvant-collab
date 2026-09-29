/**
 * adminFrameworkStoreApi.js
 *
 * Support calls for the "Buy a Framework" feature on Manage Subscription
 * (see BuyFrameworkModal.jsx). This is deliberately a NEW, separate file
 * rather than additions to adminBillingApi.js — that file's header notes its
 * exports are a stable contract consumed by name, and everything here talks
 * to user-service / framework-service, not billing-service.
 *
 * Nothing here is a new backend endpoint. Every call below hits an endpoint
 * that already exists and is already used elsewhere in this codebase:
 *   - GET   /api/organizations/{id}            — OrganizationController (existing)
 *   - PATCH /api/organizations/{id}/settings    — OrganizationController (existing);
 *     same endpoint that presumably backs a future org "Compliance Settings"
 *     frameworks editor. We only ever send `{ frameworks }` in the body, so
 *     tprmEnabled and every other org field is left exactly as-is
 *     (OrganizationController only touches a field when it's present in the
 *     request body).
 *   - GET   https://api.calvant.com/framework/api/frameworks — the framework
 *     library (same URL FrameworkContex's frameworkService.js already calls),
 *     just fetched through adminAxios instead of a raw fetch() so the auth
 *     token is attached the same way every other admin call attaches it.
 *
 * adminAxios's baseURL is https://api.calvant.com/user-service/api, so the
 * organizations calls below use relative paths; the framework-library call
 * passes an absolute URL, which axios uses as-is in place of baseURL.
 */

import adminAxios from "./adminAxios";

const FRAMEWORK_SERVICE_BASE = "https://api.calvant.com/framework/api";

/**
 * Same allowlist enforced server-side by both
 * SelfServeProvisionController and OrganizationController (search
 * ALLOWED_FRAMEWORKS in either) — duplicated here on purpose, the same way
 * those two backend classes each keep their own copy rather than sharing
 * one. Anything in the framework-service library outside this list can be
 * *displayed* (it's a real framework) but is not yet something the backend
 * will let an org actually select via PATCH /organizations/{id}/settings —
 * we filter those out of the "buy" list below so a purchase can never
 * dead-end on a 400 after payment.
 */
export const ALLOWED_FRAMEWORK_CODES = [
  "ISO27001",
  "ISO27701",
  "ISO27017",
  "SOC2",
  "ISO42001",
  "GDPR",
  "KSA_PDPL",
  "DPDPA",
  "HIPAA",
  "NIST_CSF2",
  "CSCRF",
  "PCI_DSS",
  "DUBAI_ISR",
  "EU_AI_ACT",
];

/** GET /api/organizations/{id} -> Organization (includes .frameworks) */
export async function getOrganization(orgId) {
  const { data } = await adminAxios.get(`/organizations/${encodeURIComponent(orgId)}`);
  return data;
}

/**
 * PATCH /api/organizations/{id}/settings — replaces the org's frameworks
 * list wholesale (that's how the existing endpoint works), so callers must
 * pass the FULL desired list, not just the framework(s) being added.
 * tprmEnabled is intentionally omitted from the body so it's left untouched.
 */
export async function updateOrganizationFrameworks(orgId, frameworks) {
  const { data } = await adminAxios.patch(
    `/organizations/${encodeURIComponent(orgId)}/settings`,
    { frameworks }
  );
  return data;
}

/**
 * GET the full framework library (id/code/label/color/etc. for every
 * framework CalVant supports — the "library of 15" the pricing page
 * references), same endpoint FrameworkContex's frameworkService.js reads.
 */
export async function fetchFrameworkLibrary() {
  const { data } = await adminAxios.get(`${FRAMEWORK_SERVICE_BASE}/frameworks`);
  return Array.isArray(data) ? data : [];
}

export default {
  ALLOWED_FRAMEWORK_CODES,
  getOrganization,
  updateOrganizationFrameworks,
  fetchFrameworkLibrary,
};
