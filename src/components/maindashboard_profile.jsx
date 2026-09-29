"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Key,
  LogOut,
  Users,
  ChevronDown,
  ShieldCheck,
  Bell,
  CheckCheck,
  Clock,
  UserCheck,
  RefreshCw,
  X,
  HelpCircle
} from "lucide-react";
import { useFramework, ALL_FRAMEWORKS } from "../context/FrameworkContex";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ChangePasswordModal from "../modules/dashboard/ChangePasswordModal";
import { useSession } from "../context/SessionContext";
import { useUI } from "../context/UIContext";
import { useEffectiveOrg } from "../hooks/useEffectiveOrg"; // ← import hook
import HelpDocModal from "./shared/HelpDocModal";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const BASE_URL = "https://api.calvant.com/task-service";
// const BASE_URL = "http://localhost:4006"; // Local backend for testing
const POLL_INTERVAL_MS = 60_000;

const TYPE_META = {
  OVERDUE: { label: "Overdue", color: "#ef4444", bg: "#fef2f2", Icon: Clock },
  ASSIGNED: {
    label: "Assigned",
    color: "#3b82f6",
    bg: "#eff6ff",
    Icon: UserCheck,
  },
  UPDATED: {
    label: "Updated",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: RefreshCw,
  },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─────────────────────────────────────────────
// NOTIFICATION BELL — unchanged
// ─────────────────────────────────────────────

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  // ── API helpers ──────────────────────────────

  const generateAndFetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await fetch(
        `${BASE_URL}/api/notifications/generate?userId=${encodeURIComponent(userId)}`,
        { method: "POST" },
      );
      const res = await fetch(
        `${BASE_URL}/api/notifications?userId=${encodeURIComponent(userId)}`,
      );
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markOneRead = async (id) => {
    await fetch(`${BASE_URL}/api/notifications/${id}/read`, { method: "PUT" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = async () => {
    await fetch(
      `${BASE_URL}/api/notifications/read-all?userId=${encodeURIComponent(userId)}`,
      { method: "PUT" },
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteOne = async (id, e) => {
    e.stopPropagation();
    await fetch(`${BASE_URL}/api/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ── Lifecycle ────────────────────────────────

  useEffect(() => {
    generateAndFetch();
    const interval = setInterval(generateAndFetch, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [generateAndFetch]);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Derived ──────────────────────────────────

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered =
    tab === "ALL" ? notifications : notifications.filter((n) => n.type === tab);

  // ── Render ───────────────────────────────────

  return (
    <div
      ref={panelRef}
      style={{ position: "relative", display: "flex", alignItems: "center" }}
    >
      {/* Bell button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen((p) => !p)}
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: open ? "#f1f5f9" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#64748b",
          transition: "background 0.15s",
          marginRight: 6,
        }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: "#ef4444",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              border: "2px solid white",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 360,
              maxHeight: 480,
              background: "white",
              borderRadius: 16,
              boxShadow: "0 10px 40px rgba(0,0,0,0.14)",
              border: "1px solid #f1f5f9",
              zIndex: 2000,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 16px 10px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#0f172a",
                  }}
                >
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "#64748b",
                      marginTop: 1,
                    }}
                  >
                    {unreadCount} unread
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Mark all as read"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background: "white",
                      cursor: "pointer",
                      fontSize: 11,
                      color: "#3b82f6",
                      fontWeight: 600,
                    }}
                  >
                    <CheckCheck size={13} /> All read
                  </button>
                )}
                <motion.button
                  whileTap={{ rotate: 180 }}
                  onClick={generateAndFetch}
                  title="Refresh"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: loading ? "#f8fafc" : "white",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                >
                  <RefreshCw
                    size={13}
                    style={
                      loading ? { animation: "spin 1s linear infinite" } : {}
                    }
                  />
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 4,
                padding: "8px 12px 0",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              {["ALL", "OVERDUE", "ASSIGNED", "UPDATED"].map((t) => {
                const count =
                  t === "ALL"
                    ? notifications.filter((n) => !n.read).length
                    : notifications.filter((n) => n.type === t && !n.read)
                        .length;
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: "6px 12px 8px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      color: active ? "#3b82f6" : "#64748b",
                      borderBottom: active
                        ? "2px solid #3b82f6"
                        : "2px solid transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.15s",
                    }}
                  >
                    {t}
                    {count > 0 && (
                      <span
                        style={{
                          background: active ? "#3b82f6" : "#e2e8f0",
                          color: active ? "white" : "#64748b",
                          borderRadius: 10,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 6px",
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {loading && notifications.length === 0 ? (
                <div
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  Loading…
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center" }}>
                  <Bell size={28} color="#e2e8f0" />
                  <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>
                    No notifications here
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((n) => {
                    const meta = TYPE_META[n.type] ?? TYPE_META.UPDATED;
                    const Icon = meta.Icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => !n.read && markOneRead(n.id)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "12px 14px",
                          background: n.read ? "white" : "#f8faff",
                          borderBottom: "1px solid #f8fafc",
                          cursor: n.read ? "default" : "pointer",
                          transition: "background 0.15s",
                          position: "relative",
                        }}
                      >
                        {/* Type icon */}
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            flexShrink: 0,
                            background: meta.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={15} color={meta.color} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 2,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: meta.color,
                                background: meta.bg,
                                padding: "1px 7px",
                                borderRadius: 8,
                              }}
                            >
                              {meta.label}
                            </span>
                            <span style={{ fontSize: 10, color: "#94a3b8" }}>
                              {n.taskId}
                            </span>
                            {!n.read && (
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "#3b82f6",
                                  marginLeft: "auto",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              color: "#334155",
                              lineHeight: 1.4,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 260,
                            }}
                          >
                            {n.message}
                          </p>
                          <p
                            style={{
                              margin: "3px 0 0",
                              fontSize: 11,
                              color: "#94a3b8",
                            }}
                          >
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>

                        {/* Dismiss */}
                        <button
                          onClick={(e) => deleteOne(n.id, e)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: "#cbd5e1",
                            padding: 2,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                          }}
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div
                style={{
                  padding: "8px 14px",
                  borderTop: "1px solid #f1f5f9",
                  textAlign: "center",
                  fontSize: 11,
                  color: "#94a3b8",
                }}
              >
                {notifications.length} total · refreshes every 60s
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

const Maindashboard_profile = () => {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const { logout } = useSession();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [frameworkFilterOpen, setFrameworkFilterOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);



  const {
    selectedFrameworks,
    toggleFramework,
    isAllSelected,
    availableFrameworks,
    frameworkColorMap,
  } = useFramework();
  const { startTutorial, openHelpNav } = useUI();
  const [, setSessionExpired] = useState(false);

  // ── useEffectiveOrg replaces manual user/org derivations ─────────────────
  const {
    user,
    mounted,
    isPartnerRoot,
    isOrgManager,
    isViewingManagedOrg,
    managedOrgs,
    selectedChildOrg,
    effectiveOrgId,
  } = useEffectiveOrg();

  // Show org switcher for both partner root AND org managers
  const showOrgSwitcher = isPartnerRoot || isOrgManager;

  // ── Fetch child orgs (partner root = all children, org manager = assigned only) ──
  const [childOrgs, setChildOrgs] = useState([]);

  // Temporarily add after the hook destructure
  console.log("useEffectiveOrg debug:", {
    isPartnerRoot,
    isOrgManager,
    showOrgSwitcher,
    childOrgs: childOrgs.length,
    mounted,
    userRole: user?.role,
    isPartnerOrg: sessionStorage.getItem("isPartnerOrg"),
    selectedChildOrg,
  });

  useEffect(() => {
    if (!mounted || !showOrgSwitcher) return;
    const token = sessionStorage.getItem("token");

    if (isPartnerRoot) {
      // fetch all child orgs
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
      // fetch only managed orgs by their IDs
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

  // ── Derived display values ────────────────────────────────────────────────
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const userId = user?.name ?? user?.email ?? "";

  const departmentLabel = (() => {
    if (!user) return "";
    const isPrivileged = Array.isArray(user.role)
      ? user.role.some((r) =>
          ["root", "dpo", "ciso", "aio", "super_admin"].includes(r),
        )
      : ["root", "dpo", "ciso", "aio", "super_admin"].includes(user.role);
    // Org manager viewing a managed org → root-level there
    if (isPrivileged || isViewingManagedOrg) return "All";
    if (user.departments?.length > 0)
      return user.departments.map((d) => d.name).join(", ");
    if (Array.isArray(user.department))
      return user.department.map((d) => d?.name || d).join(", ");
    return user.department?.name || "—";
  })();

  // ── Session / idle timer (unchanged) ─────────────────────────────────────
  const idleTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

  const isJwtExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    if (!user) setSessionExpired(true);
  }, [user]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();
    };
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));
    idleTimerRef.current = setInterval(() => {
      if (
        Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS &&
        isJwtExpired(token)
      ) {
        setSessionExpired(true);
        clearInterval(idleTimerRef.current);
      }
    }, 5000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      clearInterval(idleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setFrameworkOpen(false);
        setFrameworkFilterOpen(false);
        setTemplatesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavClick = (path) => {
    setDropdownOpen(false);
    setFrameworkOpen(false);
    setFrameworkFilterOpen(false);
    setTemplatesOpen(false);
    if (path) router.push(path);
  };

  const handleFrameworkToggle = (fw) => toggleFramework(fw);
  const handleLogout = () => logout();

  // ── Sub-components (unchanged) ────────────────────────────────────────────
  const AccordionRow = ({ icon: Icon, label, open, onToggle, children }) => (
    <div>
      <button
        onClick={onToggle}
        className="
          w-full flex items-center gap-2.5
          px-3 sm:px-4 py-2.5 sm:py-3
          text-xs sm:text-[13px] text-gray-700
          hover:bg-slate-50 transition-colors duration-150
          rounded-md cursor-pointer border-0 bg-transparent text-left
        "
      >
        <Icon size={15} className="text-gray-400 flex-shrink-0 sm:w-4 sm:h-4" />
        <span className="flex-1 font-medium">{label}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-6 sm:ml-7 mr-2 sm:mr-3 mb-1 bg-slate-50 rounded-md px-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const CompactFrameworkFilter = () => (
    <div style={{ padding: "8px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
          fontSize: "12px",
          color: "#1e293b",
          fontWeight: 600,
        }}
      >
        <span>Framework Filter</span>
        <div style={{ fontSize: "11px", color: "#64748b" }}>
          Showing data for
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "8px",
          flexWrap: "wrap",
        }}
      >
        {isAllSelected ? (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "12px",
              background: "#f1f5f9",
              color: "#3b82f6",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            All Frameworks
          </span>
        ) : (
          selectedFrameworks.map((fw) => (
            <span
              key={fw}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                padding: "2px 8px",
                borderRadius: "12px",
                background: `${frameworkColorMap[fw]}18`,
                color: frameworkColorMap[fw],
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: frameworkColorMap[fw],
                }}
              />
              {fw}
            </span>
          ))
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {[ALL_FRAMEWORKS, ...availableFrameworks.map((f) => f.id)].map((fw) => {
          const color = frameworkColorMap[fw];
          const active =
            fw === ALL_FRAMEWORKS
              ? isAllSelected
              : selectedFrameworks.includes(fw);
          return (
            <button
              key={fw}
              onClick={() => handleFrameworkToggle(fw)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                borderRadius: "14px",
                border: `1px solid ${active ? color : "#e2e8f0"}`,
                background: active ? `${color}10` : "white",
                color: active ? color : "#64748b",
                fontSize: "11px",
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
              title={active ? `Deselect ${fw}` : `Select ${fw}`}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: active ? color : "#e2e8f0",
                }}
              />
              {fw}
            </button>
          );
        })}
      </div>
    </div>
  );

  const SubItem = ({ label, path }) => (
    <button
      onClick={() => handleNavClick(path)}
      className="w-full text-left block px-2 py-2 sm:py-2.5 text-xs sm:text-[13px] text-gray-700 hover:text-blue-500 transition-colors duration-150 border-0 bg-transparent cursor-pointer"
    >
      {label}
    </button>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={openHelpNav}
          title="Help"
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 transition-colors flex-shrink-0"
        >
          <HelpCircle size={16} className="text-slate-500" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={startTutorial}
          className="flex items-center justify-center min-w-[100px] sm:min-w-[120px] md:min-w-[130px] h-9 sm:h-10 md:h-10 px-4 sm:px-5 md:px-6 flex-shrink-0 whitespace-nowrap text-white font-semibold tracking-[0.3px] text-[12px] sm:text-[13px] md:text-[14px] rounded-xl sm:rounded-[14px] bg-gradient-to-br from-[#667eea] to-[#764ba2] shadow-[0_4px_15px_rgba(102,126,234,0.35)] hover:shadow-[0_8px_22px_rgba(102,126,234,0.45)] active:scale-95 transition-all duration-300"
        >
          Start Tutorial
        </motion.button>

        <NotificationBell userId={userId} />

        <div
          ref={dropdownRef}
          className="relative flex items-center flex-shrink-0"
        >
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-[38px] md:h-[38px] rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-bold text-[10px] sm:text-[11px] md:text-xs cursor-pointer border-0 shadow-md hover:shadow-lg transition-all duration-200 ring-2 ring-violet-200 hover:ring-violet-400"
            aria-label="Open profile menu"
            aria-expanded={dropdownOpen}
          >
            {initials}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute top-[calc(100%+10px)] right-0 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.14)] border border-slate-100 min-w-[200px] sm:min-w-[220px] md:min-w-[240px] z-[2000] overflow-hidden"
              >
                {/* User info */}
                <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2.5 border-b border-slate-100">
                  <p className="font-semibold text-gray-800 text-[13px] sm:text-sm truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                    {departmentLabel}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 truncate">
                    {user?.email}
                  </p>
                  {/* Show which org they're currently viewing */}
                  {isViewingManagedOrg && (
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#7c3aed",
                        background: "#f5f3ff",
                        padding: "1px 8px",
                        borderRadius: 8,
                      }}
                    >
                      Root access
                    </span>
                  )}
                </div>

                {/* ── Org Switcher (partner root OR org manager) ── */}
                {showOrgSwitcher && (
                  <div
                    style={{
                      padding: "8px 12px",
                      margin: "4px 8px",
                      background: "#f8fafc",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94a3b8",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 6,
                      }}
                    >
                      Viewing Org
                    </div>
                    <select
                      value={
                        selectedChildOrg?._id || selectedChildOrg?.id || ""
                      }
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
                      {/* Label differs: root sees "All Orgs", manager sees "My Org" */}
                      <option value="">
                        {isPartnerRoot || isOrgManager
                          ? "— All Organizations —"
                          : "— My Organization —"}
                      </option>
                      {childOrgs.map((org) => (
                        <option
                          key={org._id || org.id}
                          value={org._id || org.id}
                        >
                          {org.name}
                          {/* badge hint in label */}
                          {isOrgManager ? " (delegated)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="py-1.5 sm:py-2 px-1.5 sm:px-2">
                  <AccordionRow
                    icon={ShieldCheck}
                    label="Framework Filter"
                    open={frameworkFilterOpen}
                    onToggle={() => setFrameworkFilterOpen((p) => !p)}
                  >
                    <CompactFrameworkFilter />
                  </AccordionRow>
                  <AccordionRow
                    icon={Users}
                    label="Framework"
                    open={frameworkOpen}
                    onToggle={() => setFrameworkOpen((p) => !p)}
                  >
                    {availableFrameworks.map((fw) => (
                      <SubItem key={fw.id} label={fw.label} path={fw.path} />
                    ))}
                  </AccordionRow>
                  <AccordionRow
                    icon={FileText}
                    label="Templates"
                    open={templatesOpen}
                    onToggle={() => setTemplatesOpen((p) => !p)}
                  >
                    <SubItem label="Policies" path="/policies" />
                    <SubItem label="Procedures" path="/procedures" />
                  </AccordionRow>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChangePassword(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-[13px] text-gray-700 hover:bg-slate-50 transition-colors duration-150 rounded-md cursor-pointer border-0 bg-transparent text-left"
                  >
                    <Key
                      size={15}
                      className="text-gray-400 flex-shrink-0 sm:w-4 sm:h-4"
                    />
                    <span className="font-medium">Change Password</span>
                  </button>

                  <hr className="my-1 border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-[13px] text-red-500 hover:bg-red-50 transition-colors duration-150 rounded-md cursor-pointer border-0 bg-transparent text-left"
                  >
                    <LogOut
                      size={15}
                      className="text-red-400 flex-shrink-0 sm:w-4 sm:h-4"
                    />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
};

export default Maindashboard_profile;
