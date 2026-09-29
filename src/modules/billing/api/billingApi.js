// Public billing-service client — pricing page + self-serve signup are the only
// two callers, neither has a session yet, so no auth interceptor here.
// Mirrors the "https://api.calvant.com/<service>" gateway convention used
// everywhere else in this app (see src/modules/admin/api/adminApi.js).
import axios from "axios";

const BILLING_BASE = "https://api.calvant.com/billing-service/api/billing";

const billingApi = axios.create({
  baseURL: BILLING_BASE,
  headers: { "Content-Type": "application/json" },
});

export const getStarterPackage = () => billingApi.get("/starter-package").then((r) => r.data);

export const getAddOns = () => billingApi.get("/addons").then((r) => r.data);

// Step 0 of signup — sends the 6-digit code to rootAdminEmail. Must be called
// before selfServeSignup(); that endpoint 400s if no code was ever requested
// for the email, and 400s again if the code is wrong/expired/already used.
// Backend also 429s this on resend within its 30s cooldown window — the OTP
// modal in SignupPage.jsx mirrors that same 30s cooldown client-side so the
// "Resend code" button and the server's actual limit stay in sync.
export const requestSelfServeOtp = ({ email, orgName }) =>
  billingApi.post("/self-serve-signup/request-otp", { email, orgName }).then((r) => r.data);

export const selfServeSignup = (payload) =>
  billingApi.post("/self-serve-signup", payload).then((r) => r.data);

export default billingApi;
