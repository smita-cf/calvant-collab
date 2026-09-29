// components/NotificationBell.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Clock, UserCheck, RefreshCw, X } from "lucide-react";

// const BASE_URL = "https://api.calvant.com/task-service";
const BASE_URL = "http://localhost:4006"; // Local backend for testing 
const POLL_INTERVAL_MS = 60_000;          

const TYPE_META = {
  OVERDUE:  { label: "Overdue",  color: "#ef4444", bg: "#fef2f2", Icon: Clock      },
  ASSIGNED: { label: "Assigned", color: "#3b82f6", bg: "#eff6ff", Icon: UserCheck  },
  UPDATED:  { label: "Updated",  color: "#f59e0b", bg: "#fffbeb", Icon: RefreshCw  },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen]                   = useState(false);
  const [tab, setTab]                     = useState("ALL");   // ALL | OVERDUE | ASSIGNED | UPDATED
  const [loading, setLoading]             = useState(false);
  const panelRef                          = useRef(null);

  // Pull userId from session (matches your existing pattern)
  const user   = React.useMemo(() => {
    const s = sessionStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  }, []);
  const userId = user?.name ?? user?.email ?? "";

  // ── API helpers ─────────────────────────────────────────────

  const generateAndFetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // 1. Generate any new notifications server-side
      await fetch(`${BASE_URL}/api/notifications/generate?userId=${encodeURIComponent(userId)}`, {
        method: "POST",
      });
      // 2. Fetch full list
      const res  = await fetch(`${BASE_URL}/api/notifications?userId=${encodeURIComponent(userId)}`);
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
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    await fetch(`${BASE_URL}/api/notifications/read-all?userId=${encodeURIComponent(userId)}`, {
      method: "PUT",
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteOne = async (id, e) => {
    e.stopPropagation();
    await fetch(`${BASE_URL}/api/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ── Lifecycle ────────────────────────────────────────────────

  useEffect(() => {
    generateAndFetch();
    const interval = setInterval(generateAndFetch, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [generateAndFetch]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Derived state ────────────────────────────────────────────

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = tab === "ALL"
    ? notifications
    : notifications.filter((n) => n.type === tab);

  // ── Render ───────────────────────────────────────────────────

  return (
    <div ref={panelRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>

      {/* ── Bell button ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen((p) => !p)}
        style={{
          position: "relative",
          width: 36, height: 36,
          borderRadius: "50%",
          border: "none",
          background: open ? "#f1f5f9" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
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
              position: "absolute", top: 4, right: 4,
              minWidth: 16, height: 16,
              borderRadius: 8,
              background: "#ef4444",
              color: "white",
              fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px",
              border: "2px solid white",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* ── Dropdown panel ── */}
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
            <div style={{
              padding: "14px 16px 10px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", marginTop: 1 }}>
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
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "4px 10px", borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background: "white", cursor: "pointer",
                      fontSize: 11, color: "#3b82f6", fontWeight: 600,
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
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: loading ? "#f8fafc" : "white",
                    cursor: "pointer", color: "#64748b",
                  }}
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 4,
              padding: "8px 12px 0",
              borderBottom: "1px solid #f1f5f9",
            }}>
              {["ALL", "OVERDUE", "ASSIGNED", "UPDATED"].map((t) => {
                const count = t === "ALL"
                  ? notifications.filter(n => !n.read).length
                  : notifications.filter(n => n.type === t && !n.read).length;
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: "6px 12px 8px",
                      border: "none", background: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: active ? 700 : 500,
                      color: active ? "#3b82f6" : "#64748b",
                      borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent",
                      display: "flex", alignItems: "center", gap: 5,
                      transition: "all 0.15s",
                    }}
                  >
                    {t}
                    {count > 0 && (
                      <span style={{
                        background: active ? "#3b82f6" : "#e2e8f0",
                        color: active ? "white" : "#64748b",
                        borderRadius: 10, fontSize: 10, fontWeight: 700,
                        padding: "1px 6px",
                      }}>
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
                <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
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
                          display: "flex", alignItems: "flex-start", gap: 10,
                          padding: "12px 14px",
                          background: n.read ? "white" : "#f8faff",
                          borderBottom: "1px solid #f8fafc",
                          cursor: n.read ? "default" : "pointer",
                          transition: "background 0.15s",
                          position: "relative",
                        }}
                      >
                        {/* Type icon */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                          background: meta.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Icon size={15} color={meta.color} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: meta.color,
                              background: meta.bg, padding: "1px 7px", borderRadius: 8,
                            }}>
                              {meta.label}
                            </span>
                            <span style={{ fontSize: 10, color: "#94a3b8" }}>
                              {n.taskId}
                            </span>
                            {!n.read && (
                              <span style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: "#3b82f6", marginLeft: "auto", flexShrink: 0,
                              }} />
                            )}
                          </div>
                          <p style={{
                            margin: 0, fontSize: 12, color: "#334155",
                            lineHeight: 1.4,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            maxWidth: 260,
                          }}>
                            {n.message}
                          </p>
                          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#94a3b8" }}>
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => deleteOne(n.id, e)}
                          style={{
                            border: "none", background: "none", cursor: "pointer",
                            color: "#cbd5e1", padding: 2, flexShrink: 0,
                            display: "flex", alignItems: "center",
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
              <div style={{
                padding: "8px 14px",
                borderTop: "1px solid #f1f5f9",
                textAlign: "center",
                fontSize: 11, color: "#94a3b8",
              }}>
                {notifications.length} total · refreshes every 60s
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;