/**
 * useModuleEntitlements.js
 *
 * Fulfilment-cap gating for whole modules (DPIA, AI Impact Assessment,
 * Vendor/TPRM) and for user seats — same idea as useIntegrationEntitlement.js
 * but for "on/off" module add-ons (checkbox, not a quantity stepper) plus
 * the seat count already exposed on the subscription object.
 *
 * addOnCode names (MODULE_DPIA / MODULE_AI_IMPACT / MODULE_VENDOR_MGMT) come
 * from subscriptionCatalogConfig.js's CHECKBOX_CODES set — verify against
 * real AddOn seed data if these don't match.
 *
 * A module is "entitled" if its addOn line exists on the subscription with
 * quantity > 0. Seats: adminUserCount + normalUserCount on the subscription
 * itself (see ManageSubscription.jsx), compared against the org's current
 * user count from user-service.
 */
import { useEffect, useState } from "react";
import api from "../api/adminAxios";
import { getCurrentSubscription } from "../api/adminBillingApi";
import { useFramework } from "@/context/FrameworkContex";

export const MODULE_DPIA_CODE = "MODULE_DPIA";
export const MODULE_AIIA_CODE = "MODULE_AI_IMPACT";
export const MODULE_VENDOR_CODE = "MODULE_VENDOR_MGMT";

const hasAddOn = (subscription, code) =>
  !!subscription?.addOns?.find((l) => l.addOnCode === code && l.quantity > 0);

// Framework gate for trial-granted DPIA/AIIA: even if the backend's
// trialGrant unlocks these during trial, they only make sense for tenants
// that actually selected a framework that uses them. Vendor Mgmt has no
// framework tie-in, so it's untouched by this.
const isDpiaAllowedForFramework = (fw) => {
  const norm = fw ? fw.toUpperCase().replace(/[\s\-_]/g, "") : "";
  return ["ISO27701", "GDPR", "DPDPA", "HIPAA"].includes(norm);
};

const isAiiaAllowedForFramework = (fw) => {
  const norm = fw ? fw.toUpperCase().replace(/[\s\-_]/g, "") : "";
  return ["ISO42001", "EUAIACT"].includes(norm);
};

// A module is entitled if it's genuinely paid for (addOns, qty > 0) OR it's
// covered by an active trial grant. trialGrant is a flat list of addOnCodes
// the backend unlocks for free until trialEndsAt — separate from addOns,
// and easy to miss (bit us once already: MODULE_AI_IMPACT was trial-granted
// but not in addOns, so the addOns-only check wrongly hid it during the
// trial window). MODULE_VENDOR_MGMT is deliberately excluded from ever
// using this trial-grant path (see the hard-coded check below) — Vendor
// Mgmt should stay hidden for free-trial tenants no matter what the backend
// puts in trialGrant, and only unlock once actually purchased.
//
// IMPORTANT: the trial grant only applies while the subscription is
// actually still on TRIAL. Checking trialEndsAt alone isn't enough — if a
// tenant converts to a paid plan (status flips to ACTIVE) but the backend
// doesn't also clear trialEndsAt/trialGrant, trialEndsAt can still be in
// the future and every trial-granted module (e.g. Vendor Mgmt) stays free
// forever even though nothing was purchased. Requiring status === "TRIAL"
// closes that off regardless of what the backend does with those fields.
//
// On top of the trialGrant check, DPIA/AIIA are further narrowed to the
// frameworks that actually use them (e.g. DPIA only makes sense for
// ISO27701/GDPR/DPDPA/HIPAA tenants) — Vendor Mgmt is unaffected.
const isEntitled = (subscription, code, selectedFrameworks, availableFrameworks) => {
  if (hasAddOn(subscription, code)) return true;

  // Vendor Management is a pure paid add-on with no framework tie-in and no
  // trial allowance — a free-trial tenant must NOT see it, regardless of
  // whatever the backend happens to put in trialGrant. Unlike DPIA/AI IA
  // (which are legitimately trial-granted for applicable frameworks), Vendor
  // only ever becomes entitled once MODULE_VENDOR_MGMT is actually purchased
  // (hasAddOn above). Keeping this check hard-coded here means it can't
  // silently regress if the backend's trialGrant list changes later.
  if (code === MODULE_VENDOR_CODE) return false;

  const trialActive =
    subscription?.status === "TRIAL" &&
    subscription?.trialEndsAt &&
    new Date(subscription.trialEndsAt).getTime() > Date.now();

  if (!(trialActive && subscription?.trialGrant?.includes(code))) return false;

  if (code === MODULE_DPIA_CODE || code === MODULE_AIIA_CODE) {
    let activeFrameworks = (selectedFrameworks || []).includes("ALL Frameworks")
      ? (availableFrameworks || []).map((fw) => fw.id || fw.code)
      : (selectedFrameworks || []);

    if (activeFrameworks.length === 0 && subscription?.frameworkChoice) {
      activeFrameworks = [subscription.frameworkChoice];
    }

    return code === MODULE_DPIA_CODE
      ? activeFrameworks.some((fw) => isDpiaAllowedForFramework(fw))
      : activeFrameworks.some((fw) => isAiiaAllowedForFramework(fw));
  }

  return true;
};

// Trial accounts get a flat, mandatory 5-seat cap — regardless of whatever
// adminUserCount/normalUserCount happen to be sitting on the subscription
// doc (e.g. left over from a prior paid period, or pre-set for the eventual
// starter package). Only once status flips to ACTIVE (starter bought) does
// the real seat math — starter inclusions + USER_ADMIN/USER_NORMAL add-ons —
// apply. Mirrors the same TRIAL-vs-status guard used for module entitlements
// above: checking trialEndsAt alone isn't enough once converted to paid.
const TRIAL_SEAT_CAP = 5;

const seatLimitFor = (subscription) => {
  const trialActive =
    subscription?.status === "TRIAL" &&
    subscription?.trialEndsAt &&
    new Date(subscription.trialEndsAt).getTime() > Date.now();
  if (trialActive) return TRIAL_SEAT_CAP;
  return (subscription?.adminUserCount || 0) + (subscription?.normalUserCount || 0);
};

export default function useModuleEntitlements() {
  const { selectedFrameworks = [], availableFrameworks = [] } = useFramework() || {};
  const [state, setState] = useState({
    loading: true,
    error: "",
    subscription: null,
    seatLimit: 0,
    seatsUsed: 0,
  });

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const [{ subscription }, usersRes] = await Promise.all([
        getCurrentSubscription(),
        api
          .get("https://api.calvant.com/user-service/api/users")
          .catch(() => ({ data: [] })), // don't let a users-list failure block module gating
      ]);

      const usersList = Array.isArray(usersRes?.data)
        ? usersRes.data
        : usersRes?.data?.items ?? [];

      setState({
        loading: false,
        error: "",
        subscription,
        seatLimit: seatLimitFor(subscription),
        seatsUsed: usersList.length,
      });
    } catch (err) {
      console.error(err);
      setState({
        loading: false,
        error: err?.response?.data?.error || err?.message || "Couldn't load module entitlement.",
        subscription: null,
        seatLimit: 0,
        seatsUsed: 0,
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dpia = isEntitled(state.subscription, MODULE_DPIA_CODE, selectedFrameworks, availableFrameworks);
  const aiia = isEntitled(state.subscription, MODULE_AIIA_CODE, selectedFrameworks, availableFrameworks);
  const vendor = isEntitled(state.subscription, MODULE_VENDOR_CODE, selectedFrameworks, availableFrameworks);

  return { ...state, dpia, aiia, vendor, refresh: load };
}
