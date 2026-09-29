// /**
//  * Logslist.jsx
//  * Activity log viewer — MUI table with date range filter and action filter.
//  */

// import React, { useEffect, useState, useCallback } from "react";
// import {
//     Box, Typography, Paper, Table, TableBody, TableCell,
//     TableContainer, TableHead, TableRow, TablePagination,
//     Chip, CircularProgress, Alert, Stack, TextField,
//     MenuItem, Select, InputLabel, FormControl, IconButton, Tooltip, Button,
// } from "@mui/material";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

// const LOGGING_BASE_URL =
//     (typeof import.meta !== "undefined" && import.meta.env?.VITE_LOGGING_SERVICE_URL) ||
//     "https://api.calvant.com/logging-service/api/logs";

// // ── Action chip colours ───────────────────────────────────────────────────────
// const ACTION_META = {
//     PAGE_LOAD: { color: "primary", label: "PAGE LOAD" },
//     LOGIN: { color: "success", label: "LOGIN" },
//     LOGOUT: { color: "warning", label: "LOGOUT" },
//     CREATE: { color: "success", label: "CREATE" },
//     UPDATE: { color: "warning", label: "UPDATE" },
//     DELETE: { color: "error", label: "DELETE" },
//     // BULK_FILE: { color: "secondary", label: "BULK FILE" },
//     // SELECT: { color: "info", label: "SELECT" },
//     // CLICK: { color: "default", label: "CLICK" },
// };

// const ALL_ACTIONS = Object.keys(ACTION_META);

// const getChipProps = (action = "") => ACTION_META[action] ?? { color: "default", label: action };

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const toDateStr = (log) => {
//     const raw = log.timestamp || log.createdAt;
//     return raw ? new Date(raw) : null;
// };

// // Convert one object to plain readable text: "Key: value | Key: value"
// const objectToText = (obj) => {
//     if (!obj || typeof obj !== "object") return String(obj);
//     const SKIP = ["password", "oldPassword", "processes", "auditorName", "organization"];
//     return Object.entries(obj)
//         .filter(([k, v]) =>
//             !SKIP.includes(k) &&
//             v !== null && v !== undefined && v !== "" &&
//             !(Array.isArray(v) && v.length === 0)
//         )
//         .map(([k, v]) => {
//             const label = k.replace(/([A-Z])/g, " $1")
//                 .replace(/^./, (s) => s.toUpperCase());
//             const value = Array.isArray(v) ? v.join(", ") : String(v);
//             return `${label}: ${value}`;
//         })
//         .join("  |  ");
// };

// const formatItem = (item) => {
//     if (item === null || item === undefined) return null;
//     try {
//         const arr = Array.isArray(item) ? item : [item];
//         return arr.map((entry) =>
//             typeof entry === "object" ? objectToText(entry) : String(entry)
//         ).join(" | ");
//     } catch {
//         return String(item);
//     }
// };

// // ── Component ─────────────────────────────────────────────────────────────────
// const ListOfLogs = () => {
//     const [logs, setLogs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Filters
//     const [actionFilter, setActionFilter] = useState("ALL");
//     const [dateFrom, setDateFrom] = useState("");   // "YYYY-MM-DD"
//     const [dateTo, setDateTo] = useState("");

//     // Pagination
//     const [page, setPage] = useState(0);
//     const [rowsPerPage, setRowsPerPage] = useState(10);

//     // ── Fetch ───────────────────────────────────────────────────────────────────
//     const fetchLogs = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const token = localStorage.getItem("token") || "";
//             const res = await fetch(LOGGING_BASE_URL, {
//                 headers: token ? { Authorization: `Bearer ${token}` } : {},
//             });
//             if (!res.ok) throw new Error(`Server returned ${res.status}`);
//             const data = await res.json();
//             const list = Array.isArray(data) ? data : (data.content ?? []);
//             // Show newest first
//             setLogs([...list].reverse());
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => { fetchLogs(); }, [fetchLogs]);

//     // ── Filter ──────────────────────────────────────────────────────────────────
//     const filtered = logs.filter((log) => {
//         if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
//         const dt = toDateStr(log);
//         if (dateFrom && dt && dt < new Date(dateFrom)) return false;
//         if (dateTo && dt && dt > new Date(dateTo + "T23:59:59")) return false;
//         return true;
//     });

//     const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//     const clearFilters = () => {
//         setActionFilter("ALL");
//         setDateFrom("");
//         setDateTo("");
//         setPage(0);
//     };

//     const hasFilters = actionFilter !== "ALL" || dateFrom || dateTo;

//     return (
//         <Box sx={{ p: 3 }}>
//             {/* ── Header ─────────────────────────────────────────────────────────── */}
//             <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
//                 <Typography variant="h5" fontWeight={700}>Activity Logs</Typography>
//                 <Tooltip title="Refresh">
//                     <IconButton onClick={fetchLogs} color="primary">
//                         <RefreshIcon />
//                     </IconButton>
//                 </Tooltip>
//             </Stack>

//             {/* ── Filters ────────────────────────────────────────────────────────── */}
//             <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
//                 <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">

//                     {/* Action filter */}
//                     <FormControl size="small" sx={{ minWidth: 160 }}>
//                         <InputLabel>Action</InputLabel>
//                         <Select
//                             value={actionFilter}
//                             label="Action"
//                             onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
//                         >
//                             <MenuItem value="ALL">All Actions</MenuItem>
//                             {ALL_ACTIONS.map((a) => (
//                                 <MenuItem key={a} value={a}>{ACTION_META[a].label}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>

//                     {/* Date from */}
//                     <TextField
//                         size="small"
//                         label="From date"
//                         type="date"
//                         value={dateFrom}
//                         onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
//                         InputLabelProps={{ shrink: true }}
//                         sx={{ minWidth: 160 }}
//                     />

//                     {/* Date to */}
//                     <TextField
//                         size="small"
//                         label="To date"
//                         type="date"
//                         value={dateTo}
//                         onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
//                         InputLabelProps={{ shrink: true }}
//                         sx={{ minWidth: 160 }}
//                     />

//                     {/* Clear filters */}
//                     {hasFilters && (
//                         <Button
//                             size="small"
//                             variant="outlined"
//                             startIcon={<FilterAltOffIcon />}
//                             onClick={clearFilters}
//                         >
//                             Clear
//                         </Button>
//                     )}

//                     <Box sx={{ flexGrow: 1 }} />
//                     <Typography variant="body2" color="text.secondary">
//                         {filtered.length} record{filtered.length !== 1 ? "s" : ""}
//                     </Typography>
//                 </Stack>
//             </Paper>

//             {/* ── Error ──────────────────────────────────────────────────────────── */}
//             {error && (
//                 <Alert severity="error" sx={{ mb: 2 }}>
//                     Could not load logs: {error}
//                 </Alert>
//             )}

//             {/* ── Table ──────────────────────────────────────────────────────────── */}
//             <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
//                 <TableContainer sx={{ maxHeight: "65vh" }}>
//                     <Table stickyHeader size="small">
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>URL / Page</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
//                                 <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Date & Time</TableCell>
//                             </TableRow>
//                         </TableHead>

//                         <TableBody>
//                             {loading ? (
//                                 <TableRow>
//                                     <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
//                                         <CircularProgress size={28} />
//                                     </TableCell>
//                                 </TableRow>
//                             ) : paginated.length === 0 ? (
//                                 <TableRow>
//                                     <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
//                                         No logs found.
//                                     </TableCell>
//                                 </TableRow>
//                             ) : (
//                                 paginated.map((log, i) => {
//                                     const chip = getChipProps(log.action);
//                                     const dt = toDateStr(log);
//                                     return (
//                                         <TableRow
//                                             key={log.id ?? i}
//                                             hover
//                                             sx={{ "&:last-child td": { borderBottom: 0 } }}
//                                         >
//                                             <TableCell>{page * rowsPerPage + i + 1}</TableCell>

//                                             <TableCell>
//                                                 <Chip
//                                                     label={chip.label}
//                                                     color={chip.color}
//                                                     size="small"
//                                                     sx={{ fontWeight: 600, fontSize: "11px" }}
//                                                 />
//                                             </TableCell>

//                                             <TableCell>{log.name || "—"}</TableCell>
//                                             <TableCell>{log.email || "—"}</TableCell>

//                                             <TableCell sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                                 <Tooltip title={log.url || ""}>
//                                                     <span>{log.url || "—"}</span>
//                                                 </Tooltip>
//                                             </TableCell>

//                                             <TableCell sx={{ maxWidth: 280 }}>
//                                                 {log.item == null ? (
//                                                     <Typography variant="caption" color="text.disabled">—</Typography>
//                                                 ) : (
//                                                     <Typography
//                                                         variant="caption"
//                                                         sx={{
//                                                             fontFamily: "monospace",
//                                                             display: "block",
//                                                             maxWidth: 280,
//                                                             overflow: "hidden",
//                                                             textOverflow: "ellipsis",
//                                                             whiteSpace: "nowrap",
//                                                         }}
//                                                     >
//                                                         <Tooltip title={formatItem(log.item)}>
//                                                             <span>{formatItem(log.item)}</span>
//                                                         </Tooltip>
//                                                     </Typography>
//                                                 )}
//                                             </TableCell>

//                                             <TableCell sx={{ whiteSpace: "nowrap" }}>
//                                                 {dt ? dt.toLocaleString("en-IN", {
//                                                     day: "2-digit", month: "short", year: "numeric",
//                                                     hour: "2-digit", minute: "2-digit",
//                                                 }) : "—"}
//                                             </TableCell>
//                                         </TableRow>
//                                     );
//                                 })
//                             )}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>

//                 <TablePagination
//                     component="div"
//                     count={filtered.length}
//                     page={page}
//                     rowsPerPage={rowsPerPage}
//                     onPageChange={(_, p) => setPage(p)}
//                     onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
//                     rowsPerPageOptions={[10, 25, 50, 100]}
//                 />
//             </Paper>
//         </Box>
//     );
// };

// export default ListOfLogs;

'use client'

/**
 * LogsList.jsx
 * Activity log viewer — role-aware, IST timestamps, module filter.
 *
 * Fixes:
 *  1. flexWrap DOM prop warning         → Box wrapper with sx flexWrap
 *  2. Module "—" for most rows          → resolveModule now infers from URL path + action prefix
 *  3. Email showing ObjectId or unknown → isValidEmail guard; falls back to name only
 *  4. AIIA / custom actions rendered    → ACTION_META extended with prefix fallback
 *  5. Module filter covers inferred     → uses resolveModule() in filter, not log.module
 */

import React, { useEffect, useState, useCallback } from "react";
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    Chip, CircularProgress, Alert, Stack, TextField,
    MenuItem, Select, InputLabel, FormControl,
    IconButton, Tooltip, Button,
} from "@mui/material";
import RefreshIcon      from "@mui/icons-material/Refresh";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

const LOGGING_BASE_URL =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LOGGING_SERVICE_URL) ||
    "https://api.calvant.com/logging-service/api/logs";

const USER_SERVICE_BASE =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    "https://api.calvant.com";

// ── Action chip meta ──────────────────────────────────────────────────────────
const ACTION_META = {
    PAGE_LOAD  : { color: "primary",   label: "PAGE LOAD"  },
    LOGIN      : { color: "success",   label: "LOGIN"      },
    LOGOUT     : { color: "warning",   label: "LOGOUT"     },
    CREATE     : { color: "success",   label: "CREATE"     },
    UPDATE     : { color: "warning",   label: "UPDATE"     },
    DELETE     : { color: "error",     label: "DELETE"     },
    UPLOAD     : { color: "secondary", label: "UPLOAD"     },
    DOWNLOAD   : { color: "info",      label: "DOWNLOAD"   },
    SELECT     : { color: "default",   label: "SELECT"     },
    CLICK      : { color: "default",   label: "CLICK"      },
};
const ALL_ACTIONS  = Object.keys(ACTION_META);

/**
 * Render chip for any action string, including custom ones like
 * AIIA_PLAN_MODAL_OPENED, AIIA_DASHBOARD_VISITED, etc.
 */
const getChipProps = (action = "") => {
    if (ACTION_META[action]) return ACTION_META[action];
    // Custom action: render as-is with a neutral color, prettify underscores
    const label = action.replace(/_/g, " ");
    return { color: "default", label };
};

// ── Module list ───────────────────────────────────────────────────────────────
const MODULE_LIST = ["Auth", "Risk", "Task", "Audit", "Compliance", "Trust", "TPRM", "AIIA", "Dashboard", "System"];

const MODULE_COLORS = {
    Auth       : "#6366f1",
    Risk       : "#ef4444",
    Task       : "#f59e0b",
    Audit      : "#10b981",
    Compliance : "#3b82f6",
    Trust      : "#8b5cf6",
    TPRM       : "#ec4899",
    AIIA       : "#0ea5e9",
    Dashboard  : "#64748b",
    System     : "#6b7280",
};

/**
 * Infer module from multiple signals, in priority order:
 *   1. log.module  (backend persisted it correctly)
 *   2. action prefix  (AIIA_xxx → AIIA, LOGIN/LOGOUT → Auth)
 *   3. URL path  (/risk → Risk, /gap-assessment → Audit, etc.)
 */
const resolveModule = (log) => {
    // 1. Backend sent a valid module
    if (log.module && MODULE_LIST.includes(log.module)) return log.module;
    // Also accept case-insensitive match
    if (log.module) {
        const match = MODULE_LIST.find(m => m.toLowerCase() === log.module.toLowerCase());
        if (match) return match;
    }

    // 2. Infer from action prefix / specific known actions
    const action = log.action || "";
    if (action === "LOGIN" || action === "LOGOUT") return "Auth";
    if (action.startsWith("AIIA_"))               return "AIIA";
    if (action.startsWith("RISK_"))               return "Risk";
    if (action.startsWith("TASK_"))               return "Task";
    if (action.startsWith("TRUST_"))              return "Trust";
    if (action.startsWith("TPRM_"))               return "TPRM";
    if (action.startsWith("AUDIT_"))              return "Audit";
    if (action.startsWith("COMPLIANCE_"))         return "Compliance";

    // 3. Infer from URL
    const url = (log.url || "").toLowerCase();
    if (url.includes("/risk"))            return "Risk";
    if (url.includes("/gap-assessment"))  return "Audit";
    if (url.includes("/task"))            return "Task";
    if (url.includes("/trust"))           return "Trust";
    if (url.includes("/tprm") || url.includes("/vendor")) return "TPRM";
    if (url.includes("/documentation"))   return "Compliance";
    if (url.includes("/compliances"))     return "Compliance";
    if (url.includes("/login") || url.includes("/logout")) return "Auth";
    if (url === "/" || url.includes("/dashboard")) return "Dashboard";
    if (url.includes("/logs"))                         return "System";

    return null; // genuinely unknown
};

// ── Email validation helper ───────────────────────────────────────────────────
/**
 * MongoDB ObjectIds (24 hex chars) and placeholder emails must not be
 * shown as real emails. This guard filters them out.
 */
const isValidEmail = (email) => {
    if (!email) return false;
    if (email === "unknown@example.com") return false;
    // 24-char hex string = ObjectId accidentally stored as email
    if (/^[a-f0-9]{24}$/i.test(email)) return false;
    return email.includes("@");
};

// ── JWT helpers ───────────────────────────────────────────────────────────────
const decodeJwt = (token) => {
    try {
        if (!token) return {};
        const base64   = token.split(".")[1];
        const standard = base64.replace(/-/g, "+").replace(/_/g, "/");
        const padded   = standard + "=".repeat((4 - standard.length % 4) % 4);
        return JSON.parse(atob(padded));
    } catch {
        return {};
    }
};

const getCallerInfo = () => {
    try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
        if (!token) return { role: "user", orgId: "", email: "", name: "", isSuperAdmin: false };

        const jwt   = decodeJwt(token);
        const roles = Array.isArray(jwt.role) ? jwt.role : [jwt.role].filter(Boolean);
        const role  = roles[0] || "user";

        return {
            role,
            orgId        : jwt.organization || jwt.organizationId || jwt.orgId || "",
            email        : jwt.email        || jwt.sub            || "",
            name         : jwt.name         || "",
            isSuperAdmin : role === "super_admin",
        };
    } catch {
        return { role: "user", orgId: "", email: "", name: "", isSuperAdmin: false };
    }
};

// ── Date / format helpers ─────────────────────────────────────────────────────
const toDate = (log) => {
    const raw = log.createdAt || log.timestamp;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
};

const formatIST = (d) =>
    d ? d.toLocaleString("en-IN", {
        timeZone : "Asia/Kolkata",
        day      : "2-digit",
        month    : "short",
        year     : "numeric",
        hour     : "2-digit",
        minute   : "2-digit",
        hour12   : true,
    }) : "—";

const SKIP_KEYS = ["password", "oldPassword", "processes", "auditorName", "organization"];

const objectToText = (obj) => {
    if (!obj || typeof obj !== "object") return String(obj);
    return Object.entries(obj)
        .filter(([k, v]) =>
            !SKIP_KEYS.includes(k) &&
            v !== null && v !== undefined && v !== "" &&
            !(Array.isArray(v) && v.length === 0)
        )
        .map(([k, v]) => {
            const label = k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
            const value = Array.isArray(v) ? v.join(", ") : String(v);
            return `${label}: ${value}`;
        })
        .join("  |  ");
};

const formatItem = (item) => {
    if (item == null) return null;
    try {
        const arr = Array.isArray(item) ? item : [item];
        return arr.map(e => typeof e === "object" ? objectToText(e) : String(e)).join(" | ");
    } catch {
        return String(item);
    }
};

// ── Component ─────────────────────────────────────────────────────────────────
const LogsList = () => {
    const caller = getCallerInfo();

    const [logs,        setLogs       ] = useState([]);
    const [loading,     setLoading    ] = useState(true);
    const [error,       setError      ] = useState(null);

    const [actionFilter, setActionFilter] = useState("ALL");
    const [moduleFilter, setModuleFilter] = useState("ALL");
    const [dateFrom,     setDateFrom    ] = useState("");
    const [dateTo,       setDateTo      ] = useState("");
    const [searchQuery,  setSearchQuery ] = useState("");

    const [page,        setPage       ] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orgMap,       setOrgMap      ] = useState({});  // orgId → orgName, super_admin only

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
            if (!token) throw new Error("Not authenticated");

            const res = await fetch(LOGGING_BASE_URL, {
                headers: {
                    Authorization       : `Bearer ${token}`,
                    "X-User-Role"       : caller.role,
                    "X-Organization-Id" : caller.orgId,
                },
            });

            if (!res.ok) throw new Error(`Server returned ${res.status}`);

            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.content ?? []);
            setLogs([...list].reverse());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [caller.role, caller.orgId]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    // ── Fetch org id→name map for super_admin Organisation column ─────────────
    useEffect(() => {
        if (!caller.isSuperAdmin) return;
        const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
        if (!token) return;
        fetch(`${USER_SERVICE_BASE}/user-service/api/organizations`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                const map = {};
                (Array.isArray(data) ? data : []).forEach(org => {
                    if (org.id) map[org.id] = org.name || org.id;
                });
                setOrgMap(map);
            })
            .catch(() => {});
    }, [caller.isSuperAdmin]);

    // ── Fetch org names for super_admin org column ────────────────────────────
    useEffect(() => {
        if (!caller.isSuperAdmin) return;
        const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
        if (!token) return;
        fetch(`${USER_SERVICE_BASE}/user-service/api/organizations`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                const map = {};
                (Array.isArray(data) ? data : []).forEach(org => {
                    if (org.id) map[org.id] = org.name || org.id;
                });
                setOrgMap(map);
            })
            .catch(() => {});
    }, [caller.isSuperAdmin]);

    // ── Client-side filter ────────────────────────────────────────────────────
    const filtered = logs.filter((log) => {
        if (actionFilter !== "ALL" && log.action !== actionFilter) return false;

        const resolvedMod = resolveModule(log);
        if (moduleFilter !== "ALL" && resolvedMod !== moduleFilter) return false;

        if (searchQuery) {
            const q        = searchQuery.toLowerCase();
            const logEmail = isValidEmail(log.email) ? log.email.toLowerCase() : "";
            const logName  = (log.name || "").toLowerCase();
            if (!logEmail.includes(q) && !logName.includes(q)) return false;
        }

        const dt = toDate(log);
        if (dateFrom && dt && dt < new Date(dateFrom))             return false;
        if (dateTo   && dt && dt > new Date(dateTo + "T23:59:59")) return false;
        return true;
    });

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const clearFilters = () => {
        setActionFilter("ALL");
        setModuleFilter("ALL");
        setDateFrom("");
        setDateTo("");
        setSearchQuery("");
        setPage(0);
    };

    const hasFilters = actionFilter !== "ALL" || moduleFilter !== "ALL" || dateFrom || dateTo || searchQuery;

    const colSpan = caller.isSuperAdmin ? 9 : 8;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ p: 3 }}>

            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Activity Logs</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {caller.isSuperAdmin
                            ? "Viewing logs across all organisations"
                            : "Viewing logs for your organisation"}
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchLogs} color="primary">
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* Filters */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Action</InputLabel>
                        <Select value={actionFilter} label="Action"
                            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}>
                            <MenuItem value="ALL">All Actions</MenuItem>
                            {ALL_ACTIONS.map(a => (
                                <MenuItem key={a} value={a}>{ACTION_META[a].label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Module</InputLabel>
                        <Select value={moduleFilter} label="Module"
                            onChange={(e) => { setModuleFilter(e.target.value); setPage(0); }}>
                            <MenuItem value="ALL">All Modules</MenuItem>
                            {MODULE_LIST.map(m => (
                                <MenuItem key={m} value={m}>{m}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        label="Search name / email"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                        sx={{ minWidth: 200 }}
                    />

                    <TextField size="small" label="From date" type="date" value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                        InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />

                    <TextField size="small" label="To date" type="date" value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                        InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />

                    {hasFilters && (
                        <Button size="small" variant="outlined"
                            startIcon={<FilterAltOffIcon />} onClick={clearFilters}>
                            Clear
                        </Button>
                    )}

                    <Box sx={{ flexGrow: 1 }} />

                    <Typography variant="body2" color="text.secondary">
                        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                    </Typography>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>Could not load logs: {error}</Alert>}

            {/* Table */}
            <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight: "65vh" }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                {caller.isSuperAdmin && (
                                    <TableCell sx={{ fontWeight: 700 }}>Organisation</TableCell>
                                )}
                                <TableCell sx={{ fontWeight: 700 }}>URL / Page</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                                    Date &amp; Time (IST)
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={colSpan} align="center"
                                               sx={{ py: 6, color: "text.secondary" }}>
                                        No logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((log, i) => {
                                    const chip        = getChipProps(log.action);
                                    const dt          = toDate(log);
                                    const resolvedMod = resolveModule(log);
                                    const modColor    = MODULE_COLORS[resolvedMod] ?? "#6b7280";

                                    // ── Email display: guard against ObjectId / placeholder ──
                                    const displayEmail = isValidEmail(log.email) ? log.email : null;

                                    return (
                                        <TableRow key={log.id ?? i} hover
                                            sx={{ "&:last-child td": { borderBottom: 0 } }}>

                                            <TableCell>{page * rowsPerPage + i + 1}</TableCell>

                                            {/* Module badge — inferred from URL/action if not stored */}
                                            <TableCell>
                                                {resolvedMod ? (
                                                    <Chip label={resolvedMod} size="small" sx={{
                                                        bgcolor    : modColor + "22",
                                                        color      : modColor,
                                                        fontWeight : 600,
                                                        fontSize   : "11px",
                                                        border     : `1px solid ${modColor}55`,
                                                    }} />
                                                ) : (
                                                    <Typography variant="caption" color="text.disabled">—</Typography>
                                                )}
                                            </TableCell>

                                            {/* Action chip — handles custom action strings too */}
                                            <TableCell>
                                                <Chip
                                                    label={chip.label}
                                                    color={chip.color}
                                                    size="small"
                                                    sx={{
                                                        fontWeight  : 600,
                                                        fontSize    : "11px",
                                                        maxWidth    : 220,
                                                        // custom actions get a subtle outlined style
                                                        ...(ACTION_META[log.action]
                                                            ? {}
                                                            : {
                                                                variant         : "outlined",
                                                                bgcolor         : "#f1f5f9",
                                                                color           : "#475569",
                                                                border          : "1px solid #cbd5e1",
                                                                textOverflow    : "ellipsis",
                                                                overflow        : "hidden",
                                                                whiteSpace      : "nowrap",
                                                                display         : "inline-flex",
                                                            }),
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>{log.name || "—"}</TableCell>

                                            {/* Email — never shows ObjectId or placeholder */}
                                            <TableCell>
                                                {displayEmail ?? (
                                                    <Typography variant="caption" color="text.disabled">—</Typography>
                                                )}
                                            </TableCell>

                                            {caller.isSuperAdmin && (
                                                <TableCell sx={{ fontSize: "11px", color: "text.secondary" }}>
                                                    <Tooltip title={log.organizationId || ""}>
                                                        <span>
                                                            {log.organizationId
                                                                ? (orgMap[log.organizationId] || log.organizationId)
                                                                : <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>Global</Typography>}
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>
                                            )}

                                            <TableCell sx={{
                                                maxWidth     : 180,
                                                overflow     : "hidden",
                                                textOverflow : "ellipsis",
                                                whiteSpace   : "nowrap",
                                            }}>
                                                <Tooltip title={log.url || ""}>
                                                    <span>{log.url || "—"}</span>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell sx={{ maxWidth: 280 }}>
                                                {log.item == null ? (
                                                    <Typography variant="caption" color="text.disabled">—</Typography>
                                                ) : (
                                                    <Tooltip title={formatItem(log.item)}>
                                                        <Typography variant="caption" sx={{
                                                            fontFamily   : "monospace",
                                                            display      : "block",
                                                            maxWidth     : 280,
                                                            overflow     : "hidden",
                                                            textOverflow : "ellipsis",
                                                            whiteSpace   : "nowrap",
                                                        }}>
                                                            {formatItem(log.item)}
                                                        </Typography>
                                                    </Tooltip>
                                                )}
                                            </TableCell>

                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                {formatIST(dt)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filtered.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </Paper>
        </Box>
    );
};

export default LogsList;