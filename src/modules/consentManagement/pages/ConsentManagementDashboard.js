import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useHistory } from "react-router-dom";
import consentService from "../services/consentService";
import {
  ShieldCheck,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  BarChart3,
  HelpCircle,
  ClipboardList,
  GitBranch,
} from "lucide-react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const ConsentManagementDashboard = () => {
  const history = useHistory();
  const chartsContainerRef = useRef(null);

  const [user] = useState(() => JSON.parse(sessionStorage.getItem("user")));
  const [consentStats, setConsentStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    expired: 0,
    pending: 0,
    auditCount: 0,
  });
  const [allRecords, setAllRecords] = useState([]);
  const [allAudits, setAllAudits] = useState([]);

  // ── Permission / scope derivation (same pattern as TaskManagementDashboard) ─
  const { isAdmin, departmentLabel } = useMemo(() => {
    if (!user) return { isAdmin: false, departmentLabel: "" };
    const roles = Array.isArray(user?.role) ? user.role : [user?.role || ""];
    const depts = user?.departments || [];
    const isRoot = user?.role?.some((r) => {
      const s = (typeof r === "string" ? r : r?.name || r?.roleName || "")
        .toLowerCase()
        .replace(/[\s_-]/g, "");
      return ["root", "ciso", "aio", "dpo"].some((role) => s.includes(role));
    });
    const isSuperAdmin = roles.includes("super_admin");
    return {
      isAdmin: isRoot || isSuperAdmin,
      departmentLabel: isRoot
        ? "All"
        : depts.map((d) => d.name).join(", ") ||
          user?.department?.name ||
          "General",
    };
  }, [user]);

  // ── ResizeObserver for charts ─────────────────────────────────────────────
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(window.consentResizeTimeout);
      window.consentResizeTimeout = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 150);
    });
    if (chartsContainerRef.current) {
      resizeObserver.observe(chartsContainerRef.current);
    }
    return () => {
      if (chartsContainerRef.current) {
        resizeObserver.unobserve(chartsContainerRef.current);
      }
      clearTimeout(window.consentResizeTimeout);
    };
  }, []);

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const [records, audits] = await Promise.all([
        consentService.getAllConsentRecords(),
        consentService.getAllAuditTrails(),
      ]);

      const orgRecords = Array.isArray(records)
        ? records.filter((r) => r.organization === user.organization || !r.organization)
        : records;

      const accessible = isAdmin
        ? orgRecords
        : orgRecords.filter(
            (r) =>
              r.department?.toLowerCase() ===
              user?.department?.name?.toLowerCase()
          );

      setAllRecords(accessible);
      setAllAudits(Array.isArray(audits) ? audits : []);
      setConsentStats({
        total: accessible.length,
        active: accessible.filter((r) => r.status === "Active").length,
        revoked: accessible.filter((r) => r.status === "Revoked").length,
        expired: accessible.filter((r) => r.status === "Expired").length,
        pending: accessible.filter((r) => r.status === "Pending").length,
        auditCount: Array.isArray(audits) ? audits.length : 0,
      });
    } catch (err) {
      console.error("Error loading consent stats:", err);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!user) history.push("/");
  }, [user, history]);

  // ── Charts data ───────────────────────────────────────────────────────────
  const getMonth = (d) => {
    if (!d) return null;
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][new Date(d).getMonth()];
  };

  const pieData = [
    { name: "Active", value: consentStats.active, color: "#10b981", desc: `${consentStats.active} active consents` },
    { name: "Revoked", value: consentStats.revoked, color: "#ef4444", desc: `${consentStats.revoked} revoked` },
    { name: "Expired", value: consentStats.expired, color: "#f59e0b", desc: `${consentStats.expired} expired` },
    { name: "Pending", value: consentStats.pending, color: "#6366f1", desc: `${consentStats.pending} pending` },
  ].filter((d) => d.value > 0);

  const monthlyMap = allRecords.reduce((acc, r) => {
    const m = getMonth(r.createdAt || r.created_at);
    if (m) acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  const barData = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(
    (n) => ({ name: n, value: monthlyMap[n] || 0 })
  );

  // ── Tooltips ──────────────────────────────────────────────────────────────
  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg min-w-[180px]">
        <div className="font-semibold text-slate-800 text-sm mb-1">{d.name}</div>
        <div className="text-xl font-bold text-slate-900 mb-1">{d.value}</div>
        <div className="text-xs text-slate-600">{d.desc}</div>
        <div className="text-xs text-slate-500 mt-1">
          {((d.value / (consentStats.total || 1)) * 100).toFixed(1)}% of total
        </div>
      </div>
    );
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const pct = consentStats.total > 0 ? ((d.value / consentStats.total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg min-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="font-bold text-sm text-slate-900">{d.name}</span>
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{d.value}</div>
        <div className="text-xs text-slate-500">{pct}% of total consents</div>
      </div>
    );
  };

  // ── Stats cards ───────────────────────────────────────────────────────────
  const statsCards = [
    { Icon: ShieldCheck, value: consentStats.total, label: "Total", color: "from-blue-400 to-blue-500" },
    { Icon: CheckCircle2, value: consentStats.active, label: "Active", color: "from-emerald-400 to-emerald-500" },
    { Icon: XCircle, value: consentStats.revoked, label: "Revoked", color: "from-red-400 to-red-500" },
    { Icon: Clock, value: consentStats.expired, label: "Expired", color: "from-orange-400 to-orange-500" },
    { Icon: Users, value: consentStats.pending, label: "Pending", color: "from-violet-400 to-violet-500" },
  ];

  // ── Action cards (the 2 main tiles) ──────────────────────────────────────
  const actionCards = [
    {
      id: "consent-records",
      icon: ClipboardList,
      title: "Consent Records",
      subtitle: "All Consent Data",
      path: "/consent-management/records",
      color: "from-teal-400 to-teal-500",
      primary: false,
    },
    {
      id: "audit-trails",
      icon: GitBranch,
      title: "Audit Trails",
      subtitle: "Activity Logs",
      path: "/consent-management/audit-trails",
      color: "from-indigo-400 to-indigo-500",
      primary: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-indigo-50/20 flex flex-col overflow-hidden">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-28 overflow-hidden">

        {/* ── Header ── */}
        <motion.header
          className="bg-white/80 backdrop-blur-md border border-slate-100/50 rounded-xl shadow-md mb-2 lg:mb-6 p-4 lg:p-5"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 lg:w-7 lg:h-7 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-semibold text-slate-800 leading-tight">
                  Consent Dashboard
                </h1>
                <p className="text-sm lg:text-base text-slate-600 mt-1">
                  {departmentLabel} •{" "}
                  <span className="font-bold text-lg text-slate-900">
                    {consentStats.total}
                  </span>{" "}
                  total consent records
                </p>
              </div>
            </div>
            <motion.button
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              onClick={() => history.push("/consent-management/records")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Activity size={18} />
              <span>View All</span>
            </motion.button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
          {/* ── Left: Stats + Action Cards ── */}
          <div className="space-y-8 lg:space-y-10">

            {/* Stats Grid */}
            <motion.section
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {statsCards.map(({ Icon, value, label, color }, i) => (
                <motion.div
                  key={label}
                  className="group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-lg p-4 lg:p-3.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center gap-2 hover:bg-white"
                  onClick={() => history.push("/consent-management/records")}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    <Icon size={16} className="text-white drop-shadow-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-lg lg:text-xl font-semibold text-slate-800 block leading-tight group-hover:text-slate-900">
                      {value}
                    </span>
                    <span className="text-xs lg:text-sm font-medium text-slate-600 uppercase tracking-wide">
                      {label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.section>

            {/* Action Cards */}
            <motion.section
              className="space-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-6 px-1">
                Quick Access
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <AnimatePresence>
                  {actionCards.map(
                    ({ id, icon: Icon, title, subtitle, path, color }, index) => (
                      <motion.div
                        key={id}
                        className="group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 hover:bg-white transition-all duration-300 cursor-pointer min-h-[160px]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => history.push(path)}
                      >
                        <div
                          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}
                        >
                          <Icon size={24} className="text-white drop-shadow-sm" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-slate-800 leading-tight mb-1 group-hover:text-teal-600 transition-colors duration-200">
                            {title}
                          </h4>
                          <p className="text-xs font-medium text-slate-500">
                            {subtitle}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Open →
                        </div>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>

              {/* Audit count badge */}
              <motion.div
                className="mt-4 bg-white/60 border border-slate-100 rounded-xl p-4 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <Activity size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {consentStats.auditCount} audit events recorded
                  </p>
                  <p className="text-xs text-slate-500">
                    Full activity history available in Audit Trails
                  </p>
                </div>
                <button
                  onClick={() => history.push("/consent-management/audit-trails")}
                  className="ml-auto text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  View →
                </button>
              </motion.div>
            </motion.section>
          </div>

          {/* ── Right: Charts ── */}
          <div ref={chartsContainerRef} className="space-y-4 lg:space-y-5">

            {/* Pie — Consent Status Distribution */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-72 flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-base lg:text-lg font-semibold text-slate-800 mb-4">
                Consent Status Distribution
              </h3>
              <div className="flex-1 flex items-center justify-center min-h-0">
                {consentStats.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={72}
                        paddingAngle={2}
                        stroke="white"
                        strokeWidth={3}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <text x="50%" y="42%" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize={12} fontWeight={600}>
                        Total
                      </text>
                      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fill="#1e293b" fontSize={22} fontWeight={800}>
                        {consentStats.total}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400">
                    <ShieldCheck size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No consent records yet</p>
                  </div>
                )}
              </div>
              {/* Legend */}
              {pieData.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-slate-600">{d.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Bar — Monthly Consent Activity */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-64 flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-base lg:text-lg font-semibold text-slate-800 mb-4">
                Monthly Consent Activity
              </h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((_, index) => (
                        <Cell key={`bar-${index}`} fill={`hsl(${170 + index * 3}, 60%, ${55 + index % 3 * 5}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsentManagementDashboard;
