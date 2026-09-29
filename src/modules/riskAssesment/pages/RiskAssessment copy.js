import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { useRouter } from "next/navigation";
import riskService from "../services/riskService";
import { useFramework } from "../../../context/FrameworkContex";
import {
  BarChart3,
  FileText,
  PlusCircle,
  CheckCircle,
  FolderOpen,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Circle,
  XCircle,
  RefreshCw,
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
import Joyride from "react-joyride";
import { motion, AnimatePresence } from "framer-motion";

// â”€â”€â”€ Framework filter helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€â”€ Framework filter helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function riskMatchesFilter(risk, allowedRiskTypes) {
  const types = Array.isArray(risk.riskType)
    ? risk.riskType.map((t) => t.trim().toLowerCase())
    : risk.riskType
      ? String(risk.riskType)
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
      : [];
  if (types.length === 0) return false;
  const normalizedAllowed = new Set(
    [...allowedRiskTypes].map((t) => t.toLowerCase()),
  );
  return types.some((t) => normalizedAllowed.has(t));
}
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const RiskAssessment = () => {
  const router = useRouter();
  const chartsContainerRef = useRef(null);
  const [hasMounted, setHasMounted] = useState(false);
useEffect(() => { setHasMounted(true); }, []);

  // â”€â”€ Framework context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { selectedFrameworks, isAllSelected, availableFrameworks } =
    useFramework();

  // Compute allowed risk types for active filter (null = ALL, no filter)
  const allowedRiskTypes = useMemo(() => {
    if (isAllSelected) return null;
    const allowed = new Set();
    selectedFrameworks.forEach((fwId) => {
      const fw = availableFrameworks?.find((f) => f.id === fwId);
      if (fw && fw.riskTypes) {
        fw.riskTypes.forEach((rt) => allowed.add(rt));
      }
    });
    // Fallback: if somehow no risk types matched, we allow nothing or everything?
    // If no risk types are defined for the framework, it might show 0 risks.
    // That's expected if we enforce riskTypes filtering.
    return allowed;
  }, [selectedFrameworks, isAllSelected, availableFrameworks]);

  const {
    user,
    mounted,
    isRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();
  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role || ""];

  const deptLabel = isRoot
    ? "All"
    : (user?.departments || []).map((d) => d.name).join(", ") || "Your";

  const [run, setRun] = useState(false);
  const [departmentName, setDepartmentName] = useState("Your");
  const [allRisks, setAllRisks] = useState([]);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // â”€â”€ Framework-filtered view of risks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredRisks = useMemo(() => {
    if (!allowedRiskTypes) return allRisks;
    return allRisks.filter((r) => riskMatchesFilter(r, allowedRiskTypes));
  }, [allRisks, allowedRiskTypes]);

  // â”€â”€ Available years (from filteredRisks) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const availableYears = useMemo(
    () => [
      ...new Set(
        filteredRisks
          .map((r) => {
            const date = r.createdAt || r.created_at;
            return date ? new Date(date).getFullYear() : null;
          })
          .filter(Boolean),
      ),
    ],
    [filteredRisks],
  );

  // â”€â”€ Monthly risk data (from filteredRisks) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const monthlyRiskData = useMemo(() => {
    const months = [
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
    ].map((name) => ({ name, value: 0 }));
    filteredRisks.forEach((risk) => {
      const dateStr = risk.createdAt || risk.created_at;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (date.getFullYear() === selectedYear)
        months[date.getMonth()].value += 1;
    });
    return months;
  }, [filteredRisks, selectedYear]);

  // â”€â”€ Stats computed from filteredRisks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const riskStats = useMemo(() => {
    return filteredRisks.reduce(
      (acc, risk) => {
        acc.total++;
        const impact = Math.max(
          parseInt(risk.confidentiality) || 0,
          parseInt(risk.integrity) || 0,
          parseInt(risk.availability) || 0,
        );
        const probability = parseInt(risk.probability) || 0;
        const riskScore = impact * probability;
        const level =
          riskScore <= 3
            ? "low"
            : riskScore <= 8
              ? "medium"
              : riskScore <= 12
                ? "high"
                : "critical";
        acc[level]++;
        (risk.status || "").toLowerCase() === "closed"
          ? acc.closed++
          : acc.open++;
        return acc;
      },
      { total: 0, low: 0, medium: 0, high: 0, critical: 0, open: 0, closed: 0 },
    );
  }, [filteredRisks]);

  const steps = [
    {
      target: "#dashboard-header",
      content: `Welcome to your ${deptLabel} risk management dashboard.`,
    },
    { target: "#stats-grid", content: "Quick metrics overview at a glance." },
    {
      target: "#charts-container",
      content: "Visual risk distribution and trends analysis.",
    },
    {
      target: "#action-cards",
      content: "Quick access to all risk management tools.",
    },
  ];

  // â”€â”€ ResizeObserver fix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(
        () => window.dispatchEvent(new Event("resize")),
        150,
      );
    });
    if (chartsContainerRef.current)
      resizeObserver.observe(chartsContainerRef.current);
    return () => {
      if (chartsContainerRef.current)
        resizeObserver.unobserve(chartsContainerRef.current);
      clearTimeout(window.resizeTimeout);
    };
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/");
    }
  }, [mounted, user, router]);

  // useEffect(() => {
  //   collapseSidebar();
  // }, [collapseSidebar]);

  // â”€â”€ Load ALL org/dept risks (original logic unchanged) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadRiskStats = useCallback(async () => {
    if (!mounted || !user) return;
    try {
      const risks = await riskService.getAllRisks();
      if (!Array.isArray(risks)) return;

      const userOrgId = effectiveOrgId;
      const userDeptNames = isRoot
        ? []
        : (user.departments || []).map((d) =>
          (d.name || "").trim().toLowerCase(),
        );

      const departmentRisks = risks.filter((risk) => {
        const riskOrgId = risk.organization?._id || risk.organization;
        if (String(riskOrgId) !== String(userOrgId)) return false;
        if (isRoot) return true;
        if (!risk.department) return false;
        return userDeptNames.includes(risk.department.trim().toLowerCase());
      });

      setAllRisks(departmentRisks);
      setDepartmentName(
        isRoot
          ? "All"
          : (user?.departments || []).map((d) => d.name).join(", "),
      );
    } catch (error) {
      console.error("Error loading risk stats:", error);
    }
  }, [mounted, user, isRoot, effectiveOrgId]);

  useEffect(() => {
    loadRiskStats();
  }, [loadRiskStats]);

  if (!mounted || !user) return null;

  // â”€â”€ Chart data (from filteredRisks / riskStats) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pieData = [
    {
      name: "Low Risk",
      value: riskStats.low,
      color: "#10b981",
      desc: `${riskStats.low} low impact risks`,
    },
    {
      name: "Medium Risk",
      value: riskStats.medium,
      color: "#f59e0b",
      desc: `${riskStats.medium} medium risks`,
    },
    {
      name: "High Risk",
      value: riskStats.high,
      color: "#ef4444",
      desc: `${riskStats.high} high priority risks`,
    },
    {
      name: "Critical Risk",
      value: riskStats.critical,
      color: "#dc2626",
      desc: `${riskStats.critical} critical risks`,
    },
  ].filter((d) => d.value > 0);

  const realQuarterlyData = filteredRisks.reduce((acc, risk) => {
    const dateStr = risk.createdAt || risk.created_at;
    if (!dateStr) return acc;
    const q = `Q${Math.floor(new Date(dateStr).getMonth() / 3) + 1}`;
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {});

  const barData = [
    {
      name: "Q1",
      value: realQuarterlyData.Q1 || 0,
      desc: "Jan-Mar: Risk assessments created",
    },
    {
      name: "Q2",
      value: realQuarterlyData.Q2 || 0,
      desc: "Apr-Jun: Risk assessments created",
    },
    {
      name: "Q3",
      value: realQuarterlyData.Q3 || 0,
      desc: "Jul-Sep: Risk assessments created",
    },
    {
      name: "Q4",
      value: realQuarterlyData.Q4 || 0,
      desc: "Oct-Dec: Risk assessments created",
    },
  ];

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg min-w-[200px]">
          <div className="font-semibold text-slate-800 text-sm mb-1">
            {data.name}
          </div>
          <div className="text-xl font-bold text-slate-900 mb-1">
            {data.value}
          </div>
          <div className="text-xs text-slate-600">{data.desc}</div>
          <div className="text-xs text-slate-500 mt-1">
            {((data.value / (riskStats.total || 1)) * 100).toFixed(1)}% of total
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
          <div className="font-semibold text-slate-800 text-sm mb-1">
            {data.name}
          </div>
          <div className="text-xl font-bold text-slate-900 mb-1">
            {data.value}
          </div>
          <div className="text-xs text-slate-600 mb-1">{data.desc}</div>
          <div className="text-xs text-slate-500">Total Risks</div>
        </div>
      );
    }
    return null;
  };

  const actionCards = [
    {
      id: "templates",
      icon: FolderOpen,
      title: "Templates",
      subtitle: "Sample Risks",
      path: "/risk-assessment/templates",
      color: "from-violet-400 to-violet-500",
    },
    {
      id: "add",
      icon: PlusCircle,
      title: "New Risks",
      subtitle: "Add Risk",
      path: "/risk-assessment/add",
      color: "from-emerald-400 to-emerald-500",
      primary: true,
    },
    {
      id: "tasks",
      icon: CheckCircle,
      title: "View Tasks",
      subtitle: "Assigned",
      path: "/risk-assessment/my-tasks",
      color: "from-amber-400 to-amber-500",
    },
    {
      id: "risks",
      icon: AlertTriangle,
      title: "View Risks",
      subtitle: "Departmental",
      path: "/risk-assessment/saved",
      color: "from-red-400 to-red-500",
      show: userRoles.some((r) =>
        [
          "risk_owner",
          "risk_manager",
          "risk_identifier",
          "super_admin",
          "root",
        ].includes(r),
      ),
    },
    {
      id: "soa",
      icon: FileText,
      title: "Statement of Applicability",
      subtitle: "SoA",
      path: "/risk-assessment/soa",
      color: "from-sky-400 to-sky-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col overflow-hidden">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-28 overflow-hidden">
        <Joyride
          steps={steps}
          run={run}
          continuous
          showSkipButton
          scrollToFirstStep
          styles={{ options: { primaryColor: "#3b82f6", width: 300 } }}
        />

        {/* â”€â”€ Professional Header â”€â”€ */}
        <motion.header
          id="dashboard-header"
          className="bg-white/80 backdrop-blur-md border border-slate-100/50 rounded-xl shadow-md mb-2 lg:mb-2 p-4 lg:p-5 !text-left"
          style={{
            textAlign: "left",
            width: "100%",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between w-full">

            <div
              className="flex items-center gap-4 flex-1"
              style={{
                justifyContent: "flex-start",
                textAlign: "left",
                alignItems: "flex-start",
              }}
            >
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 lg:w-7 lg:h-7 text-white drop-shadow-sm" />
              </div>

              <div className="flex-1 min-w-0" style={{ textAlign: "left" }}>
                {/* Title row â€” framework badges sit inline */}
                <div
                  className="flex items-center justify-start gap-2 flex-wrap"
                  style={{ justifyContent: "flex-start" }}
                >
                  <h1 className="text-xl lg:text-2xl font-semibold text-slate-800 leading-tight">
                    Risks Dashboard
                  </h1>

                  {/* Framework filter pills â€” only shown when a specific filter is active */}
                  {!isAllSelected &&
                    selectedFrameworks.map((fwId) => {
                      const fwObj = availableFrameworks?.find(
                        (f) => f.id === fwId,
                      );
                      const bg = fwObj?.color ? fwObj.color + "15" : "#f1f5f9";
                      const color = fwObj?.color || "#334155";
                      const border = fwObj?.color
                        ? fwObj.color + "40"
                        : "#cbd5e1";
                      return (
                        <span
                          key={fwId}
                          title={`Showing risks filtered by ${fwId}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: bg,
                            color: color,
                            border: `1px solid ${border}`,
                            fontSize: 11,
                            fontWeight: 700,
                            boxShadow: `0 0 0 2px ${border}33`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: color || "#94a3b8",
                              flexShrink: 0,
                            }}
                          />
                          {fwId}
                        </span>
                      );
                    })}
                </div>

                {/* Department + total row */}
                <p className="text-sm lg:text-base text-slate-600 mt-0.5">
                  {departmentName} {" "}
                  <span className="font-bold text-lg text-slate-900">
                    {riskStats.total}{" "}
                  </span>{" "}
                  <span className="text-slate-400 text-xs ml-1">
                    Total Risks
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${isRoot ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                {isRoot ? "Root" : (userRoles[0] ? userRoles[0].replace("_", " ") : "User")}
              </span>
              <span className="text-sm font-semibold text-slate-600">
                {user?.name || "User"}
              </span>
              <motion.button
                onClick={loadRiskStats}
                title="Refresh"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={15} className="text-slate-500" />
              </motion.button>
              <motion.button
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                onClick={() => {
                  setRun(false);
                  setTimeout(() => setRun(true), 100);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HelpCircle size={18} />
                <span>Guide</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 w-full min-w-0">
          {/* Left: Stats + Actions */}
          <div className="space-y-8 lg:space-y-10 w-full min-w-0">
            {/* Stats Grid */}
            <motion.section
              id="stats-grid"
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {[
                {
                  Icon: BarChart3,
                  value: riskStats.total,
                  label: "Total",
                  color: "from-blue-400 to-blue-500",
                },
                {
                  Icon: AlertTriangle,
                  value: riskStats.high + riskStats.critical,
                  label: "High",
                  color: "from-red-400 to-red-500",
                },
                {
                  Icon: XCircle,
                  value: riskStats.medium,
                  label: "Medium",
                  color: "from-orange-400 to-orange-500",
                },
                {
                  Icon: CheckCircle2,
                  value: riskStats.low,
                  label: "Low",
                  color: "from-emerald-400 to-emerald-500",
                },
                {
                  Icon: Circle,
                  value: riskStats.open,
                  label: "Open",
                  color: "from-sky-400 to-sky-500",
                },
                {
                  Icon: CheckCircle,
                  value: riskStats.closed,
                  label: "Closed",
                  color: "from-purple-400 to-purple-500",
                },
              ].map(({ Icon, value, label, color }, i) => (
                <motion.div
                  key={label}
                  className="group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-lg p-4 lg:p-3.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center gap-2 h-17 lg:h-17 hover:bg-white"
                  onClick={() => router.push("/risk-assessment/saved")}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    <Icon
                      size={16}
                      className="lg:size-18 text-white drop-shadow-sm"
                    />
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

            {/* Quick Actions */}
            <motion.section
              id="action-cards"
              className="space-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-6 px-1">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-15">
                <AnimatePresence>
                  {actionCards.map(
                    (
                      {
                        id,
                        icon: Icon,
                        title,
                        subtitle,
                        path,
                        color,
                        primary,
                        show = true,
                      },
                      index,
                    ) =>
                      show && (
                        <motion.div
                          key={id}
                          className={`group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl p-4 h-full flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-white transition-all duration-300 cursor-pointer ${primary ? "ring-2 ring-emerald-200/50 bg-gradient-to-br " + color : ""}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.4 + index * 0.06,
                          }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => router.push(path)}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-md flex-shrink-0 ${primary ? "bg-white/20 backdrop-blur-sm" : `bg-gradient-to-br ${color}`}`}
                          >
                            <Icon
                              size={20}
                              className="text-white drop-shadow-sm"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h4 className="text-sm lg:text-base font-semibold text-center text-slate-800 leading-tight mb-1 px-1 truncate group-hover:text-blue-600 transition-colors duration-200">
                              {title}
                            </h4>
                            <p className="text-xs font-bold text-center text-slate-1000 px-1 truncate">
                              {subtitle}
                            </p>
                          </div>
                        </motion.div>
                      ),
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

          {/* Right: Charts */}
          <div
            ref={chartsContainerRef}
            id="charts-container"
            className="space-y-4 lg:space-y-3 w-full min-w-0"
          >
            {/* Pie chart */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-9 lg:p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-400 h-72 flex flex-col w-full min-w-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-base lg:text-lg font-semibold text-slate-800 mb-6 px-1">
                Risk Distribution
              </h3>
              <div className="flex-1 flex items-center justify-center min-h-0 w-full min-w-0">
                {riskStats.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" debounce={50}>
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
                      <text
                        x="50%"
                        y="42%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-slate-700 text-sm font-semibold"
                      >
                        Total
                      </text>
                      <text
                        x="50%"
                        y="52%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-slate-900 text-xl lg:text-2xl font-bold"
                      >
                        {riskStats.total}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <BarChart3
                      size={40}
                      className="text-slate-400 mb-4"
                      strokeWidth={1.5}
                    />
                    <p className="text-lg font-semibold text-slate-500 mb-2">
                      No Data
                    </p>
                    <p className="text-sm text-slate-500 max-w-xs">
                      {!isAllSelected
                        ? `No risks found for ${selectedFrameworks.join(" + ")}`
                        : "Start by adding risk assessments"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Bar chart */}
            <motion.div
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(241,245,249,0.6)",
                borderRadius: "16px",
                padding: "24px",
                height: "288px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                transition: "all 0.4s ease",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                minWidth: 0,
              }}
              whileHover={{ scale: 1.01 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: "4px",
                    }}
                  >
                    Monthly Risk Trends
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      fontWeight: 500,
                    }}
                  >
                    Number of risks created each month
                  </p>
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    fontSize: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    background: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                  }}
                >
                  {availableYears.length > 0 ? (
                    availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))
                  ) : (
                    <option value={selectedYear}>{selectedYear}</option>
                  )}
                </select>
              </div>

              <div style={{ width: "100%", height: "100%", minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    <BarChart
                      data={monthlyRiskData}
                      margin={{ top: 15, right: 15, left: -5, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient
                          id="riskGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="95%"
                            stopColor="#93c5fd"
                            stopOpacity={0.6}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        vertical={false}
                        stroke="#f1f5f9"
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="value"
                        fill="url(#riskGradient)"
                        radius={[6, 6, 0, 0]}
                        barSize={24}
                        animationDuration={800}
                      />
                    </BarChart>
                  </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-100/50 shadow-lg px-6 py-4 lg:px-8 lg:py-5 sticky bottom-0 z-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm lg:text-base text-slate-600 font-medium">
            Â© {new Date().getFullYear()} CalVant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RiskAssessment;
