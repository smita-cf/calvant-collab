'use client'

import React, { useEffect, useMemo, useState } from "react";
import { X, Loader2, CheckCircle2, Lock } from "lucide-react";
import { purchaseOrChangeAddOn } from "../../api/adminBillingApi";
import {
  ALLOWED_FRAMEWORK_CODES,
  getOrganization,
  updateOrganizationFrameworks,
  fetchFrameworkLibrary,
} from "../../api/adminFrameworkStoreApi";
import { formatINR, perCycleRateFor } from "@/modules/billing/utils/billingFormat";
import { openRazorpayCheckout } from "./razorpayHelpers";
import "./ManageSubscription.css";

/**
 * "Buy a Framework" — the missing piece of the fulfillment feature: the
 * Starter Package includes exactly one framework of choice
 * (starter.includedFrameworkChoiceCount); this modal is how an org unlocks
 * any of the others.
 *
 * Deliberately does NOT touch UpgradeAddOnsWizard.jsx's generic
 * quantity-only stepper (FRAMEWORK_EXTRA is also listed there now, via
 * WIZARD_ADDON_ORDER, for admins who just want to buy raw slots) — this
 * component is the framework-*identity* picker on top of that same
 * mechanism, since AddOnLineItem only tracks a quantity, never which
 * framework(s) a purchased slot actually corresponds to.
 *
 * Purchase rule mirrors UpgradeAddOnsWizard's own checkout-vs-topup split
 * exactly (see its ALWAYS_CHECKOUT_ON_INCREASE comment): the very first
 * FRAMEWORK_EXTRA unit ever bought needs a fresh Razorpay authorization;
 * every unit after that is charged silently against the mandate already on
 * file. FRAMEWORK_EXTRA is not a "pay now every time" code, so increases
 * beyond the first follow the same "pay once, mandate remembers" rule as
 * DPIA / AI Impact / Vendor Mgmt.
 */
export default function BuyFrameworkModal({ sub, starter, catalog, billingCycle, onClose, onComplete }) {
  const [orgFrameworks, setOrgFrameworks] = useState(null); // null = not loaded yet
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [unlockingCode, setUnlockingCode] = useState(null);
  const [selectedCode, setSelectedCode] = useState("");

  const orgId = sub?.orgId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [org, lib] = await Promise.all([
          orgId ? getOrganization(orgId) : Promise.resolve(null),
          fetchFrameworkLibrary(),
        ]);
        if (cancelled) return;
        setOrgFrameworks(Array.isArray(org?.frameworks) ? org.frameworks : []);
        setLibrary(lib);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError("Couldn't load the framework library. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  const frameworkAddOn = useMemo(
    () => (catalog || []).find((a) => a.addOnCode === "FRAMEWORK_EXTRA"),
    [catalog]
  );

  const ownedExtraSlots = useMemo(
    () => sub?.addOns?.find((l) => l.addOnCode === "FRAMEWORK_EXTRA")?.quantity || 0,
    [sub]
  );

  const includedFrameworkCount = starter?.includedFrameworkChoiceCount ?? 1;

  const ownedCodesUpper = useMemo(
    () => new Set((orgFrameworks || []).map((c) => (c || "").toUpperCase())),
    [orgFrameworks]
  );

  // How many of the FRAMEWORK_EXTRA units already paid for haven't been
  // assigned to a framework yet — those unlock for free (no new Razorpay
  // authorization, no new mandate charge), since they were already paid for.
  const unlockedExtraCount = Math.max(0, ownedCodesUpper.size - includedFrameworkCount);
  const availableUnusedSlots = Math.max(0, ownedExtraSlots - unlockedExtraCount);

  // Only frameworks the backend will actually accept on org.frameworks (see
  // ALLOWED_FRAMEWORK_CODES javadoc) are offered for purchase, even if the
  // library returns more.
  const purchasableLibrary = useMemo(
    () => (library || []).filter((fw) => ALLOWED_FRAMEWORK_CODES.includes((fw.code || "").toUpperCase())),
    [library]
  );

  const lockedFrameworks = purchasableLibrary.filter((fw) => !ownedCodesUpper.has((fw.code || "").toUpperCase()));
  const unlockedFrameworks = purchasableLibrary.filter((fw) => ownedCodesUpper.has((fw.code || "").toUpperCase()));

  // Keep the dropdown pointed at a valid, still-locked framework.
  useEffect(() => {
    if (lockedFrameworks.length === 0) {
      setSelectedCode("");
      return;
    }
    if (!lockedFrameworks.some((fw) => fw.code === selectedCode)) {
      setSelectedCode(lockedFrameworks[0].code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedFrameworks.map((fw) => fw.code).join(",")]);

  const selectedFramework = lockedFrameworks.find((fw) => fw.code === selectedCode) || null;

  const perCycleRate = frameworkAddOn ? perCycleRateFor(frameworkAddOn, billingCycle) : null;
  const cycleSuffix = billingCycle === "ANNUAL" ? "/yr" : "/6mo";

  const handleUnlock = async (fw) => {
    const code = (fw.code || "").toUpperCase();
    setUnlockingCode(code);
    setError("");
    setMessage("");
    try {
      const needsNewSlot = availableUnusedSlots <= 0;

      if (needsNewSlot) {
        const isFirstPurchase = ownedExtraSlots === 0;
        const session = await purchaseOrChangeAddOn("FRAMEWORK_EXTRA", ownedExtraSlots + 1);
        if (isFirstPurchase) {
          // No mandate on file yet for this add-on — needs fresh authorization,
          // same rule UpgradeAddOnsWizard applies to any brand-new add-on.
          await new Promise((resolve, reject) => {
            openRazorpayCheckout(session, {
              description: `Unlock ${fw.label || code}`,
              onSuccess: resolve,
              onDismiss: () => reject(new Error("Payment window closed before completing.")),
              onError: reject,
            });
          });
        }
        // Else: backend already charged this silently against the existing
        // mandate (see SubscriptionService.purchaseOrChangeAddOn's "topup"
        // branch) — nothing to open.
      }

      const nextFrameworks = [...(orgFrameworks || []), code];
      const updatedOrg = await updateOrganizationFrameworks(orgId, nextFrameworks);
      setOrgFrameworks(Array.isArray(updatedOrg?.frameworks) ? updatedOrg.frameworks : nextFrameworks);
      setMessage(`${fw.label || code} unlocked.`);
      await onComplete?.();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error || err?.message || `Couldn't unlock ${fw.label || code}. Please try again.`
      );
    } finally {
      setUnlockingCode(null);
    }
  };

  return (
    <div className="ms-modal-overlay" role="dialog" aria-modal="true">
      <div className="ms-modal fw-store-modal">
        <button className="ms-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <h2 className="ms-modal-title">Buy a Framework</h2>
        <p className="fw-store-sub">
          Your Starter Package includes {includedFrameworkCount} framework of choice.
          Unlock additional frameworks below{perCycleRate != null ? ` for ${formatINR(perCycleRate)} ${cycleSuffix} each` : ""}.
          {availableUnusedSlots > 0 && (
            <> You have {availableUnusedSlots} paid slot{availableUnusedSlots > 1 ? "s" : ""} not yet assigned to a framework — the next {availableUnusedSlots > 1 ? "few unlocks are" : "unlock is"} free.</>
          )}
        </p>

        {error && <div className="ms-error">{error}</div>}
        {message && <div className="ms-banner ms-banner--success fw-store-banner">{message}</div>}

        {loading ? (
          <div className="ms-loading fw-store-loading">
            <Loader2 className="ms-spin" size={20} />
            <span>Loading frameworks…</span>
          </div>
        ) : loadError ? (
          <div className="ms-error">{loadError}</div>
        ) : (
          <>
            {unlockedFrameworks.length > 0 && (
              <>
                <div className="fw-store-section-label">Active on your account</div>
                <div className="fw-store-grid">
                  {unlockedFrameworks.map((fw) => (
                    <div key={fw.code} className="fw-store-card fw-store-card--active">
                      <span className="fw-store-card-name">{fw.label || fw.code}</span>
                      <span className="fw-store-card-badge">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="fw-store-section-label">Available to unlock</div>
            {lockedFrameworks.length === 0 ? (
              <p className="ms-fineprint">Every framework in the library is already active on your account.</p>
            ) : (
              <div className="fw-store-picker">
                <select
                  className="fw-store-select"
                  value={selectedCode}
                  onChange={(e) => setSelectedCode(e.target.value)}
                >
                  {lockedFrameworks.map((fw) => (
                    <option key={fw.code} value={fw.code}>
                      {fw.label || fw.code}
                    </option>
                  ))}
                </select>

                {selectedFramework && (
                  <div className="fw-store-result">
                    <div className="fw-store-result-info">
                      <span className="fw-store-card-name">
                        <Lock size={13} /> {selectedFramework.label || selectedFramework.code}
                      </span>
                      <span className="fw-store-card-price">
                        {availableUnusedSlots > 0
                          ? "Included (paid slot available)"
                          : perCycleRate != null
                            ? `${formatINR(perCycleRate)} ${cycleSuffix}`
                            : "—"}
                      </span>
                    </div>
                    <button
                      className="ms-btn ms-btn--primary ms-btn--sm"
                      disabled={unlockingCode !== null}
                      onClick={() => handleUnlock(selectedFramework)}
                    >
                      {unlockingCode === (selectedFramework.code || "").toUpperCase() ? "Processing…" : "Unlock"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="ms-modal-actions">
          <button className="ms-btn ms-btn--outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
