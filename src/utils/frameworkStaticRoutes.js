// utils/frameworkStaticRoutes.js

export const STATIC_FRAMEWORK_ROUTES = {
  soc2: "/soc-2",
  "soc-2": "/soc2",
  iso27001: "/iso-27001",
  "iso-27001": "/iso-27001",
  iso27701: "/iso-27701",
  "iso-27701": "/iso-27701",
  iso42001: "/iso-42001",
  "iso-42001": "/iso-42001",
  dpdpa: "/dpdpa",
  ksapdpl: "/ksa-pdpl",
  "ksa-pdpl": "/ksa-pdpl",
};

export const normalize = (str) =>
  (str || "")
    .toString()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export const resolveStaticRoute = (framework) => {
  if (!framework) return null;

  const candidates = [
    framework.code,
    framework.slug,
    framework.shortCode,
    framework.label,
    framework.name,
  ];

  for (const c of candidates) {
    const key = normalize(c);
    if (!key) continue;
    if (STATIC_FRAMEWORK_ROUTES[key]) return STATIC_FRAMEWORK_ROUTES[key];

    const keyNoDash = key.replace(/-/g, "");
    if (STATIC_FRAMEWORK_ROUTES[keyNoDash]) {
      return STATIC_FRAMEWORK_ROUTES[keyNoDash];
    }
  }

  return null;
};

export const hasRenderablePage = (framework) => {
  if (!framework) return false;
  if (framework.pageContent) return true;
  return !!resolveStaticRoute(framework);
};