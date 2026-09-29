import React, { useState, useEffect, useRef } from "react";
import { LogOut, ShieldCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFramework, ALL_FRAMEWORKS } from "../../context/FrameworkContex";
import CompactFrameworkFilter from "../CompactFrameworkFilter";
import { useEffectiveOrg } from "../../hooks/useEffectiveOrg"; // ← import hook

const UserProfile = ({ handleLogout }) => {
  // user prop no longer needed — comes from hook
  const [open, setOpen] = useState(false);
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const modalRef = useRef(null);
  const [childOrgs, setChildOrgs] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);

  const {
    user,
    mounted,
    isPartnerRoot,
    isOrgManager,
    isViewingManagedOrg,
    managedOrgs,
    selectedChildOrg,
  } = useEffectiveOrg();

  const showOrgSwitcher = isPartnerRoot || isOrgManager;

  const {
    selectedFrameworks,
    toggleFramework,
    isAllSelected,
    availableFrameworks,
    frameworkColorMap,
  } = useFramework();

  // ── Fetch orgs ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !showOrgSwitcher) return;
    const token = sessionStorage.getItem("token");

    if (isPartnerRoot) {
      fetch("https://api.calvant.com/user-service/api/organizations/children", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((orgs) => {
          if (Array.isArray(orgs)) setChildOrgs(orgs);
        })
        .catch(console.error);
    } else if (isOrgManager) {
      Promise.all(
        managedOrgs.map((id) =>
          fetch(
            `https://api.calvant.com/user-service/api/organizations/${id}`,
            {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            },
          ).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          }),
        ),
      )
        .then((orgs) => setChildOrgs(orgs.filter(Boolean)))
        .catch(console.error);
    }
  }, [mounted, showOrgSwitcher, isPartnerRoot, isOrgManager, managedOrgs]);

  // ── Fetch all departments for mapping ID to Name ────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const token = sessionStorage.getItem("token");
    fetch("https://api.calvant.com/user-service/api/departments", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllDepartments(data);
        }
      })
      .catch(console.error);
  }, [mounted]);

  // ── Org switcher handler ──────────────────────────────────────────────────
  const handleOrgChange = (e) => {
    if (!e.target.value) {
      sessionStorage.removeItem("selectedChildOrg");
      window.dispatchEvent(new Event("childOrgChanged"));
      window.location.reload();
      return;
    }
    const org = childOrgs.find((o) => (o._id || o.id) === e.target.value);
    if (org) {
      sessionStorage.setItem("selectedChildOrg", JSON.stringify(org));
      window.dispatchEvent(new Event("childOrgChanged"));
      window.location.reload();
    }
  };

  // ── Outside click / Escape ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setOpen(false);
        setFrameworkOpen(false);
      }
    };
    const escHandler = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setFrameworkOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, []);

  // ── Derived display ───────────────────────────────────────────────────────
  const getInitials = () => {
    if (!user?.name) return "";
    const parts = user.name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "";
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const getDepartmentLabel = () => {
    if (!user) return "";
    const isPrivileged = Array.isArray(user.role)
      ? user.role.some((r) =>
          ["root", "dpo", "ciso", "aio", "super_admin"].includes(r),
        )
      : ["root", "dpo", "ciso", "aio", "super_admin"].includes(user.role);
    if (isPrivileged || isViewingManagedOrg) return "All";

    const resolveDeptName = (dept) => {
      if (!dept) return "";
      if (typeof dept === "object") {
        if (dept.name) return dept.name;
        const found = allDepartments.find(
          (d) => d._id === dept._id || d.id === dept.id || d._id === dept || d.id === dept
        );
        return found ? found.name : (dept._id || dept.id || "");
      }
      if (typeof dept === "string") {
        const found = allDepartments.find((d) => d._id === dept || d.id === dept);
        return found ? found.name : dept;
      }
      return "";
    };

    if (user.departments?.length > 0) {
      return user.departments.map(resolveDeptName).filter(Boolean).join(", ");
    }
    if (Array.isArray(user.department)) {
      return user.department.map(resolveDeptName).filter(Boolean).join(", ");
    }
    return resolveDeptName(user.department) || "—";
  };

  // ── AccordionRow (unchanged) ──────────────────────────────────────────────
  const AccordionRow = ({ icon: Icon, label, open, onToggle, children }) => (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-700 hover:bg-slate-50 transition-colors duration-150 rounded-md border-0 bg-transparent text-left"
      >
        <Icon size={15} className="text-gray-400 flex-shrink-0" />
        <span className="flex-1 font-medium">{label}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-6 mr-2 mb-1 bg-slate-50 rounded-md px-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        position: "relative",
      }}
    >
      {/* Avatar */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        title="Open profile"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {getInitials()}
      </div>

      {/* Popover */}
      {open && (
        <div
          ref={modalRef}
          style={{
            position: "absolute",
            top: 50,
            right: 0,
            width: 240,
            background: "#fff",
            borderRadius: 12,
            padding: 14,
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
            border: "1px solid #e5e7eb",
            zIndex: 100,
          }}
        >
          <strong>{user?.name}</strong>
          <div style={{ marginTop: 6 }}>Department: {getDepartmentLabel()}</div>
          <div>
            Role:{" "}
            {Array.isArray(user?.role) ? user.role.join(", ") : user?.role}
          </div>

          {isViewingManagedOrg && (
            <div
              style={{
                marginTop: 6,
                fontSize: 10,
                fontWeight: 700,
                color: "#7c3aed",
                background: "#f5f3ff",
                padding: "2px 8px",
                borderRadius: 8,
                display: "inline-block",
              }}
            >
              Root access
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <AccordionRow
              icon={ShieldCheck}
              label="Framework Filter"
              open={frameworkOpen}
              onToggle={() => setFrameworkOpen((p) => !p)}
            >
              <CompactFrameworkFilter />
            </AccordionRow>
          </div>

          {/* ── Org Switcher ── */}
          {showOrgSwitcher && (
            <>
              <div
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginTop: 12,
                  marginBottom: 6,
                }}
              >
                Viewing Org
              </div>
              <select
                value={selectedChildOrg?._id || selectedChildOrg?.id || ""}
                onChange={handleOrgChange}
                style={{
                  width: "100%",
                  fontSize: 12,
                  padding: "5px 8px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#0f172a",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="">
                  {isPartnerRoot
                    ? "— All Organizations —"
                    : "— My Organization —"}
                </option>
                {childOrgs.map((org) => (
                  <option key={org._id || org.id} value={org._id || org.id}>
                    {org.name}
                    {isOrgManager ? " (delegated)" : ""}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {/* Logout */}
      <button onClick={handleLogout}>
        <LogOut size={18} />
      </button>
    </div>
  );
};

export default UserProfile;
