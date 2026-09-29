// Public user-service client used only for the "log the new admin straight in
// after signup" step. Mirrors billingApi.js's gateway convention.
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const USER_SERVICE_BASE = "https://api.calvant.com/user-service/api/users";

const authApi = axios.create({
  baseURL: USER_SERVICE_BASE,
  headers: { "Content-Type": "application/json" },
});

export const login = (email, password) =>
  authApi.post("/login", { email, password }).then((r) => r.data);

// FIXED: was "cf_token" — nothing else in the app reads that key, so the
// freshly-created admin looked logged in on this page only and got bounced
// straight back to /login the instant /admin/onboarding's route guard /
// adminAxios interceptor checked for a session. OnboardingModule.jsx already
// reads sessionStorage.getItem("token") || localStorage.getItem("token")
// (see its createUser function), so "token" is the key the rest of the app
// actually expects.
//
// ⚠️ Still confirm this against your real adminAxios.js / ProtectedPage
// source — this is inferred from that one corroborating usage, not read
// directly from your route guard.
export const AUTH_TOKEN_KEY = "token";

/**
 * Stores the token from a successful login response so the rest of the app
 * (axios interceptors, ProtectedPage, etc.) picks the new session up on the
 * very next request/route. Also reconstructs the "user" object that pages
 * like OnboardingModule.jsx read out of sessionStorage (e.g. to prefill the
 * Primary Contact name/email) — login never populated that before, so those
 * fields would otherwise come up blank on a fresh signup even once the token
 * itself was being read correctly.
 *
 * Returns the token, or null if the response shape didn't match what we
 * expected (caller should fall back to routing the person to /login instead
 * of silently pretending they're signed in).
 */
export function persistAuthSession(loginResponseData) {
  const token =
    loginResponseData?.token || loginResponseData?.accessToken || loginResponseData?.jwt;
  if (!token) return null;

  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_TOKEN_KEY, token);

  try {
    const decoded = jwtDecode(token);
    const user = {
      name: decoded?.name || decoded?.username || "",
      email: decoded?.sub || decoded?.email || "",
      organization: decoded?.organization,
      role: decoded?.role,
    };
    sessionStorage.setItem("user", JSON.stringify(user));
  } catch (e) {
    // Non-fatal — worst case the Primary Contact fields on step 1 stay
    // blank and the person types them in manually.
    console.error("Couldn't decode JWT to build session user object:", e);
  }

  return token;
}

export default authApi;
