// Helper to extract all possible role strings from any user object shape

// C:\Users\ak192\Downloads\CalVant-Next-master (3)\CalVant-Next-master\src\utils\roleUtils.js
const extractRoleStrings = (obj, depth = 0) => {
  if (!obj || depth > 2) return [];
  const found = [];

  const check = (val) => {
    if (!val) return;
    if (typeof val === "string" || typeof val === "number") {
      found.push(String(val).toLowerCase().trim());
    } else if (Array.isArray(val)) {
      val.forEach(check);
    } else if (typeof val === "object" && val !== null) {
      if (val.name) found.push(String(val.name).toLowerCase().trim());
      if (val.role) check(val.role);
      if (val.roleName) found.push(String(val.roleName).toLowerCase().trim());
      if (val.authority) found.push(String(val.authority).toLowerCase().trim());
      if (val.code) found.push(String(val.code).toLowerCase().trim());
    }
  };

  // Inspect standard role keys
  check(obj.role);
  check(obj.roles);
  check(obj.userRole);
  check(obj.authorities);
  check(obj.designation);
  check(obj.jobTitle);

  // Inspect nested containers
  if (obj.user) found.push(...extractRoleStrings(obj.user, depth + 1));
  if (obj.data) found.push(...extractRoleStrings(obj.data, depth + 1));
  if (obj.details) found.push(...extractRoleStrings(obj.details, depth + 1));
  if (obj.profile) found.push(...extractRoleStrings(obj.profile, depth + 1));

  return [...new Set(found.filter(Boolean))];
};

export const isStrictAuditor = (inputUser) => {
  let user = inputUser;

  // Fallback to storage if inputUser is missing or incomplete
  if (!user && typeof window !== "undefined") {
    try {
      const sUser = sessionStorage.getItem("user");
      const lUser = localStorage.getItem("user");
      const mUser = localStorage.getItem("myObject");
      user = sUser ? JSON.parse(sUser) : lUser ? JSON.parse(lUser) : mUser ? JSON.parse(mUser) : null;
    } catch (e) {
      user = null;
    }
  }

  if (!user) return false;

  const normalizedRoles = extractRoleStrings(user);
  if (normalizedRoles.length === 0) return false;

  // Helper to check for auditor role strings
  const isAuditorRole = (r) =>
    r.includes("auditor") || r.includes("audit_manager") || r.includes("audit manager") || r === "auditmanager";

  const hasAuditorRole = normalizedRoles.some(isAuditorRole);
  if (!hasAuditorRole) return false;

  // If user has ANY non-auditor role (e.g. process_owner, admin, manager, user, risk_owner, etc.),
  // they are NOT a strict auditor and receive full module access.
  const hasNonAuditorRole = normalizedRoles.some((r) => !isAuditorRole(r));

  return !hasNonAuditorRole;
};

export const isAuditorAllowedPath = (pathname) => {
  if (!pathname) return true;
  const path = pathname.toLowerCase().trim();

  // Allow exact home/change-password/root
  if (path === "/" || path === "/change-password" || path === "") return true;

  const allowedPrefixes = [
    "/gap-assessment",
    "/gapassessment",
    "/task-management",
    "/taskmanagement",
    "/compliances",
    "/compliance",
    "/integrations"
  ];

  return allowedPrefixes.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
};
