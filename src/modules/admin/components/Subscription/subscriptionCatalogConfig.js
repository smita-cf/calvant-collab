

export const CONTROL_CHECKBOX = "CHECKBOX";
export const CONTROL_STEPPER = "STEPPER";

// Codes that should render as an on/off checkbox rather than a +/- stepper —
// these are modules you either have or don't, quantity is meaningless.
const CHECKBOX_CODES = new Set([
  "MODULE_DPIA",
  "MODULE_VENDOR_MGMT",
  "MODULE_AI_IMPACT",
]);

export function controlTypeFor(addOnCode) {
  return CHECKBOX_CODES.has(addOnCode) ? CONTROL_CHECKBOX : CONTROL_STEPPER;
}

// Display + wizard order for every PER_UNIT_MONTHLY addOnCode. Anything in
// the catalog with billingType=PER_UNIT_MONTHLY but NOT listed here simply
// won't show up in the Subscription Details table or the wizard — so when
// you add a new recurring add-on on the backend, add its code here too.
export const WIZARD_ADDON_ORDER = [
  "MODULE_DPIA",
  "MODULE_VENDOR_MGMT",
  "MODULE_AI_IMPACT",
  "FRAMEWORK_EXTRA",
  "INTEGRATION_STANDARD",
];

// Convenience export for IntegrationsPage.jsx / useIntegrationEntitlement —
// the one PER_UNIT_MONTHLY code that gates integration slot count, and the
// one CUSTOM_QUOTE code that means "unlimited, sales-negotiated" instead.
export const INTEGRATION_STANDARD_CODE = "INTEGRATION_STANDARD";
export const INTEGRATION_CUSTOM_CODE = "INTEGRATION_CUSTOM";
