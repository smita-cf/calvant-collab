'use client'

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import GroupIcon from "@mui/icons-material/Group";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BusinessIcon from "@mui/icons-material/Business";
import QuizIcon from "@mui/icons-material/Quiz";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FilterListIcon from "@mui/icons-material/FilterList";
import ShieldIcon from "@mui/icons-material/Shield";

import { jwtDecode } from "jwt-decode";
import axios from "axios";
import api from "../../services/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
);

const TPRM_BASE = "https://api.calvant.com/tprm-service/api/tprm/vendors";
const ROOT_RISKS_BASE = "https://api.calvant.com/risk-service/api/risks";

const ACCESS = {
  METRIC_USERS: ["root", "super_admin", "ciso", "steering_committee_member"],
  METRIC_VENDORS: ["root", "super_admin", "risk_manager", "risk_owner", "ciso"],
  METRIC_RISKS: [
    "root",
    "super_admin",
    "risk_manager",
    "risk_owner",
    "ciso",
    "steering_committee_member",
    "audit_manager",
  ],
  METRIC_GAPS: ["super_admin"],
  METRIC_LOGS: ["root", "super_admin", "ciso"],
  METRIC_DEPTS: ["root", "super_admin", "ciso"],
  CHART_ACTIVITY: ["root", "super_admin", "ciso"],
  CHART_RISK_PROFILE: [
    "root",
    "super_admin",
    "risk_manager",
    "risk_owner",
    "ciso",
    "steering_committee_member",
  ],
  SECTION_USER_LIST: [
    "root",
    "super_admin",
    "ciso",
    "steering_committee_member",
  ],
  SECTION_DEPT_LIST: ["root", "super_admin", "ciso"],
  SECTION_VENDOR_LIST: [
    "root",
    "super_admin",
    "risk_manager",
    "risk_owner",
    "ciso",
  ],
  SECTION_RISK_LEDGER: [
    "root",
    "super_admin",
    "risk_manager",
    "risk_owner",
    "ciso",
    "steering_committee_member",
    "audit_manager",
  ],
};

const ACTION_COLORS = {
  PAGE_LOAD: "#3b82f6",
  LOGIN: "#10b981",
  LOGOUT: "#f97316",
  CREATE: "#10b981",
  UPDATE: "#f97316",
  DELETE: "#f43f5e",
};

const PALETTE = {
  bg: "#f0f4f8",
  surface: "#ffffff",
  border: "#e2e8f0",
  borderAccent: "#cbd5e1",
  text: "#0f172a",
  textSub: "#475569",
  textMuted: "#94a3b8",
  blue: "#2563eb",
  blueLight: "#eff6ff",
  green: "#059669",
  greenLight: "#ecfdf5",
  red: "#dc2626",
  redLight: "#fef2f2",
  amber: "#d97706",
  amberLight: "#fffbeb",
  purple: "#7c3aed",
  purpleLight: "#f5f3ff",
  cyan: "#0891b2",
  cyanLight: "#ecfeff",
  slate: "#64748b",
  slateLight: "#f8fafc",
};

const formatLogItem = (item) => {
  if (!item) return "—";
  try {
    const arr = Array.isArray(item) ? item : [item];
    return arr
      .map((entry) => {
        if (typeof entry === "object") {
          return Object.entries(entry)
            .filter(([k, v]) => !["password", "token"].includes(k) && v != null)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
        }
        return String(entry);
      })
      .join(" | ");
  } catch (e) {
    return "—";
  }
};

const renderRiskStatus = (status) => {
  const lower = status?.toLowerCase();
  let bg = PALETTE.slateLight,
    color = PALETTE.slate;
  if (lower === "open") {
    bg = PALETTE.redLight;
    color = PALETTE.red;
  } else if (lower === "closed") {
    bg = PALETTE.greenLight;
    color = PALETTE.green;
  } else if (lower === "in progress") {
    bg = PALETTE.amberLight;
    color = PALETTE.amber;
  }
  return (
    <Chip
      label={status?.replace("_", " ") || "N/A"}
      size="small"
      sx={{
        backgroundColor: bg,
        color,
        fontWeight: 700,
        fontSize: "0.65rem",
        borderRadius: "6px",
        height: "22px",
        border: `1px solid ${color}40`,
        letterSpacing: "0.3px",
      }}
    />
  );
};

const getRiskLevelColor = (level) => {
  const l = String(level || "").toLowerCase();
  if (l === "critical") return PALETTE.red;
  if (l === "high") return "#ea580c";
  if (l === "medium") return PALETTE.amber;
  if (l === "low") return PALETTE.green;
  return PALETTE.slate;
};

// ── Reusable Design Components ──────────────────────────────────────────────

const SurfaceCard = ({ children, sx = {}, noPad = false }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: "16px",
      background: PALETTE.surface,
      border: `1px solid ${PALETTE.border}`,
      height: "100%",
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
      "&:hover": {
        boxShadow: "0 8px 30px rgba(0,0,0,0.07)",
        transform: "translateY(-1px)",
      },
      ...sx,
    }}
  >
    {children}
  </Card>
);

const SectionHeader = ({ title, subtitle, action, icon }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="flex-start"
    sx={{ mb: 2 }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      {icon && (
        <Box
          sx={{ color: PALETTE.blue, display: "flex", alignItems: "center" }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 18 } })}
        </Box>
      )}
      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            color: PALETTE.text,
            fontSize: "0.95rem",
            lineHeight: 1.2,
            letterSpacing: "-0.2px",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              color: PALETTE.textMuted,
              fontSize: "0.72rem",
              fontWeight: 500,
              mt: 0.2,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Stack>
);

const Divider = () => (
  <Box sx={{ height: "1px", bgcolor: PALETTE.border, mx: -2.5, mb: 2 }} />
);

const MetricCard = ({
  title,
  value,
  icon,
  color,
  colorLight,
  trend,
  subtitle,
}) => (
  <SurfaceCard>
    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box
          sx={{
            p: 1.25,
            borderRadius: "12px",
            backgroundColor: colorLight || `${color}15`,
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 20 } })}
        </Box>
        {trend !== undefined && (
          <Chip
            label={`${trend > 0 ? "▲" : "▼"} ${Math.abs(trend)}%`}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.6rem",
              fontWeight: 700,
              bgcolor: trend > 0 ? PALETTE.greenLight : PALETTE.redLight,
              color: trend > 0 ? PALETTE.green : PALETTE.red,
              borderRadius: "6px",
            }}
          />
        )}
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Typography
          sx={{
            fontSize: "1.85rem",
            fontWeight: 800,
            color: PALETTE.text,
            lineHeight: 1,
            letterSpacing: "-1px",
          }}
        >
          {value ?? "—"}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: PALETTE.textSub,
            mt: 0.5,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{ fontSize: "0.65rem", color: PALETTE.textMuted, mt: 0.25 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </CardContent>
  </SurfaceCard>
);

const StyledTableHead = ({ columns }) => (
  <TableHead>
    <TableRow sx={{ bgcolor: PALETTE.slateLight }}>
      {columns.map((col, i) => (
        <TableCell
          key={i}
          align={col.align || "left"}
          sx={{
            fontWeight: 700,
            color: PALETTE.textSub,
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            borderBottom: `1px solid ${PALETTE.border}`,
            py: 1.25,
            px: 2,
            whiteSpace: "nowrap",
            ...(i === 0 ? { borderRadius: "0" } : {}),
          }}
        >
          {col.label}
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);

const StyledTableRow = ({ children, ...props }) => (
  <TableRow
    hover
    sx={{
      "& td": {
        borderBottom: `1px solid ${PALETTE.border}`,
        py: 1.25,
        px: 2,
        fontSize: "0.82rem",
        color: PALETTE.text,
      },
      "&:last-child td": { border: 0 },
      "&:hover": { bgcolor: "#f8fafc" },
      transition: "background 0.12s",
    }}
    {...props}
  >
    {children}
  </TableRow>
);

const NavButton = ({ href, children }) => (
  <IconButton
    href={href}
    size="small"
    sx={{
      border: `1px solid ${PALETTE.border}`,
      borderRadius: "8px",
      p: 0.75,
      color: PALETTE.textSub,
      "&:hover": {
        bgcolor: PALETTE.blueLight,
        color: PALETTE.blue,
        borderColor: PALETTE.blue,
      },
      transition: "0.15s",
    }}
  >
    {children || <ArrowForwardIcon sx={{ fontSize: 15 }} />}
  </IconButton>
);

const RoleBadge = ({ role }) => {
  const roleColors = {
    root: { bg: "#fef3c7", color: "#92400e" },
    super_admin: { bg: "#ede9fe", color: "#5b21b6" },
    ciso: { bg: "#dbeafe", color: "#1e40af" },
    risk_manager: { bg: "#dcfce7", color: "#166534" },
    default: { bg: PALETTE.slateLight, color: PALETTE.slate },
  };
  const style = roleColors[role] || roleColors.default;
  return (
    <Chip
      label={role?.replace(/_/g, " ")}
      size="small"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 700,
        fontSize: "0.65rem",
        height: 22,
        borderRadius: "6px",
        textTransform: "capitalize",
      }}
    />
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    users: [],
    departments: [],
    organizations: [],
    gaps: [],
    logs: [],
    vendors: [],
    risks: [],
    seo: [],
  });
  const [selectedOrgId, setSelectedOrgId] = useState("all");

  const muiTheme = useTheme();
  const isXs = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const isSm = useMediaQuery(muiTheme.breakpoints.between("sm", "md"));

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const myObject = JSON.parse(localStorage.getItem("myObject") || "{}");
  const userData = JSON.parse(sessionStorage.getItem("user") || "{}");

  const organizationId = myObject?.organization || null;
  const loggedInRole = (
    (Array.isArray(decoded?.role) ? decoded.role[0] : decoded?.role) ||
    localStorage.getItem("role") ||
    "user"
  ).toLowerCase();
  const userDept = userData?.department || userData?.dept || null;
  const canAccess = (key) => ACCESS[key]?.includes(loggedInRole);
  const isMaster = loggedInRole === "super_admin" || loggedInRole === "root";

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const vendorParams =
          loggedInRole === "super_admin"
            ? {}
            : { organization: organizationId };
        const username = "username";
        const password = "password";
        const basicToken = btoa(`${username}:${password}`);

        const requests = [];
        requests.push(api.get("https://api.calvant.com/user-service/api/users").catch(() => ({ data: [] })));
        requests.push(api.get("https://api.calvant.com/user-service/api/departments").catch(() => ({ data: [] })));
        requests.push(api.get("https://api.calvant.com/user-service/api/organizations").catch(() => ({ data: [] })));
        requests.push(
          axios
            .get("https://api.calvant.com/gap-questions/api/gaps")
            .catch(() => ({ data: [] })),
        );
        requests.push(
          fetch("https://api.calvant.com/logging-service/api/logs", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .catch(() => []),
        );
        requests.push(
          axios
            .get(TPRM_BASE, {
              headers: { Authorization: `Bearer ${token}` },
              params: vendorParams,
            })
            .catch(() => ({ data: [] })),
        );
        requests.push(
          fetch(ROOT_RISKS_BASE, {
            headers: {
              Authorization: `Basic ${basicToken}`,
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => ({ data }))
            .catch(() => ({ data: [] })),
        );
        requests.push(
          axios
            .get("https://api.calvant.com/risk-template-service/api/risks")
            .catch(() => ({ data: [] })),
        );
        requests.push(
          axios
            .get("https://api.calvant.com/seo-form/api/seo")
            .catch(() => ({ data: [] })),
        );

        const [
          usersRes,
          deptsRes,
          orgsRes,
          gapsRes,
          logsRes,
          vendorsRes,
          risksRes,
          templateRisksRes,
          seoRes,
        ] = await Promise.all(requests);

        const extract = (res) => {
          if (!res) return [];
          const body = res.data || res;
          if (Array.isArray(body)) return body;
          if (Array.isArray(body.content)) return body.content;
          if (Array.isArray(body.data)) return body.data;
          if (Array.isArray(body.vendors)) return body.vendors;
          if (body.data && Array.isArray(body.data.data)) return body.data.data;
          return [];
        };

        const finalRisks =
          loggedInRole === "super_admin"
            ? extract(templateRisksRes)
            : extract(risksRes);

        setData({
          users: extract(usersRes),
          departments: extract(deptsRes),
          organizations: extract(orgsRes),
          gaps: extract(gapsRes),
          logs: extract(logsRes).reverse(),
          vendors: extract(vendorsRes),
          risks: finalRisks,
          seo: extract(seoRes),
        });
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAllData();
  }, [token, loggedInRole, organizationId]);

  const isTenant = ["steering_committee_member", "ciso", "aio", "dpo"].includes(
    loggedInRole,
  );

  const filteredUsers = useMemo(() => {
    let pool = data.users;
    if (loggedInRole === "super_admin" && selectedOrgId !== "all") {
      pool = pool.filter(
        (u) =>
          String(u.organization) === String(selectedOrgId) ||
          String(u.orgId) === String(selectedOrgId),
      );
    } else if (isTenant) {
      pool = pool.filter(
        (u) =>
          String(u.organization) === String(organizationId) ||
          String(u.orgId) === String(organizationId),
      );
    }
    if (
      loggedInRole !== "super_admin" &&
      loggedInRole !== "root" &&
      !isTenant &&
      userDept
    ) {
      pool = pool.filter((u) => {
        const d = Array.isArray(u.department) ? u.department : [u.department];
        return d.includes(userDept) || d.includes(String(userDept));
      });
    }
    return pool;
  }, [
    data.users,
    loggedInRole,
    selectedOrgId,
    organizationId,
    userDept,
    isTenant,
  ]);

  const filteredRisks = useMemo(() => {
    let pool = data.risks;
    if (loggedInRole === "super_admin") {
      if (selectedOrgId !== "all") {
        pool = pool.filter(
          (r) =>
            String(r.organizationId) === String(selectedOrgId) ||
            String(r.orgId) === String(selectedOrgId),
        );
        if (pool.length === 0) {
          const orgDepts = data.departments
            .filter((d) => String(d.organizationId) === String(selectedOrgId))
            .map((d) => d.departmentName);
          pool = data.risks.filter(
            (r) => orgDepts.includes(r.department) || orgDepts.includes(r.dept),
          );
        }
      }
    } else if (userDept && !isTenant && loggedInRole !== "root") {
      pool = pool.filter(
        (r) => r.department === userDept || r.dept === userDept,
      );
    }
    return pool;
  }, [
    data.risks,
    loggedInRole,
    selectedOrgId,
    data.departments,
    isTenant,
    userDept,
  ]);

  const risksByLevel = useMemo(
    () =>
      filteredRisks.reduce((acc, risk) => {
        const level = (
          risk.riskLevel ||
          risk.riskScore ||
          risk.level ||
          "UNKNOWN"
        )
          .toString()
          .toUpperCase();
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {}),
    [filteredRisks],
  );

  const deptWorkforce = useMemo(() => {
    if (loggedInRole !== "root") return [];
    const orgDepts = organizationId
      ? data.departments.filter(
          (d) => String(d.organization) === String(organizationId),
        )
      : data.departments;
    const orgUsers = organizationId
      ? data.users.filter(
          (u) => String(u.organization) === String(organizationId),
        )
      : data.users;
    return orgDepts
      .map((dept) => {
        const deptId = String(dept._id || dept.id);
        const userCount = orgUsers.filter((u) => {
          const d = u.department || u.dept || u.idDept;
          if (Array.isArray(d)) return d.some((id) => String(id) === deptId);
          return String(d) === deptId;
        }).length;
        const share =
          orgUsers.length > 0
            ? ((userCount / orgUsers.length) * 100).toFixed(1)
            : "0.0";
        const org = data.organizations.find(
          (o) => String(o._id || o.id) === String(dept.organization),
        );
        return {
          id: deptId,
          name: dept.name || "Unnamed",
          count: userCount,
          share,
          orgName: org ? org.name : "—",
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [
    data.departments,
    data.users,
    data.organizations,
    loggedInRole,
    organizationId,
  ]);

  const healthScore = useMemo(() => {
    const critical = risksByLevel["CRITICAL"] || 0;
    const high = risksByLevel["HIGH"] || 0;
    const med = risksByLevel["MEDIUM"] || 0;
    return Math.max(0, 100 - (critical * 12 + high * 6 + med * 2));
  }, [risksByLevel]);

  const logPulseData = useMemo(() => {
    if (loggedInRole !== "super_admin") return { labels: [], counts: [] };
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const labels = [],
      counts = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(days[d.getDay()]);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      counts.push(
        data.logs.filter((log) => {
          const ts = log.timestamp || log.createdAt;
          if (!ts) return false;
          const lDate = new Date(ts);
          return lDate >= start && lDate <= end;
        }).length,
      );
    }
    return { labels, counts };
  }, [data.logs, loggedInRole]);

  const metrics = useMemo(() => {
    if (loggedInRole === "super_admin" || loggedInRole === "root") {
      return [
        {
          title: "Total Users",
          value: data.users.length,
          icon: <GroupIcon />,
          color: PALETTE.blue,
          colorLight: PALETTE.blueLight,
        },
        ...(loggedInRole !== "root"
  ? [
      {
        title: "Organizations",
        value: data.organizations.length,
        icon: <BusinessIcon />,
        color: PALETTE.purple,
      },
    ]
  : []),
        {
          title: "Departments",
          value: data.departments.length,
          icon: <AccountBalanceIcon />,
          color: PALETTE.cyan,
          colorLight: PALETTE.cyanLight,
        },
        ...(loggedInRole === "root"
          ? [
              {
                title: "Active Vendors",
                value: data.vendors.length,
                icon: <StorefrontIcon />,
                color: PALETTE.green,
                colorLight: PALETTE.greenLight,
              },
            ]
          : []),
        {
          title: "Global Risks",
          value: data.risks.length,
          icon: <WarningAmberIcon />,
          color: PALETTE.red,
          colorLight: PALETTE.redLight,
        },
        {
          title: "Audit Questions",
          value: data.gaps.length,
          icon: <QuizIcon />,
          color: PALETTE.purple,
          colorLight: PALETTE.purpleLight,
        },
        {
          title: "Activity Logs",
          value: data.logs.length,
          icon: <HistoryIcon />,
          color: PALETTE.slate,
          colorLight: PALETTE.slateLight,
        },
      ];
    }
    return [
      {
        key: "users",
        perm: "METRIC_USERS",
        title: "Total Users",
        value: filteredUsers.length,
        icon: <GroupIcon />,
        color: PALETTE.blue,
        colorLight: PALETTE.blueLight,
      },
      {
        key: "vendors",
        perm: "METRIC_VENDORS",
        title: "Active Vendors",
        value: data.vendors.length,
        icon: <StorefrontIcon />,
        color: PALETTE.green,
        colorLight: PALETTE.greenLight,
      },
      {
        key: "risks",
        perm: "METRIC_RISKS",
        title: "Scoped Risks",
        value: filteredRisks.length,
        icon: <WarningAmberIcon />,
        color: PALETTE.red,
        colorLight: PALETTE.redLight,
      },
      {
        key: "gaps",
        perm: "METRIC_GAPS",
        title: "Audit Questions",
        value: data.gaps.length,
        icon: <QuizIcon />,
        color: PALETTE.purple,
        colorLight: PALETTE.purpleLight,
      },
      {
        key: "depts",
        perm: "METRIC_DEPTS",
        title: "Departments",
        value: data.departments.length,
        icon: <AccountBalanceIcon />,
        color: PALETTE.cyan,
        colorLight: PALETTE.cyanLight,
      },
    ].filter((m) => canAccess(m.perm));
  }, [loggedInRole, data, filteredUsers, filteredRisks, canAccess]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="90vh"
        gap={2}
        sx={{ bgcolor: PALETTE.bg }}
      >
        <CircularProgress
          size={44}
          thickness={4}
          sx={{ color: PALETTE.blue }}
        />
        <Typography
          sx={{
            color: PALETTE.textMuted,
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          Loading Dashboard
        </Typography>
      </Box>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5, md: 3, lg: 3.5 },
        bgcolor: PALETTE.bg,
        minHeight: "100vh",
      }}
    >
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={{ xs: 1.5, sm: 0 }}
        sx={{ mb: { xs: 2.5, md: 3 } }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: "10px",
                bgcolor: PALETTE.blue,
                color: "#fff",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ShieldIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: PALETTE.text,
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                Admin Dashboard
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 0.5 }}
              >
                <Typography
                  sx={{
                    color: PALETTE.textMuted,
                    fontSize: "0.7rem",
                    fontWeight: 500,
                  }}
                >
                  Session
                </Typography>
                <RoleBadge role={loggedInRole} />
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              px: 1.5,
              py: 0.75,
              bgcolor: PALETTE.greenLight,
              borderRadius: "10px",
              border: `1px solid ${PALETTE.green}30`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: PALETTE.green,
              }}
            />
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: PALETTE.green,
                letterSpacing: "0.3px",
              }}
            >
              {isMaster ? "Primary Access" : "Active Session"}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* ── Metrics Grid ─────────────────────────────────────────────────── */}
      <Grid
        container
        spacing={{ xs: 1.5, md: 2 }}
        sx={{ mb: { xs: 2.5, md: 3 } }}
      >
        {metrics.map((m, idx) => (
          <Grid
            key={idx}
            item
            xs={6}
            sm={4}
            md={3}
            lg={12 / Math.min(metrics.length, 6)}
          >
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>

      {/* ── UNIFIED CORE OVERVIEW (Entities | Identity | Pulse | Risk | SEO) ── */}
      <Grid
        container
        spacing={{ xs: 2, md: 2.5 }}
        sx={{ mb: { xs: 2.5, md: 3 } }}
        alignItems="stretch"
      >
        {/* ① Entities (Super Admin Only) */}
        {loggedInRole === "super_admin" && (
          <Grid item xs={12} md={4} lg={3}>
            <SurfaceCard sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                <SectionHeader title="Entities" subtitle={`${data.organizations.length} organizations`} icon={<BusinessIcon />} />
                <Box onClick={() => setSelectedOrgId("all")} sx={{ mb: 1, px: 1.25, py: 0.75, borderRadius: "8px", cursor: "pointer", border: `1px solid ${selectedOrgId === "all" ? PALETTE.blue : PALETTE.border}`, bgcolor: selectedOrgId === "all" ? PALETTE.blueLight : "transparent", transition: "0.15s", "&:hover": { borderColor: PALETTE.blue } }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: selectedOrgId === "all" ? PALETTE.blue : PALETTE.textSub }}>All Organizations</Typography>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, flex: 1 }}>
                  {data.organizations.map((org, idx) => {
                    const orgId = org._id || org.id;
                    const isSelected = selectedOrgId === orgId;
                    const userCount = data.users.filter(u => String(u.organization) === String(orgId) || String(u.orgId) === String(orgId)).length;
                    return (
                      <Box key={idx} onClick={() => setSelectedOrgId(orgId)} sx={{ p: 1, borderRadius: "8px", cursor: "pointer", border: `1px solid ${isSelected ? PALETTE.blue : PALETTE.border}`, bgcolor: isSelected ? PALETTE.blueLight : PALETTE.slateLight, transition: "0.15s", "&:hover": { borderColor: PALETTE.blue }, display: "flex", flexDirection: "column", gap: 0.25 }}>
                        <Typography noWrap sx={{ fontSize: "0.68rem", fontWeight: 700, color: isSelected ? PALETTE.blue : PALETTE.text, lineHeight: 1.2 }}>{org.name || "Unknown"}</Typography>
                        <Typography sx={{ fontSize: "0.6rem", fontWeight: 600, color: PALETTE.textMuted }}>{userCount} users</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </SurfaceCard>
          </Grid>
        )}

        {/* ② Identity Suite (Everyone) */}
        <Grid item xs={12} md={loggedInRole === "super_admin" ? 8 : 12} lg={loggedInRole === "root" ? 8 : (loggedInRole === "super_admin" ? 5 : 6)}>
          <SurfaceCard sx={{ height: "100%" }}>
            <CardContent sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                <SectionHeader title="Users" subtitle="Members & access control" icon={<GroupIcon />} />
              </Box>
              <TableContainer sx={{ flex: 1 }}>
                <Table size="small">
                  <StyledTableHead
                    columns={[
                      { label: "Member" },
                      ...(loggedInRole === "root" ? [{ label: "Contact" }] : []),
                      { label: "Role" },
                      ...(loggedInRole === "super_admin" ? [{ label: "Organization" }] : []),
                      ...(loggedInRole === "root" ? [{ label: "Department" }] : []),
                      { label: "Status", align: "center" }
                    ]}
                  />
                  <TableBody>
                    {filteredUsers.slice(0, 7).map((user, idx) => (
                      <StyledTableRow key={idx}>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 30, height: 30, bgcolor: PALETTE.blueLight, color: PALETTE.blue, fontSize: "0.75rem", fontWeight: 800, border: `1px solid ${PALETTE.border}` }}>{user.username?.[0]?.toUpperCase() || "U"}</Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.82rem", color: PALETTE.text }}>{user.username}</Typography>
                              <Typography noWrap sx={{ color: PALETTE.textMuted, fontSize: "0.68rem" }}>{user.email || "—"}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        {loggedInRole === "root" && (
                          <TableCell>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: PALETTE.textSub }}>{user.mobile || user.phone || "—"}</Typography>
                          </TableCell>
                        )}
                        <TableCell><RoleBadge role={user.role?.[0] || "user"} /></TableCell>
{loggedInRole === "super_admin" && (
  <TableCell>
    <Typography
      noWrap
      sx={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: PALETTE.textSub,
        maxWidth: 120,
      }}
    >
      {data.organizations.find(
        (o) =>
          String(o._id || o.id) === String(user.organization) ||
          String(o._id || o.id) === String(user.orgId)
      )?.name || "All Orgs"}
    </Typography>
  </TableCell>
)}
                        {loggedInRole === "root" && (
                          <TableCell>
                            <Chip label={user.department || user.dept || "Global"} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: PALETTE.slateLight, borderRadius: "5px" }} />
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: PALETTE.green, mx: "auto", boxShadow: `0 0 0 4px ${PALETTE.green}20` }} />
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </SurfaceCard>
        </Grid>

        {/* ③ Operational Pulse (Super Admin Only) */}
        {loggedInRole === "super_admin" && (
          <Grid item xs={12} md={12} lg={4}>
            <SurfaceCard sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                <SectionHeader title="Operational Pulse" subtitle="Activity events · Last 7 days" icon={<TrendingUpIcon />} action={<Box sx={{ px: 1, py: 0.5, bgcolor: PALETTE.blueLight, borderRadius: "6px" }}><Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: PALETTE.blue }}>LIVE</Typography></Box>} />
                <Box sx={{ flex: 1, minHeight: 200 }}>
                  <Line
                    data={{
                      labels: logPulseData.labels,
                      datasets: [{ data: logPulseData.counts, borderColor: PALETTE.blue, backgroundColor: "rgba(37,99,235,0.06)", fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: PALETTE.blue, pointBorderColor: "#fff", pointBorderWidth: 2, borderWidth: 2.5 }],
                    }}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false }, tooltip: { backgroundColor: PALETTE.text, padding: 10, cornerRadius: 8 } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 10, weight: "600" }, color: PALETTE.textMuted, maxTicksLimit: 5 } },
                        x: { grid: { display: false }, ticks: { font: { size: 10, weight: "600" }, color: PALETTE.textMuted } }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </SurfaceCard>
          </Grid>
        )}

        {/* ④ Risk Severity (Adaptive Sizing) */}
        <Grid item xs={12} md={loggedInRole === "root" ? 6 : (data.seo.length === 0 ? 7 : 6)} lg={loggedInRole === "root" ? 4 : (data.seo.length === 0 ? 8 : 4)}>
          <SurfaceCard sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
              <SectionHeader title="Risk Severity" subtitle={loggedInRole === "super_admin" ? "System-wide profile" : "Scoped assessment"} icon={<WarningAmberIcon />} />
              <Box sx={{ flex: 1, minHeight: 180 }}>
                {(() => {
                  const targetRisks = loggedInRole === "super_admin" ? data.risks : filteredRisks;
                  const levels = targetRisks.reduce((acc, risk) => {
                    const level = (risk.riskLevel || risk.riskScore || risk.level || "UNKNOWN").toString().toUpperCase();
                    acc[level] = (acc[level] || 0) + 1;
                    return acc;
                  }, {});
                  const score = Math.max(0, 100 - ((levels["CRITICAL"] || 0) * 12 + (levels["HIGH"] || 0) * 6 + (levels["MEDIUM"] || 0) * 2));
                  
                  return (
                    <>
                      <Box sx={{ flex: 1, height: 180 }}>
                        <Bar
                          data={{
                            labels: ["Critical", "High", "Medium", "Low"],
                            datasets: [{
                              data: [levels["CRITICAL"] || 0, levels["HIGH"] || 0, levels["MEDIUM"] || 0, levels["LOW"] || 0],
                              backgroundColor: [PALETTE.red, "#ea580c", PALETTE.amber, PALETTE.green],
                              borderRadius: 6, barThickness: 32
                            }]
                          }}
                          options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              x: { grid: { display: false }, ticks: { font: { size: 10, weight: "600" }, color: PALETTE.textMuted } },
                              y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 10, weight: "600" }, color: PALETTE.textMuted, maxTicksLimit: 4 } }
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ mt: 2, p: 2, bgcolor: PALETTE.slateLight, borderRadius: "12px", border: `1px solid ${PALETTE.border}` }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: PALETTE.textSub, textTransform: "uppercase", letterSpacing: "0.5px" }}>Ecosystem Health</Typography>
                          <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: score > 75 ? PALETTE.green : PALETTE.red }}>{score}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={score} sx={{ height: 8, borderRadius: 4, bgcolor: PALETTE.border, "& .MuiLinearProgress-bar": { bgcolor: score > 75 ? PALETTE.green : PALETTE.red, borderRadius: 4 } }} />
                      </Box>
                    </>
                  );
                })()}
              </Box>
            </CardContent>
          </SurfaceCard>
        </Grid>

        {/* ⑤ SEO Register (Adaptive Sizing) */}
        {loggedInRole === "super_admin" && (
          <Grid item xs={12} md={data.seo.length === 0 ? 5 : 6} lg={data.seo.length === 0 ? 4 : 8}>
            <SurfaceCard sx={{ height: "100%" }}>
              <CardContent sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                  <SectionHeader title="SEO Intelligence" subtitle={`${data.seo.length} pages configured`} icon={<VerifiedUserIcon />} action={<NavButton href="/seo_form/list" />} />
                </Box>
                {data.seo.length === 0 ? (
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 5, px: 3, textAlign: "center" }}>
                    <Box sx={{ p: 2, borderRadius: "50%", bgcolor: PALETTE.slateLight, color: PALETTE.textMuted, mb: 2 }}>
                      <FilterListIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography sx={{ color: PALETTE.text, fontWeight: 700, fontSize: "0.95rem" }}>No Records Found</Typography>
                    <Typography sx={{ color: PALETTE.textMuted, fontSize: "0.75rem", mt: 0.5, maxWidth: 240 }}>The system is ready for metadata configuration.</Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ flex: 1 }}>
                    <Table size="small">
                      <StyledTableHead columns={[{ label: "Target URL" }, { label: "Page Title" }, { label: "Details", align: "right" }]} />
                      <TableBody>
                        {data.seo.slice(0, 6).map((item, idx) => (
                          <StyledTableRow key={idx}>
                            <TableCell><Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: PALETTE.blue }}>{item.url}</Typography></TableCell>
                            <TableCell><Typography noWrap sx={{ fontWeight: 600, fontSize: "0.8rem", color: PALETTE.textSub, maxWidth: 200 }}>{item.pageTitle}</Typography></TableCell>
                            <TableCell align="right"><NavButton href={`/seo_form/edit/${item.id || item._id}`}><MoreVertIcon sx={{ fontSize: 14 }} /></NavButton></TableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </SurfaceCard>
          </Grid>
        )}
      </Grid>

      {/* ── Audit Log (Super Admin) ───────────────────────────────────────── */}
      {loggedInRole === "super_admin" && (
        <SurfaceCard sx={{ mb: { xs: 2.5, md: 3 } }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 } }}>
              <SectionHeader
                title="Audit Trail"
                subtitle="Recent system-wide operations"
                icon={<HistoryIcon />}
                action={<NavButton href="/logs" />}
              />
            </Box>
            <TableContainer>
              <Table size="small">
                <StyledTableHead
                  columns={[
                    { label: "Action" },
                    { label: "Actor" },
                    { label: "Target URL" },
                    { label: "Details" },
                    { label: "Timestamp", align: "right" },
                  ]}
                />
                <TableBody>
                  {data.logs.slice(0, 8).map((log, idx) => {
                    const color = ACTION_COLORS[log.action] || PALETTE.slate;
                    const dt =
                      log.timestamp || log.createdAt
                        ? new Date(log.timestamp || log.createdAt)
                        : null;
                    return (
                      <StyledTableRow key={idx}>
                        <TableCell>
                          <Chip
                            label={log.action?.replace("_", " ")}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              bgcolor: `${color}12`,
                              color,
                              border: `1px solid ${color}30`,
                              borderRadius: "6px",
                              letterSpacing: "0.3px",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                          >
                            {log.name || "System"}
                          </Typography>
                          <Typography
                            sx={{
                              color: PALETTE.textMuted,
                              fontSize: "0.68rem",
                            }}
                          >
                            {log.email || "system@internal"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.78rem",
                              color: PALETTE.blue,
                            }}
                          >
                            {log.url || "/"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Tooltip title={formatLogItem(log.item)}>
                            <Typography
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.72rem",
                                color: PALETTE.textSub,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                              }}
                            >
                              {formatLogItem(log.item)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.72rem",
                              color: PALETTE.textSub,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {dt
                              ? dt.toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </Typography>
                        </TableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </SurfaceCard>
      )}

      {/* ── Risk Ledger ───────────────────────────────────────────────────── */}
      {canAccess("METRIC_RISKS") && (
        <SurfaceCard sx={{ mb: { xs: 2.5, md: 3 } }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 } }}>
              <SectionHeader
                title="Risk Ledger"
                subtitle={`${loggedInRole === "super_admin" ? data.risks.length : filteredRisks.length} risks in scope`}
                icon={<SecurityIcon />}
                action={
                  <NavButton
                    href={
                      loggedInRole === "root"
                        ? "/risks/risk_sample/root_list"
                        : "/risks/risk_sample/list"
                    }
                  />
                }
              />
            </Box>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 750 }}>
                <StyledTableHead
                  columns={[
                    { label: "Risk ID" },
                    { label: "Department" },
                    { label: "Category" },
                    { label: "Description" },
                    { label: "Score", align: "center" },
                    { label: "Status" },
                    { label: "Updated", align: "right" },
                  ]}
                />
                <TableBody>
                  {(loggedInRole === "super_admin" ? data.risks : filteredRisks)
                    .slice(0, 10)
                    .map((risk, idx) => {
                      const scoreColor = getRiskLevelColor(
                        risk.riskLevel || risk.level,
                      );
                      const dt =
                        risk.updatedAt || risk.createdAt
                          ? new Date(risk.updatedAt || risk.createdAt)
                          : null;
                      return (
                        <StyledTableRow key={idx}>
                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.8rem",
                                color: PALETTE.text,
                                fontFamily: "monospace",
                              }}
                            >
                              {risk.riskId ||
                                `RK-${String(idx + 1).padStart(3, "0")}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{ fontWeight: 700, fontSize: "0.8rem" }}
                            >
                              {risk.department || risk.dept || "Global"}
                            </Typography>
                            <Typography
                              sx={{
                                color: PALETTE.textMuted,
                                fontSize: "0.68rem",
                              }}
                            >
                              {risk.organization || "Enterprise"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={risk.riskType || "General"}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                bgcolor: PALETTE.slateLight,
                                color: PALETTE.textSub,
                                borderRadius: "6px",
                                border: `1px solid ${PALETTE.border}`,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 260 }}>
                            <Typography
                              sx={{
                                fontSize: "0.78rem",
                                color: PALETTE.textSub,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                              }}
                            >
                              {risk.riskDescription ||
                                risk.description ||
                                "No description provided."}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                px: 1.25,
                                py: 0.4,
                                borderRadius: "6px",
                                bgcolor: `${scoreColor}12`,
                                color: scoreColor,
                                display: "inline-block",
                                border: `1px solid ${scoreColor}30`,
                              }}
                            >
                              <Typography
                                sx={{ fontWeight: 800, fontSize: "0.72rem" }}
                              >
                                {risk.riskScore || risk.score || "—"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {renderRiskStatus(risk.status || "Open")}
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.72rem",
                                color: PALETTE.textSub,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {dt
                                ? dt.toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                  })
                                : "—"}
                            </Typography>
                          </TableCell>
                        </StyledTableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </SurfaceCard>
      )}


      {/* ── Audit Register (Super Admin) ──────────────────────────────────── */}
      {loggedInRole === "super_admin" && (
        <SurfaceCard sx={{ mb: { xs: 2.5, md: 3 } }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 } }}>
              <SectionHeader
                title="Audit Register"
                subtitle={`${data.gaps.length} compliance controls`}
                icon={<QuizIcon />}
                action={<NavButton href="/gap/list" />}
              />
            </Box>
            {data.gaps.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography
                  sx={{
                    color: PALETTE.textMuted,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  No Audit Controls Registered
                </Typography>
                <Typography
                  sx={{
                    color: PALETTE.textMuted,
                    fontSize: "0.72rem",
                    mt: 0.5,
                  }}
                >
                  Compliance framework ready for data ingestion
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 700 }}>
                  <StyledTableHead
                    columns={[
                      { label: "Clause" },
                      { label: "Standard Requirement" },
                      { label: "Audit Questions" },
                      { label: "Departments" },
                      { label: "", align: "right" },
                    ]}
                  />
                  <TableBody>
                    {data.gaps.slice(0, 10).map((gap, idx) => (
                      <StyledTableRow key={idx}>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.8rem",
                              fontFamily: "monospace",
                              color: PALETTE.text,
                            }}
                          >
                            {gap.clause ||
                              `CL-${String(idx + 1).padStart(3, "0")}`}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              color: PALETTE.textSub,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {gap.standardRequirement || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 280 }}>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {Array.isArray(gap.auditQuestions)
                              ? gap.auditQuestions[0]
                              : gap.auditQuestions}
                          </Typography>
                          {Array.isArray(gap.auditQuestions) &&
                            gap.auditQuestions.length > 1 && (
                              <Typography
                                sx={{
                                  color: PALETTE.textMuted,
                                  fontSize: "0.65rem",
                                }}
                              >
                                +{gap.auditQuestions.length - 1} more
                              </Typography>
                            )}
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {(Array.isArray(gap.department)
                              ? gap.department
                              : gap.department?.split(",") || ["Global"]
                            )
                              .slice(0, 2)
                              .map((dept, didx) => (
                                <Chip
                                  key={didx}
                                  label={dept.trim()}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.62rem",
                                    fontWeight: 700,
                                    bgcolor: PALETTE.slateLight,
                                    borderRadius: "4px",
                                  }}
                                />
                              ))}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <NavButton href={`/gap/edit/${gap.id || gap._id}`}>
                            <MoreVertIcon sx={{ fontSize: 15 }} />
                          </NavButton>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </SurfaceCard>
      )}

      {/* ── Root Analytics Row: Adaptive Vendor & Workforce ── */}
      {loggedInRole === "root" && (
        <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ mb: { xs: 2.5, md: 3 } }} alignItems="stretch">
          <Grid item xs={12} lg={6}>
            <SurfaceCard sx={{ height: "100%" }}>
              <CardContent sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                  <SectionHeader title="Vendor Ledger" subtitle={`${data.vendors.length} vendors onboarded`} icon={<StorefrontIcon />} action={<NavButton href="/vendors/list" />} />
                </Box>
                {data.vendors.length === 0 ? (
                  <Box sx={{ py: 5, px: 3, textAlign: "center" }}>
                    <Typography sx={{ color: PALETTE.textMuted, fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase" }}>No Vendor Data Available</Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ flex: 1 }}>
                    <Table size="small">
                      <StyledTableHead columns={[{ label: "Vendor" }, { label: "Point of Contact" }, { label: "Organization" }, { label: "", align: "right" }]} />
                      <TableBody>
                        {data.vendors.slice(0, 10).map((v, idx) => (
                          <StyledTableRow key={idx}>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ width: 28, height: 28, bgcolor: PALETTE.greenLight, color: PALETTE.green, fontSize: "0.65rem" }}><StorefrontIcon sx={{ fontSize: 14 }} /></Avatar>
                                <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.82rem", maxWidth: 120 }}>{v.vendorName || v.name || v.vendor || "—"}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography noWrap sx={{ fontWeight: 600, fontSize: "0.78rem", color: PALETTE.text, maxWidth: 110 }}>{v.poc || "N/A"}</Typography>
                              <Typography noWrap sx={{ fontSize: "0.65rem", color: PALETTE.textMuted, maxWidth: 110 }}>{v.pocEmail || "No email"}</Typography>
                            </TableCell>
                            <TableCell><Chip label={data.organizations.find(o => String(o._id || o.id) === String(v.organization || v.orgId))?.name || "Global"} size="small" sx={{ height: 18, fontSize: "0.62rem", bgcolor: PALETTE.blueLight, color: PALETTE.blue, fontWeight: 700 }} /></TableCell>
                            <TableCell align="right"><NavButton href="/vendors/list"><MoreVertIcon sx={{ fontSize: 16 }} /></NavButton></TableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </SurfaceCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <SurfaceCard sx={{ height: "100%" }}>
              <CardContent sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                  <SectionHeader title="Workforce Share" subtitle="Departmental metrics" icon={<AccountBalanceIcon />} action={<NavButton href="/departments/list" />} />
                </Box>
                <TableContainer sx={{ flex: 1 }}>
                  <Table size="small">
                    <StyledTableHead columns={[{ label: "Dept Name" }, { label: "Org" }, { label: "Count", align: "center" }, { label: "Share", align: "right" }]} />
                    <TableBody>
                      {deptWorkforce.slice(0, 10).map((dept) => (
                        <StyledTableRow key={dept.id}>
                          <TableCell><Typography noWrap sx={{ fontWeight: 700, fontSize: "0.8rem", maxWidth: 120 }}>{dept.name}</Typography></TableCell>
                          <TableCell><Typography noWrap sx={{ fontSize: "0.72rem", color: PALETTE.textSub, fontWeight: 600, maxWidth: 80 }}>{dept.orgName}</Typography></TableCell>
                          <TableCell align="center"><Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: PALETTE.blue }}>{dept.count}</Typography></TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
                              <Box sx={{ width: 40 }}><LinearProgress variant="determinate" value={Number(dept.share)} sx={{ height: 4, borderRadius: 2, bgcolor: PALETTE.border, "& .MuiLinearProgress-bar": { bgcolor: PALETTE.blue } }} /></Box>
                              <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", minWidth: 35 }}>{dept.share}%</Typography>
                            </Stack>
                          </TableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </SurfaceCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Home;
