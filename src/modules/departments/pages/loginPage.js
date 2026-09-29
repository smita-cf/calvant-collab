// "use client";
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import "./loginPage.css";
// import HamburgerMenu from "../../../components/navigations/HamburgerMenu";
// import { useSession } from "@/context/SessionContext";
// import { resetActivitySession } from "../../admin/shell/services/activities";

// const LoginPage = () => {
//   const [email, setEmail] = useState("");
//   const [region, setRegion] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { login } = useSession();
//   const [showForgotPassword, setShowForgotPassword] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [forgotEmail, setForgotEmail] = useState("");

//   const [infoModal, setInfoModal] = useState({
//     isOpen: false,
//     title: "",
//     message: "",
//   });

//   const [signupModalOpen, setSignupModalOpen] = useState(false);
//   const router = useRouter();

//   const openInfoModal = (title, message) => {
//     setInfoModal({ isOpen: true, title, message });
//   };

//   const closeInfoModal = () => {
//     setInfoModal({ ...infoModal, isOpen: false });
//   };

//   const extractErrorMessage = (err, fallback) => {
//     const data = err?.response?.data;
//     if (!data) return fallback;
//     if (typeof data === "string") return data;
//     if (typeof data === "object" && data.error) return data.error;
//     if (typeof data === "object" && data.message) return data.message;
//     return fallback;
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const loginRes = await axios.post(
//         `${process.env.NEXT_PUBLIC_SP}/user-service/api/users/login`,
//         { email, password },
//       );

//       const { token, organization } = loginRes.data;
//       const currentHost = window.location.hostname;
//       const organizationId = organization;

//       // ── Clear any stale previous user session before writing new one ──────
//       // Without this, the previous user's name/email lingers in sessionStorage
//       // and gets picked up by activityService before the new user object is
//       // written — causing wrong-user entries in the activity log.
//       resetActivitySession();                 // reset email fetch flag in activityService
//       sessionStorage.removeItem("user");      // clear stale user object
//       sessionStorage.removeItem("userEmail"); // clear stale cached email

//       // LOCALHOST / DEV BYPASS ───────────────────────────────────────────────
//       if (
//         currentHost.includes("localhost") ||
//         currentHost.includes(".amplifyapp.com")

//       ) {
//         sessionStorage.setItem("token", token);

//         // Write the full user object with email injected.
//         // loginRes.data has no email field by itself — we inject it from the
//         // login form so activityService can use it immediately on the first
//         // log call, without waiting for the async email-enrichment fetch.
//         sessionStorage.setItem(
//           "user",
//           JSON.stringify({ ...loginRes.data, email }),
//         );

//         // Pre-cache email separately so activityService's getUserInfo() can
//         // find it via sessionStorage.getItem("userEmail") on the very first
//         // render — before fetchAndCacheEmail() completes its async fetch.
//         sessionStorage.setItem("userEmail", email);

//         // Signal SessionContext that a valid session now exists.
//         login();

//         // ── FIX: push navigation to the next event-loop tick ─────────────
//         // login() triggers a React state update inside SessionContext.
//         // If we call router.replace() synchronously here, the destination
//         // page (e.g. RiskAssessment) mounts before React has flushed that
//         // state update, so useEffectiveOrg returns user = null on the first
//         // render. The Risk module's redirect guard sees (mounted && !user)
//         // and immediately pushes back to "/", causing the auto-logout.
//         //
//         // await-ing a zero-timeout yields to the JS event loop once, which
//         // is enough for React to flush the login() update before the new
//         // route mounts.
//         await new Promise((r) => setTimeout(r, 0));
//         router.replace("/");
//         return;
//       }

//       // PRODUCTION PATH ──────────────────────────────────────────────────────

//       // STEP 2: GET TENANT ID FROM ORGANIZATION ID
//       const tenantIdRes = await axios.get(
//         `https://api.calvant.com/user-service/api/organizations/${organizationId}/tenant`,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       const tenantId = tenantIdRes.data;

//       // STEP 3: GET PRODUCTION DOMAIN FROM TENANT ID
//       // If domain lookup fails (new org with no GWS configured yet),
//       // fall back to current host — no redirect needed
//       let configuredDomain = null;
//       try {
//         const domainLookupRes = await axios.get(
//           `${process.env.NEXT_PUBLIC_SP}/compliance-brain/api/tenant-lookup/${tenantId}/domain`,
//         );
//         configuredDomain = domainLookupRes.data;
//       } catch (err) {
//         // 400 = tenant exists but no domain configured yet
//         // 404 = tenant config not found yet
//         // Either way, stay on current host
//         console.warn("Domain lookup failed, staying on current host:", err.response?.status);
//       }

//       // STEP 4: DETERMINE BASE DOMAIN + REDIRECT OR STAY
//       if (!configuredDomain) {
//         // No domain configured — just store session and proceed on current host
//         sessionStorage.setItem("token", token);
//         sessionStorage.setItem("user", JSON.stringify({ ...loginRes.data, email }));
//         sessionStorage.setItem("userEmail", email);
//         login();
//         await new Promise((r) => setTimeout(r, 0));
//         router.replace("/");
//         return;
//       }

//       // Domain found — do the full subdomain redirect
//       const hostParts = currentHost.split(".");
//       let baseDomain;

//       const secondLevelTLDs = ["co.in", "co.uk", "com.au", "net.in", "org.in"];
//       const lastTwo = hostParts.slice(-2).join(".");

//       if (secondLevelTLDs.includes(lastTwo)) {
//         baseDomain = hostParts.slice(-3).join(".");
//       } else {
//         baseDomain = hostParts.slice(-2).join(".");
//       }

//       const subdomain = configuredDomain.split(".")[0];

//       // STEP 5: REDIRECT TO TENANT SUBDOMAIN
//       window.location.href = `https://${subdomain}.${baseDomain}/auth-bridge?token=${token}&user=${encodeURIComponent(
//         JSON.stringify({ ...loginRes.data, email }),
//       )}&email=${encodeURIComponent(email)}`;

//     } catch (err) {
//       console.error("Login/Routing Error:", err);
//       setError(extractErrorMessage(err, "Routing failed. Check your organization config."));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPasswordClick = () => {
//     setShowForgotPassword((prev) => !prev);
//     setOtpSent(false);
//     setForgotEmail("");
//     setOtp("");
//   };

//   const sendOtp = async () => {
//     if (!forgotEmail) {
//       openInfoModal("Error", "Please enter your email address.");
//       return;
//     }
//     setLoading(true);
//     try {
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_CFTB}/user-service/api/users/forgot-password`,
//         { email: forgotEmail },
//         { withCredentials: true },
//       );
//       setOtpSent(true);
//       openInfoModal("Success", "OTP sent to your email.");
//     } catch (err) {
//       openInfoModal("Error", extractErrorMessage(err, "Failed to send OTP."));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyOtp = async () => {
//     if (!otp) {
//       openInfoModal("Error", "Please enter the OTP.");
//       return;
//     }

//     const maxRetries = 5;
//     const retryDelay = 500;

//     setLoading(true);

//     let attempt = 0;
//     let success = false;
//     let lastError = "";

//     while (attempt < maxRetries && !success) {
//       try {
//         const res = await axios.post(
//           `${process.env.NEXT_PUBLIC_CFTB}/user-service/api/users/verify-otp`,
//           { email: forgotEmail, otp },
//           { withCredentials: true },
//         );

//         sessionStorage.setItem("resetToken", res.data.resetToken);

//         success = true;
//         openInfoModal("Success", "OTP verified. Redirecting...");
//         setTimeout(() => {
//           router.push("/change-password");
//         }, 1500);
//       } catch (err) {
//         lastError = extractErrorMessage(err, "Invalid OTP.");
//         await new Promise((resolve) => setTimeout(resolve, retryDelay));
//         attempt++;
//       }
//     }

//     if (!success) {
//       openInfoModal("Error", lastError);
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="login-page">
//       <header className="login-header">
//         <div className="login-logo">CalVant</div>
//         <nav className="login-nav">
//           <button onClick={() => router.push("/")} className="login-nav-link">
//             Home
//           </button>
//           <button
//             onClick={() => router.push("/demo")}
//             className="login-nav-link-demo"
//           >
//             Schedule Demo
//           </button>
//         </nav>
//       </header>

//       <main className="login-main">
//         <section className="login-left">
//           <div className="login-left-inner">
//             <div className="login-content">
//               <h1 className="login-title">Welcome back!</h1>
//               <p className="login-subtitle">
//                 Sign in with your work email to access CalVant risk, compliance,
//                 and documentation tools.
//               </p>

//               {error && <div className="login-error">{error}</div>}

//               <form className="login-form" onSubmit={handleLogin}>
//                 <div className="login-field-group">
//                   <label className="login-label">
//                     Work email <span>*</span>
//                   </label>
//                   <input
//                     type="email"
//                     placeholder="you@company.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     disabled={loading}
//                     autoComplete="username"
//                     className="login-input"
//                   />
//                 </div>

//                 <div className="login-field-group">
//                   <label className="login-label">
//                     Password <span>*</span>
//                   </label>
//                   <input
//                     type="password"
//                     placeholder="Your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     disabled={loading}
//                     autoComplete="current-password"
//                     className="login-input"
//                   />
//                 </div>

//                 <div className="login-remember-row">
//                   <button
//                     type="button"
//                     className="login-forgot-btn"
//                     onClick={handleForgotPasswordClick}
//                     disabled={loading}
//                   >
//                     {showForgotPassword
//                       ? "Hide reset options"
//                       : "Forgot password?"}
//                   </button>
//                 </div>

//                 <button
//                   type="submit"
//                   className="login-submit"
//                   disabled={loading}
//                 >
//                   {loading ? "Signing in..." : "Sign in"}
//                 </button>
//               </form>

//               {showForgotPassword && (
//                 <div className="login-forgot-block">
//                   {!otpSent ? (
//                     <>
//                       <input
//                         type="email"
//                         placeholder="Enter your work email"
//                         value={forgotEmail}
//                         onChange={(e) => setForgotEmail(e.target.value)}
//                         disabled={loading}
//                         className="login-input"
//                       />
//                       <button
//                         onClick={sendOtp}
//                         disabled={loading}
//                         className="login-otp-btn"
//                       >
//                         Send OTP
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <input
//                         type="text"
//                         placeholder="Enter OTP"
//                         value={otp}
//                         onChange={(e) => setOtp(e.target.value)}
//                         disabled={loading}
//                         className="login-input"
//                       />
//                       <button
//                         onClick={verifyOtp}
//                         disabled={loading}
//                         className="login-otp-btn"
//                       >
//                         Verify OTP
//                       </button>
//                     </>
//                   )}
//                 </div>
//               )}

//               <div className="login-signup-row">
//                 <span>New to CalVant?</span>
//                 <button
//                   type="button"
//                   className="login-signup-btn"
//                   onClick={() =>
//                     openInfoModal(
//                       "Account Creation Disabled",
//                       "Account creation is managed by your organization. Please contact your system administrator or IT team to get access to CalVant.",
//                     )
//                   }
//                 >
//                   Create account
//                 </button>
//               </div>

//               <div className="login-footer-links">
//                 <button className="login-footer-link">Terms of Service</button>
//                 <span className="login-footer-separator">|</span>
//                 <button className="login-footer-link">Privacy Policy</button>
//                 <span className="login-footer-separator">|</span>
//                 <button className="login-footer-link">Contact</button>
//               </div>

//               <div className="login-footer-copy">
//                 © CalVant 2025. All Rights Reserved.
//               </div>
//             </div>
//           </div>

//           <div className="login-orbit-left">
//             <div className="login-orbit-sphere" />
//             <div className="login-orbit-ring" />
//           </div>
//         </section>

//         <section className="login-right">
//           <div className="login-right-inner">
//             <div className="login-badge">#1 Compliance Automation Tool</div>
//             <h2 className="login-right-title">Stay one step ahead of risk.</h2>
//             <p className="login-right-text">
//               CalVant helps security and compliance teams monitor risk in
//               real-time, automate checks, and keep every audit-ready report in
//               one secure place.
//             </p>

//             <div className="login-features">
//               <div className="login-feature">
//                 <span className="login-feature-label">Continuous</span>
//                 <span className="login-feature-title">Risk monitoring</span>
//                 <p>Track vulnerabilities across your organization.</p>
//               </div>
//               <div className="login-feature">
//                 <span className="login-feature-label">Automated</span>
//                 <span className="login-feature-title">Compliance checks</span>
//                 <p>Generate audit evidence in just a few clicks.</p>
//               </div>
//               <div className="login-feature">
//                 <span className="login-feature-label">Real-time</span>
//                 <span className="login-feature-title">Threat detection</span>
//                 <p>Get notified before incidents impact business.</p>
//               </div>
//               <div className="login-feature">
//                 <span className="login-feature-label">Team</span>
//                 <span className="login-feature-title">Collaboration</span>
//                 <p>Assign owners and close gaps faster.</p>
//               </div>
//             </div>

//             <div className="login-trust">
//               Trusted by security teams worldwide.
//             </div>
//           </div>

//           <div className="login-orbit-right">
//             <div className="login-orbit-sphere-right" />
//             <div className="login-orbit-ring-right" />
//           </div>
//         </section>
//       </main>

//       {infoModal.isOpen && (
//         <div className="login-modal-backdrop">
//           <div className="login-modal">
//             <h3 className="login-modal-title">{infoModal.title}</h3>
//             <p className="login-modal-message">{infoModal.message}</p>
//             <button className="login-modal-btn" onClick={closeInfoModal}>
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginPage;

"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import "./loginPage.css";
import HamburgerMenu from "../../../components/navigations/HamburgerMenu";
import { useSession } from "@/context/SessionContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { resetActivitySession } from "../../admin/shell/services/activities";

const LoginPageInner = () => {
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useSession();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  // Seconds remaining before "Resend OTP" becomes clickable again — prevents
  // spamming the forgot-password endpoint.
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);
  const [forgotEmail, setForgotEmail] = useState("");

  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Where to send the user after a successful login. Populated by
  // ProtectedPage when it bounces an unauthenticated user here
  // (e.g. /login?redirect=/task-management/tasks). Falls back to "/"
  // for normal, non-redirected logins.
  const redirectTo = searchParams.get("redirect") || "/";

  const openInfoModal = (title, message) => {
    setInfoModal({ isOpen: true, title, message });
  };

  const closeInfoModal = () => {
    setInfoModal({ ...infoModal, isOpen: false });
  };

  const extractErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data.error) return data.error;
    if (typeof data === "object" && data.message) return data.message;
    return fallback;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginRes = await axios.post(
        `${process.env.NEXT_PUBLIC_SP}/user-service/api/users/login`,
        { email, password },
      );

      const { token, organization } = loginRes.data;
      const currentHost = window.location.hostname;
      const organizationId = organization;

      // ── Clear any stale previous user session before writing new one ──────
      // Without this, the previous user's name/email lingers in sessionStorage
      // and gets picked up by activityService before the new user object is
      // written — causing wrong-user entries in the activity log.
      resetActivitySession();                 // reset email fetch flag in activityService
      sessionStorage.removeItem("user");      // clear stale user object
      sessionStorage.removeItem("userEmail"); // clear stale cached email

      // FORCED PASSWORD CHANGE ─────────────────────────────────────────────
      // Root-created accounts start on a system-generated temp password
      // (mustChangePassword=true from the backend). Send the user straight
      // to the change-password screen before any tenant/subdomain routing.
      // ChangePasswordModal asks for the old password itself, so nothing
      // needs to be carried over from the login form beyond the session token.
      if (loginRes.data.mustChangePassword) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem(
          "user",
          JSON.stringify({ ...loginRes.data, email }),
        );
        sessionStorage.setItem("userEmail", email);
        login();
        await new Promise((r) => setTimeout(r, 0));
        router.replace(`/change-password?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      // LOCALHOST / DEV BYPASS ───────────────────────────────────────────────
      if (
        currentHost.includes("localhost") ||
        currentHost.includes(".amplifyapp.com")

      ) {
        sessionStorage.setItem("token", token);

        // Write the full user object with email injected.
        // loginRes.data has no email field by itself — we inject it from the
        // login form so activityService can use it immediately on the first
        // log call, without waiting for the async email-enrichment fetch.
        sessionStorage.setItem(
          "user",
          JSON.stringify({ ...loginRes.data, email }),
        );

        // Pre-cache email separately so activityService's getUserInfo() can
        // find it via sessionStorage.getItem("userEmail") on the very first
        // render — before fetchAndCacheEmail() completes its async fetch.
        sessionStorage.setItem("userEmail", email);

        // Signal SessionContext that a valid session now exists.
        login();

        // ── FIX: push navigation to the next event-loop tick ─────────────
        // login() triggers a React state update inside SessionContext.
        // If we call router.replace() synchronously here, the destination
        // page (e.g. RiskAssessment) mounts before React has flushed that
        // state update, so useEffectiveOrg returns user = null on the first
        // render. The Risk module's redirect guard sees (mounted && !user)
        // and immediately pushes back to "/", causing the auto-logout.
        //
        // await-ing a zero-timeout yields to the JS event loop once, which
        // is enough for React to flush the login() update before the new
        // route mounts.
        // Check if this is the first time the user is logging in on this device
        const hasLoggedInKey = `hasLoggedIn_${email}`;
        const hasLoggedInBefore = localStorage.getItem(hasLoggedInKey);

        let finalRedirect = redirectTo;
        if (!hasLoggedInBefore && redirectTo === "/") {
          localStorage.setItem(hasLoggedInKey, "true");
          finalRedirect = "/admin/onboarding";
        } else if (!hasLoggedInBefore) {
          localStorage.setItem(hasLoggedInKey, "true");
        }

        await new Promise((r) => setTimeout(r, 0));
        router.replace(finalRedirect);
        return;
      }

      // PRODUCTION PATH ──────────────────────────────────────────────────────

      // STEP 2: GET TENANT ID FROM ORGANIZATION ID
      const tenantIdRes = await axios.get(
        `https://api.calvant.com/user-service/api/organizations/${organizationId}/tenant`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const tenantId = tenantIdRes.data;

      // STEP 3: GET PRODUCTION DOMAIN FROM TENANT ID
      // If domain lookup fails (new org with no GWS configured yet),
      // fall back to current host — no redirect needed
      let configuredDomain = null;
      try {
        const domainLookupRes = await axios.get(
          `${process.env.NEXT_PUBLIC_SP}/compliance-brain/api/tenant-lookup/${tenantId}/domain`,
        );
        configuredDomain = domainLookupRes.data;
      } catch (err) {
        // 400 = tenant exists but no domain configured yet
        // 404 = tenant config not found yet
        // Either way, stay on current host
        console.warn("Domain lookup failed, staying on current host:", err.response?.status);
      }

      // STEP 4: DETERMINE BASE DOMAIN + REDIRECT OR STAY
      if (!configuredDomain) {
        // No domain configured — just store session and proceed on current host
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify({ ...loginRes.data, email }));
        sessionStorage.setItem("userEmail", email);
        login();

        const hasLoggedInKey = `hasLoggedIn_${email}`;
        const hasLoggedInBefore = localStorage.getItem(hasLoggedInKey);

        let finalRedirect = redirectTo;
        if (!hasLoggedInBefore && redirectTo === "/") {
          localStorage.setItem(hasLoggedInKey, "true");
          finalRedirect = "/admin/onboarding";
        } else if (!hasLoggedInBefore) {
          localStorage.setItem(hasLoggedInKey, "true");
        }

        await new Promise((r) => setTimeout(r, 0));
        router.replace(finalRedirect);
        return;
      }

      // Domain found — do the full subdomain redirect
      const hostParts = currentHost.split(".");
      let baseDomain;

      const secondLevelTLDs = ["co.in", "co.uk", "com.au", "net.in", "org.in"];
      const lastTwo = hostParts.slice(-2).join(".");

      if (secondLevelTLDs.includes(lastTwo)) {
        baseDomain = hostParts.slice(-3).join(".");
      } else {
        baseDomain = hostParts.slice(-2).join(".");
      }

      const subdomain = configuredDomain.split(".")[0];

      const hasLoggedInKey = `hasLoggedIn_${email}`;
      const hasLoggedInBefore = localStorage.getItem(hasLoggedInKey);

      let finalRedirect = redirectTo;
      if (!hasLoggedInBefore && redirectTo === "/") {
        localStorage.setItem(hasLoggedInKey, "true");
        finalRedirect = "/admin/onboarding";
      } else if (!hasLoggedInBefore) {
        localStorage.setItem(hasLoggedInKey, "true");
      }

      // STEP 5: REDIRECT TO TENANT SUBDOMAIN
      // Pass the intended destination along so /auth-bridge on the target
      // subdomain can forward the user there once the session is set up,
      // instead of always landing on the dashboard.
      window.location.href = `https://${subdomain}.${baseDomain}/auth-bridge?token=${token}&user=${encodeURIComponent(
        JSON.stringify({ ...loginRes.data, email }),
      )}&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(finalRedirect)}`;

    } catch (err) {
      console.error("Login/Routing Error:", err);
      setError(extractErrorMessage(err, "Routing failed. Check your organization config."));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword((prev) => !prev);
    setOtpSent(false);
    setForgotEmail("");
    setOtp("");
    setResendCooldown(0);
  };

  const sendOtp = async (isResend = false) => {
    if (!forgotEmail) {
      openInfoModal("Error", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_CFTB}/user-service/api/users/forgot-password`,
        { email: forgotEmail },
        { withCredentials: true },
      );
      setOtpSent(true);
      setResendCooldown(30);
      openInfoModal("Success", isResend ? "OTP resent to your email." : "OTP sent to your email.");
    } catch (err) {
      openInfoModal("Error", extractErrorMessage(err, "Failed to send OTP."));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      openInfoModal("Error", "Please enter the OTP.");
      return;
    }

    const maxRetries = 5;
    const retryDelay = 500;

    setLoading(true);

    let attempt = 0;
    let success = false;
    let lastError = "";

    while (attempt < maxRetries && !success) {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_CFTB}/user-service/api/users/verify-otp`,
          { email: forgotEmail, otp },
          { withCredentials: true },
        );

        sessionStorage.setItem("resetToken", res.data.resetToken);

        success = true;
        openInfoModal("Success", "OTP verified. Redirecting...");
        setTimeout(() => {
          router.push("/change-password");
        }, 1500);
      } catch (err) {
        lastError = extractErrorMessage(err, "Invalid OTP.");
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        attempt++;
      }
    }

    if (!success) {
      openInfoModal("Error", lastError);
    }
    setLoading(false);
  };

  return (
     <>
          <SiteHeader />
    <div className="login-page">
     

      <main className="login-main">
        <section className="login-left">
          <div className="login-left-inner">
            <div className="login-content">
              <h1 className="login-title">Welcome back!</h1>
              <p className="login-subtitle">
                Sign in with your work email to access CalVant risk, compliance,
                and documentation tools.
              </p>

              {error && <div className="login-error">{error}</div>}

              <form className="login-form" onSubmit={handleLogin}>
                <div className="login-field-group">
                  <label className="login-label">
                    Work email <span>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="username"
                    className="login-input"
                  />
                </div>

                <div className="login-field-group">
                  <label className="login-label">
                    Password <span>*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="login-input"
                  />
                </div>

                <div className="login-remember-row">
                  <button
                    type="button"
                    className="login-forgot-btn"
                    onClick={handleForgotPasswordClick}
                    disabled={loading}
                  >
                    {showForgotPassword
                      ? "Hide reset options"
                      : "Forgot password?"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="login-submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              {showForgotPassword && (
                <div className="login-forgot-block">
                  {!otpSent ? (
                    <>
                      <input
                        type="email"
                        placeholder="Enter your work email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={loading}
                        className="login-input"
                      />
                      <button
                        onClick={sendOtp}
                        disabled={loading}
                        className="login-otp-btn"
                      >
                        Send OTP
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={loading}
                        className="login-input"
                      />
                      <button
                        onClick={verifyOtp}
                        disabled={loading}
                        className="login-otp-btn"
                      >
                        Verify OTP
                      </button>
                      <button
                        onClick={() => sendOtp(true)}
                        disabled={loading || resendCooldown > 0}
                        className="login-resend-btn"
                        style={{
                          background: "none",
                          border: "none",
                          color: resendCooldown > 0 ? "#888" : "#7c8cf8",
                          cursor: resendCooldown > 0 ? "default" : "pointer",
                          marginTop: "8px",
                          fontSize: "14px",
                        }}
                      >
                        {resendCooldown > 0
                          ? `Resend OTP in ${resendCooldown}s`
                          : "Resend OTP"}
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="login-signup-row">
                <span>New to CalVant?</span>
                <button
                  type="button"
                  className="login-signup-btn"
                  onClick={() =>
                    openInfoModal(
                      "Account Creation Disabled",
                      "Account creation is managed by your organization. Please contact your system administrator or IT team to get access to CalVant.",
                    )
                  }
                >
                  Create account
                </button>
              </div>

              <div className="login-footer-links">
                <button className="login-footer-link">Terms of Service</button>
                <span className="login-footer-separator">|</span>
                <button className="login-footer-link">Privacy Policy</button>
                <span className="login-footer-separator">|</span>
                <button className="login-footer-link">Contact</button>
              </div>

              <div className="login-footer-copy">
                © CalVant 2025. All Rights Reserved.
              </div>
            </div>
          </div>

          <div className="login-orbit-left">
            <div className="login-orbit-sphere" />
            <div className="login-orbit-ring" />
          </div>
        </section>

        <section className="login-right">
          <div className="login-right-inner">
            <div className="login-badge">#1 Compliance Automation Tool</div>
            <h2 className="login-right-title">Stay one step ahead of risk.</h2>
            <p className="login-right-text">
              CalVant helps security and compliance teams monitor risk in
              real-time, automate checks, and keep every audit-ready report in
              one secure place.
            </p>

            <div className="login-features">
              <div className="login-feature">
                <span className="login-feature-label">Continuous</span>
                <span className="login-feature-title">Risk monitoring</span>
                <p>Track vulnerabilities across your organization.</p>
              </div>
              <div className="login-feature">
                <span className="login-feature-label">Automated</span>
                <span className="login-feature-title">Compliance checks</span>
                <p>Generate audit evidence in just a few clicks.</p>
              </div>
              <div className="login-feature">
                <span className="login-feature-label">Real-time</span>
                <span className="login-feature-title">Threat detection</span>
                <p>Get notified before incidents impact business.</p>
              </div>
              <div className="login-feature">
                <span className="login-feature-label">Team</span>
                <span className="login-feature-title">Collaboration</span>
                <p>Assign owners and close gaps faster.</p>
              </div>
            </div>

            <div className="login-trust">
              Trusted by security teams worldwide.
            </div>
          </div>

          <div className="login-orbit-right">
            <div className="login-orbit-sphere-right" />
            <div className="login-orbit-ring-right" />
          </div>
        </section>
      </main>

      {infoModal.isOpen && (
        <div className="login-modal-backdrop">
          <div className="login-modal">
            <h3 className="login-modal-title">{infoModal.title}</h3>
            <p className="login-modal-message">{infoModal.message}</p>
            <button className="login-modal-btn" onClick={closeInfoModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
       <SiteFooter />
        </>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginPageInner />
    </Suspense>
  );
}