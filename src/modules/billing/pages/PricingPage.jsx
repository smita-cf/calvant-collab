// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Check, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
// import { getStarterPackage } from "../api/billingApi";
// import { formatINR } from "../utils/billingFormat";
// import SiteHeader from "@/components/SiteHeader";
// import SiteFooter from "@/components/SiteFooter";
// import "./PricingPage.css";

// const CYCLE_ANNUAL = "ANNUAL";
// const CYCLE_HALF_YEARLY = "HALF_YEARLY";
// const ANNUAL_DISCOUNT = 0.2; // 20% off vs half-yearly rate, front-end display only

// const STARTER_FEATURES = [
//   "7 core modules: Compliance, Risk, Audits, Policies, Tasks, Trust Centre, Reports",
//   "1 compliance framework of choice (from our library of 15, inclusive of ISO 27001, ISO 27701, SOC 2, ISO 42001, GDPR, DPDPR, etc.)",
//   "Up to 5 users: 1 admin + 4 normal",
//   "Up to 2 integrations (from 40+ ready integrations, or any custom integration of your choice)",
//   "Email alerting mechanism",
//   "Email support with 48-hour SLA",
//   "Auditor access included",
// ];

// const ENTERPRISE_FEATURES = [
//   "Unlimited users & departments",
//   "All frameworks, unlimited framework choices",
//   "Dedicated Customer Success Manager",
//   "Custom SLA & priority support",
//   "SSO / SCIM & advanced access controls",
//   "Custom integrations & data residency options",
// ];

// export default function PricingPage() {
//   const router = useRouter();
//   const [billingCycle, setBillingCycle] = useState(CYCLE_ANNUAL);
//   const [starter, setStarter] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const sp = await getStarterPackage();
//         if (cancelled) return;
//         setStarter(sp);
//       } catch (err) {
//         console.error(err);
//         if (!cancelled) setError("Couldn't load live pricing right now — showing may be incomplete.");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const starterPrice = useMemo(() => {
//     if (!starter) return null;
//     return billingCycle === CYCLE_ANNUAL ? starter.priceAnnual : starter.priceHalfYearly;
//   }, [starter, billingCycle]);

//   // Per-cycle-year equivalent so both toggles are visually comparable
//   const starterPricePerMonth = useMemo(() => {
//     if (starterPrice === null || starterPrice === undefined) return null;
//     return starterPrice / 12;
//   }, [starterPrice]);

//   const goToSignup = () => {
//     router.push(`/signup?billingCycle=${billingCycle}`);
//   };

//   const goToDemo = () => {
//     router.push("/demo");
//   };

//   return (
//     <>
//       <SiteHeader />
//       <div className="pricing-page">
//       <div className="pricing-bg-glow" aria-hidden="true" />

//       <div className="pricing-container">
//         <div className="pricing-header">
//           <span className="pricing-eyebrow">
//             <Sparkles size={14} /> Simple, transparent pricing
//           </span>
//           <h1>One plan. Scale it exactly how you need.</h1>
//           <p className="pricing-sub">
//             Start with everything you need to run compliance, risk, and audits — then add
//             frameworks, seats, modules, or integrations only when you actually need them.
//           </p>

//           <div className="cycle-toggle" role="tablist" aria-label="Billing cycle">
//             <button
//               role="tab"
//               aria-selected={billingCycle === CYCLE_ANNUAL}
//               className={billingCycle === CYCLE_ANNUAL ? "active" : ""}
//               onClick={() => setBillingCycle(CYCLE_ANNUAL)}
//             >
//               Annual
//               <span className="save-badge">Save 20%</span>
//             </button>
//             <button
//               role="tab"
//               aria-selected={billingCycle === CYCLE_HALF_YEARLY}
//               className={billingCycle === CYCLE_HALF_YEARLY ? "active" : ""}
//               onClick={() => setBillingCycle(CYCLE_HALF_YEARLY)}
//             >
//               Half-yearly
//             </button>
//           </div>
//         </div>

//         {error && <div className="pricing-error">{error}</div>}

//         <div className="pricing-cards">
//           {/* ── Starter (Growth folded in via add-ons) ───────────────────── */}
//           <div className="pricing-card pricing-card--highlight">
//             <div className="pricing-card-badge">Most popular</div>
//             <h2>Starter</h2>
//             <p className="pricing-card-tagline">
//               Everything a lean compliance team needs — scale seats, frameworks, and modules
//               as you grow, without switching plans.
//             </p>

//             <div className="pricing-amount">
//               {loading ? (
//                 <span className="pricing-skeleton" />
//               ) : (
//                 <>
//                   {billingCycle === CYCLE_ANNUAL && starterPricePerMonth !== null && (
//                     <span className="pricing-amount-strike">
//                       {formatINR(starterPricePerMonth / (1 - ANNUAL_DISCOUNT))}
//                     </span>
//                   )}
//                   <span className="pricing-amount-value">{formatINR(starterPricePerMonth)}</span>
//                   <span className="pricing-amount-unit">/month</span>
//                   {billingCycle === CYCLE_ANNUAL && (
//                     <span className="pricing-discount-chip">20% off</span>
//                   )}
//                 </>
//               )}
//             </div>
//             <div className="pricing-amount-note">
//               {loading
//                 ? " "
//                 : billingCycle === CYCLE_ANNUAL
//                 ? `Billed annually at ${formatINR(starterPrice)}/year, excl. GST`
//                 : `Billed half-yearly — ${formatINR(starterPrice ? starterPrice / 2 : null)} every 6 months, excl. GST`}
//             </div>

//             <button className="pricing-cta pricing-cta--primary" onClick={goToSignup}>
//               Start your 14-day free trial <ArrowRight size={16} />
//             </button>
//             <p className="pricing-cta-note">No card required to start. Cancel anytime.</p>

//             <ul className="pricing-feature-list">
//               {STARTER_FEATURES.map((f) => (
//                 <li key={f}>
//                   <Check size={16} /> {f}
//                 </li>
//               ))}
//             </ul>

//           </div>

//           {/* ── Enterprise ─────────────────────────────────────────────── */}
//           <div className="pricing-card">
//             <h2>Enterprise</h2>
//             <p className="pricing-card-tagline">
//               For organizations with 100+ employees, multi-entity structures, or bespoke
//               compliance programs.
//             </p>

//             <div className="pricing-amount">
//               <span className="pricing-amount-value">Custom</span>
//             </div>
//             <div className="pricing-amount-note">Pricing tailored to your org's scope</div>

//             <button className="pricing-cta pricing-cta--secondary" onClick={goToDemo}>
//               Book a demo <ArrowRight size={16} />
//             </button>
//             <p className="pricing-cta-note">Our team will scope a plan with you.</p>

//             <ul className="pricing-feature-list">
//               {ENTERPRISE_FEATURES.map((f) => (
//                 <li key={f}>
//                   <Check size={16} /> {f}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         <div className="pricing-footnote">
//           <ShieldCheck size={14} /> All prices shown exclude GST, applied at checkout. Starter
//           plan add-ons can be adjusted anytime from Manage Subscription.
//         </div>
//       </div>
//       </div>
//       <SiteFooter />
//     </>
//   );
// }


"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { getStarterPackage } from "../api/billingApi";
import { formatINR } from "../utils/billingFormat";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./PricingPage.css";

const CYCLE_ANNUAL = "ANNUAL";
const CYCLE_HALF_YEARLY = "HALF_YEARLY";
const ANNUAL_DISCOUNT = 0.2; // 20% off vs half-yearly rate, front-end display only

const STARTER_FEATURES = [
  "7 core modules: Compliance, Risk, Audits, Policies, Tasks, Trust Centre, Reports",
  "1 compliance framework of choice (from our library of 15, inclusive of ISO 27001, ISO 27701, SOC 2, ISO 42001, GDPR, DPDPR, etc.)",
  "Up to 5 users: 1 admin + 4 normal",
  "Up to 2 integrations (from 40+ ready integrations, or any custom integration of your choice)",
  "Email alerting mechanism",
  "Email support with 48-hour SLA",
  "Auditor access included",
];

const ENTERPRISE_FEATURES = [
  "Unlimited users & departments",
  "All frameworks, unlimited framework choices",
  "Dedicated Customer Success Manager",
  "Custom SLA & priority support",
  "SSO / SCIM & advanced access controls",
  "Custom integrations & data residency options",
];

function PricingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTrial = searchParams.get("trial") === "true";

  const [billingCycle, setBillingCycle] = useState(CYCLE_ANNUAL);
  const [starter, setStarter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sp = await getStarterPackage();
        if (cancelled) return;
        setStarter(sp);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Couldn't load live pricing right now — showing may be incomplete.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const starterPrice = useMemo(() => {
    if (!starter) return null;
    return billingCycle === CYCLE_ANNUAL ? starter.priceAnnual : starter.priceHalfYearly;
  }, [starter, billingCycle]);

  // Per-cycle-year equivalent so both toggles are visually comparable
  const starterPricePerMonth = useMemo(() => {
    if (starterPrice === null || starterPrice === undefined) return null;
    return starterPrice / 12;
  }, [starterPrice]);

  const goToSignup = () => {
    router.push(`/signup?billingCycle=${billingCycle}${isTrial ? "&trial=true" : ""}`);
  };

  const goToDemo = () => {
    router.push("/demo");
  };

  return (
    <>
      <SiteHeader />
      <div className="pricing-page">
      <div className="pricing-bg-glow" aria-hidden="true" />

      <div className="pricing-container">
        <div className="pricing-header">
          {isTrial && (
            <div className="pricing-trial-banner">
              <Sparkles size={14} /> Start your 14-day free trial no credit card required
            </div>
          )}
          {/* <span className="pricing-eyebrow">
            <Sparkles size={14} /> Simple, transparent pricing
          </span> */}
          <h1>One plan. Scale it exactly how you need.</h1>
          {/* <p className="pricing-sub">
            Start with everything you need to run compliance, risk, and audits — then add
            frameworks, seats, modules, or integrations only when you actually need them.
          </p> */}

          <div className="cycle-toggle" role="tablist" aria-label="Billing cycle">
            <button
              role="tab"
              aria-selected={billingCycle === CYCLE_ANNUAL}
              className={billingCycle === CYCLE_ANNUAL ? "active" : ""}
              onClick={() => setBillingCycle(CYCLE_ANNUAL)}
            >
              Annual
              <span className="save-badge">Save 20%</span>
            </button>
            <button
              role="tab"
              aria-selected={billingCycle === CYCLE_HALF_YEARLY}
              className={billingCycle === CYCLE_HALF_YEARLY ? "active" : ""}
              onClick={() => setBillingCycle(CYCLE_HALF_YEARLY)}
            >
              Half-yearly
            </button>
          </div>
        </div>

        {error && <div className="pricing-error">{error}</div>}

        <div className="pricing-cards">
          {/* ── Starter (Growth folded in via add-ons) ───────────────────── */}
          <div className={`pricing-card pricing-card--highlight${isTrial ? " pricing-card--trial" : ""}`}>
            <div className="pricing-card-badge">Most popular</div>
            <h2>Starter</h2>
            <p className="pricing-card-tagline">
              Everything a lean compliance team needs scale seats, frameworks, and modules
              as you grow, without switching plans.
            </p>

            <div className="pricing-amount">
              {loading ? (
                <span className="pricing-skeleton" />
              ) : (
                <>
                  {billingCycle === CYCLE_ANNUAL && starterPricePerMonth !== null && (
                    <span className="pricing-amount-strike">
                      {formatINR(starterPricePerMonth / (1 - ANNUAL_DISCOUNT))}
                    </span>
                  )}
                  <span className="pricing-amount-value">{formatINR(starterPricePerMonth)}</span>
                  <span className="pricing-amount-unit">/month</span>
                  {billingCycle === CYCLE_ANNUAL && (
                    <span className="pricing-discount-chip">20% off</span>
                  )}
                </>
              )}
            </div>
            <div className="pricing-amount-note">
              {loading
                ? " "
                : billingCycle === CYCLE_ANNUAL
                ? `Billed annually at ${formatINR(starterPrice)}/year, excl. GST`
                : `Billed half-yearly — ${formatINR(starterPrice ? starterPrice / 2 : null)} every 6 months, excl. GST`}
            </div>

            <button className="pricing-cta pricing-cta--primary" onClick={goToSignup}>
              Start your 14-day free trial <ArrowRight size={16} />
            </button>
            <p className="pricing-cta-note">No card required to start. Cancel anytime.</p>

            <ul className="pricing-feature-list">
              {STARTER_FEATURES.map((f) => (
                <li key={f}>
                  <Check size={16} /> {f}
                </li>
              ))}
            </ul>

          </div>

          {/* ── Enterprise ─────────────────────────────────────────────── */}
          <div className="pricing-card">
            <h2>Enterprise</h2>
            <p className="pricing-card-tagline">
              For organizations with 100+ employees, multi-entity structures, or bespoke
              compliance programs.
            </p>

            <div className="pricing-amount">
              <span className="pricing-amount-value">Custom</span>
            </div>
            <div className="pricing-amount-note">Pricing tailored to your org's scope</div>

            <button className="pricing-cta pricing-cta--secondary" onClick={goToDemo}>
              Book a demo <ArrowRight size={16} />
            </button>
            <p className="pricing-cta-note">Our team will scope a plan with you.</p>

            <ul className="pricing-feature-list">
              {ENTERPRISE_FEATURES.map((f) => (
                <li key={f}>
                  <Check size={16} /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pricing-footnote">
          <ShieldCheck size={14} /> All prices shown exclude GST, applied at checkout. Starter
          plan add-ons can be adjusted anytime from Manage Subscription.
        </div>
      </div>
      </div>
      <SiteFooter />
    </>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingPageInner />
    </Suspense>
  );
}