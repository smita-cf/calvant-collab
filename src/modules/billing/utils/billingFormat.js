// Shared formatting helpers for anything billing-related. Prices from
// billing-service are always minor units (paise) — see the AddOn/StarterPackage
// javadoc in the backend: never render a raw minor-units number to a user.

export function formatINR(minorUnits, { withDecimals = false } = {}) {
  if (minorUnits === null || minorUnits === undefined) return "—";
  const rupees = minorUnits / 100;
  return rupees.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: withDecimals ? 2 : 0,
    minimumFractionDigits: withDecimals ? 2 : 0,
  });
}

// AddOn.category -> display label, used to group the catalog into sections.
export const CATEGORY_LABELS = {
  MODULE: "Modules",
  FRAMEWORK: "Frameworks",
  USER: "Users & Seats",
  INTEGRATION: "Integrations",
  SERVICE: "Professional Services",
};

export const CATEGORY_ORDER = ["MODULE", "FRAMEWORK", "USER", "INTEGRATION", "SERVICE"];

// Per-unit monthly rate for the active billing cycle, or null if not applicable
// (ONE_TIME / CUSTOM_QUOTE addOns don't have a recurring monthly rate).
export function monthlyRateFor(addOn, billingCycle) {
  if (addOn.billingType !== "PER_UNIT_MONTHLY") return null;
  return billingCycle === "ANNUAL" ? addOn.priceAnnualMonthly : addOn.priceHalfYearlyMonthly;
}

// The per-cycle charge for one unit of an addOn: 12x monthly for ANNUAL,
// 6x monthly for HALF_YEARLY — mirrors SubscriptionService.resolveTotalMinorUnits
// on the backend so the numbers the frontend previews always match what gets billed.
export function perCycleRateFor(addOn, billingCycle) {
  const monthly = monthlyRateFor(addOn, billingCycle);
  if (monthly === null) return null;
  return billingCycle === "ANNUAL" ? monthly * 12 : monthly * 6;
}

export const STATUS_LABELS = {
  TRIAL: "Trial",
  ACTIVE: "Active",
  PAST_DUE: "Payment overdue",
  INACTIVE: "Inactive",
  CANCELLED: "Cancelled",
};

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
