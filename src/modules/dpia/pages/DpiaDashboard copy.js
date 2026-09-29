import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../hooks/useUser";
import { getAllAssessments } from "../services/dpiaApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ShieldCheck,
  ClipboardList,
  BarChart3,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonthLabel(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short" });
  } catch {
    return null;
  }
}

// ─── Custom Tooltips ─────────────────────────────────────────────────────────
function PieTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        minWidth: 150,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#1e293b",
          fontSize: 13,
          marginBottom: 2,
        }}
      >
        {d.name}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#1e293b",
          marginBottom: 2,
        }}
      >
        {d.value}
      </div>
      <div style={{ fontSize: 11, color: "#64748b" }}>
        {((d.value / (total || 1)) * 100).toFixed(1)}% of total
      </div>
    </div>
  );
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      }}
    >
      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 13 }}>
        {d.name}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
        {d.value}
      </div>
      <div style={{ fontSize: 11, color: "#64748b" }}>assessments</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const user = useUser();
  const organizationId = user?.organization;
  const router = useRouter();
  const chartsContainerRef = useRef(null);

  const [dpias, setDpias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(() => {
    setLoadingStats(true);
    setLoading(true);
    getAllAssessments(organizationId)
      .then((data) => {
        setDpias(Array.isArray(data) ? data : []);
        setLoadingStats(false);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || err?.message || "Failed to load",
        );
        setLoadingStats(false);
        setLoading(false);
      });
  }, [organizationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fix recharts in flex containers
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      clearTimeout(window._dpiaRO);
      window._dpiaRO = setTimeout(
        () => window.dispatchEvent(new Event("resize")),
        150,
      );
    });
    if (chartsContainerRef.current) ro.observe(chartsContainerRef.current);
    return () => {
      if (chartsContainerRef.current) ro.unobserve(chartsContainerRef.current);
    };
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────
  const total = dpias.length;
  const submitted = dpias.filter((d) => d.status === "SUBMITTED").length;
  const inProgress = dpias.filter((d) => d.status === "IN_PROGRESS").length;
  const draft = dpias.filter((d) => d.status === "DRAFT").length;
  const highRisk = dpias.filter((d) => d.overallRiskLevel === "HIGH").length;

  // ── Pie data ─────────────────────────────────────────────────────────────
  const pieData = [
    { name: "Submitted", value: submitted, color: "#10b981" },
    { name: "In Progress", value: inProgress, color: "#6366f1" },
    { name: "Draft", value: draft, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  // ── Bar data ─────────────────────────────────────────────────────────────
  const monthlyMap = dpias.reduce((acc, d) => {
    const m = getMonthLabel(d.createdDate);
    if (m) acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  const barData = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].map((m) => ({ name: m, value: monthlyMap[m] || 0 }));
  const BAR_COLORS = [
    "#3b82f6",
    "#60a5fa",
    "#93c5fd",
    "#bfdbfe",
    "#dbeafe",
    "#eff6ff",
    "#e0f2fe",
    "#bae6fd",
    "#7dd3fc",
    "#38bdf8",
    "#0ea5e9",
    "#0284c7",
  ];

  // ── Stat cards ───────────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Total",
      value: total,
      Icon: FileText,
      color: "from-blue-400 to-blue-500",
    },
    {
      label: "Submitted",
      value: submitted,
      Icon: CheckCircle2,
      color: "from-emerald-400 to-emerald-500",
    },
    {
      label: "In Progress",
      value: inProgress,
      Icon: Clock,
      color: "from-violet-400 to-violet-500",
    },
    {
      label: "Draft",
      value: draft,
      Icon: FileText,
      color: "from-amber-400 to-amber-500",
    },
    {
      label: "High Risk",
      value: highRisk,
      Icon: AlertCircle,
      color: "from-rose-400 to-rose-500",
    },
  ];

  // ── Quick actions ─────────────────────────────────────────────────────────
  const quickActions = [
    {
      key: "new",
      Icon: Plus,
      title: "New Assessment",
      subtitle: "Start a new DPIA",
      color: "from-blue-400 to-blue-600",
      onClick: () => router.push("/dpia/new"),
    },
    {
      key: "view",
      Icon: Eye,
      title: "View Assessments",
      subtitle: "Browse all assessments",
      color: "from-emerald-400 to-emerald-600",
      onClick: () => router.push("/dpia/assessments"),
    },
    {
      key: "compliance",
      Icon: ShieldCheck,
      title: "Compliance",
      subtitle: "Review submitted findings",
      color: "from-violet-400 to-violet-600",
      onClick: () => router.push("/dpia/assessments"),
    },
    {
      key: "reports",
      Icon: BarChart3,
      title: "Reports",
      subtitle: "Risk level overview",
      color: "from-amber-400 to-amber-500",
      onClick: () => router.push("/dpia/assessments"),
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col overflow-hidden"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-28">
        {/* ── HEADER ── */}
        <motion.header
          className="bg-white/80 backdrop-blur-md border border-slate-100/50 rounded-xl shadow-md mb-6 p-6"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <ShieldCheck className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-800 leading-tight">
                  DPIA Dashboard
                </h1>
                <p className="text-base text-slate-600 mt-1">
                  Data Protection Impact Assessment ·{" "}
                  <span className="font-bold text-2xl text-slate-900">
                    {total}
                  </span>{" "}
                  total assessments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={loadData}
                title="Refresh"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw
                  size={15}
                  className="text-slate-500"
                  style={
                    loading ? { animation: "spin 1s linear infinite" } : {}
                  }
                />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
            ⚠ {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-8">
            {/* Stat Cards */}
            <motion.section
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {statCards.map((stat, i) => {
                const Icon = stat.Icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3 h-20 hover:bg-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md flex-shrink-0`}
                    >
                      <Icon size={20} className="text-white drop-shadow-sm" />
                    </div>
                    <div>
                      <span className="text-2xl font-semibold text-slate-800 block leading-tight group-hover:text-slate-900">
                        {loadingStats ? "—" : stat.value}
                      </span>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {stat.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.section>

            {/* Quick Actions */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <AnimatePresence>
                  {quickActions.map((action, i) => {
                    const Icon = action.Icon;
                    return (
                      <motion.div
                        key={action.key}
                        className="group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-white transition-all duration-300 cursor-pointer"
                        initial={{ opacity: 0, scale: 0.93 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={action.onClick}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md mb-4`}
                        >
                          <Icon
                            size={22}
                            className="text-white drop-shadow-sm"
                          />
                        </div>
                        <p className="text-sm font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {action.subtitle}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

          {/* ── RIGHT COLUMN: CHARTS ── */}
          <div ref={chartsContainerRef} className="space-y-6">
            {/* Pie Chart */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-72 flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                Assessment Status
              </h3>
              <div className="flex-1 flex items-center justify-center min-h-0">
                {total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={75}
                        paddingAngle={3}
                        stroke="white"
                        strokeWidth={3}
                      >
                        {pieData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip total={total} />} />
                      <text
                        x="50%"
                        y="43%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fill: "#64748b",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Total
                      </text>
                      <text
                        x="50%"
                        y="57%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fill: "#1e293b",
                          fontSize: 22,
                          fontWeight: 800,
                        }}
                      >
                        {total}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <ShieldCheck
                      size={40}
                      className="text-slate-300 mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="text-base font-semibold text-slate-400 mb-1">
                      No Assessments Yet
                    </p>
                    <p className="text-sm text-slate-400">
                      Create your first DPIA to get started
                    </p>
                  </div>
                )}
              </div>
              {total > 0 && (
                <div className="flex gap-4 justify-center mt-2">
                  {pieData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: d.color,
                        }}
                      />
                      {d.name}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Bar Chart */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-72"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="mb-3">
                <h3 className="text-base font-semibold text-slate-800 mb-1">
                  Assessment Trends
                </h3>
                <p className="text-xs text-slate-500">
                  Assessments by month{" "}
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                    {total} total
                  </span>
                </p>
              </div>
              {barData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart
                    data={barData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#f8fafc"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                    />
                    <YAxis hide />
                    <Tooltip content={<BarTooltip />} />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={24}>
                      {barData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={BAR_COLORS[i % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <BarChart3
                    size={40}
                    className="text-slate-300 mb-3"
                    strokeWidth={1.5}
                  />
                  <p className="text-base font-semibold text-slate-400 mb-1">
                    No Trend Data
                  </p>
                  <p className="text-sm text-slate-400">
                    Assessments need date fields for trends
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-100/50 shadow-lg px-8 py-5 sticky bottom-0 z-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} CalVant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
