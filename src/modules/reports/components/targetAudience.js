/**
 * ─────────────────────────────────────────────────────────────────────────
 * targetAudience.js  (v2 — picker moved to user-service directly)
 * ─────────────────────────────────────────────────────────────────────────
 * v1 routed "Select Users"/"Specific Roles" through reports-service, which
 * assumed list-by-org/role endpoints that don't actually exist on
 * UserController. Fixed split:
 *
 *   - POPULATING the picker (all assignable users/roles) → call
 *     user-service's existing GET /api/users directly, using the logged-in
 *     user's own JWT (same sessionStorage token useDashboardData.js uses).
 *     ROLES is a static client-side mirror of UserController's
 *     ALLOWED_ROLES — there's no roles-list endpoint to call instead.
 *
 *   - RESOLVING a panel's already-stored user IDs into display names (for
 *     rendering, e.g. row labels in a Multiple Bar Target Meter) → goes
 *     through reports-service's /target-audience/resolve-users, which is
 *     backed by the real /internal/by-id lookup.
 * ─────────────────────────────────────────────────────────────────────────
 */

const USER_SERVICE_URL = "https://api.calvant.com/user-service";
const REPORTS_BASE_URL = "https://api.calvant.com/reports-service/api/reports";

// Mirrors UserController.ALLOWED_ROLES — keep these in sync by hand, since
// there's no endpoint to fetch them from.
export const ASSIGNABLE_ROLES = [
  "super_admin", "root", "steering_committee_member",
  "risk_owner", "risk_manager", "process_owner", "process_manager",
  "auditor", "audit_manager", "user", "dpo", "ciso", "aio",
];

function getToken() {
  try {
    return sessionStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// "Set Target for → Specific Users" / "Specific Roles" picker. Hits
// user-service directly — org-visibility and role data are already on each
// User, so filter by role client-side rather than asking the backend for it.
// targetAudience.js
export async function fetchAssignableUsers(organizationId) {
  const params = new URLSearchParams({ organization: organizationId });
  const res = await fetch(`${USER_SERVICE_URL}/api/users?${params.toString()}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
  return res.json();
}
export function filterUsersByRole(users, role) {
  return users.filter((u) => Array.isArray(u.role) && u.role.includes(role));
}

// Render-time resolution of stored user IDs → { id, name, email } rows.
export async function resolveTargetUsers(userIds) {
  if (!userIds?.length) return [];
  const params = new URLSearchParams();
  userIds.forEach((id) => params.append("ids", id));
  const res = await fetch(`${REPORTS_BASE_URL}/target-audience/resolve-users?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
  const json = await res.json();
  return json?.data ?? [];
}