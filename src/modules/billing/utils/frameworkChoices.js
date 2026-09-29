// The single included framework a self-serve tenant picks at signup
// (Subscription.frameworkChoice, validated server-side against ALLOWED_FRAMEWORKS).
// Kept in sync with src/utils/frameworkStaticRoutes.js — the frameworks this
// site actually has dedicated pages/content for.
export const FRAMEWORK_CHOICES = [
  { code: "SOC2", label: "SOC 2" },
  { code: "ISO27001", label: "ISO 27001" },
  { code: "ISO27701", label: "ISO 27701" },
  { code: "ISO42001", label: "ISO 42001" },
  { code: "GDPR", label: "GDPR" },
  { code: "DPDPA", label: "DPDPA" },
  { code: "KSA_PDPL", label: "KSA PDPL" },
];
