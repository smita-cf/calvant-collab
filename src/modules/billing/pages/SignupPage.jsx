"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, ShieldCheck, X } from "lucide-react";
import { requestSelfServeOtp, selfServeSignup } from "../api/billingApi";
import { login, persistAuthSession } from "../api/authApi";
import { FRAMEWORK_CHOICES } from "../utils/frameworkChoices";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./SignupPage.css";

const CYCLE_ANNUAL = "ANNUAL";
const CYCLE_HALF_YEARLY = "HALF_YEARLY";

const OTP_LENGTH = 6; // must match OtpService.OTP_LENGTH on billing-service
const RESEND_COOLDOWN_SECONDS = 30; // must match OtpService.RESEND_COOLDOWN_MS

// Where a freshly-created, freshly-logged-in admin lands. Matches where the
// existing manual-signup flow sends brand-new orgs (OnboardingModule.jsx
// lives at this route and drives new orgs through the 3-step wizard).
//
// NOTE: this route alone being correct isn't enough — see authApi.js.
// The actual 404/bounce-back bug was the token being persisted under a
// storage key ("cf_token") that nothing else in the app reads, so the route
// guard never saw a valid session and kicked the person back to /login
// before this page ever rendered. Fixed in authApi.js's AUTH_TOKEN_KEY.
const DASHBOARD_ROUTE = "/admin/onboarding";

function maskEmail(email) {
  const at = email.indexOf("@");
  if (at <= 1) return email;
  return `${email[0]}***${email.slice(at)}`;
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCycle = searchParams.get("billingCycle") === CYCLE_HALF_YEARLY
    ? CYCLE_HALF_YEARLY
    : CYCLE_ANNUAL;

  const [form, setForm] = useState({
    orgName: "",
    rootAdminName: "",
    rootAdminEmail: "",
    rootAdminPassword: "",
    frameworkChoice: FRAMEWORK_CHOICES[0].code,
    billingCycle: initialCycle,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── OTP modal state ─────────────────────────────────────────────────
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);
  // "finishing" = signup verified, now auto-logging in before redirect —
  // kept distinct from otpVerifying so the modal can show a different message.
  const [finishing, setFinishing] = useState(false);
  const otpInputRefs = useRef([]);

  useEffect(() => {
    if (!otpOpen || resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [otpOpen, resendCooldown]);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validateForm = () => {
    if (!form.orgName.trim() || !form.rootAdminEmail.trim() || !form.rootAdminPassword.trim()) {
      setError("Organization name, email, and password are required.");
      return false;
    }
    if (form.rootAdminPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    return true;
  };

  // "Start free trial" no longer creates the account directly — it first
  // requests an OTP for rootAdminEmail and opens the verification modal.
  // The account itself is only created once the code is verified, inside
  // handleVerifyOtp below (SelfServeSignupController requires a valid,
  // unconsumed otp on the actual /self-serve-signup call).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await requestSelfServeOtp({ email: form.rootAdminEmail, orgName: form.orgName });
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtpOpen(true);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Couldn't send a verification code. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setOtpError("");
    try {
      await requestSelfServeOtp({ email: form.rootAdminEmail, orgName: form.orgName });
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      console.error(err);
      // 429 here is the backend's own resend cooldown message — surface it
      // as-is rather than the generic fallback, it's already user-facing copy.
      const msg =
        err?.response?.data?.error || "Couldn't resend the code. Please try again.";
      setOtpError(msg);
    } finally {
      setResending(false);
    }
  };

  const setDigit = (index, value) => {
    const clean = value.replace(/[^0-9]/g, "");
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = clean.slice(-1) || "";
      return next;
    });
    if (clean && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);
    otpInputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const closeOtpModal = () => {
    if (otpVerifying || finishing) return; // don't let them close mid-flight
    setOtpOpen(false);
  };

  // Verify step: create the account, then immediately log the new root admin
  // in and drop them straight into the app — no separate "go to login" page.
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== OTP_LENGTH) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit code.`);
      return;
    }

    setOtpError("");
    setOtpVerifying(true);
    try {
      await selfServeSignup({ ...form, otp });
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Something went wrong creating your account. Please try again.";
      setOtpError(msg);
      setOtpVerifying(false);
      return;
    }
    setOtpVerifying(false);

    // Account exists now — auto-login with the credentials they just set,
    // then redirect straight in. If login fails for any reason (backend
    // hiccup, contract mismatch — see authApi.js header comment), fail open
    // by sending them to /login instead of stranding them on this modal;
    // the account was created successfully either way.
    setFinishing(true);
    try {
      const loginData = await login(form.rootAdminEmail, form.rootAdminPassword);
      const token = persistAuthSession(loginData);
      if (!token) throw new Error("Login response did not contain a token");
      router.push(DASHBOARD_ROUTE);
    } catch (err) {
      console.error("Auto-login after signup failed, falling back to /login:", err);
      router.push("/login");
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="signup-page">
        <form className="signup-card" onSubmit={handleSubmit}>
          <h1>Start your free trial</h1>
          <p className="signup-sub">
            14 days, every add-on unlocked, no card required.
          </p>

          <label className="signup-field">
            <span>Organization name</span>
            <input
              type="text"
              value={form.orgName}
              onChange={update("orgName")}
              placeholder="Acme Inc."
              required
            />
          </label>

          <label className="signup-field">
            <span>Your name</span>
            <input
              type="text"
              value={form.rootAdminName}
              onChange={update("rootAdminName")}
              placeholder="Jane Doe"
            />
          </label>

          <label className="signup-field">
            <span>Work email</span>
            <input
              type="email"
              value={form.rootAdminEmail}
              onChange={update("rootAdminEmail")}
              placeholder="jane@acme.com"
              required
            />
          </label>

          <label className="signup-field">
            <span>Password</span>
            <div className="signup-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={form.rootAdminPassword}
                onChange={update("rootAdminPassword")}
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label className="signup-field">
            <span>Included framework</span>
            <select value={form.frameworkChoice} onChange={update("frameworkChoice")}>
              {FRAMEWORK_CHOICES.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <div className="signup-field">
            <span>Billing cycle</span>
            <div className="signup-cycle-toggle">
              <button
                type="button"
                className={form.billingCycle === CYCLE_ANNUAL ? "active" : ""}
                onClick={() => setForm((f) => ({ ...f, billingCycle: CYCLE_ANNUAL }))}
              >
                Annual
              </button>
              <button
                type="button"
                className={form.billingCycle === CYCLE_HALF_YEARLY ? "active" : ""}
                onClick={() => setForm((f) => ({ ...f, billingCycle: CYCLE_HALF_YEARLY }))}
              >
                Half-yearly
              </button>
            </div>
          </div>

          {error && <div className="signup-error">{error}</div>}

          <button type="submit" className="signup-cta" disabled={submitting}>
            {submitting ? "Sending code…" : "Start free trial"}
            {!submitting && <ArrowRight size={16} />}
          </button>

          <p className="signup-footnote">
            <ShieldCheck size={13} /> You won't be charged until you add a payment method.
          </p>
        </form>
      </div>
      <SiteFooter />

      {otpOpen && (
        <div className="otp-backdrop" role="dialog" aria-modal="true" aria-labelledby="otp-title">
          <div className="otp-modal">
            {!finishing && (
              <button
                type="button"
                className="otp-close"
                onClick={closeOtpModal}
                aria-label="Close"
                disabled={otpVerifying}
              >
                <X size={18} />
              </button>
            )}

            {finishing ? (
              <div className="otp-finishing">
                <div className="otp-spinner" aria-hidden="true" />
                <h2>Setting up your workspace…</h2>
                <p>Verified — creating {form.orgName || "your organization"} and signing you in.</p>
              </div>
            ) : (
              <>
                <h2 id="otp-title">Check your email</h2>
                <p className="otp-sub">
                  Enter the {OTP_LENGTH}-digit code we sent to{" "}
                  <strong>{maskEmail(form.rootAdminEmail)}</strong>. It expires in 10 minutes.
                </p>

                <div className="otp-digit-row" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpInputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      className="otp-digit"
                      value={digit}
                      onChange={(e) => setDigit(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={otpVerifying}
                      aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                    />
                  ))}
                </div>

                {otpError && <div className="signup-error">{otpError}</div>}

                <button
                  type="button"
                  className="signup-cta"
                  onClick={handleVerifyOtp}
                  disabled={otpVerifying || otpDigits.join("").length !== OTP_LENGTH}
                >
                  {otpVerifying ? "Verifying…" : "Verify & create account"}
                  {!otpVerifying && <ArrowRight size={16} />}
                </button>

                <button
                  type="button"
                  className="otp-resend"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resending}
                >
                  {resending
                    ? "Resending…"
                    : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend code"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
