const BASE_URL = "https://api.calvant.com/framework/api/frameworks";
const ORG_BASE_URL = "https://api.calvant.com/user-service/api/organizations";

const fetchOrgFrameworks = async (organizationId, token) => {
  const res = await fetch(`${ORG_BASE_URL}/${organizationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch organization: ${organizationId}`);
  const org = await res.json();
  return Array.isArray(org.frameworks)
    ? org.frameworks.map((code) => code.toUpperCase())
    : [];
};

export const fetchFrameworks = async () => {
  let user;
  try {
    user = JSON.parse(sessionStorage.getItem("user"));
  } catch {
    throw new Error("[frameworkService] Failed to parse user from sessionStorage");
  }

  const organizationId = user?.organization;
  const token =
    typeof user?.token === "string"
      ? user.token
      : user?.token?.token ?? sessionStorage.getItem("token");

  if (!organizationId) throw new Error("[frameworkService] user.organization missing");
  if (!token) throw new Error("[frameworkService] No token found");

  const [allFrameworks, orgFrameworkCodes] = await Promise.all([
    fetch(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch frameworks");
      return res.json();
    }),
    fetchOrgFrameworks(organizationId, token),
  ]);

  return allFrameworks
    .filter((fw) => orgFrameworkCodes.includes(fw.code?.toUpperCase()))
    .map((fw) => {
      if (!fw.label || !fw.path) {
        console.warn(`[frameworkService] Incomplete config for framework: "${fw.code}"`);
        return null;
      }
      return {
        id: fw.label,
        code: fw.code,
        label: fw.label,
        color: fw.color,
        path: fw.path,
        description: fw.description,
        riskTypes: fw.riskTypes ?? [],
        annexSectionTypes: fw.annexSectionTypes ?? [],
        isMapped: fw.isMapped ?? false,
        mappingSources: fw.mappingSources ?? [],
      };
    })
    .filter(Boolean);
};