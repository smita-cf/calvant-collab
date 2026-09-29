//cf-tool-frontend-main\src\utils\departmentUtils.js

/**
 * Safely parses all roles assigned to a user into a clean array of lower-case strings.
 * Handles user.role (string or array) and user.roles (string or array) cumulatively.
 */
export function getUserRoles(user) {
  if (!user) return [];
  const roles = [];
  if (Array.isArray(user.role)) roles.push(...user.role);
  else if (user.role) roles.push(user.role);

  if (Array.isArray(user.roles)) roles.push(...user.roles);
  else if (user.roles) roles.push(user.roles);

  return [...new Set(roles.filter(Boolean).map((r) => String(r).trim().toLowerCase()))];
}

/**
 * Checks if user has any privileged role (root, super_admin, dpo, ciso, aio).
 */
export function isUserPrivileged(user, isRoot = false) {
  if (isRoot) return true;
  const roles = getUserRoles(user);
  return roles.some((r) => ["root", "super_admin", "dpo", "ciso", "aio"].includes(r));
}

/**
 * Checks if user has Risk Owner role.
 */
export function isUserRiskOwner(user) {
  const roles = getUserRoles(user);
  return roles.includes("risk_owner");
}

/**
 * Safely extracts all department objects/strings from a user object.
 * Also merges departments from session storage if /users/me returned raw IDs without department names.
 */
export function getUserDepartments(user) {
  if (!user) return [];
  const rawDepts = [];

  if (Array.isArray(user.departments)) rawDepts.push(...user.departments);
  else if (user.departments) rawDepts.push(user.departments);

  if (Array.isArray(user.department)) rawDepts.push(...user.department);
  else if (user.department) rawDepts.push(user.department);

  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("user");
      if (stored) {
        const storedUser = JSON.parse(stored);
        if (Array.isArray(storedUser.departments)) rawDepts.push(...storedUser.departments);
        else if (storedUser.departments) rawDepts.push(storedUser.departments);
        if (Array.isArray(storedUser.department)) rawDepts.push(...storedUser.department);
        else if (storedUser.department) rawDepts.push(storedUser.department);
      }
    } catch (e) {}
  }

  const deptMap = new Map();

  rawDepts.forEach((item) => {
    if (!item) return;
    let id = "";
    let name = "";

    if (typeof item === "object") {
      id = String(item._id || item.id || "").trim();
      name = String(item.name || "").trim();
    } else if (typeof item === "string") {
      const trimmed = item.trim();
      if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
        id = trimmed;
      } else {
        name = trimmed;
      }
    }

    if (!id && !name) return;

    let existing = null;
    if (id) {
      existing = deptMap.get(id);
    }
    if (!existing && name) {
      existing = deptMap.get(name.toLowerCase());
    }

    if (existing) {
      if (id && !existing._id) {
        existing._id = id;
        existing.id = id;
        deptMap.set(id, existing);
      }
      if (name && !existing.name) {
        existing.name = name;
        deptMap.set(name.toLowerCase(), existing);
      }
    } else {
      const newEntry = { _id: id || undefined, id: id || undefined, name: name || undefined };
      if (id) deptMap.set(id, newEntry);
      if (name) deptMap.set(name.toLowerCase(), newEntry);
    }
  });

  const uniqueEntries = Array.from(new Set(deptMap.values()));

  return uniqueEntries
    .map(e => ({
      _id: e._id || e.id,
      id: e.id || e._id,
      name: e.name && !/^[0-9a-fA-F]{24}$/.test(e.name) ? e.name : ""
    }))
    .filter(e => e._id || e.name);
}

/**
 * Checks if a risk belongs to the effective organization context.
 * If targetOrgId is not specified or risk has no organization field, returns true.
 */
export function isSameOrg(riskOrg, targetOrgId) {
  if (!targetOrgId) return true;
  if (!riskOrg) return true;
  const rId = String(riskOrg._id || riskOrg.id || riskOrg).toLowerCase();
  const tId = String(targetOrgId).toLowerCase();
  return rId === tId;
}

/**
 * Matches a risk's department against a user's assigned department(s).
 * Handles string names ("HR"), string IDs ("65b..."), or objects ({ _id, id, name }).
 * Also accepts an optional allDepartments list to map IDs -> Names.
 */
export function matchesDepartment(riskDept, userDepts, allDepartments = []) {
  if (!riskDept || !userDepts) return false;

  // Build a lookup map of ID -> Name from allDepartments if provided
  const idToNameMap = new Map();
  if (Array.isArray(allDepartments)) {
    allDepartments.forEach((d) => {
      if (d && d.name) {
        const dId = d._id || d.id;
        if (dId) idToNameMap.set(String(dId).trim().toLowerCase(), String(d.name).trim().toLowerCase());
      }
    });
  }

  // Extract all identifiers (names & IDs) for the risk's department
  const riskDeptVals = new Set();
  if (typeof riskDept === "string") {
    const trimmed = riskDept.trim().toLowerCase();
    riskDeptVals.add(trimmed);
    if (idToNameMap.has(trimmed)) {
      riskDeptVals.add(idToNameMap.get(trimmed));
    }
  } else if (typeof riskDept === "object" && riskDept !== null) {
    if (riskDept.name) riskDeptVals.add(String(riskDept.name).trim().toLowerCase());
    if (riskDept._id) riskDeptVals.add(String(riskDept._id).trim().toLowerCase());
    if (riskDept.id) riskDeptVals.add(String(riskDept.id).trim().toLowerCase());
  }

  if (riskDeptVals.size === 0) return false;

  // Standardize user departments into a flat array
  const list = Array.isArray(userDepts) ? userDepts.flat(Infinity) : [userDepts];

  for (const uDept of list) {
    if (!uDept) continue;

    const uDeptVals = new Set();
    if (typeof uDept === "string") {
      const trimmed = uDept.trim().toLowerCase();
      uDeptVals.add(trimmed);
      if (idToNameMap.has(trimmed)) {
        uDeptVals.add(idToNameMap.get(trimmed));
      }
    } else if (typeof uDept === "object" && uDept !== null) {
      if (uDept.name) uDeptVals.add(String(uDept.name).trim().toLowerCase());
      if (uDept._id) uDeptVals.add(String(uDept._id).trim().toLowerCase());
      if (uDept.id) uDeptVals.add(String(uDept.id).trim().toLowerCase());
    }

    for (const val of uDeptVals) {
      if (riskDeptVals.has(val)) return true;
    }
  }

  return false;
}
