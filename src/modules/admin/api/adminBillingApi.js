
// import adminAxios from "./adminAxios";

// const BILLING_BASE = process.env.NEXT_PUBLIC_SP
//   ? `${process.env.NEXT_PUBLIC_SP}/billing-service`
//   : "https://api.calvant.com/billing-service";

// const API = `${BILLING_BASE}/api/billing`;

// /** GET /api/billing/subscription -> { subscription, resolvedPriceMinorUnits } */
// export async function getCurrentSubscription() {
//   const { data } = await adminAxios.get(`${API}/subscription`);
//   return data;
// }

// /** GET /api/billing/addons -> AddOn[] (full catalog, all billingTypes) */
// export async function getAddOnCatalog() {
//   const { data } = await adminAxios.get(`${API}/addons`);
//   return data;
// }

// /** GET /api/billing/starter-package -> StarterPackage */
// export async function getStarterPackage() {
//   const { data } = await adminAxios.get(`${API}/starter-package`);
//   return data;
// }

// /** PATCH /api/billing/subscription/addons — full replace of PER_UNIT_MONTHLY lines. */
// export async function updateAddOns(addOns) {
//   const { data } = await adminAxios.patch(`${API}/subscription/addons`, { addOns });
//   return data;
// }

// /** PATCH /api/billing/subscription/seats — absolute seat counts, not deltas. */
// export async function updateSeats(adminUserCount, normalUserCount) {
//   const { data } = await adminAxios.patch(`${API}/subscription/seats`, {
//     adminUserCount,
//     normalUserCount,
//   });
//   return data;
// }

// /** POST /api/billing/subscription/cancel */
// export async function cancelSubscription() {
//   const { data } = await adminAxios.post(`${API}/subscription/cancel`);
//   return data;
// }

// /**
//  * POST /api/billing/subscription/checkout — starts a Razorpay checkout for the
//  * tenant's CURRENT billingCycle + addOns (whatever was last saved via
//  * updateAddOns/updateSeats). This is the recurring-plan checkout — trial
//  * conversion, re-subscribing after INACTIVE, or an immediate mid-cycle
//  * upgrade charge. Named startCheckout (not initiateCheckout) to match what
//  * ManageSubscription.jsx / UpgradeAddOnsWizard.jsx already import.
//  */
// export async function startCheckout() {
//   const { data } = await adminAxios.post(`${API}/subscription/checkout`);
//   return data;
// }

// /**
//  * POST /api/billing/subscription/checkout/one-time — for ONE_TIME catalog
//  * items (SERVICE_POLICY_PACK, SERVICE_CONSULTANT_DAY today). Requires the
//  * backend-patch/SubscriptionService_and_Controller.patch.java addition —
//  * without it this 404s. startCheckout() above can't be reused for this
//  * because it always prices off the tenant's recurring plan, never a
//  * standalone item.
//  */
// export async function initiateOneTimeCheckout(addOnCode, quantity = 1) {
//   const { data } = await adminAxios.post(`${API}/subscription/checkout/one-time`, {
//     addOnCode,
//     quantity,
//   });
//   return data;
// }

// export default {
//   getCurrentSubscription,
//   getAddOnCatalog,
//   getStarterPackage,
//   updateAddOns,
//   updateSeats,
//   cancelSubscription,
//   startCheckout,
//   initiateOneTimeCheckout,
// };


/**
 * adminBillingApi.js
 * Authenticated billing-service calls for the Manage Subscription admin page,
 * the Upgrade/Downgrade Add-Ons wizard, and the /admin/integrations
 * slot-limit check. Uses adminAxios (already attaches Bearer token) exactly
 * like every other admin module — see ListOrg.jsx / OnboardingModule.jsx.
 *
 * IMPORTANT: never send an x-org / tenant header as the "which tenant" signal
 * for these billing-service calls — SubscriptionController resolves tenantId
 * server-side from the verified JWT (see its class javadoc). adminAxios still
 * attaches x-org/x-role for other services' benefit; billing-service simply
 * ignores those and reads the JWT instead.
 *
 * Export names below are the actual contract consumed by
 * ManageSubscription.jsx and UpgradeAddOnsWizard.jsx — keep them stable,
 * these two files destructure by name.
 *
 * ── purchaseOrChangeAddOn / removeAddOn (new below) ─────────────────────────
 * Added for the "every add-on is its own subscription" redesign —
 * SubscriptionController's POST /subscription/addons/{code}/checkout and
 * DELETE /subscription/addons/{code}, backed by
 * SubscriptionService.purchaseOrChangeAddOn / removeAddOnSubscription.
 * updateAddOns() below is kept as-is for callers that still need a bulk
 * PATCH, but it folds changes into the *Starter* subscription rather than
 * giving the add-on its own subscription — for MODULE_
 * INTEGRATION_STANDARD */
 
import adminAxios from "./adminAxios";

const BILLING_BASE = process.env.NEXT_PUBLIC_SP
  ? `${process.env.NEXT_PUBLIC_SP}/billing-service`
  : "https://api.calvant.com/billing-service";

const API = `${BILLING_BASE}/api/billing`;

/** GET /api/billing/subscription -> { subscription, resolvedPriceMinorUnits } */
export async function getCurrentSubscription() {
  const { data } = await adminAxios.get(`${API}/subscription`);
  return data;
}

/** GET /api/billing/addons -> AddOn[] (full catalog, all billingTypes) */
export async function getAddOnCatalog() {
  const { data } = await adminAxios.get(`${API}/addons`);
  return data;
}

/** GET /api/billing/starter-package -> StarterPackage */
export async function getStarterPackage() {
  const { data } = await adminAxios.get(`${API}/starter-package`);
  return data;
}

/**
 * PATCH /api/billing/subscription/addons — full replace of PER_UNIT_MONTHLY
 * lines on the *Starter* subscription. Legacy path — see file header. Not
 * used by the current UpgradeAddOnsWizard.jsx for catalog add-ons anymore;
 * kept exported in case another caller still needs a bulk replace.
 */
export async function updateAddOns(addOns) {
  const { data } = await adminAxios.patch(`${API}/subscription/addons`, { addOns });
  return data;
}

/** PATCH /api/billing/subscription/seats — absolute seat counts, not deltas. */
export async function updateSeats(adminUserCount, normalUserCount) {
  const { data } = await adminAxios.patch(`${API}/subscription/seats`, {
    adminUserCount,
    normalUserCount,
  });
  return data;
}

/**
 * POST /api/billing/subscription/addons/{code}/checkout — buy a new catalog
 * add-on, or change an existing one's quantity. Backend cancels any existing
 * Razorpay subscription for this addOnCode (at cycle end, no double charge)
 * and creates a fresh one at the requested quantity — ALWAYS returns a
 * ProviderCheckoutSession that must be opened via openRazorpayCheckout(),
 * even for a quantity decrease, since Razorpay requires fresh authorization
 * for the new subscription either way.
 */
export async function purchaseOrChangeAddOn(addOnCode, quantity = 1) {
  const { data } = await adminAxios.post(
    `${API}/subscription/addons/${encodeURIComponent(addOnCode)}/checkout`,
    { quantity }
  );
  return data;
}

/**
 * DELETE /api/billing/subscription/addons/{code} — drop an add-on entirely.
 * Cancels its Razorpay subscription at cycle end and returns the updated
 * Subscription directly — no checkout session, no Razorpay modal.
 */
export async function removeAddOn(addOnCode) {
  const { data } = await adminAxios.delete(
    `${API}/subscription/addons/${encodeURIComponent(addOnCode)}`
  );
  return data;
}

/** POST /api/billing/subscription/cancel */
export async function cancelSubscription() {
  const { data } = await adminAxios.post(`${API}/subscription/cancel`);
  return data;
}

/**
 * POST /api/billing/subscription/checkout — starts a Razorpay checkout for the
 * tenant's CURRENT billingCycle + addOns (whatever was last saved via
 * updateAddOns/updateSeats). This is the recurring-plan checkout — trial
 * conversion, re-subscribing after INACTIVE, or an immediate mid-cycle
 * upgrade charge. Named startCheckout (not initiateCheckout) to match what
 * ManageSubscription.jsx / UpgradeAddOnsWizard.jsx already import.
 */
export async function startCheckout() {
  const { data } = await adminAxios.post(`${API}/subscription/checkout`);
  return data;
}

/**
 * POST /api/billing/subscription/checkout/one-time — for ONE_TIME catalog
 * items (SERVICE_POLICY_PACK, SERVICE_CONSULTANT_DAY today). Requires the
 * backend-patch/SubscriptionService_and_Controller.patch.java addition —
 * without it this 404s. startCheckout() above can't be reused for this
 * because it always prices off the tenant's recurring plan, never a
 * standalone item.
 */
export async function initiateOneTimeCheckout(addOnCode, quantity = 1) {
  const { data } = await adminAxios.post(`${API}/subscription/checkout/one-time`, {
    addOnCode,
    quantity,
  });
  return data;
}

/**
 * POST /api/billing/trial-extension/request — root asks for a one-time,
 * billing.policy.trial-extension-days (3) extension. Backend enforces
 * eligibility (must still be TRIAL, or lapsed-but-never-paid) and the
 * one-request-at-a-time / one-shot-ever guards — this call can 409, which
 * ManageSubscription.jsx surfaces via err.response.data.message.
 */
export async function requestTrialExtension(reason) {
  const { data } = await adminAxios.post(`${API}/trial-extension/request`, { reason });
  return data;
}

/**
 * GET /api/billing/trial-extension/mine — every trial-extension request this
 * tenant has ever made (PENDING/APPROVED/REJECTED), newest and oldest alike.
 * ManageSubscription.jsx picks the most recent to decide what to show.
 */
export async function getMyTrialExtensionRequests() {
  const { data } = await adminAxios.get(`${API}/trial-extension/mine`);
  return data;
}

export default {
  getCurrentSubscription,
  getAddOnCatalog,
  getStarterPackage,
  updateAddOns,
  updateSeats,
  purchaseOrChangeAddOn,
  removeAddOn,
  cancelSubscription,
  startCheckout,
  initiateOneTimeCheckout,
  requestTrialExtension,
  getMyTrialExtensionRequests,
};