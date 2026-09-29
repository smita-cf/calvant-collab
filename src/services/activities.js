/**
 * activities.js
 * Sends user-activity logs to the Java Spring Boot logging-service.
 *
 * Payload shape:
 * { name, email, url, action, item }
 */

// ─── Endpoint ────────────────────────────────────────────────────────────────
const LOGGING_BASE_URL = "https://api.calvant.com/logging-service/api/logs";

// ─── Action constants ─────────────────────────────────────────────────────────
export const ACTIONS = {
  PAGE_LOAD: "PAGE_LOAD",
  LOGIN:     "LOGIN",
  LOGOUT:    "LOGOUT",
  CREATE:    "CREATE",
  UPDATE:    "UPDATE",
  DELETE:    "DELETE",
  SELECT:    "SELECT",
  CLICK:     "CLICK",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getUserInfo = () => {
  try { return JSON.parse(sessionStorage.getItem("user") || "{}"); }
  catch { return {}; }
};

const getToken = () => sessionStorage.getItem("token") || "";

const buildPayload = ({ action, item, url, name, email, ...extra }) => {
  const user = getUserInfo();

  // If we have extra metadata and item is a string, merge them into an object
  // so that the Admin Dashboard (which only shows 'item') can display all details.
  let finalItem = item;
  if (Object.keys(extra).length > 0) {
    if (typeof item === "string") {
      finalItem = { actionDescription: item, ...extra };
    } else if (item && typeof item === "object") {
      finalItem = { ...item, ...extra };
    } else if (item === null || item === undefined) {
      finalItem = extra;
    }
  }

  return {
    name:   name  || user.name  || user.username || sessionStorage.getItem("uname") || "Unknown",
    email:  email || user.email || sessionStorage.getItem("email") || "unknown@example.com",
    url:    url   || (typeof window !== "undefined" ? window.pathname : "/"),
    action: action || ACTIONS.PAGE_LOAD,
    item:   finalItem != null ? (Array.isArray(finalItem) ? finalItem : [finalItem]) : null,
  };
};

// ─── Core: async POST ─────────────────────────────────────────────────────────
export const captureActivity = async ({ action, item, url, name, email, ...extra } = {}) => {
  try {
    const payload = buildPayload({ action, item, url, name, email, ...extra });
    const token   = getToken();
    const response = await fetch(LOGGING_BASE_URL, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!response.ok) {
      console.warn("[ActivityService] Log rejected:", response.status);
    }
  } catch (err) {
    console.warn("[ActivityService] Could not send log:", err?.message);
  }
};

// ─── Fire-and-forget beacon ──────────────────────────────────────────────────
export const beaconActivity = ({ action, item, url, name, email, ...extra } = {}) => {
  try {
    const payload = buildPayload({ action, item, url, name, email, ...extra });
    const blob    = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon(LOGGING_BASE_URL, blob);
  } catch (err) {
    console.warn("[ActivityService] Beacon failed:", err?.message);
  }
};

// ─── Convenience wrappers ─────────────────────────────────────────────────────
export const logPageLoad = (url, overrides = {}) => captureActivity({ action: ACTIONS.PAGE_LOAD, item: null, url, ...overrides });
export const logLogin    = (overrides = {})       => captureActivity({ action: ACTIONS.LOGIN,     item: null, ...overrides });
export const logLogout   = (overrides = {})       => captureActivity({ action: ACTIONS.LOGOUT,    item: null, ...overrides });
export const logCreate   = (item, overrides = {}) => captureActivity({ action: ACTIONS.CREATE,    item,       ...overrides });
export const logUpdate   = (item, overrides = {}) => captureActivity({ action: ACTIONS.UPDATE,    item,       ...overrides });
export const logDelete   = (item, overrides = {}) => captureActivity({ action: ACTIONS.DELETE,    item,       ...overrides });
export const logSelect   = (item, overrides = {}) => captureActivity({ action: ACTIONS.SELECT,    item,       ...overrides });
export const logClick    = (item = null, overrides = {}) => captureActivity({ action: ACTIONS.CLICK, item,   ...overrides });
