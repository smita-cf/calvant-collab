// 'use client'
 
// import React, { useEffect, useMemo, useState } from "react";
// import { X, ChevronLeft, Loader2, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
// import { purchaseOrChangeAddOn, removeAddOn } from "../../api/adminBillingApi";
// import {
//   ALLOWED_FRAMEWORK_CODES,
//   getOrganization,
//   updateOrganizationFrameworks,
//   fetchFrameworkLibrary,
// } from "../../api/adminFrameworkStoreApi";
// import { formatINR, perCycleRateFor } from "@/modules/billing/utils/billingFormat";
// import { openRazorpayCheckout } from "./razorpayHelpers";
// import { controlTypeFor, CONTROL_CHECKBOX, WIZARD_ADDON_ORDER } from "./subscriptionCatalogConfig";
// import "./ManageSubscription.css";
 
// const STEPS = ["Upgrade Add-Ons", "Confirm Order", "Confirmation"];
 
// const FRAMEWORK_EXTRA_CODE = "FRAMEWORK_EXTRA";
 
// // Product rule: for these add-ons every quantity INCREASE is a fresh,
// // pay-now Razorpay checkout (its own add-on subscription) — no mandate
// // memory. Seats: add 1 today, pay; add 4 more tomorrow, pay again.
// // Integration follows the same rule.
// // Everything else (DPIA, AI Impact, Vendor Mgmt) is "pay once, mandate
// // remembers": first purchase needs checkout, later increases are silently
// // charged against the mandate on file (the "topup" action below).
// const ALWAYS_CHECKOUT_ON_INCREASE = new Set(["USER_ADMIN", "USER_NORMAL", "INTEGRATION_STANDARD"]);
 
// /**
//  * mode: "upgrade" | "downgrade" — only changes step-1 title/copy and which
//  * direction the steppers move; handleConfirm is identical either way.
//  *
//  * Seats no longer go through a separate updateSeats PATCH — they're treated
//  * as ordinary catalog add-ons (USER_ADMIN / USER_NORMAL) that always require
//  * a fresh Razorpay checkout on increase, same pipeline as every other add-on.
//  */
// export default function UpgradeAddOnsWizard({ mode = "upgrade", sub, starter, catalog, billingCycle, onClose, onComplete }) {
//   const [step, setStep] = useState(1);
//   const [seats, setSeats] = useState({
//     adminUserCount: sub?.adminUserCount ?? starter?.includedAdminUsers ?? 1,
//     normalUserCount: sub?.normalUserCount ?? starter?.includedNormalUsers ?? 4,
//   });
//   const [qty, setQty] = useState(() => {
//     const q = {};
//     (sub?.addOns || []).forEach((line) => { q[line.addOnCode] = line.quantity; });
//     return q;
//   });
//   const [saving, setSaving] = useState(false);
//   const [processingLabel, setProcessingLabel] = useState("");
//   const [error, setError] = useState("");
//   const [itemResults, setItemResults] = useState([]); // [{ label, status: "ok"|"failed", detail? }]
//   const [chargesNow, setChargesNow] = useState(0);
 
//   // ── Framework picker (for the FRAMEWORK_EXTRA row) ──────────────────────
//   // Same data BuyFrameworkModal.jsx loads — org's currently-active frameworks
//   // plus the full framework library — so a slot bought here can be assigned
//   // to a specific framework right in this screen instead of requiring a
//   // separate trip to "Buy a Framework".
//   const [orgFrameworks, setOrgFrameworks] = useState(null); // null = not loaded yet
//   const [frameworkLibrary, setFrameworkLibrary] = useState([]);
//   const [frameworksLoading, setFrameworksLoading] = useState(true);
//   const [selectedNewFrameworkCodes, setSelectedNewFrameworkCodes] = useState([]);
 
//   const orgId = sub?.orgId;
 
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       setFrameworksLoading(true);
//       try {
//         const [org, lib] = await Promise.all([
//           orgId ? getOrganization(orgId) : Promise.resolve(null),
//           fetchFrameworkLibrary(),
//         ]);
//         if (cancelled) return;
//         setOrgFrameworks(Array.isArray(org?.frameworks) ? org.frameworks : []);
//         setFrameworkLibrary(lib);
//       } catch (err) {
//         console.error(err);
//         if (!cancelled) setOrgFrameworks((prev) => prev ?? []);
//       } finally {
//         if (!cancelled) setFrameworksLoading(false);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [orgId]);
 
//   const ownedCodesUpper = useMemo(
//     () => new Set((orgFrameworks || []).map((c) => (c || "").toUpperCase())),
//     [orgFrameworks]
//   );
 
//   // Only frameworks the backend will actually accept on org.frameworks —
//   // same allowlist BuyFrameworkModal filters against.
//   const lockedFrameworks = useMemo(
//     () => (frameworkLibrary || [])
//       .filter((fw) => ALLOWED_FRAMEWORK_CODES.includes((fw.code || "").toUpperCase()))
//       .filter((fw) => !ownedCodesUpper.has((fw.code || "").toUpperCase())),
//     [frameworkLibrary, ownedCodesUpper]
//   );
 
//   const includedFrameworkCount = starter?.includedFrameworkChoiceCount ?? 1;
//   // Extra frameworks already assigned beyond the included one — these
//   // already occupy a paid FRAMEWORK_EXTRA slot, so they don't need a new
//   // selection.
//   const alreadyUnlockedExtraCount = Math.max(0, ownedCodesUpper.size - includedFrameworkCount);
 
//   const toggleFrameworkSelection = (code, maxSelectable) => {
//     setSelectedNewFrameworkCodes((prev) => {
//       if (prev.includes(code)) return prev.filter((c) => c !== code);
//       if (prev.length >= maxSelectable) return prev;
//       return [...prev, code];
//     });
//   };
 
//   const orderedCatalog = useMemo(() => {
//     const byCode = {};
//     (catalog || []).forEach((a) => { if (a.billingType === "PER_UNIT_MONTHLY") byCode[a.addOnCode] = a; });
//     return WIZARD_ADDON_ORDER.map((code) => byCode[code]).filter(Boolean);
//   }, [catalog]);
 
//   const adminCatalogItem = useMemo(
//     () => (catalog || []).find((a) => a.addOnCode === "USER_ADMIN"),
//     [catalog]
//   );
//   const normalCatalogItem = useMemo(
//     () => (catalog || []).find((a) => a.addOnCode === "USER_NORMAL"),
//     [catalog]
//   );
 
//   const startingAdmin = sub?.adminUserCount ?? starter?.includedAdminUsers ?? 1;
//   const startingNormal = sub?.normalUserCount ?? starter?.includedNormalUsers ?? 4;
//   const minAdmin = mode === "downgrade" ? (starter?.includedAdminUsers ?? 1) : startingAdmin;
//   const maxAdmin = mode === "downgrade" ? startingAdmin : Infinity;
//   const minNormal = mode === "downgrade" ? (starter?.includedNormalUsers ?? 4) : startingNormal;
//   const maxNormal = mode === "downgrade" ? startingNormal : Infinity;
 
//   const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
 
//   const currentTotal = useMemo(() => {
//     let t = starter ? (billingCycle === "ANNUAL" ? starter.priceAnnual : starter.priceHalfYearly) : 0;
 
//     const currentExtraAdmin = Math.max(0, startingAdmin - (starter?.includedAdminUsers ?? 1));
//     const currentExtraNormal = Math.max(0, startingNormal - (starter?.includedNormalUsers ?? 4));
 
//     if (adminCatalogItem && currentExtraAdmin > 0) {
//       t += (perCycleRateFor(adminCatalogItem, billingCycle) || 0) * currentExtraAdmin;
//     }
//     if (normalCatalogItem && currentExtraNormal > 0) {
//       t += (perCycleRateFor(normalCatalogItem, billingCycle) || 0) * currentExtraNormal;
//     }
 
//     (sub?.addOns || []).forEach((line) => {
//       const item = (catalog || []).find((a) => a.addOnCode === line.addOnCode);
//       if (item && item.addOnCode !== "USER_ADMIN" && item.addOnCode !== "USER_NORMAL") {
//         t += (perCycleRateFor(item, billingCycle) || 0) * line.quantity;
//       }
//     });
 
//     return t;
//   }, [sub, catalog, starter, billingCycle, startingAdmin, startingNormal, adminCatalogItem, normalCatalogItem]);
 
//   const newTotal = useMemo(() => {
//     let t = starter ? (billingCycle === "ANNUAL" ? starter.priceAnnual : starter.priceHalfYearly) : 0;
 
//     const newExtraAdmin = Math.max(0, seats.adminUserCount - (starter?.includedAdminUsers ?? 1));
//     const newExtraNormal = Math.max(0, seats.normalUserCount - (starter?.includedNormalUsers ?? 4));
 
//     if (adminCatalogItem && newExtraAdmin > 0) {
//       t += (perCycleRateFor(adminCatalogItem, billingCycle) || 0) * newExtraAdmin;
//     }
//     if (normalCatalogItem && newExtraNormal > 0) {
//       t += (perCycleRateFor(normalCatalogItem, billingCycle) || 0) * newExtraNormal;
//     }
 
//     for (const item of orderedCatalog) {
//       const q = qty[item.addOnCode] || 0;
//       if (q > 0) t += (perCycleRateFor(item, billingCycle) || 0) * q;
//     }
 
//     return t;
//   }, [orderedCatalog, qty, starter, billingCycle, seats, adminCatalogItem, normalCatalogItem]);
 
//   const delta = newTotal - currentTotal;
//   const seatsChanged = seats.adminUserCount !== startingAdmin || seats.normalUserCount !== startingNormal;
 
//   // Per-add-on change list.
//   // - "remove": qty → 0, free cancel, no payment.
//   // - "checkout": ALWAYS_CHECKOUT_ON_INCREASE codes on any increase, or a
//   //   genuinely brand-new add-on (oldQty === 0) for anything else — needs a
//   //   fresh Razorpay authorization.
//   // - "topup": an increase on an add-on you already own that ISN'T in
//   //   ALWAYS_CHECKOUT_ON_INCREASE (DPIA / AI Impact / Vendor Mgmt) — charged
//   //   silently against the mandate on file.
//   // - "downgrade": a decrease that stays above zero — free, immediate.
//   const addOnChanges = useMemo(() => {
//     const changes = [];
//     for (const item of orderedCatalog) {
//       const oldQty = sub?.addOns?.find((l) => l.addOnCode === item.addOnCode)?.quantity || 0;
//       const newQty = qty[item.addOnCode] || 0;
//       if (newQty === oldQty) continue;
//       let action;
//       if (newQty === 0) action = "remove";
//       else if (oldQty === 0 || ALWAYS_CHECKOUT_ON_INCREASE.has(item.addOnCode)) action = newQty > oldQty ? "checkout" : "downgrade";
//       else action = newQty > oldQty ? "topup" : "downgrade";
//       changes.push({ item, oldQty, newQty, action });
//     }
//     return changes;
//   }, [orderedCatalog, qty, sub]);
 
//   // Seats are ordinary pay-now add-ons under the hood (USER_ADMIN /
//   // USER_NORMAL) — same action rules as ALWAYS_CHECKOUT_ON_INCREASE above,
//   // just sourced from the `seats` state instead of `qty`.
//   // Seats are ordinary pay-now add-ons under the hood (USER_ADMIN /
//   // USER_NORMAL). purchaseOrChangeAddOn's quantity means "units beyond what's
//   // included in Starter" — same convention the backend already uses — so we
//   // pass the EXTRA count here, not the raw seat total.
//   const seatChanges = useMemo(() => {
//     const changes = [];
//     const includedAdmin = starter?.includedAdminUsers ?? 1;
//     const includedNormal = starter?.includedNormalUsers ?? 4;
//     const oldExtraAdmin = Math.max(0, startingAdmin - includedAdmin);
//     const newExtraAdmin = Math.max(0, seats.adminUserCount - includedAdmin);
//     const oldExtraNormal = Math.max(0, startingNormal - includedNormal);
//     const newExtraNormal = Math.max(0, seats.normalUserCount - includedNormal);
 
//     if (adminCatalogItem && newExtraAdmin !== oldExtraAdmin) {
//       changes.push({
//         item: adminCatalogItem, oldQty: oldExtraAdmin, newQty: newExtraAdmin,
//         action: newExtraAdmin > oldExtraAdmin ? "checkout" : "downgrade",
//       });
//     }
//     if (normalCatalogItem && newExtraNormal !== oldExtraNormal) {
//       changes.push({
//         item: normalCatalogItem, oldQty: oldExtraNormal, newQty: newExtraNormal,
//         action: newExtraNormal > oldExtraNormal ? "checkout" : "downgrade",
//       });
//     }
//     return changes;
//   }, [seats, startingAdmin, startingNormal, starter, adminCatalogItem, normalCatalogItem]);
 
//   const addOnsChanged = addOnChanges.length > 0;
 
//   // How many NEW frameworks need to be picked for the FRAMEWORK_EXTRA
//   // quantity currently set on the stepper — includes any already-owned,
//   // still-unassigned paid slot (frameworksNeeded can be > 0 even with no
//   // quantity change this session).
//   const frameworksNeeded = Math.max(0, (qty[FRAMEWORK_EXTRA_CODE] || 0) - alreadyUnlockedExtraCount);
//   const frameworkSelectionSatisfied = frameworksNeeded === 0 || selectedNewFrameworkCodes.length === frameworksNeeded;
 
//   const hasChanges = seatsChanged || addOnsChanged || selectedNewFrameworkCodes.length > 0;
 
//   const setItemQty = (code, v) => {
//     setQty((q) => ({ ...q, [code]: Math.max(0, v) }));
//     if (code === FRAMEWORK_EXTRA_CODE) {
//       // Quantity moved — drop any selections that no longer fit so the
//       // picker never silently holds a stale over-selection.
//       setSelectedNewFrameworkCodes((prev) => prev.slice(0, Math.max(0, v - alreadyUnlockedExtraCount)));
//     }
//   };
//   const toggleCheckbox = (code) => setItemQty(code, (qty[code] || 0) > 0 ? 0 : 1);
 
//   const afterLabel = (oldV, newV, checkbox) => {
//     if (oldV === newV) return "—";
//     if (checkbox) return newV > 0 ? <span className="ms-after-badge">Added</span> : <span className="ms-after-badge ms-after-badge--removed">Removed</span>;
//     return <span className="ms-after-badge">{oldV} → {newV}</span>;
//   };
 
//   const handleProceedFromStep1 = () => setStep(2);
 
//   const handleConfirm = async () => {
//     setSaving(true);
//     setError("");
//     const results = [];
//     let chargedNow = 0;
//     const allChanges = [...seatChanges, ...addOnChanges];
 
//     try {
//       // 1. Removals — free, immediate, safe to do first.
//       for (const { item } of allChanges.filter((c) => c.action === "remove")) {
//         setProcessingLabel(`Removing ${item.displayName}…`);
//         try {
//           await removeAddOn(item.addOnCode);
//           results.push({ label: item.displayName, status: "ok" });
//         } catch (err) {
//           results.push({ label: item.displayName, status: "failed", detail: err?.response?.data?.error || err?.message || "Couldn't remove this add-on." });
//         }
//       }
 
//       // 2. Downgrades — free, immediate, no payment.
//       for (const { item, newQty } of allChanges.filter((c) => c.action === "downgrade")) {
//         setProcessingLabel(`Updating ${item.displayName}…`);
//         try {
//           await purchaseOrChangeAddOn(item.addOnCode, newQty);
//           results.push({ label: item.displayName, status: "ok" });
//         } catch (err) {
//           results.push({ label: item.displayName, status: "failed", detail: err?.response?.data?.error || err?.message || "Couldn't update this add-on." });
//         }
//       }
 
//       // 3. Silent mandate top-ups (DPIA / AI Impact / Vendor Mgmt only).
//       for (const { item, oldQty, newQty } of allChanges.filter((c) => c.action === "topup")) {
//         setProcessingLabel(`Updating ${item.displayName}…`);
//         try {
//           await purchaseOrChangeAddOn(item.addOnCode, newQty);
//           chargedNow += (perCycleRateFor(item, billingCycle) || 0) * (newQty - oldQty);
//           results.push({ label: item.displayName, status: "ok" });
//         } catch (err) {
//           results.push({ label: item.displayName, status: "failed", detail: err?.response?.data?.error || err?.message || "Couldn't charge this add-on's top-up." });
//         }
//       }
 
//       // 4. Pay-now checkouts — seats & Integration on every increase, plus any
//       // brand-new DPIA/AI Impact/Vendor add-on. Strictly sequential: Checkout.js
//       // only ever shows one modal at a time.
//       for (const { item, newQty } of allChanges.filter((c) => c.action === "checkout")) {
//         setProcessingLabel(`Authorizing ${item.displayName}…`);
//         try {
//           const session = await purchaseOrChangeAddOn(item.addOnCode, newQty);
//           await new Promise((resolve, reject) => {
//             openRazorpayCheckout(session, {
//               description: item.displayName,
//               onSuccess: resolve,
//               onDismiss: () => reject(new Error("Payment window closed before completing.")),
//               onError: reject,
//             });
//           });
//           results.push({ label: item.displayName, status: "ok" });
//         } catch (err) {
//           results.push({ label: item.displayName, status: "failed", detail: err?.message || "Couldn't complete this add-on's payment." });
//           // Deliberately keep going — one declined/dismissed item shouldn't
//           // block the rest of the queue.
//         }
//       }
 
//       // 5. Assign any newly picked frameworks. Runs after the FRAMEWORK_EXTRA
//       // quantity change above (if any) has already gone through, whether
//       // that was a checkout, a topup, or no change at all this session
//       // (spare already-paid slot being assigned for the first time).
//       if (selectedNewFrameworkCodes.length > 0) {
//         setProcessingLabel("Assigning selected framework(s)…");
//         try {
//           const nextFrameworks = [...(orgFrameworks || []), ...selectedNewFrameworkCodes];
//           const updatedOrg = await updateOrganizationFrameworks(orgId, nextFrameworks);
//           setOrgFrameworks(Array.isArray(updatedOrg?.frameworks) ? updatedOrg.frameworks : nextFrameworks);
//           setSelectedNewFrameworkCodes([]);
//           results.push({ label: "Framework selection", status: "ok" });
//         } catch (err) {
//           results.push({
//             label: "Framework selection",
//             status: "failed",
//             detail: err?.response?.data?.error || err?.message || "Couldn't assign the selected framework(s).",
//           });
//         }
//       }
 
//       setItemResults(results);
//       setChargesNow(chargedNow);
//       setStep(3);
//     } finally {
//       setSaving(false);
//       setProcessingLabel("");
//     }
//   };
 
//   const handleDone = async () => {
//     await onComplete?.(itemResults);
//   };
 
//   const anyFailed = itemResults.some((r) => r.status === "failed");
 
//   return (
//     <div className="ms-modal-overlay" role="dialog" aria-modal="true">
//       <div className="ms-modal">
//         <button className="ms-modal-close" onClick={onClose} aria-label="Close" disabled={saving}>
//           <X size={18} />
//         </button>
 
//         <h2 className="ms-modal-title">
//           Manage your CalVant Subscription
//         </h2>
 
//         <div className="ms-stepper">
//           {STEPS.map((label, i) => (
//             <React.Fragment key={label}>
//               <div className={`ms-step ${step === i + 1 ? "ms-step--active" : step > i + 1 ? "ms-step--done" : ""}`}>
//                 <span className="ms-step-dot" />
//                 <span className="ms-step-label">{i === 0 ? (mode === "downgrade" ? "Downgrade Add-Ons" : label) : label}</span>
//               </div>
//               {i < STEPS.length - 1 && <span className="ms-step-line" />}
//             </React.Fragment>
//           ))}
//         </div>
 
//         {error && <div className="ms-error">{error}</div>}
 
//         {step === 1 && (
//           <>
//             <div className="ms-table-wrap">
//               <table className="ms-table">
//                 <thead>
//                   <tr>
//                     <th>ITEM</th>
//                     <th>NO. OF UNITS</th>
//                     <th>AFTER ADDITION</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>
//                       <div className="ms-item-name">Additional admin users</div>
//                       <div className="ms-item-sub">Included: {starter?.includedAdminUsers ?? 1}</div>
//                     </td>
//                     <td>
//                       <NumberStepper
//                         value={seats.adminUserCount}
//                         min={minAdmin}
//                         max={maxAdmin}
//                         onChange={(v) => setSeats((s) => ({ ...s, adminUserCount: clamp(v, minAdmin, maxAdmin) }))}
//                       />
//                     </td>
//                     <td>{afterLabel(startingAdmin, seats.adminUserCount, false)}</td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <div className="ms-item-name">Additional normal users</div>
//                       <div className="ms-item-sub">Included: {starter?.includedNormalUsers ?? 4}</div>
//                     </td>
//                     <td>
//                       <NumberStepper
//                         value={seats.normalUserCount}
//                         min={minNormal}
//                         max={maxNormal}
//                         onChange={(v) => setSeats((s) => ({ ...s, normalUserCount: clamp(v, minNormal, maxNormal) }))}
//                       />
//                     </td>
//                     <td>{afterLabel(startingNormal, seats.normalUserCount, false)}</td>
//                   </tr>
 
//                   {orderedCatalog.map((item) => {
//                     const isCheckbox = controlTypeFor(item.addOnCode) === CONTROL_CHECKBOX;
//                     const oldQty = sub?.addOns?.find((l) => l.addOnCode === item.addOnCode)?.quantity || 0;
//                     const curQty = qty[item.addOnCode] || 0;
//                     const rate = perCycleRateFor(item, billingCycle);
//                     return (
//                       <React.Fragment key={item.addOnCode}>
//                       <tr>
//                         <td>
//                           <div className="ms-item-name">{item.displayName}</div>
//                           <div className="ms-item-sub">
//                             {formatINR(rate)} / {billingCycle === "ANNUAL" ? "yr" : "6mo"}
//                             {isCheckbox ? "" : " per unit"}
//                           </div>
//                         </td>
//                         <td>
//                           {isCheckbox ? (
//                             <label className="ms-checkbox">
//                               <input
//                                 type="checkbox"
//                                 checked={curQty > 0}
//                                 disabled={mode === "downgrade" && oldQty === 0}
//                                 onChange={() => toggleCheckbox(item.addOnCode)}
//                               />
//                             </label>
//                           ) : (
//                             <NumberStepper
//                               value={curQty}
//                               min={mode === "downgrade" ? 0 : oldQty}
//                               max={mode === "downgrade" ? oldQty : Infinity}
//                               onChange={(v) => setItemQty(item.addOnCode, v)}
//                             />
//                           )}
//                         </td>
//                         <td>{afterLabel(oldQty, curQty, isCheckbox)}</td>
//                       </tr>
//                       {item.addOnCode === FRAMEWORK_EXTRA_CODE && frameworksNeeded > 0 && (
//                         <tr className="ms-framework-picker-row">
//                           <td colSpan={3}>
//                             <div className="fw-picker">
//                               <div className="fw-picker-label">
//                                 Select {frameworksNeeded} framework{frameworksNeeded > 1 ? "s" : ""} to unlock
//                                 {" "}({selectedNewFrameworkCodes.length}/{frameworksNeeded} selected)
//                               </div>
//                               {frameworksLoading ? (
//                                 <div className="fw-picker-loading">
//                                   <Loader2 size={14} className="ms-spin" /> Loading frameworks…
//                                 </div>
//                               ) : lockedFrameworks.length === 0 ? (
//                                 <p className="ms-fineprint">No more frameworks available to unlock.</p>
//                               ) : (
//                                 <>
//                                   <select
//                                     className="fw-picker-select"
//                                     value=""
//                                     disabled={selectedNewFrameworkCodes.length >= frameworksNeeded}
//                                     onChange={(e) => {
//                                       if (e.target.value) toggleFrameworkSelection(e.target.value, frameworksNeeded);
//                                     }}
//                                   >
//                                     <option value="" disabled>
//                                       {selectedNewFrameworkCodes.length >= frameworksNeeded
//                                         ? "Selection complete"
//                                         : "Select a framework…"}
//                                     </option>
//                                     {lockedFrameworks
//                                       .filter((fw) => !selectedNewFrameworkCodes.includes((fw.code || "").toUpperCase()))
//                                       .map((fw) => {
//                                         const code = (fw.code || "").toUpperCase();
//                                         return (
//                                           <option key={code} value={code}>
//                                             {fw.label || code}
//                                           </option>
//                                         );
//                                       })}
//                                   </select>

//                                   {selectedNewFrameworkCodes.length > 0 && (
//                                     <div className="fw-picker-chips">
//                                       {selectedNewFrameworkCodes.map((code) => {
//                                         const fw = lockedFrameworks.find((f) => (f.code || "").toUpperCase() === code);
//                                         return (
//                                           <span key={code} className="fw-picker-chip">
//                                             {fw?.label || code}
//                                             <button
//                                               type="button"
//                                               className="fw-picker-chip-remove"
//                                               aria-label={`Remove ${fw?.label || code}`}
//                                               onClick={() => toggleFrameworkSelection(code, frameworksNeeded)}
//                                             >
//                                               <X size={12} />
//                                             </button>
//                                           </span>
//                                         );
//                                       })}
//                                     </div>
//                                   )}
//                                 </>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
 
//             <div className="ms-amount-block">
//               <div className="ms-amount-label">
//                 {delta > 0 ? "Estimated new per-cycle total" : delta < 0 ? "Estimated new per-cycle total (lower)" : "No change in amount"}
//               </div>
//               <div className="ms-amount-value">{formatINR(Math.abs(delta))}</div>
//             </div>
 
//             <div className="ms-modal-actions">
//               <button className="ms-btn ms-btn--outline" onClick={onClose}>CANCEL</button>
//               <button
//                 className="ms-btn ms-btn--primary"
//                 disabled={!hasChanges || !frameworkSelectionSatisfied}
//                 title={!frameworkSelectionSatisfied ? "Select a framework for each additional slot before proceeding" : undefined}
//                 onClick={handleProceedFromStep1}
//               >
//                 PROCEED
//               </button>
//             </div>
//           </>
//         )}
 
//         {step === 2 && (
//           <>
//             <button className="ms-back-link" onClick={() => setStep(1)}>
//               <ChevronLeft size={15} /> Back
//             </button>
//             <div className="ms-confirm-summary">
//               <h3>Review your changes</h3>
//               {seatsChanged && (
//                 <>
//                   <div className="ms-confirm-row">
//                     <span>Admin users</span>
//                     <span>{startingAdmin} → {seats.adminUserCount}</span>
//                   </div>
//                   <div className="ms-confirm-row">
//                     <span>Normal users</span>
//                     <span>{startingNormal} → {seats.normalUserCount}</span>
//                   </div>
//                   <div className="ms-confirm-note">
//                     Adding seats opens a quick Razorpay payment screen per change; reducing
//                     seats takes effect immediately with nothing to authorize.
//                   </div>
//                 </>
//               )}
//               {addOnChanges.map(({ item, oldQty, newQty, action }) => (
//                 <div className="ms-confirm-row" key={item.addOnCode}>
//                   <span>{item.displayName}</span>
//                   <span>{oldQty} → {newQty}</span>
//                 </div>
//               ))}
//               {selectedNewFrameworkCodes.length > 0 && (
//                 <div className="ms-confirm-row">
//                   <span>Frameworks selected</span>
//                   <span>
//                     {selectedNewFrameworkCodes
//                       .map((code) => lockedFrameworks.find((fw) => (fw.code || "").toUpperCase() === code)?.label || code)
//                       .join(", ")}
//                   </span>
//                 </div>
//               )}
//               {addOnsChanged && (
//                 <div className="ms-confirm-note">
//                   {addOnChanges.some((c) => c.action === "checkout") && (
//                     <>New add-ons, and any increase to Integration, open a quick Razorpay
//                       payment screen — one after another. </>
//                   )}
//                   {addOnChanges.some((c) => c.action === "topup") && (
//                     <>Increases to DPIA / AI Impact / Vendor Mgmt you already own are charged
//                       automatically against your mandate on file — no separate payment screen. </>
//                   )}
//                   {addOnChanges.some((c) => c.action === "downgrade" || c.action === "remove") && (
//                     <>Reduced or removed add-ons take effect immediately with nothing to authorize.</>
//                   )}
//                 </div>
//               )}
//               <div className="ms-confirm-row ms-confirm-row--total">
//                 <span>Estimated new per-cycle total</span>
//                 <span>{formatINR(newTotal)}</span>
//               </div>
//             </div>
//             <div className="ms-modal-actions">
//               <button className="ms-btn ms-btn--outline" onClick={onClose} disabled={saving}>CANCEL</button>
//               <button className="ms-btn ms-btn--primary" disabled={saving} onClick={handleConfirm}>
//                 {saving ? (
//                   <span className="ms-processing">
//                     <Loader2 size={15} className="ms-spin" /> {processingLabel || "Processing…"}
//                   </span>
//                 ) : "CONFIRM & PROCEED"}
//               </button>
//             </div>
//           </>
//         )}
 
//         {step === 3 && (
//           <div className="ms-confirmation">
//             {anyFailed ? (
//               <AlertTriangle size={44} className="ms-confirmation-icon ms-confirmation-icon--warn" />
//             ) : (
//               <CheckCircle2 size={44} className="ms-confirmation-icon" />
//             )}
//             <h3>{anyFailed ? "Some changes need another look" : mode === "downgrade" ? "Downgrade scheduled" : "Subscription updated"}</h3>
 
//             {itemResults.length > 0 && (
//               <ul className="ms-result-list">
//                 {itemResults.map((r, i) => (
//                   <li key={i} className={r.status === "failed" ? "ms-result-item--failed" : "ms-result-item--ok"}>
//                     <span>{r.label}</span>
//                     <span>{r.status === "ok" ? "Done" : (r.detail || "Failed")}</span>
//                   </li>
//                 ))}
//               </ul>
//             )}
 
//             <p>
//               {chargesNow > 0 && `${formatINR(chargesNow)} was charged for your mandate top-up(s). `}
//               {anyFailed
//                 ? "You can retry the failed item(s) from Manage Subscription — everything else above already took effect."
//                 : "Your changes have been saved. New quantities on pay-now items will reflect once payment is confirmed (usually within moments)."}
//             </p>
//             <button className="ms-btn ms-btn--primary" onClick={handleDone}>Done</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
 
// function NumberStepper({ value, min = 0, max = Infinity, onChange }) {
//   return (
//     <div className="ms-stepper-control">
//       <button type="button" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
//       <span>{value}</span>
//       <button type="button" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
//     </div>
//   );
// }


'use client'
 
import React, { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, Loader2, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { purchaseOrChangeAddOn, removeAddOn } from "../../api/adminBillingApi";
import {
  ALLOWED_FRAMEWORK_CODES,
  getOrganization,
  updateOrganizationFrameworks,
  fetchFrameworkLibrary,
} from "../../api/adminFrameworkStoreApi";
import { formatINR, perCycleRateFor } from "@/modules/billing/utils/billingFormat";
import { openRazorpayCheckout } from "./razorpayHelpers";
import { controlTypeFor, CONTROL_CHECKBOX, WIZARD_ADDON_ORDER } from "./subscriptionCatalogConfig";
import "./ManageSubscription.css";
 
const STEPS = ["Upgrade Add-Ons", "Confirm Order", "Confirmation"];
 
const FRAMEWORK_EXTRA_CODE = "FRAMEWORK_EXTRA";
 
// Product rule: for these add-ons every quantity INCREASE is a fresh,
// pay-now Razorpay checkout (its own add-on subscription) — no mandate
// memory. Seats: add 1 today, pay; add 4 more tomorrow, pay again.
// Integration follows the same rule.
// Everything else (DPIA, AI Impact, Vendor Mgmt) is "pay once, mandate
// remembers": first purchase needs checkout, later increases are silently
// charged against the mandate on file (the "topup" action below).
const ALWAYS_CHECKOUT_ON_INCREASE = new Set(["USER_ADMIN", "USER_NORMAL", "INTEGRATION_STANDARD"]);
 
/**
 * mode: "upgrade" | "downgrade" — only changes step-1 title/copy and which
 * direction the steppers move; handleConfirm is identical either way.
 *
 * Seats no longer go through a separate updateSeats PATCH — they're treated
 * as ordinary catalog add-ons (USER_ADMIN / USER_NORMAL) that always require
 * a fresh Razorpay checkout on increase, same pipeline as every other add-on.
 */
export default function UpgradeAddOnsWizard({ mode = "upgrade", sub, starter, catalog, billingCycle, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [seats, setSeats] = useState({
    adminUserCount: sub?.adminUserCount ?? starter?.includedAdminUsers ?? 1,
    normalUserCount: sub?.normalUserCount ?? starter?.includedNormalUsers ?? 4,
  });
  const [qty, setQty] = useState(() => {
    const q = {};
    (sub?.addOns || []).forEach((line) => { q[line.addOnCode] = line.quantity; });
    return q;
  });
  const [saving, setSaving] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [error, setError] = useState("");
  const [itemResults, setItemResults] = useState([]); // [{ label, status: "ok"|"failed", detail? }]
  const [chargesNow, setChargesNow] = useState(0);
 
  // ── Framework picker (for the FRAMEWORK_EXTRA row) ──────────────────────
  // Same data BuyFrameworkModal.jsx loads — org's currently-active frameworks
  // plus the full framework library — so a slot bought here can be assigned
  // to a specific framework right in this screen instead of requiring a
  // separate trip to "Buy a Framework".
  const [orgFrameworks, setOrgFrameworks] = useState(null); // null = not loaded yet
  const [frameworkLibrary, setFrameworkLibrary] = useState([]);
  const [frameworksLoading, setFrameworksLoading] = useState(true);
  const [selectedNewFrameworkCodes, setSelectedNewFrameworkCodes] = useState([]);
 
  const orgId = sub?.orgId;
 
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFrameworksLoading(true);
      try {
        const [org, lib] = await Promise.all([
          orgId ? getOrganization(orgId) : Promise.resolve(null),
          fetchFrameworkLibrary(),
        ]);
        if (cancelled) return;
        setOrgFrameworks(Array.isArray(org?.frameworks) ? org.frameworks : []);
        setFrameworkLibrary(lib);
      } catch (err) {
        console.error(err);
        if (!cancelled) setOrgFrameworks((prev) => prev ?? []);
      } finally {
        if (!cancelled) setFrameworksLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);
 
  const ownedCodesUpper = useMemo(
    () => new Set((orgFrameworks || []).map((c) => (c || "").toUpperCase())),
    [orgFrameworks]
  );

  // Human-readable names for every framework the org already owns — shown
  // next to the framework-slot row so the person can see what they bought
  // instead of just a bare unit count.
  const ownedFrameworkLabels = useMemo(
    () => (orgFrameworks || []).map((code) => {
      const fw = (frameworkLibrary || []).find(
        (f) => (f.code || "").toUpperCase() === (code || "").toUpperCase()
      );
      return fw?.label || code;
    }),
    [orgFrameworks, frameworkLibrary]
  );
 
  // Only frameworks the backend will actually accept on org.frameworks —
  // same allowlist BuyFrameworkModal filters against.
  const lockedFrameworks = useMemo(
    () => (frameworkLibrary || [])
      .filter((fw) => ALLOWED_FRAMEWORK_CODES.includes((fw.code || "").toUpperCase()))
      .filter((fw) => !ownedCodesUpper.has((fw.code || "").toUpperCase())),
    [frameworkLibrary, ownedCodesUpper]
  );
 
  const includedFrameworkCount = starter?.includedFrameworkChoiceCount ?? 1;
  // Extra frameworks already assigned beyond the included one — these
  // already occupy a paid FRAMEWORK_EXTRA slot, so they don't need a new
  // selection.
  const alreadyUnlockedExtraCount = Math.max(0, ownedCodesUpper.size - includedFrameworkCount);
 
  const toggleFrameworkSelection = (code, maxSelectable) => {
    setSelectedNewFrameworkCodes((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code);
      if (prev.length >= maxSelectable) return prev;
      return [...prev, code];
    });
  };
 
  const orderedCatalog = useMemo(() => {
    const byCode = {};
    (catalog || []).forEach((a) => { if (a.billingType === "PER_UNIT_MONTHLY") byCode[a.addOnCode] = a; });
    return WIZARD_ADDON_ORDER.map((code) => byCode[code]).filter(Boolean);
  }, [catalog]);
 
  const adminCatalogItem = useMemo(
    () => (catalog || []).find((a) => a.addOnCode === "USER_ADMIN"),
    [catalog]
  );
  const normalCatalogItem = useMemo(
    () => (catalog || []).find((a) => a.addOnCode === "USER_NORMAL"),
    [catalog]
  );
 
  const startingAdmin = sub?.adminUserCount ?? starter?.includedAdminUsers ?? 1;
  const startingNormal = sub?.normalUserCount ?? starter?.includedNormalUsers ?? 4;
  const minAdmin = mode === "downgrade" ? (starter?.includedAdminUsers ?? 1) : startingAdmin;
  const maxAdmin = mode === "downgrade" ? startingAdmin : Infinity;
  const minNormal = mode === "downgrade" ? (starter?.includedNormalUsers ?? 4) : startingNormal;
  const maxNormal = mode === "downgrade" ? startingNormal : Infinity;
 
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
 
  const currentTotal = useMemo(() => {
    let t = starter ? (billingCycle === "ANNUAL" ? starter.priceAnnual : starter.priceHalfYearly) : 0;
 
    const currentExtraAdmin = Math.max(0, startingAdmin - (starter?.includedAdminUsers ?? 1));
    const currentExtraNormal = Math.max(0, startingNormal - (starter?.includedNormalUsers ?? 4));
 
    if (adminCatalogItem && currentExtraAdmin > 0) {
      t += (perCycleRateFor(adminCatalogItem, billingCycle) || 0) * currentExtraAdmin;
    }
    if (normalCatalogItem && currentExtraNormal > 0) {
      t += (perCycleRateFor(normalCatalogItem, billingCycle) || 0) * currentExtraNormal;
    }
 
    (sub?.addOns || []).forEach((line) => {
      const item = (catalog || []).find((a) => a.addOnCode === line.addOnCode);
      if (item && item.addOnCode !== "USER_ADMIN" && item.addOnCode !== "USER_NORMAL") {
        t += (perCycleRateFor(item, billingCycle) || 0) * line.quantity;
      }
    });
 
    return t;
  }, [sub, catalog, starter, billingCycle, startingAdmin, startingNormal, adminCatalogItem, normalCatalogItem]);
 
  const newTotal = useMemo(() => {
    let t = starter ? (billingCycle === "ANNUAL" ? starter.priceAnnual : starter.priceHalfYearly) : 0;
 
    const newExtraAdmin = Math.max(0, seats.adminUserCount - (starter?.includedAdminUsers ?? 1));
    const newExtraNormal = Math.max(0, seats.normalUserCount - (starter?.includedNormalUsers ?? 4));
 
    if (adminCatalogItem && newExtraAdmin > 0) {
      t += (perCycleRateFor(adminCatalogItem, billingCycle) || 0) * newExtraAdmin;
    }
    if (normalCatalogItem && newExtraNormal > 0) {
      t += (perCycleRateFor(normalCatalogItem, billingCycle) || 0) * newExtraNormal;
    }
 
    for (const item of orderedCatalog) {
      const q = qty[item.addOnCode] || 0;
      if (q > 0) t += (perCycleRateFor(item, billingCycle) || 0) * q;
    }
 
    return t;
  }, [orderedCatalog, qty, starter, billingCycle, seats, adminCatalogItem, normalCatalogItem]);
 
  const delta = newTotal - currentTotal;
  const seatsChanged = seats.adminUserCount !== startingAdmin || seats.normalUserCount !== startingNormal;
 
  // Per-add-on change list.
  // - "remove": qty → 0, free cancel, no payment.
  // - "checkout": ALWAYS_CHECKOUT_ON_INCREASE codes on any increase, or a
  //   genuinely brand-new add-on (oldQty === 0) for anything else — needs a
  //   fresh Razorpay authorization.
  // - "topup": an increase on an add-on you already own that ISN'T in
  //   ALWAYS_CHECKOUT_ON_INCREASE (DPIA / AI Impact / Vendor Mgmt) — charged
  //   silently against the mandate on file.
  // - "downgrade": a decrease that stays above zero — free, immediate.
  const addOnChanges = useMemo(() => {
    const changes = [];
    for (const item of orderedCatalog) {
      const oldQty = sub?.addOns?.find((l) => l.addOnCode === item.addOnCode)?.quantity || 0;
      const newQty = qty[item.addOnCode] || 0;
      if (newQty === oldQty) continue;
      let action;
      if (newQty === 0) action = "remove";
      else if (oldQty === 0 || ALWAYS_CHECKOUT_ON_INCREASE.has(item.addOnCode)) action = newQty > oldQty ? "checkout" : "downgrade";
      else action = newQty > oldQty ? "topup" : "downgrade";
      changes.push({ item, oldQty, newQty, action });
    }
    return changes;
  }, [orderedCatalog, qty, sub]);
 
  // Seats are ordinary pay-now add-ons under the hood (USER_ADMIN /
  // USER_NORMAL) — same action rules as ALWAYS_CHECKOUT_ON_INCREASE above,
  // just sourced from the `seats` state instead of `qty`.
  // Seats are ordinary pay-now add-ons under the hood (USER_ADMIN /
  // USER_NORMAL). purchaseOrChangeAddOn's quantity means "units beyond what's
  // included in Starter" — same convention the backend already uses — so we
  // pass the EXTRA count here, not the raw seat total.
  const seatChanges = useMemo(() => {
    const changes = [];
    const includedAdmin = starter?.includedAdminUsers ?? 1;
    const includedNormal = starter?.includedNormalUsers ?? 4;
    const oldExtraAdmin = Math.max(0, startingAdmin - includedAdmin);
    const newExtraAdmin = Math.max(0, seats.adminUserCount - includedAdmin);
    const oldExtraNormal = Math.max(0, startingNormal - includedNormal);
    const newExtraNormal = Math.max(0, seats.normalUserCount - includedNormal);
 
    if (adminCatalogItem && newExtraAdmin !== oldExtraAdmin) {
      changes.push({
        item: adminCatalogItem, oldQty: oldExtraAdmin, newQty: newExtraAdmin,
        action: newExtraAdmin > oldExtraAdmin ? "checkout" : "downgrade",
      });
    }
    if (normalCatalogItem && newExtraNormal !== oldExtraNormal) {
      changes.push({
        item: normalCatalogItem, oldQty: oldExtraNormal, newQty: newExtraNormal,
        action: newExtraNormal > oldExtraNormal ? "checkout" : "downgrade",
      });
    }
    return changes;
  }, [seats, startingAdmin, startingNormal, starter, adminCatalogItem, normalCatalogItem]);
 
  const addOnsChanged = addOnChanges.length > 0;
 
  // How many NEW frameworks need to be picked for the FRAMEWORK_EXTRA
  // quantity currently set on the stepper — includes any already-owned,
  // still-unassigned paid slot (frameworksNeeded can be > 0 even with no
  // quantity change this session).
  const frameworksNeeded = Math.max(0, (qty[FRAMEWORK_EXTRA_CODE] || 0) - alreadyUnlockedExtraCount);
  const frameworkSelectionSatisfied = frameworksNeeded === 0 || selectedNewFrameworkCodes.length === frameworksNeeded;
 
  const hasChanges = seatsChanged || addOnsChanged || selectedNewFrameworkCodes.length > 0;
 
  const setItemQty = (code, v) => {
    setQty((q) => ({ ...q, [code]: Math.max(0, v) }));
    if (code === FRAMEWORK_EXTRA_CODE) {
      // Quantity moved — drop any selections that no longer fit so the
      // picker never silently holds a stale over-selection.
      setSelectedNewFrameworkCodes((prev) => prev.slice(0, Math.max(0, v - alreadyUnlockedExtraCount)));
    }
  };
  const toggleCheckbox = (code) => setItemQty(code, (qty[code] || 0) > 0 ? 0 : 1);
 
  const afterLabel = (oldV, newV, checkbox) => {
    if (oldV === newV) return "—";
    if (checkbox) return newV > 0 ? <span className="ms-after-badge">Added</span> : <span className="ms-after-badge ms-after-badge--removed">Removed</span>;
    return <span className="ms-after-badge">{oldV} → {newV}</span>;
  };
 
  const handleProceedFromStep1 = () => setStep(2);
 
  const handleConfirm = async () => {
    setSaving(true);
    setError("");
    const results = [];
    let chargedNow = 0;
    const allChanges = [...seatChanges, ...addOnChanges];
 
    try {
      // 1. Removals — free, immediate, safe to do first.
      for (const { item } of allChanges.filter((c) => c.action === "remove")) {
        setProcessingLabel(`Removing ${item.displayName}…`);
        try {
          await removeAddOn(item.addOnCode);
          results.push({ label: item.displayName, status: "ok" });
        } catch (err) {
          results.push({ label: item.displayName, status: "failed", detail: err?.response?.data?.error || err?.message || "Couldn't remove this add-on." });
        }
      }
 
      // 2. Downgrades — free, immediate, no payment.
      for (const { item, newQty } of allChanges.filter((c) => c.action === "downgrade")) {
        setProcessingLabel(`Updating ${item.displayName}…`);
        try {
          await purchaseOrChangeAddOn(item.addOnCode, newQty);
          results.push({ label: item.displayName, status: "ok" });
        } catch (err) {
          results.push({ label: item.displayName, status: "failed", detail: err?.response?.data?.error || err?.message || "Couldn't update this add-on." });
        }
      }
 
      // 3. Silent mandate top-ups (DPIA / AI Impact / Vendor Mgmt only).
      for (const { item, oldQty, newQty } of allChanges.filter((c) => c.action === "topup")) {
        setProcessingLabel(`Updating ${item.displayName}…`);
        try {
          await purchaseOrChangeAddOn(item.addOnCode, newQty);
          chargedNow += (perCycleRateFor(item, billingCycle) || 0) * (newQty - oldQty);
          results.push({ label: item.displayName, status: "ok" });
        } catch (err) {
          results.push({ label: item.displayName, status: "failed", detail: err?.response?.data?.error || err?.message || "Couldn't charge this add-on's top-up." });
        }
      }
 
      // 4. Pay-now checkouts — seats & Integration on every increase, plus any
      // brand-new DPIA/AI Impact/Vendor add-on. Strictly sequential: Checkout.js
      // only ever shows one modal at a time.
      for (const { item, newQty } of allChanges.filter((c) => c.action === "checkout")) {
        setProcessingLabel(`Authorizing ${item.displayName}…`);
        try {
          const session = await purchaseOrChangeAddOn(item.addOnCode, newQty);
          await new Promise((resolve, reject) => {
            openRazorpayCheckout(session, {
              description: item.displayName,
              onSuccess: resolve,
              onDismiss: () => reject(new Error("Payment window closed before completing.")),
              onError: reject,
            });
          });
          results.push({ label: item.displayName, status: "ok" });
        } catch (err) {
          results.push({ label: item.displayName, status: "failed", detail: err?.message || "Couldn't complete this add-on's payment." });
          // Deliberately keep going — one declined/dismissed item shouldn't
          // block the rest of the queue.
        }
      }
 
      // 5. Assign any newly picked frameworks. Runs after the FRAMEWORK_EXTRA
      // quantity change above (if any) has already gone through, whether
      // that was a checkout, a topup, or no change at all this session
      // (spare already-paid slot being assigned for the first time).
      if (selectedNewFrameworkCodes.length > 0) {
        setProcessingLabel("Assigning selected framework(s)…");
        try {
          const nextFrameworks = [...(orgFrameworks || []), ...selectedNewFrameworkCodes];
          const updatedOrg = await updateOrganizationFrameworks(orgId, nextFrameworks);
          setOrgFrameworks(Array.isArray(updatedOrg?.frameworks) ? updatedOrg.frameworks : nextFrameworks);
          setSelectedNewFrameworkCodes([]);
          results.push({ label: "Framework selection", status: "ok" });
        } catch (err) {
          results.push({
            label: "Framework selection",
            status: "failed",
            detail: err?.response?.data?.error || err?.message || "Couldn't assign the selected framework(s).",
          });
        }
      }
 
      setItemResults(results);
      setChargesNow(chargedNow);
      setStep(3);
    } finally {
      setSaving(false);
      setProcessingLabel("");
    }
  };
 
  const handleDone = async () => {
    await onComplete?.(itemResults);
  };
 
  const anyFailed = itemResults.some((r) => r.status === "failed");
 
  return (
    <div className="ms-modal-overlay" role="dialog" aria-modal="true">
      <div className="ms-modal">
        <button className="ms-modal-close" onClick={onClose} aria-label="Close" disabled={saving}>
          <X size={18} />
        </button>
 
        <h2 className="ms-modal-title">
          Manage your CalVant Subscription
        </h2>
 
        <div className="ms-stepper">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`ms-step ${step === i + 1 ? "ms-step--active" : step > i + 1 ? "ms-step--done" : ""}`}>
                <span className="ms-step-dot" />
                <span className="ms-step-label">{i === 0 ? (mode === "downgrade" ? "Downgrade Add-Ons" : label) : label}</span>
              </div>
              {i < STEPS.length - 1 && <span className="ms-step-line" />}
            </React.Fragment>
          ))}
        </div>
 
        {error && <div className="ms-error">{error}</div>}
 
        {step === 1 && (
          <>
            <div className="ms-table-wrap">
              <table className="ms-table">
                <thead>
                  <tr>
                    <th>ITEM</th>
                    <th>NO. OF UNITS</th>
                    <th>AFTER ADDITION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="ms-item-name">Additional admin users</div>
                      <div className="ms-item-sub">Included: {starter?.includedAdminUsers ?? 1}</div>
                    </td>
                    <td>
                      <NumberStepper
                        value={seats.adminUserCount}
                        min={minAdmin}
                        max={maxAdmin}
                        onChange={(v) => setSeats((s) => ({ ...s, adminUserCount: clamp(v, minAdmin, maxAdmin) }))}
                      />
                    </td>
                    <td>{afterLabel(startingAdmin, seats.adminUserCount, false)}</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="ms-item-name">Additional normal users</div>
                      <div className="ms-item-sub">Included: {starter?.includedNormalUsers ?? 4}</div>
                    </td>
                    <td>
                      <NumberStepper
                        value={seats.normalUserCount}
                        min={minNormal}
                        max={maxNormal}
                        onChange={(v) => setSeats((s) => ({ ...s, normalUserCount: clamp(v, minNormal, maxNormal) }))}
                      />
                    </td>
                    <td>{afterLabel(startingNormal, seats.normalUserCount, false)}</td>
                  </tr>
 
                  {orderedCatalog.map((item) => {
                    const isCheckbox = controlTypeFor(item.addOnCode) === CONTROL_CHECKBOX;
                    const oldQty = sub?.addOns?.find((l) => l.addOnCode === item.addOnCode)?.quantity || 0;
                    const curQty = qty[item.addOnCode] || 0;
                    const rate = perCycleRateFor(item, billingCycle);
                    return (
                      <React.Fragment key={item.addOnCode}>
                      <tr>
                        <td>
                          <div className="ms-item-name">{item.displayName}</div>
                          <div className="ms-item-sub">
                            {formatINR(rate)} / {billingCycle === "ANNUAL" ? "yr" : "6mo"}
                            {isCheckbox ? "" : " per unit"}
                          </div>
                          {item.addOnCode === FRAMEWORK_EXTRA_CODE && ownedFrameworkLabels.length > 0 && (
                            <div className="ms-item-sub ms-item-sub--owned">
                              Currently unlocked: {ownedFrameworkLabels.join(", ")}
                            </div>
                          )}
                        </td>
                        <td>
                          {isCheckbox ? (
                            <label className="ms-checkbox">
                              <input
                                type="checkbox"
                                checked={curQty > 0}
                                disabled={mode === "downgrade" && oldQty === 0}
                                onChange={() => toggleCheckbox(item.addOnCode)}
                              />
                            </label>
                          ) : (
                            <NumberStepper
                              value={curQty}
                              min={mode === "downgrade" ? 0 : oldQty}
                              max={mode === "downgrade" ? oldQty : Infinity}
                              onChange={(v) => setItemQty(item.addOnCode, v)}
                            />
                          )}
                        </td>
                        <td>{afterLabel(oldQty, curQty, isCheckbox)}</td>
                      </tr>
                      {item.addOnCode === FRAMEWORK_EXTRA_CODE && frameworksNeeded > 0 && (
                        <tr className="ms-framework-picker-row">
                          <td colSpan={3}>
                            <div className="fw-picker">
                              <div className="fw-picker-label">
                                Select {frameworksNeeded} framework{frameworksNeeded > 1 ? "s" : ""} to unlock
                                {" "}({selectedNewFrameworkCodes.length}/{frameworksNeeded} selected)
                              </div>
                              {frameworksLoading ? (
                                <div className="fw-picker-loading">
                                  <Loader2 size={14} className="ms-spin" /> Loading frameworks…
                                </div>
                              ) : lockedFrameworks.length === 0 ? (
                                <p className="ms-fineprint">No more frameworks available to unlock.</p>
                              ) : (
                                <>
                                  <select
                                    className="fw-picker-select"
                                    value=""
                                    disabled={selectedNewFrameworkCodes.length >= frameworksNeeded}
                                    onChange={(e) => {
                                      if (e.target.value) toggleFrameworkSelection(e.target.value, frameworksNeeded);
                                    }}
                                  >
                                    <option value="" disabled>
                                      {selectedNewFrameworkCodes.length >= frameworksNeeded
                                        ? "Selection complete"
                                        : "Select a framework…"}
                                    </option>
                                    {lockedFrameworks
                                      .filter((fw) => !selectedNewFrameworkCodes.includes((fw.code || "").toUpperCase()))
                                      .map((fw) => {
                                        const code = (fw.code || "").toUpperCase();
                                        return (
                                          <option key={code} value={code}>
                                            {fw.label || code}
                                          </option>
                                        );
                                      })}
                                  </select>

                                  {selectedNewFrameworkCodes.length > 0 && (
                                    <div className="fw-picker-chips">
                                      {selectedNewFrameworkCodes.map((code) => {
                                        const fw = lockedFrameworks.find((f) => (f.code || "").toUpperCase() === code);
                                        return (
                                          <span key={code} className="fw-picker-chip">
                                            {fw?.label || code}
                                            <button
                                              type="button"
                                              className="fw-picker-chip-remove"
                                              aria-label={`Remove ${fw?.label || code}`}
                                              onClick={() => toggleFrameworkSelection(code, frameworksNeeded)}
                                            >
                                              <X size={12} />
                                            </button>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
 
            <div className="ms-amount-block">
              <div className="ms-amount-label">
                {delta > 0 ? "Estimated new per-cycle total" : delta < 0 ? "Estimated new per-cycle total (lower)" : "No change in amount"}
              </div>
              <div className="ms-amount-value">{formatINR(Math.abs(delta))}</div>
            </div>
 
            <div className="ms-modal-actions">
              <button className="ms-btn ms-btn--outline" onClick={onClose}>CANCEL</button>
              <button
                className="ms-btn ms-btn--primary"
                disabled={!hasChanges || !frameworkSelectionSatisfied}
                title={!frameworkSelectionSatisfied ? "Select a framework for each additional slot before proceeding" : undefined}
                onClick={handleProceedFromStep1}
              >
                PROCEED
              </button>
            </div>
          </>
        )}
 
        {step === 2 && (
          <>
            <button className="ms-back-link" onClick={() => setStep(1)}>
              <ChevronLeft size={15} /> Back
            </button>
            <div className="ms-confirm-summary">
              <h3>Review your changes</h3>
              {seatsChanged && (
                <>
                  <div className="ms-confirm-row">
                    <span>Admin users</span>
                    <span>{startingAdmin} → {seats.adminUserCount}</span>
                  </div>
                  <div className="ms-confirm-row">
                    <span>Normal users</span>
                    <span>{startingNormal} → {seats.normalUserCount}</span>
                  </div>
                  <div className="ms-confirm-note">
                    Adding seats opens a quick Razorpay payment screen per change; reducing
                    seats takes effect immediately with nothing to authorize.
                  </div>
                </>
              )}
              {addOnChanges.map(({ item, oldQty, newQty, action }) => (
                <div className="ms-confirm-row" key={item.addOnCode}>
                  <span>{item.displayName}</span>
                  <span>{oldQty} → {newQty}</span>
                </div>
              ))}
              {selectedNewFrameworkCodes.length > 0 && (
                <div className="ms-confirm-row">
                  <span>Frameworks selected</span>
                  <span>
                    {selectedNewFrameworkCodes
                      .map((code) => lockedFrameworks.find((fw) => (fw.code || "").toUpperCase() === code)?.label || code)
                      .join(", ")}
                  </span>
                </div>
              )}
              {addOnsChanged && (
                <div className="ms-confirm-note">
                  {addOnChanges.some((c) => c.action === "checkout") && (
                    <>New add-ons, and any increase to Integration, open a quick Razorpay
                      payment screen — one after another. </>
                  )}
                  {addOnChanges.some((c) => c.action === "topup") && (
                    <>Increases to DPIA / AI Impact / Vendor Mgmt you already own are charged
                      automatically against your mandate on file — no separate payment screen. </>
                  )}
                  {addOnChanges.some((c) => c.action === "downgrade" || c.action === "remove") && (
                    <>Reduced or removed add-ons take effect immediately with nothing to authorize.</>
                  )}
                </div>
              )}
              <div className="ms-confirm-row ms-confirm-row--total">
                <span>Estimated new per-cycle total</span>
                <span>{formatINR(newTotal)}</span>
              </div>
            </div>
            <div className="ms-modal-actions">
              <button className="ms-btn ms-btn--outline" onClick={onClose} disabled={saving}>CANCEL</button>
              <button className="ms-btn ms-btn--primary" disabled={saving} onClick={handleConfirm}>
                {saving ? (
                  <span className="ms-processing">
                    <Loader2 size={15} className="ms-spin" /> {processingLabel || "Processing…"}
                  </span>
                ) : "CONFIRM & PROCEED"}
              </button>
            </div>
          </>
        )}
 
        {step === 3 && (
          <div className="ms-confirmation">
            {anyFailed ? (
              <AlertTriangle size={44} className="ms-confirmation-icon ms-confirmation-icon--warn" />
            ) : (
              <CheckCircle2 size={44} className="ms-confirmation-icon" />
            )}
            <h3>{anyFailed ? "Some changes need another look" : mode === "downgrade" ? "Downgrade scheduled" : "Subscription updated"}</h3>
 
            {itemResults.length > 0 && (
              <ul className="ms-result-list">
                {itemResults.map((r, i) => (
                  <li key={i} className={r.status === "failed" ? "ms-result-item--failed" : "ms-result-item--ok"}>
                    <span>{r.label}</span>
                    <span>{r.status === "ok" ? "Done" : (r.detail || "Failed")}</span>
                  </li>
                ))}
              </ul>
            )}
 
            <p>
              {chargesNow > 0 && `${formatINR(chargesNow)} was charged for your mandate top-up(s). `}
              {anyFailed
                ? "You can retry the failed item(s) from Manage Subscription — everything else above already took effect."
                : "Your changes have been saved. New quantities on pay-now items will reflect once payment is confirmed (usually within moments)."}
            </p>
            <button className="ms-btn ms-btn--primary" onClick={handleDone}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
 
function NumberStepper({ value, min = 0, max = Infinity, onChange }) {
  return (
    <div className="ms-stepper-control">
      <button type="button" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span>{value}</span>
      <button type="button" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}