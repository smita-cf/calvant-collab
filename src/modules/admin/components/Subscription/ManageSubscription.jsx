// 'use client'

// import React, { useEffect, useMemo, useState } from "react";
// import { jwtDecode } from "jwt-decode";
// import {
//   CreditCard, Loader2, ShieldAlert, ExternalLink, Info,
// } from "lucide-react";
// import {
//   getCurrentSubscription, getAddOnCatalog, getStarterPackage,
//   cancelSubscription, startCheckout, initiateOneTimeCheckout,
// } from "../../api/adminBillingApi";
// import {
//   formatINR, perCycleRateFor, STATUS_LABELS, daysUntil,
// } from "@/modules/billing/utils/billingFormat";
// import { openRazorpayCheckout } from "./razorpayHelpers";
// import { controlTypeFor, CONTROL_CHECKBOX, WIZARD_ADDON_ORDER } from "./subscriptionCatalogConfig";
// import UpgradeAddOnsWizard from "./UpgradeAddOnsWizard";
// import BuyFrameworkModal from "./BuyFrameworkModal";
// import "./ManageSubscription.css";

// /**
//  * Client-side role gate — mirrors AdminLayout.jsx's own token-decoding
//  * convention (sessionStorage "token", jwtDecode, decoded.role as array or
//  * string) so this page never disagrees with the nav about who counts as
//  * root/super_admin. This does NOT replace server-side enforcement
//  * (SecurityConfig already rejects non-root mutations with a 403) — it exists
//  * so a non-root viewer sees disabled controls with an explanation instead of
//  * a dead-end click that fails silently or with a raw error.
//  */
// function useCanManageBilling() {
//   const [canManage, setCanManage] = useState(false);
//   const [checked, setChecked] = useState(false);
//   useEffect(() => {
//     try {
//       const token = sessionStorage.getItem("token");
//       const decoded = token ? jwtDecode(token) : null;
//       const roles = Array.isArray(decoded?.role) ? decoded.role : [decoded?.role].filter(Boolean);
//       setCanManage(roles.some((r) => r === "root" || r === "super_admin"));
//     } catch {
//       setCanManage(false);
//     } finally {
//       setChecked(true);
//     }
//   }, []);
//   return { canManage, checked };
// }

// export default function ManageSubscription() {
//   const { canManage, checked: roleChecked } = useCanManageBilling();

//   const [sub, setSub] = useState(null);
//   const [resolvedPrice, setResolvedPrice] = useState(null);
//   const [starter, setStarter] = useState(null);
//   const [catalog, setCatalog] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");
//   const [cancelling, setCancelling] = useState(false);
//   const [activating, setActivating] = useState(false);
//   const [wizard, setWizard] = useState(null); // "upgrade" | "downgrade" | null
//   const [showChangePlanInfo, setShowChangePlanInfo] = useState(false);
//   const [showFrameworkStore, setShowFrameworkStore] = useState(false);
//   const [buyingCode, setBuyingCode] = useState(null);
//   const [consultantDays, setConsultantDays] = useState(1);
//   const [awaitingWebhook, setAwaitingWebhook] = useState(false);

//   // silent=true skips the full-page "Loading your subscription…" spinner —
//   // used while polling after a payment, where we already have a page to show.
//   const loadAll = async ({ silent = false } = {}) => {
//     if (!silent) setLoading(true);
//     setError("");
//     try {
//       const [subData, catalogData, starterData] = await Promise.all([
//         getCurrentSubscription(),
//         getAddOnCatalog(),
//         getStarterPackage(),
//       ]);
//       setSub(subData.subscription);
//       setResolvedPrice(subData.resolvedPriceMinorUnits);
//       setCatalog(Array.isArray(catalogData) ? catalogData : []);
//       setStarter(starterData);
//       return subData.subscription;
//     } catch (err) {
//       console.error(err);
//       setError(
//         err?.response?.status === 401 || err?.response?.status === 403
//           ? "You don't have access to billing for this organization."
//           : "Couldn't load your subscription. Please refresh and try again."
//       );
//       return null;
//     } finally {
//       if (!silent) setLoading(false);
//     }
//   };

//   useEffect(() => { loadAll(); }, []);

//   /**
//    * Razorpay's client-side `handler` fires the instant the checkout modal
//    * shows success — well before Razorpay's webhook has necessarily reached
//    * WebhookController and flipped Subscription.status in Mongo. A single
//    * loadAll() right after checkout almost always re-reads the stale
//    * pre-payment status. Poll briefly instead, and only give up (with an
//    * honest message) if the webhook genuinely hasn't landed after ~20s —
//    * which usually means webhook delivery itself is the problem (e.g. the
//    * URL registered in the Razorpay dashboard can't reach this environment),
//    * not that the payment failed.
//    *
//    * Only used for the Starter plan activation below — that's the one flow
//    * whose success is actually gated by Subscription.status flipping via
//    * webhook. Per-add-on purchases inside UpgradeAddOnsWizard don't have an
//    * equivalent status flag to poll for today (see that file's header note
//    * on the addOnSubscriptions/addOns backend gap), so they just refetch
//    * once via onWizardComplete below.
//    */
//   const waitForStatusChange = async (previousStatus, { attempts = 8, delayMs = 2500 } = {}) => {
//     setAwaitingWebhook(true);
//     try {
//       for (let i = 0; i < attempts; i += 1) {
//         await new Promise((r) => setTimeout(r, delayMs));
//         const latest = await loadAll({ silent: true });
//         if (latest && latest.status !== previousStatus) {
//           return latest;
//         }
//       }
//       return null; // timed out — caller decides how to message this
//     } finally {
//       setAwaitingWebhook(false);
//     }
//   };

//   const billingCycle = sub?.billingCycle || "ANNUAL";
//   const cycleLabel = billingCycle === "ANNUAL" ? "Yearly" : "Half-Yearly";
//   const periodLabel = billingCycle === "ANNUAL" ? "/year" : "/6 months";

//   // Per your instruction: don't show the add-ons / upgrade machinery until
//   // the tenant has actually paid at least once. TRIAL is the only status
//   // that means "never checked out" — ACTIVE/PAST_DUE/CANCELLED all imply a
//   // completed payment at some point.
//   const hasPaid = sub && sub.status !== "TRIAL";

//   const perUnitCatalog = useMemo(
//     () => WIZARD_ADDON_ORDER
//       .map((code) => catalog.find((a) => a.addOnCode === code))
//       .filter(Boolean),
//     [catalog]
//   );

//   const oneTimeItems = useMemo(
//     () => catalog.filter((a) => a.billingType === "ONE_TIME"),
//     [catalog]
//   );
//   const customQuoteItems = useMemo(
//     () => catalog.filter((a) => a.billingType === "CUSTOM_QUOTE"),
//     [catalog]
//   );

//   const netTotal = hasPaid ? (resolvedPrice ?? 0) : 0;

//   const handleActivate = async () => {
//     setActivating(true);
//     setError("");
//     const previousStatus = sub?.status;
//     try {
//       const session = await startCheckout();
//       await new Promise((resolve, reject) => {
//         openRazorpayCheckout(session, {
//           description: "Activate subscription",
//           onSuccess: resolve,
//           onDismiss: () => reject(new Error("Payment window closed before completing.")),
//           onError: reject,
//         });
//       });
//       // Razorpay's modal confirms success client-side; the actual status
//       // flip happens when Razorpay's webhook reaches the backend, which is
//       // asynchronous. Don't trust a single immediate re-fetch — poll.
//       setMessage("Payment received — confirming with Razorpay…");
//       const updated = await waitForStatusChange(previousStatus);
//       if (updated) {
//         setMessage("Your subscription is active.");
//       } else {
//         setMessage("");
//         setError(
//           "Payment succeeded, but we're still waiting on confirmation from Razorpay. " +
//           "This can take a minute — refresh the page shortly, or contact support if it's been a while."
//         );
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err?.message || "Couldn't complete checkout. Please try again.");
//     } finally {
//       setActivating(false);
//     }
//   };

//   const handleCancel = async () => {
//     if (!canManage) return;
//     if (!window.confirm("Cancel your subscription at the end of the current billing period?")) return;
//     setCancelling(true);
//     setError("");
//     try {
//       const updated = await cancelSubscription();
//       setSub(updated);
//       setMessage("Your subscription will be cancelled at the end of the current period.");
//     } catch (err) {
//       console.error(err);
//       setError("Couldn't cancel your subscription. Please try again.");
//     } finally {
//       setCancelling(false);
//     }
//   };

//   const handleBuyOneTime = async (addOnCode, quantity = 1) => {
//     if (!canManage) return;
//     setBuyingCode(addOnCode);
//     setError("");
//     try {
//       const session = await initiateOneTimeCheckout(addOnCode, quantity);
//       await new Promise((resolve, reject) => {
//         openRazorpayCheckout(session, {
//           description: addOnCode,
//           onSuccess: resolve,
//           onDismiss: () => reject(new Error("Payment window closed before completing.")),
//           onError: reject,
//         });
//       });
//       setMessage("Purchase complete.");
//     } catch (err) {
//       console.error(err);
//       setError(err?.response?.data?.error || err?.message || "Couldn't complete the purchase. Please try again.");
//     } finally {
//       setBuyingCode(null);
//     }
//   };

//   /**
//    * Called by UpgradeAddOnsWizard's "Done" button with the per-item result
//    * list it built up (seats + each add-on it touched). A wizard run can now
//    * be a PARTIAL success — e.g. seats updated fine but one add-on's
//    * Razorpay popup got dismissed — so this message reflects that instead of
//    * always claiming full success.
//    */
//   const handleWizardComplete = async (itemResults = []) => {
//     setWizard(null);
//     const failed = itemResults.filter((r) => r.status === "failed");
//     if (failed.length === 0) {
//       setMessage(
//         itemResults.length === 0
//           ? "No changes were needed."
//           : "Your subscription has been updated."
//       );
//       setError("");
//     } else if (failed.length === itemResults.length) {
//       setMessage("");
//       setError("Couldn't complete your changes. Please try again.");
//     } else {
//       setMessage(`${itemResults.length - failed.length} of ${itemResults.length} change(s) applied.`);
//       setError(`Didn't go through: ${failed.map((f) => f.label).join(", ")}. You can retry these from the wizard.`);
//     }
//     await loadAll();
//   };

//   if (loading) {
//     return (
//       <div className="ms-page ms-loading">
//         <Loader2 className="ms-spin" size={22} />
//         <span>Loading your subscription…</span>
//       </div>
//     );
//   }

//   if (error && !sub) {
//     return (
//       <div className="ms-page ms-loading">
//         <ShieldAlert size={22} />
//         <span>{error}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="ms-page">
//       {!roleChecked ? null : !canManage && (
//         <div className="ms-banner ms-banner--info">
//           <Info size={15} /> You have read-only access to billing. Only a root or super admin can make changes here.
//         </div>
//       )}
//       {message && <div className="ms-banner ms-banner--success">{message}</div>}
//       {error && sub && <div className="ms-banner ms-banner--error">{error}</div>}

//       {!hasPaid ? (
//         <div className="ms-activate-card">
//           <h2>Activate your subscription</h2>
//           <p>
//             You're on a {STATUS_LABELS[sub?.status] || "trial"}
//             {sub?.status === "TRIAL" && daysUntil(sub.trialEndsAt) != null
//               ? ` — ${Math.max(0, daysUntil(sub.trialEndsAt))} day(s) left`
//               : ""}. Add a payment method to unlock Manage Subscription — add-ons, extra
//             seats, and integrations become available once your plan is active.
//           </p>
//           <button
//             className="ms-btn ms-btn--primary"
//             disabled={activating || !canManage}
//             onClick={handleActivate}
//             title={!canManage ? "Only a root or super admin can activate billing" : undefined}
//           >
//             <CreditCard size={15} />
//             {awaitingWebhook ? "Confirming payment…" : activating ? "Redirecting…" : "Add payment method"}
//           </button>
//         </div>
//       ) : (
//         <>
//           <div className="ms-header-row">
//             <div className="ms-brand">
//               <div className="ms-brand-icon">CV</div>
//               <div>
//                 <div className="ms-brand-name">CalVant</div>
//                 <div className="ms-sub-id">Subscription ID: {sub?.id || "—"}</div>
//               </div>
//             </div>
//             <div className="ms-header-actions">
//               {/* <button className="ms-btn ms-btn--outline" onClick={() => setShowChangePlanInfo(true)}>
//                 Change Plan
//               </button> */}
//               <button
//                 className="ms-btn ms-btn--primary"
//                 disabled={!canManage}
//                 title={!canManage ? "Only a root or super admin can upgrade" : undefined}
//                 onClick={() => setWizard("upgrade")}
//               >
//                 Upgrade User/Add-Ons
//               </button>
//               <button
//                 className="ms-btn ms-btn--outline"
//                 disabled={!canManage}
//                 title={!canManage ? "Only a root or super admin can downgrade" : undefined}
//                 onClick={() => setWizard("downgrade")}
//               >
//                 Downgrade User/Add-Ons
//               </button>
//               <button
//                 className="ms-btn ms-btn--outline"
//                 disabled={!canManage}
//                 title={!canManage ? "Only a root or super admin can buy frameworks" : undefined}
//                 onClick={() => setShowFrameworkStore(true)}
//               >
//                 Buy a Framework
//               </button>
//             </div>
//           </div>

//           <div className="ms-main-grid">
//             <div className="ms-details-card">
//               <h3>Subscription Details</h3>
//               <table className="ms-table">
//                 <thead>
//                   <tr><th>ITEM</th><th>NO. OF UNITS</th><th>TOTAL {periodLabel.toUpperCase()}</th></tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>Starter Plan</td>
//                     <td>{(sub?.adminUserCount || 0) + (sub?.normalUserCount || 0)} users</td>
//                     <td>{formatINR(billingCycle === "ANNUAL" ? starter?.priceAnnual : starter?.priceHalfYearly)}</td>
//                   </tr>
//                   {perUnitCatalog.map((item) => {
//                     const line = sub?.addOns?.find((l) => l.addOnCode === item.addOnCode);
//                     const opted = line && line.quantity > 0;
//                     const isCheckbox = controlTypeFor(item.addOnCode) === CONTROL_CHECKBOX;
//                     return (
//                       <tr key={item.addOnCode}>
//                         <td>{item.displayName}</td>
//                         <td>{opted ? (isCheckbox ? "Opted" : `${line.quantity} units`) : "Not Opted"}</td>
//                         <td>{opted ? formatINR((perCycleRateFor(item, billingCycle) || 0) * line.quantity) : formatINR(0)}</td>
//                       </tr>
//                     );
//                   })}
//                   <tr className="ms-table-total-row">
//                     <td colSpan={2}>Net Total</td>
//                     <td>{formatINR(netTotal)}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//             <div className="ms-payment-card">
//               <div className="ms-payment-card-header">
//                 <span>Next Payment</span>
//                 <a className="ms-link ms-link--disabled" title="Not available yet">
//                   Payment History
//                 </a>
//               </div>
//               <div className="ms-payment-date">
//                 {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
//               </div>
//               <div className="ms-payment-cycle">({cycleLabel})</div>
//               <div className="ms-payment-amount-circle">{formatINR(netTotal)}</div>
//               <div className="ms-payment-tax-note">* Excluding Tax</div>
//             </div>
//           </div>

//           <div className="ms-nonrecurring-card">
//             <div className="ms-nonrecurring-header">
//               <h3>Nonrecurring Add-ons</h3>
//             </div>
//             <table className="ms-table">
//               <thead>
//                 <tr><th>ITEM</th><th>UNIT PRICE</th><th>ACTION</th></tr>
//               </thead>
//               <tbody>
//                 {oneTimeItems.map((item) => (
//                   <tr key={item.addOnCode}>
//                     <td>{item.displayName}</td>
//                     <td>
//                       {formatINR(item.priceOneTime)}
//                       {item.addOnCode === "SERVICE_CONSULTANT_DAY" ? " /day" : ""}
//                     </td>
//                     <td>
//                       {item.addOnCode === "SERVICE_CONSULTANT_DAY" && (
//                         <input
//                           type="number"
//                           min={1}
//                           value={consultantDays}
//                           onChange={(e) => setConsultantDays(Math.max(1, Number(e.target.value) || 1))}
//                           className="ms-qty-input"
//                         />
//                       )}
//                       <button
//                         className="ms-btn ms-btn--outline ms-btn--sm"
//                         disabled={!canManage || buyingCode === item.addOnCode}
//                         title={!canManage ? "Only a root or super admin can purchase" : undefined}
//                         onClick={() => handleBuyOneTime(item.addOnCode, item.addOnCode === "SERVICE_CONSULTANT_DAY" ? consultantDays : 1)}
//                       >
//                         {buyingCode === item.addOnCode ? "Processing…" : "Buy"}
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {customQuoteItems.map((item) => (
//                   <tr key={item.addOnCode}>
//                     <td>{item.displayName}</td>
//                     <td>Custom quote</td>
//                     <td>
//                       <a className="ms-btn ms-btn--outline ms-btn--sm" href="mailto:sales@calvant.com?subject=Custom%20quote%20request">
//                         Contact Sales <ExternalLink size={12} />
//                       </a>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             <p className="ms-fineprint">
//               Purchases here are one-time charges, separate from your recurring plan total above.
//             </p>
//           </div>

//           <div className="ms-footer-card">
//             <div className="ms-footer-note">
//               {sub?.paymentProvider ? `Payment method on file (${sub.paymentProvider})` : "No payment method on file yet"}
//             </div>
//             <button
//               className="ms-btn ms-btn--danger-outline"
//               disabled={cancelling || !canManage || sub?.cancelAtPeriodEnd || sub?.status === "CANCELLED"}
//               title={!canManage ? "Only a root or super admin can cancel" : undefined}
//               onClick={handleCancel}
//             >
//               {sub?.cancelAtPeriodEnd ? "Cancellation scheduled" : cancelling ? "Cancelling…" : "Cancel subscription"}
//             </button>
//           </div>
//         </>
//       )}

//       {wizard && (
//         <UpgradeAddOnsWizard
//           mode={wizard}
//           sub={sub}
//           starter={starter}
//           catalog={catalog}
//           billingCycle={billingCycle}
//           onClose={() => setWizard(null)}
//           onComplete={handleWizardComplete}
//         />
//       )}

//       {showFrameworkStore && (
//         <BuyFrameworkModal
//           sub={sub}
//           starter={starter}
//           catalog={catalog}
//           billingCycle={billingCycle}
//           onClose={() => setShowFrameworkStore(false)}
//           onComplete={() => loadAll({ silent: true })}
//         />
//       )}

//       {showChangePlanInfo && (
//         <div className="ms-modal-overlay" role="dialog" aria-modal="true">
//           <div className="ms-modal ms-modal--small">
//             <h2 className="ms-modal-title">Change Plan</h2>
//             <p>
//               Self-serve billing cycle changes (Annual ⇄ Half-Yearly) aren't wired up on the
//               backend yet — there's no endpoint for it today. Reach out to your account
//               manager to switch cycles or move to Enterprise, and we'll update this to a
//               one-click flow once that endpoint exists.
//             </p>
//             <div className="ms-modal-actions">
//               <button className="ms-btn ms-btn--primary" onClick={() => setShowChangePlanInfo(false)}>Got it</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


'use client'

import React, { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  CreditCard, Loader2, ShieldAlert, ExternalLink, Info, CalendarClock, Clock,
} from "lucide-react";
import {
  getCurrentSubscription, getAddOnCatalog, getStarterPackage,
  cancelSubscription, startCheckout, initiateOneTimeCheckout,
  requestTrialExtension, getMyTrialExtensionRequests,
} from "../../api/adminBillingApi";
import {
  formatINR, perCycleRateFor, STATUS_LABELS, daysUntil,
} from "@/modules/billing/utils/billingFormat";
import { openRazorpayCheckout } from "./razorpayHelpers";
import { controlTypeFor, CONTROL_CHECKBOX, WIZARD_ADDON_ORDER } from "./subscriptionCatalogConfig";
import { getOrganization, fetchFrameworkLibrary } from "../../api/adminFrameworkStoreApi";
import UpgradeAddOnsWizard from "./UpgradeAddOnsWizard";
import BuyFrameworkModal from "./BuyFrameworkModal";
import "./ManageSubscription.css";

/**
 * Client-side role gate — mirrors AdminLayout.jsx's own token-decoding
 * convention (sessionStorage "token", jwtDecode, decoded.role as array or
 * string) so this page never disagrees with the nav about who counts as
 * root/super_admin. This does NOT replace server-side enforcement
 * (SecurityConfig already rejects non-root mutations with a 403) — it exists
 * so a non-root viewer sees disabled controls with an explanation instead of
 * a dead-end click that fails silently or with a raw error.
 */
function useCanManageBilling() {
  const [canManage, setCanManage] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    try {
      const token = sessionStorage.getItem("token");
      const decoded = token ? jwtDecode(token) : null;
      const roles = Array.isArray(decoded?.role) ? decoded.role : [decoded?.role].filter(Boolean);
      setCanManage(roles.some((r) => r === "root" || r === "super_admin"));
    } catch {
      setCanManage(false);
    } finally {
      setChecked(true);
    }
  }, []);
  return { canManage, checked };
}

export default function ManageSubscription() {
  const FRAMEWORK_EXTRA_CODE = "FRAMEWORK_EXTRA";
  const { canManage, checked: roleChecked } = useCanManageBilling();

  const [sub, setSub] = useState(null);
  const [resolvedPrice, setResolvedPrice] = useState(null);
  const [starter, setStarter] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [activating, setActivating] = useState(false);
  const [wizard, setWizard] = useState(null); // "upgrade" | "downgrade" | null
  const [showChangePlanInfo, setShowChangePlanInfo] = useState(false);
  const [showFrameworkStore, setShowFrameworkStore] = useState(false);
  const [buyingCode, setBuyingCode] = useState(null);
  const [consultantDays, setConsultantDays] = useState(1);
  const [awaitingWebhook, setAwaitingWebhook] = useState(false);

  // ── Trial extension (Layer 2) ──────────────────────────────────────────
  // extensionRequests holds every request this tenant has ever made
  // (PENDING/APPROVED/REJECTED, oldest to newest as returned by the API) —
  // latestExtensionRequest below picks the one that decides what the button/
  // banner shows. Loaded lazily (see the effect below) only while on TRIAL,
  // since a paid tenant never needs this.
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [extensionLoading, setExtensionLoading] = useState(false);
  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const [extensionReason, setExtensionReason] = useState("");
  const [submittingExtension, setSubmittingExtension] = useState(false);
  const [extensionError, setExtensionError] = useState("");

  // silent=true skips the full-page "Loading your subscription…" spinner —
  // used while polling after a payment, where we already have a page to show.
  const loadAll = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [subData, catalogData, starterData] = await Promise.all([
        getCurrentSubscription(),
        getAddOnCatalog(),
        getStarterPackage(),
      ]);
      setSub(subData.subscription);
      setResolvedPrice(subData.resolvedPriceMinorUnits);
      setCatalog(Array.isArray(catalogData) ? catalogData : []);
      setStarter(starterData);
      return subData.subscription;
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.status === 401 || err?.response?.status === 403
          ? "You don't have access to billing for this organization."
          : "Couldn't load your subscription. Please refresh and try again."
      );
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Human-readable names for the frameworks this org already owns — same
  // data UpgradeAddOnsWizard uses, fetched here too so the "Additional
  // compliance framework" row shows names instead of a bare unit count.
  const [orgFrameworks, setOrgFrameworks] = useState(null);
  const [frameworkLibrary, setFrameworkLibrary] = useState([]);
  useEffect(() => {
    if (!sub?.orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const [org, lib] = await Promise.all([
          getOrganization(sub.orgId),
          fetchFrameworkLibrary(),
        ]);
        if (cancelled) return;
        setOrgFrameworks(Array.isArray(org?.frameworks) ? org.frameworks : []);
        setFrameworkLibrary(lib);
      } catch (err) {
        console.error(err);
        if (!cancelled) setOrgFrameworks((prev) => prev ?? []);
      }
    })();
    return () => { cancelled = true; };
  }, [sub?.orgId]);

  // DD/MM/YYYY, no leading zeros (e.g. "21/9/2026") — toLocaleDateString()'s
  // default locale formatting reads as US-style MM/DD/YYYY in this app, which
  // read as the wrong date to reviewers expecting day-first.
  const formatDDMMYYYY = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const ownedFrameworkLabels = useMemo(
    () => (orgFrameworks || []).map((code) => {
      const fw = (frameworkLibrary || []).find(
        (f) => (f.code || "").toUpperCase() === (code || "").toUpperCase()
      );
      return fw?.label || code;
    }),
    [orgFrameworks, frameworkLibrary]
  );

  // Only load extension requests while actually on TRIAL — a paid tenant
  // never needs this, and (per TrialExtensionService) an already-lapsed,
  // never-paid tenant is also eligible, but that state currently renders the
  // full paid dashboard here (hasPaid only checks status !== "TRIAL"), so
  // this stays scoped to the TRIAL banner for now rather than reworking that
  // gate.
  useEffect(() => {
    if (sub?.status !== "TRIAL") return;
    let cancelled = false;
    (async () => {
      setExtensionLoading(true);
      try {
        const requests = await getMyTrialExtensionRequests();
        if (!cancelled) setExtensionRequests(Array.isArray(requests) ? requests : []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setExtensionLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sub?.status, sub?.trialExtensionGranted]);

  // Most recent request decides what the banner shows — newest by
  // requestedAt, since the backend returns them in insertion order but
  // doesn't guarantee it.
  const latestExtensionRequest = useMemo(() => {
    if (!extensionRequests.length) return null;
    return [...extensionRequests].sort(
      (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
    )[0];
  }, [extensionRequests]);

  const handleRequestExtension = async () => {
    setSubmittingExtension(true);
    setExtensionError("");
    try {
      const created = await requestTrialExtension(extensionReason.trim() || undefined);
      setExtensionRequests((prev) => [...prev, created]);
      setShowExtensionForm(false);
      setExtensionReason("");
      setMessage("Your extension request has been submitted for review.");
      setError("");
    } catch (err) {
      console.error(err);
      setExtensionError(
        err?.response?.data?.message
          || err?.response?.data?.error
          || "Couldn't submit your extension request. Please try again."
      );
    } finally {
      setSubmittingExtension(false);
    }
  };

  /**
   * Razorpay's client-side `handler` fires the instant the checkout modal
   * shows success — well before Razorpay's webhook has necessarily reached
   * WebhookController and flipped Subscription.status in Mongo. A single
   * loadAll() right after checkout almost always re-reads the stale
   * pre-payment status. Poll briefly instead, and only give up (with an
   * honest message) if the webhook genuinely hasn't landed after ~20s —
   * which usually means webhook delivery itself is the problem (e.g. the
   * URL registered in the Razorpay dashboard can't reach this environment),
   * not that the payment failed.
   *
   * Only used for the Starter plan activation below — that's the one flow
   * whose success is actually gated by Subscription.status flipping via
   * webhook. Per-add-on purchases inside UpgradeAddOnsWizard don't have an
   * equivalent status flag to poll for today (see that file's header note
   * on the addOnSubscriptions/addOns backend gap), so they just refetch
   * once via onWizardComplete below.
   */
  const waitForStatusChange = async (previousStatus, { attempts = 8, delayMs = 2500 } = {}) => {
    setAwaitingWebhook(true);
    try {
      for (let i = 0; i < attempts; i += 1) {
        await new Promise((r) => setTimeout(r, delayMs));
        const latest = await loadAll({ silent: true });
        if (latest && latest.status !== previousStatus) {
          return latest;
        }
      }
      return null; // timed out — caller decides how to message this
    } finally {
      setAwaitingWebhook(false);
    }
  };

  const billingCycle = sub?.billingCycle || "ANNUAL";
  const cycleLabel = billingCycle === "ANNUAL" ? "Yearly" : "Half-Yearly";
  const periodLabel = billingCycle === "ANNUAL" ? "/year" : "/6 months";

  // Per your instruction: don't show the add-ons / upgrade machinery until
  // the tenant has actually paid at least once. TRIAL is the only status
  // that means "never checked out" — ACTIVE/PAST_DUE/CANCELLED all imply a
  // completed payment at some point.
  const hasPaid = sub && sub.status !== "TRIAL";

  const perUnitCatalog = useMemo(
    () => WIZARD_ADDON_ORDER
      .map((code) => catalog.find((a) => a.addOnCode === code))
      .filter(Boolean),
    [catalog]
  );

  const oneTimeItems = useMemo(
    () => catalog.filter((a) => a.billingType === "ONE_TIME"),
    [catalog]
  );
  const customQuoteItems = useMemo(
    () => catalog.filter((a) => a.billingType === "CUSTOM_QUOTE"),
    [catalog]
  );

  const netTotal = hasPaid ? (resolvedPrice ?? 0) : 0;

  const handleActivate = async () => {
    setActivating(true);
    setError("");
    const previousStatus = sub?.status;
    try {
      const session = await startCheckout();
      await new Promise((resolve, reject) => {
        openRazorpayCheckout(session, {
          description: "Activate subscription",
          onSuccess: resolve,
          onDismiss: () => reject(new Error("Payment window closed before completing.")),
          onError: reject,
        });
      });
      // Razorpay's modal confirms success client-side; the actual status
      // flip happens when Razorpay's webhook reaches the backend, which is
      // asynchronous. Don't trust a single immediate re-fetch — poll.
      setMessage("Payment received — confirming with Razorpay…");
      const updated = await waitForStatusChange(previousStatus);
      if (updated) {
        setMessage("Your subscription is active.");
      } else {
        setMessage("");
        setError(
          "Payment succeeded, but we're still waiting on confirmation from Razorpay. " +
          "This can take a minute — refresh the page shortly, or contact support if it's been a while."
        );
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Couldn't complete checkout. Please try again.");
    } finally {
      setActivating(false);
    }
  };

  const handleCancel = async () => {
    if (!canManage) return;
    if (!window.confirm("Cancel your subscription at the end of the current billing period?")) return;
    setCancelling(true);
    setError("");
    try {
      const updated = await cancelSubscription();
      setSub(updated);
      setMessage("Your subscription will be cancelled at the end of the current period.");
    } catch (err) {
      console.error(err);
      setError("Couldn't cancel your subscription. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const handleBuyOneTime = async (addOnCode, quantity = 1) => {
    if (!canManage) return;
    setBuyingCode(addOnCode);
    setError("");
    try {
      const session = await initiateOneTimeCheckout(addOnCode, quantity);
      await new Promise((resolve, reject) => {
        openRazorpayCheckout(session, {
          description: addOnCode,
          onSuccess: resolve,
          onDismiss: () => reject(new Error("Payment window closed before completing.")),
          onError: reject,
        });
      });
      setMessage("Purchase complete.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err?.message || "Couldn't complete the purchase. Please try again.");
    } finally {
      setBuyingCode(null);
    }
  };

  /**
   * Called by UpgradeAddOnsWizard's "Done" button with the per-item result
   * list it built up (seats + each add-on it touched). A wizard run can now
   * be a PARTIAL success — e.g. seats updated fine but one add-on's
   * Razorpay popup got dismissed — so this message reflects that instead of
   * always claiming full success.
   */
  const handleWizardComplete = async (itemResults = []) => {
    setWizard(null);
    const failed = itemResults.filter((r) => r.status === "failed");
    if (failed.length === 0) {
      setMessage(
        itemResults.length === 0
          ? "No changes were needed."
          : "Your subscription has been updated."
      );
      setError("");
    } else if (failed.length === itemResults.length) {
      setMessage("");
      setError("Couldn't complete your changes. Please try again.");
    } else {
      setMessage(`${itemResults.length - failed.length} of ${itemResults.length} change(s) applied.`);
      setError(`Didn't go through: ${failed.map((f) => f.label).join(", ")}. You can retry these from the wizard.`);
    }
    await loadAll();
  };

  if (loading) {
    return (
      <div className="ms-page ms-loading">
        <Loader2 className="ms-spin" size={22} />
        <span>Loading your subscription…</span>
      </div>
    );
  }

  if (error && !sub) {
    return (
      <div className="ms-page ms-loading">
        <ShieldAlert size={22} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="ms-page">
      {!roleChecked ? null : !canManage && (
        <div className="ms-banner ms-banner--info">
          <Info size={15} /> You have read-only access to billing. Only a root or super admin can make changes here.
        </div>
      )}
      {message && <div className="ms-banner ms-banner--success">{message}</div>}
      {error && sub && <div className="ms-banner ms-banner--error">{error}</div>}

      {!hasPaid ? (
        <div className="ms-activate-card">
          <h2>Activate your subscription</h2>
          <p>
            You're on a {STATUS_LABELS[sub?.status] || "trial"}
            {sub?.status === "TRIAL" && daysUntil(sub.trialEndsAt) != null
              ? ` — ${Math.max(0, daysUntil(sub.trialEndsAt))} day(s) left`
              : ""}. Add a payment method to unlock Manage Subscription — add-ons, extra
            seats, and integrations become available once your plan is active.
          </p>
          <button
            className="ms-btn ms-btn--primary"
            disabled={activating || !canManage}
            onClick={handleActivate}
            title={!canManage ? "Only a root or super admin can activate billing" : undefined}
          >
            <CreditCard size={15} />
            {awaitingWebhook ? "Confirming payment…" : activating ? "Redirecting…" : "Add payment method"}
          </button>

          {sub?.status === "TRIAL" && (
            <div className="ms-trial-extension">
              {sub?.trialExtensionGranted ? (
                <p className="ms-trial-extension-note ms-trial-extension-note--approved">
                  <CalendarClock size={14} />
                  You've already used your one-time trial extension
                  {latestExtensionRequest?.newTrialEndsAt
                    ? ` — your trial now runs through ${formatDDMMYYYY(latestExtensionRequest.newTrialEndsAt)}.`
                    : "."}
                </p>
              ) : extensionLoading ? null : latestExtensionRequest?.status === "PENDING" ? (
                <p className="ms-trial-extension-note ms-trial-extension-note--pending">
                  <Clock size={14} />
                  Your request for {latestExtensionRequest.requestedDays} more day(s) is pending review by a super admin.
                </p>
              ) : (
                <>
                  {latestExtensionRequest?.status === "REJECTED" && (
                    <p className="ms-trial-extension-note ms-trial-extension-note--rejected">
                      Your last extension request was declined
                      {latestExtensionRequest.comments ? `: “${latestExtensionRequest.comments}”` : "."}
                      {" "}You can submit a new request below.
                    </p>
                  )}
                  {!showExtensionForm ? (
                    <button
                      className="ms-btn ms-btn--outline"
                      disabled={!canManage}
                      title={!canManage ? "Only a root or super admin can request a trial extension" : undefined}
                      onClick={() => setShowExtensionForm(true)}
                    >
                      <CalendarClock size={15} />
                      Request 3-Day Trial Extension
                    </button>
                  ) : (
                    <div className="ms-trial-extension-form">
                      <label htmlFor="ms-extension-reason">
                        Why do you need more time? <span className="ms-trial-extension-optional">(optional)</span>
                      </label>
                      <textarea
                        id="ms-extension-reason"
                        rows={3}
                        value={extensionReason}
                        onChange={(e) => setExtensionReason(e.target.value)}
                        placeholder="e.g. still onboarding our team"
                        disabled={submittingExtension}
                      />
                      {extensionError && (
                        <div className="ms-banner ms-banner--error ms-trial-extension-error">{extensionError}</div>
                      )}
                      <div className="ms-trial-extension-actions">
                        <button
                          className="ms-btn ms-btn--primary"
                          disabled={submittingExtension}
                          onClick={handleRequestExtension}
                        >
                          {submittingExtension ? "Submitting…" : "Submit Request"}
                        </button>
                        <button
                          className="ms-btn ms-btn--outline"
                          disabled={submittingExtension}
                          onClick={() => { setShowExtensionForm(false); setExtensionError(""); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="ms-header-row">
            <div className="ms-brand">
              <div className="ms-brand-icon">CV</div>
              <div>
                <div className="ms-brand-name">CalVant</div>
                <div className="ms-sub-id">Subscription ID: {sub?.id || "—"}</div>
              </div>
            </div>
            <div className="ms-header-actions">
              {/* <button className="ms-btn ms-btn--outline" onClick={() => setShowChangePlanInfo(true)}>
                Change Plan
              </button> */}
              <button
                className="ms-btn ms-btn--primary"
                disabled={!canManage}
                title={!canManage ? "Only a root or super admin can upgrade" : undefined}
                onClick={() => setWizard("upgrade")}
              >
                Upgrade User/Add-Ons
              </button>
              <button
                className="ms-btn ms-btn--outline"
                disabled={!canManage}
                title={!canManage ? "Only a root or super admin can downgrade" : undefined}
                onClick={() => setWizard("downgrade")}
              >
                Downgrade User/Add-Ons
              </button>
              <button
                className="ms-btn ms-btn--outline"
                disabled={!canManage}
                title={!canManage ? "Only a root or super admin can buy frameworks" : undefined}
                onClick={() => setShowFrameworkStore(true)}
              >
                Buy a Framework
              </button>
            </div>
          </div>

          <div className="ms-main-grid">
            <div className="ms-details-card">
              <h3>Subscription Details</h3>
              <table className="ms-table">
                <thead>
                  <tr><th>ITEM</th><th>NO. OF UNITS</th><th>TOTAL {periodLabel.toUpperCase()}</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Starter Plan</td>
                    <td>{(sub?.adminUserCount || 0) + (sub?.normalUserCount || 0)} users</td>
                    <td>{formatINR(billingCycle === "ANNUAL" ? starter?.priceAnnual : starter?.priceHalfYearly)}</td>
                  </tr>
                  {perUnitCatalog.map((item) => {
                    const line = sub?.addOns?.find((l) => l.addOnCode === item.addOnCode);
                    const opted = line && line.quantity > 0;
                    const isCheckbox = controlTypeFor(item.addOnCode) === CONTROL_CHECKBOX;
                    return (
                      <React.Fragment key={item.addOnCode}>
                      <tr>
                        <td>{item.displayName}</td>
                        <td>{opted ? (isCheckbox ? "Opted" : `${line.quantity} units`) : "Not Opted"}</td>
                        <td>{opted ? formatINR((perCycleRateFor(item, billingCycle) || 0) * line.quantity) : formatINR(0)}</td>
                      </tr>
                      {item.addOnCode === FRAMEWORK_EXTRA_CODE && ownedFrameworkLabels.length > 0 && (
                        <tr className="ms-table-subrow">
                          <td colSpan={3}>
                            <span className="ms-item-sub ms-item-sub--owned">
                              Currently unlocked: {ownedFrameworkLabels.join(", ")}
                            </span>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })}
                  <tr className="ms-table-total-row">
                    <td colSpan={2}>Net Total</td>
                    <td>{formatINR(netTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="ms-payment-card">
              <div className="ms-payment-card-header">
                <span>Next Payment</span>
                <a className="ms-link ms-link--disabled" title="Not available yet">
                  Payment History
                </a>
              </div>
              <div className="ms-payment-date">
                {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </div>
              <div className="ms-payment-cycle">({cycleLabel})</div>
              <div className="ms-payment-amount-circle">{formatINR(netTotal)}</div>
              <div className="ms-payment-tax-note">* Excluding Tax</div>
            </div>
          </div>

          <div className="ms-nonrecurring-card">
            <div className="ms-nonrecurring-header">
              <h3>Nonrecurring Add-ons</h3>
            </div>
            <table className="ms-table">
              <thead>
                <tr><th>ITEM</th><th>UNIT PRICE</th><th>ACTION</th></tr>
              </thead>
              <tbody>
                {oneTimeItems.map((item) => (
                  <tr key={item.addOnCode}>
                    <td>{item.displayName}</td>
                    <td>
                      {formatINR(item.priceOneTime)}
                      {item.addOnCode === "SERVICE_CONSULTANT_DAY" ? " /day" : ""}
                    </td>
                    <td>
                      {item.addOnCode === "SERVICE_CONSULTANT_DAY" && (
                        <input
                          type="number"
                          min={1}
                          value={consultantDays}
                          onChange={(e) => setConsultantDays(Math.max(1, Number(e.target.value) || 1))}
                          className="ms-qty-input"
                        />
                      )}
                      <button
                        className="ms-btn ms-btn--outline ms-btn--sm"
                        disabled={!canManage || buyingCode === item.addOnCode}
                        title={!canManage ? "Only a root or super admin can purchase" : undefined}
                        onClick={() => handleBuyOneTime(item.addOnCode, item.addOnCode === "SERVICE_CONSULTANT_DAY" ? consultantDays : 1)}
                      >
                        {buyingCode === item.addOnCode ? "Processing…" : "Buy"}
                      </button>
                    </td>
                  </tr>
                ))}
                {customQuoteItems.map((item) => (
                  <tr key={item.addOnCode}>
                    <td>{item.displayName}</td>
                    <td>Custom quote</td>
                    <td>
                      <a className="ms-btn ms-btn--outline ms-btn--sm" href="mailto:sales@calvant.com?subject=Custom%20quote%20request">
                        Contact Sales <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="ms-fineprint">
              Purchases here are one-time charges, separate from your recurring plan total above.
            </p>
          </div>

          <div className="ms-footer-card">
            <div className="ms-footer-note">
              {sub?.paymentProvider ? `Payment method on file (${sub.paymentProvider})` : "No payment method on file yet"}
            </div>
            <button
              className="ms-btn ms-btn--danger-outline"
              disabled={cancelling || !canManage || sub?.cancelAtPeriodEnd || sub?.status === "CANCELLED"}
              title={!canManage ? "Only a root or super admin can cancel" : undefined}
              onClick={handleCancel}
            >
              {sub?.cancelAtPeriodEnd ? "Cancellation scheduled" : cancelling ? "Cancelling…" : "Cancel subscription"}
            </button>
          </div>
        </>
      )}

      {wizard && (
        <UpgradeAddOnsWizard
          mode={wizard}
          sub={sub}
          starter={starter}
          catalog={catalog}
          billingCycle={billingCycle}
          onClose={() => setWizard(null)}
          onComplete={handleWizardComplete}
        />
      )}

      {showFrameworkStore && (
        <BuyFrameworkModal
          sub={sub}
          starter={starter}
          catalog={catalog}
          billingCycle={billingCycle}
          onClose={() => setShowFrameworkStore(false)}
          onComplete={() => loadAll({ silent: true })}
        />
      )}

      {showChangePlanInfo && (
        <div className="ms-modal-overlay" role="dialog" aria-modal="true">
          <div className="ms-modal ms-modal--small">
            <h2 className="ms-modal-title">Change Plan</h2>
            <p>
              Self-serve billing cycle changes (Annual ⇄ Half-Yearly) aren't wired up on the
              backend yet — there's no endpoint for it today. Reach out to your account
              manager to switch cycles or move to Enterprise, and we'll update this to a
              one-click flow once that endpoint exists.
            </p>
            <div className="ms-modal-actions">
              <button className="ms-btn ms-btn--primary" onClick={() => setShowChangePlanInfo(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}