// ─── Endpoint ─────────────────────────────────────────────────────────────────
const LOGGING_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LOGGING_SERVICE_URL) ||
  "https://api.calvant.com/logging-service/api/logs";

const USER_SERVICE_BASE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  "https://api.calvant.com";

// ─── Action constants ─────────────────────────────────────────────────────────
export const ACTIONS = {
  PAGE_LOAD : "PAGE_LOAD",
  LOGIN     : "LOGIN",
  LOGOUT    : "LOGOUT",
  CREATE    : "CREATE",
  UPDATE    : "UPDATE",
  DELETE    : "DELETE",
  UPLOAD    : "UPLOAD",
  DOWNLOAD  : "DOWNLOAD",
  SELECT    : "SELECT",
  CLICK     : "CLICK",
};

// ─── Module constants ─────────────────────────────────────────────────────────
export const MODULES = {
  AUTH       : "Auth",
  RISK       : "Risk",
  TASK       : "Task",
  AUDIT      : "Audit",
  COMPLIANCE : "Compliance",
  TRUST      : "Trust",
  TPRM       : "TPRM",
  AIIA       : "AIIA",
  DASHBOARD  : "Dashboard",
  SYSTEM     : "System",
};

// ─── JWT decoder ──────────────────────────────────────────────────────────────
const decodeJwt = (token) => {
  try {
    if (!token) return {};
    const base64   = token.split(".")[1];
    if (!base64)   return {};
    const standard = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padded   = standard + "=".repeat((4 - standard.length % 4) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
};

// ─── Validation helpers ───────────────────────────────────────────────────────
const isValidEmail = (val) => {
  if (!val || typeof val !== "string") return false;
  if (val === "unknown@example.com")   return false;
  if (/^[a-f0-9]{24}$/i.test(val))    return false; // MongoDB ObjectId
  return val.includes("@") && val.includes(".");
};

const isValidName = (val) => {
  if (!val || typeof val !== "string") return false;
  if (val === "Unknown")               return false;
  if (/^[a-f0-9]{24}$/i.test(val))    return false;
  return val.trim().length > 0;
};

// ─── Email enrichment ─────────────────────────────────────────────────────────
/**
 * The CalVant login response does NOT include email.
 * This fetches it once from the user-service using the user's id,
 * caches it in sessionStorage as "userEmail", and enriches the stored
 * "user" object so future sessions don't need to re-fetch.
 *
 * Runs fire-and-forget — never blocks a log call.
 */
let _emailFetchAttempted = false;

const fetchAndCacheEmail = async () => {
  if (_emailFetchAttempted) return;
  _emailFetchAttempted = true;

  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    if (!token) return;

    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const userId = user.id || user._id;
    if (!userId) return;

    // Already cached from a previous call this session
    if (isValidEmail(sessionStorage.getItem("userEmail"))) return;

    const res = await fetch(
      `${USER_SERVICE_BASE}/user-service/api/users/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return;

    const data = await res.json();

    // Find email in the response — try common field names
    const email = [data.email, data.emailId, data.userEmail, data.emailAddress, data.mail]
      .find(isValidEmail);

    if (email) {
      // Cache separately so it survives without modifying the original user object
      sessionStorage.setItem("userEmail", email);

      // Also enrich the stored user object for completeness
      const enriched = { ...user, email };
      sessionStorage.setItem("user", JSON.stringify(enriched));
    }
  } catch {
    // Never crash — this is background enrichment
  }
};

// ─── User info resolver ───────────────────────────────────────────────────────
/**
 * Login response shape (confirmed):
 * { token, id, name, role: ["root"], organization, departments, isAuditor }
 *
 * No email field — fetched async via fetchAndCacheEmail() and stored as
 * sessionStorage "userEmail".
 */
const getUserInfo = () => {
  try {
    const raw  = sessionStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;

    if (user) {
      const roles = Array.isArray(user.role) ? user.role : [user.role].filter(Boolean);

      // Email: check enriched user object first, then the cached "userEmail" key
      const email = isValidEmail(user.email)
        ? user.email
        : (isValidEmail(sessionStorage.getItem("userEmail"))
            ? sessionStorage.getItem("userEmail")
            : "");

      const name = isValidName(user.name) ? user.name
                 : isValidName(user.username) ? user.username
                 : "";

      return {
        name,
        email,
        role           : roles[0] || "USER",
        organizationId : user.organization || user.organizationId || user.orgId || "",
      };
    }
  } catch { /* ignore */ }

  // JWT fallback
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  const jwt   = decodeJwt(token);
  if (token) {
    const roles    = Array.isArray(jwt.role) ? jwt.role : [jwt.role].filter(Boolean);
    const jwtEmail = [jwt.email, jwt.emailId, jwt.preferred_username].find(isValidEmail) || "";
    return {
      name           : isValidName(jwt.name) ? jwt.name : "",
      email          : jwtEmail,
      role           : roles[0] || "USER",
      organizationId : jwt.organization || jwt.organizationId || jwt.orgId || "",
    };
  }

  return {
    name           : "",
    email          : isValidEmail(sessionStorage.getItem("userEmail"))
                       ? sessionStorage.getItem("userEmail") : "",
    role           : "USER",
    organizationId : "",
  };
};

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || "";

// ─── Payload builder ──────────────────────────────────────────────────────────
const buildPayload = ({ action, module: mod, item, url, name, email, role, organizationId }) => {
  const user = getUserInfo();
  return {
    name           : name           || user.name           || "",
    email          : email          || user.email          || "",
    role           : role           || user.role           || "USER",
    organizationId : organizationId || user.organizationId || "",
    url            : url || (typeof window !== "undefined" ? window.location.pathname : "/"),
    action         : action || ACTIONS.PAGE_LOAD,
    module         : mod    || MODULES.SYSTEM,
    item           : item !== undefined ? item : null,
  };
};

// ─── Dedup guard ──────────────────────────────────────────────────────────────
// Prevents duplicate logs from React double-renders (500 ms window per unique event)
const _recentKeys = new Map();

const isDuplicate = (payload) => {
  const key  = `${payload.action}|${payload.module}|${payload.url}`;
  const now  = Date.now();
  const last = _recentKeys.get(key);
  if (last && now - last < 500) return true;
  _recentKeys.set(key, now);
  if (_recentKeys.size > 50) {
    const oldest = [..._recentKeys.entries()].sort((a, b) => a[1] - b[1])[0];
    _recentKeys.delete(oldest[0]);
  }
  return false;
};

// ─── Core: async POST ─────────────────────────────────────────────────────────
export const captureActivity = async (params = {}) => {
  try {
    const token = getToken();
    if (!token) return;

    // Never log internal admin/system pages — they create noise and self-referential logs
    const BLOCKED_PATHS = ["/logs", "/admin", "/admin/logs"];
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    if (BLOCKED_PATHS.some(p => currentPath === p || currentPath.startsWith(p + "/"))) return;

    // Kick off email enrichment in background (no-op after first attempt)
    fetchAndCacheEmail();

    const payload = buildPayload(params);
    if (isDuplicate(payload)) return;

    const response = await fetch(LOGGING_BASE_URL, {
      method  : "POST",
      headers : {
        "Content-Type"      : "application/json",
        Authorization       : `Bearer ${token}`,
        "X-User-Role"       : payload.role,
        "X-Organization-Id" : payload.organizationId,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn("[ActivityService] Log rejected:", response.status, response.statusText);
    }
  } catch (err) {
    console.warn("[ActivityService] Could not send log:", err?.message);
  }
};

// ─── Beacon (safe on page unload) ─────────────────────────────────────────────
export const beaconActivity = (params = {}) => {
  try {
    const token = getToken();
    if (!token) return;
    const payload = buildPayload(params);
    const blob    = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon(LOGGING_BASE_URL, blob);
  } catch (err) {
    console.warn("[ActivityService] Beacon failed:", err?.message);
  }
};

// ─── Convenience wrappers ─────────────────────────────────────────────────────
export const logPageLoad = (url, mod = MODULES.SYSTEM, overrides = {}) =>
  captureActivity({ action: ACTIONS.PAGE_LOAD, module: mod, url, item: null, ...overrides });

export const logLogin = (overrides = {}) =>
  captureActivity({ action: ACTIONS.LOGIN, module: MODULES.AUTH, item: null, ...overrides });

export const logLogout = (overrides = {}) =>
  captureActivity({ action: ACTIONS.LOGOUT, module: MODULES.AUTH, item: null, ...overrides });

export const logCreate = (item, mod = MODULES.SYSTEM, overrides = {}) =>
  captureActivity({ action: ACTIONS.CREATE, module: mod, item, ...overrides });

export const logUpdate = (item, mod = MODULES.SYSTEM, overrides = {}) =>
  captureActivity({ action: ACTIONS.UPDATE, module: mod, item, ...overrides });

export const logDelete = (item, mod = MODULES.SYSTEM, overrides = {}) =>
  captureActivity({ action: ACTIONS.DELETE, module: mod, item, ...overrides });

export const logUpload = (item, mod = MODULES.SYSTEM, overrides = {}) =>
  captureActivity({ action: ACTIONS.UPLOAD, module: mod, item, ...overrides });

export const logDownload = (item, mod = MODULES.SYSTEM, overrides = {}) =>
  captureActivity({ action: ACTIONS.DOWNLOAD, module: mod, item, ...overrides });

export const logSelect = (item, mod = MODULES.SYSTEM, overrides = {}) =>
  captureActivity({ action: ACTIONS.SELECT, module: mod, item, ...overrides });

export const logClick = (item = null, mod = MODULES.SYSTEM, overrides = {}) =>
  captureActivity({ action: ACTIONS.CLICK, module: mod, item, ...overrides });