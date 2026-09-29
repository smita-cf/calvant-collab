//cf-tool-frontend-main\src\hooks\useEffectiveOrg.js

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getUserRoles } from "@/utils/departmentUtils";

export function useEffectiveOrg() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedChildOrg, setSelectedChildOrg] = useState(null);
  const [isPartnerOrg, setIsPartnerOrg] = useState(false);

  // State for child orgs managed directly in the hook
  const [childOrgs, setChildOrgs] = useState([]);
  const [childOrgsLoading, setChildOrgsLoading] = useState(false);

  // 1. Core initialization effect: Fetch authoritative profile data on mount
  useEffect(() => {
    const initializeUserAndOrg = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setMounted(true);
          return;
        }

        // Fetch complete, authoritative profile data to catch managedOrgs fields
        const profileRes = await axios
          .get(
            `${process.env.NEXT_PUBLIC_SP || "https://api.calvant.com"}/user-service/api/users/me`,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          .catch(() => {
            // Fallback to session storage if custom /me profile route isn't deployed yet
            const stored = sessionStorage.getItem("user");
            return { data: stored ? JSON.parse(stored) : null };
          });

        const currentUser = profileRes.data;
        if (!currentUser) {
          setMounted(true);
          return;
        }

        // Preserve populated department objects from login session if /me returns raw ID array
        const stored = sessionStorage.getItem("user");
        if (stored) {
          try {
            const storedUser = JSON.parse(stored);
            if (!currentUser.departments && storedUser?.departments) {
              currentUser.departments = storedUser.departments;
            }
          } catch (e) {}
        }

        setUser(currentUser);

        const orgId = currentUser.organization?._id || currentUser.organization;
        if (orgId) {
          const orgRes = await axios.get(
            `${process.env.NEXT_PUBLIC_SP || "https://api.calvant.com"}/user-service/api/organizations/${orgId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setIsPartnerOrg(orgRes.data.partner === true);
        }
      } catch (err) {
        console.error("Initialization failed in useEffectiveOrg hook:", err);
      } finally {
        setMounted(true);
      }
    };

    initializeUserAndOrg();
  }, []);

  // Sync selected child organization from session storage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("selectedChildOrg");
      setSelectedChildOrg(raw ? JSON.parse(raw) : null);
    } catch {
      setSelectedChildOrg(null);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () => {
      try {
        const raw = sessionStorage.getItem("selectedChildOrg");
        setSelectedChildOrg(raw ? JSON.parse(raw) : null);
      } catch {
        setSelectedChildOrg(null);
      }
    };
    window.addEventListener("childOrgChanged", handler);
    return () => window.removeEventListener("childOrgChanged", handler);
  }, [mounted]);

  // ── role derivations ──────────────────────────────────────────────────────
  const userRoles = useMemo(() => getUserRoles(user), [user]);
  const isRoot = useMemo(() => userRoles.includes("root"), [userRoles]);
  const isSuperAdmin = useMemo(() => userRoles.includes("super_admin"), [userRoles]);
  const isRiskOwner = useMemo(() => userRoles.includes("risk_owner"), [userRoles]);

  const isPartnerRoot = isPartnerOrg && isRoot;
  const managedOrgs = useMemo(() => user?.managedOrgs || [], [user]);
  const isOrgManager = !isRoot && !isSuperAdmin && managedOrgs.length > 0;

  const isPrivilegedRole = useMemo(
    () =>
      isRoot ||
      isSuperAdmin ||
      userRoles.some((r) => ["dpo", "ciso", "aio", "steering_committee_member"].includes(r)),
    [isRoot, isSuperAdmin, userRoles],
  );

  const hasFullOrgAccess = isPrivilegedRole || isOrgManager;
  const userOrgId = useMemo(
    () => user?.organization?._id || user?.organization || null,
    [user],
  );

  // ── Fetch Child Orgs Internally ──────────────────────────────────────
  useEffect(() => {
    // If they aren't a partner root and aren't an org manager, don't fetch children
    if (!mounted || (!isPartnerRoot && !isOrgManager)) return;

    const token = sessionStorage.getItem("token");
    setChildOrgsLoading(true);

    if (isPartnerRoot) {
      fetch(
        `${process.env.NEXT_PUBLIC_SP || "https://api.calvant.com"}/user-service/api/organizations/children`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((orgs) => setChildOrgs(Array.isArray(orgs) ? orgs : []))
        .catch(console.error)
        .finally(() => setChildOrgsLoading(false));
    } else if (isOrgManager) {
      Promise.all(
        managedOrgs.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_SP || "https://api.calvant.com"}/user-service/api/organizations/${id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          ).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          }),
        ),
      )
        .then((orgs) => setChildOrgs(orgs.filter(Boolean)))
        .catch(console.error)
        .finally(() => setChildOrgsLoading(false));
    }
  }, [mounted, isPartnerRoot, isOrgManager, managedOrgs]);

  // ── org / identity ────────────────────────────────────────────────────────
  const effectiveOrgId = useMemo(() => {
    const candidateId = selectedChildOrg?._id || selectedChildOrg?.id || null;
    if ((isPartnerRoot || isOrgManager) && candidateId) return candidateId;

    // Consolidated: for org manager use first managed org as "primary"
    if (isOrgManager && managedOrgs.length > 0) return String(managedOrgs[0]);

    return userOrgId;
  }, [isPartnerRoot, isOrgManager, selectedChildOrg, userOrgId, managedOrgs]);

  const isViewingManagedOrg = useMemo(() => {
    if (!isOrgManager) return false;
    return managedOrgs.map(String).includes(String(effectiveOrgId));
  }, [isOrgManager, managedOrgs, effectiveOrgId]);

  const effectiveOrgIds = useMemo(() => {
    const ids = new Set();

    // Scenario A: Specific child selected
    if ((isPartnerRoot || isOrgManager) && selectedChildOrg) {
      ids.add(String(selectedChildOrg._id || selectedChildOrg.id));
      return ids;
    }

    // Scenario B: Consolidated view
    if ((isPartnerRoot || isOrgManager) && !selectedChildOrg) {
      if (isPartnerRoot) {
        // While children are loading, fall back to userOrgId so data isn't empty
        if (childOrgs.length > 0) {
          childOrgs.forEach((o) => ids.add(String(o._id || o.id)));
        } else if (userOrgId) {
          ids.add(String(userOrgId)); // ← temporary fallback during load
        }
      } else if (isOrgManager) {
        // managedOrgs is available immediately from user profile
        managedOrgs.forEach((id) => ids.add(String(id)));
      }
      return ids;
    }

    // Scenario C: Standard fallback
    if (userOrgId) {
      ids.add(String(userOrgId));
    }

    return ids;
  }, [
    isPartnerRoot,
    isOrgManager,
    selectedChildOrg,
    childOrgs,
    managedOrgs,
    userOrgId,
  ]);

  // ── department ────────────────────────────────────────────────────────────
  const userDepartmentIds = useMemo(() => {
    const depts = user?.department;
    if (!depts) return [];
    const arr = Array.isArray(depts) ? depts : [depts];
    return arr.map((d) => String(d?._id || d)).filter(Boolean);
  }, [user]);

  const isDepartmentScoped = useMemo(() => {
    if (isPrivilegedRole) return false;
    if (isViewingManagedOrg) return false;
    return userDepartmentIds.length > 0;
  }, [isPrivilegedRole, isViewingManagedOrg, userDepartmentIds]);

  const dataFilterParams = useMemo(() => {
    const base = { orgId: effectiveOrgId };
    if (isDepartmentScoped) {
      base.departmentIds = userDepartmentIds;
    }
    return base;
  }, [effectiveOrgId, isDepartmentScoped, userDepartmentIds]);

  return {
    effectiveOrgId,
    effectiveOrgIds,
    userOrgId,
    selectedChildOrg,
    isRoot,
    isSuperAdmin,
    isPartnerOrg,
    isPartnerRoot,
    isOrgManager,
    isViewingManagedOrg,
    isPrivilegedRole,
    isRiskOwner,
    userRoles,
    hasFullOrgAccess,
    userDepartmentIds,
    isDepartmentScoped,
    dataFilterParams,
    managedOrgs,
    childOrgs,
    childOrgsLoading,
    user,
    mounted,
  };
}
