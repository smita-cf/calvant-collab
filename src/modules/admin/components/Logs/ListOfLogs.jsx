// 'use client'

// /**
//  * ListOfLogs.jsx
//  * Activity log viewer — role-aware, IST timestamps, module + action filter.
//  *
//  * Finalized action taxonomy (10 canonical actions):
//  *   VISITED | CLICK | CREATED | MODIFIED | UPDATED |
//  *   LOGGED_IN | LOGOUT | DELETE | UPLOAD | DOWNLOAD
//  *
//  * Legacy alias map handles old DB records written before the taxonomy was finalized.
//  */

// import React, { useEffect, useState, useCallback } from "react";
// import {
//     Box, Typography, Paper, Table, TableBody, TableCell,
//     TableContainer, TableHead, TableRow, TablePagination,
//     Chip, CircularProgress, Alert, Stack, TextField,
//     MenuItem, Select, InputLabel, FormControl,
//     IconButton, Tooltip, Button,
// } from "@mui/material";
// import RefreshIcon      from "@mui/icons-material/Refresh";
// import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

// // ── Endpoint ──────────────────────────────────────────────────────────────────
// const LOGGING_BASE_URL =
//     (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LOGGING_SERVICE_URL) ||
//     "https://api.calvant.com/logging-service/api/logs";

// // ── Canonical action taxonomy ─────────────────────────────────────────────────
// const ACTION_META = {
//     VISITED   : { color: "primary",   label: "VISITED"   },
//     CLICK     : { color: "default",   label: "CLICK"     },
//     CREATED   : { color: "success",   label: "CREATED"   },
//     MODIFIED  : { color: "info",      label: "MODIFIED"  },
//     UPDATED   : { color: "warning",   label: "UPDATED"   },
//     LOGGED_IN : { color: "success",   label: "LOGGED IN" },
//     LOGOUT    : { color: "warning",   label: "LOGOUT"    },
//     DELETE    : { color: "error",     label: "DELETE"    },
//     UPLOAD    : { color: "secondary", label: "UPLOAD"    },
//     DOWNLOAD  : { color: "info",      label: "DOWNLOAD"  },
// };

// // ── Legacy alias map ──────────────────────────────────────────────────────────
// const ACTION_ALIAS = {
//     PAGE_LOAD : "VISITED",
//     LOGIN     : "LOGGED_IN",
//     CREATE    : "CREATED",
//     UPDATE    : "UPDATED",
//     SELECT    : "CLICK",
// };

// const ALL_ACTIONS = Object.keys(ACTION_META);

// const normaliseAction = (action = "") => ACTION_ALIAS[action] ?? action;

// const getChipProps = (rawAction = "") => {
//     const action = normaliseAction(rawAction);
//     if (ACTION_META[action]) return ACTION_META[action];
//     return { color: "default", label: action.replace(/_/g, " ") };
// };

// // ── Module list ───────────────────────────────────────────────────────────────
// const MODULE_LIST = [
//     "Auth", "Risk", "Task", "Audit", "Framework Compliance",
//     "Trust", "TPRM", "AIIA", "Dashboard", "DPIA" , "Policies"
// ];

// const MODULE_COLORS = {
//     Auth       : "#6366f1",
//     Risk       : "#ef4444",
//     Task       : "#f59e0b",
//     Audit      : "#10b981",
//     Compliance : "#3b82f6",
//     Trust      : "#8b5cf6",
//     TPRM       : "#ec4899",
//     AIIA       : "#0ea5e9",
//     Dashboard  : "#64748b",
//     System     : "#6b7280",
// };

// const resolveModule = (log) => {
//     if (log.module && MODULE_LIST.includes(log.module)) return log.module;
//     if (log.module) {
//         const match = MODULE_LIST.find(m => m.toLowerCase() === log.module.toLowerCase());
//         if (match) return match;
//     }
//     const action = normaliseAction(log.action || "");
//     if (["LOGGED_IN", "LOGOUT"].includes(action))  return "Auth";
//     if (action.startsWith("AIIA_"))                return "AIIA";
//     if (action.startsWith("RISK_"))                return "Risk";
//     if (action.startsWith("TASK_"))                return "Task";
//     if (action.startsWith("TRUST_"))               return "Trust";
//     if (action.startsWith("TPRM_"))                return "TPRM";
//     if (action.startsWith("AUDIT_"))               return "Audit";
//     if (action.startsWith("COMPLIANCE_"))          return "Compliance";
//     const url = (log.url || "").toLowerCase();
//     if (url.includes("/risk"))                                        return "Risk";
//     if (url.includes("/gap-assessment"))                              return "Audit";
//     if (url.includes("/task"))                                        return "Task";
//     if (url.includes("/trust"))                                       return "Trust";
//     if (url.includes("/tprm") || url.includes("/vendor"))             return "TPRM";
//     if (url.includes("/documentation") || url.includes("/compliances")) return "Compliance";
//     if (url.includes("/login") || url.includes("/logout"))            return "Auth";
//     if (url === "/" || url.includes("/dashboard"))                    return "Dashboard";
//     return null;
// };

// // ── System-log safety net ─────────────────────────────────────────────────────
// const SYSTEM_URL_BLOCKLIST = [
//     "/framework/controls",
//     "/framework/",
//     "/api/",
//     "/_next/",
//     "/static/",
//     "/health",
//     "/actuator",
// ];

// const isSystemLog = (log) => {
//     const url = (log.url || "").toLowerCase();
//     if (resolveModule(log) === null && log.module === "System") return true;
//     return SYSTEM_URL_BLOCKLIST.some(b => url.startsWith(b) || url.includes(b));
// };

// // ── Validation ────────────────────────────────────────────────────────────────
// const isValidEmail = (email) => {
//     if (!email) return false;
//     if (email === "unknown@example.com") return false;
//     if (/^[a-f0-9]{24}$/i.test(email)) return false;
//     return email.includes("@");
// };

// // ── JWT helpers ───────────────────────────────────────────────────────────────
// const decodeJwt = (token) => {
//     try {
//         if (!token) return {};
//         const base64   = token.split(".")[1];
//         const standard = base64.replace(/-/g, "+").replace(/_/g, "/");
//         const padded   = standard + "=".repeat((4 - standard.length % 4) % 4);
//         return JSON.parse(atob(padded));
//     } catch {
//         return {};
//     }
// };

// const getCallerInfo = () => {
//     try {
//         const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
//         if (!token) return { role: "user", orgId: "", email: "", name: "", isSuperAdmin: false };
//         const jwt   = decodeJwt(token);
//         const roles = Array.isArray(jwt.role) ? jwt.role : [jwt.role].filter(Boolean);
//         const role  = roles[0] || "user";
//         return {
//             role,
//             orgId        : jwt.organization || jwt.organizationId || jwt.orgId || "",
//             email        : jwt.email        || jwt.sub            || "",
//             name         : jwt.name         || "",
//             isSuperAdmin : role === "super_admin",
//         };
//     } catch {
//         return { role: "user", orgId: "", email: "", name: "", isSuperAdmin: false };
//     }
// };

// // ── Date helpers ──────────────────────────────────────────────────────────────
// const toDate = (log) => {
//     const raw = log.createdAt || log.timestamp;
//     if (!raw) return null;
//     const d = new Date(raw);
//     return isNaN(d.getTime()) ? null : d;
// };

// const formatIST = (d) =>
//     d ? d.toLocaleString("en-IN", {
//         timeZone : "Asia/Kolkata",
//         day      : "2-digit",
//         month    : "short",
//         year     : "numeric",
//         hour     : "2-digit",
//         minute   : "2-digit",
//         hour12   : true,
//     }) : "—";

// // ── Item formatter ────────────────────────────────────────────────────────────
// const SKIP_KEYS = ["password", "oldPassword", "processes", "auditorName", "organization"];

// const objectToText = (obj) => {
//     if (!obj || typeof obj !== "object") return String(obj);
//     return Object.entries(obj)
//         .filter(([k, v]) =>
//             !SKIP_KEYS.includes(k) &&
//             v !== null && v !== undefined && v !== "" &&
//             !(Array.isArray(v) && v.length === 0)
//         )
//         .map(([k, v]) => {
//             const label = k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
//             const value = Array.isArray(v) ? v.join(", ") : String(v);
//             return `${label}: ${value}`;
//         })
//         .join("  |  ");
// };

// const formatItem = (item) => {
//     if (item == null) return null;
//     try {
//         const arr = Array.isArray(item) ? item : [item];
//         return arr.map(e => typeof e === "object" ? objectToText(e) : String(e)).join(" | ");
//     } catch {
//         return String(item);
//     }
// };

// // ── Exact-duplicate collapse ──────────────────────────────────────────────────
// const collapseExactDuplicates = (logs) => {
//     const seen = new Set();
//     return logs.filter((log) => {
//         if (!log.idempotencyKey) return true;
//         if (seen.has(log.idempotencyKey)) return false;
//         seen.add(log.idempotencyKey);
//         return true;
//     });
// };

// // ── Component ─────────────────────────────────────────────────────────────────
// const ListOfLogs = () => {
//     const caller = getCallerInfo();

//     const [logs,         setLogs        ] = useState([]);
//     const [loading,      setLoading     ] = useState(true);
//     const [error,        setError       ] = useState(null);

//     // Filters
//     const [actionFilter, setActionFilter] = useState("ALL");
//     const [moduleFilter, setModuleFilter] = useState("ALL");
//     const [searchQuery,  setSearchQuery ] = useState("");
//     const [dateFrom,     setDateFrom    ] = useState("");
//     const [dateTo,       setDateTo      ] = useState("");

//     // Pagination
//     const [page,         setPage        ] = useState(0);
//     const [rowsPerPage,  setRowsPerPage ] = useState(10);

//     // ── Fetch ─────────────────────────────────────────────────────────────────
//     const fetchLogs = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
//             if (!token) throw new Error("Not authenticated");

//             const res = await fetch(LOGGING_BASE_URL, {
//                 headers: {
//                     Authorization       : `Bearer ${token}`,
//                     "X-User-Role"       : caller.role,
//                     "X-Organization-Id" : caller.orgId,
//                 },
//             });

//             if (!res.ok) throw new Error(`Server returned ${res.status}`);

//             const data = await res.json();
//             const list = Array.isArray(data) ? data : (data.content ?? []);

//             const humanOnly = [...list].reverse().filter(log => !isSystemLog(log));
//             const deduped   = collapseExactDuplicates(humanOnly);
//             setLogs(deduped);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, [caller.role, caller.orgId]);

//     useEffect(() => { fetchLogs(); }, [fetchLogs]);

//     // ── Client-side filter ────────────────────────────────────────────────────
//     const filtered = logs.filter((log) => {
//         const normalisedAction = normaliseAction(log.action);

//         if (actionFilter !== "ALL" && normalisedAction !== actionFilter) return false;

//         const resolvedMod = resolveModule(log);
//         if (moduleFilter !== "ALL" && resolvedMod !== moduleFilter) return false;

//         if (searchQuery) {
//             const q        = searchQuery.toLowerCase();
//             const logEmail = isValidEmail(log.email) ? log.email.toLowerCase() : "";
//             const logName  = (log.name || "").toLowerCase();
//             if (!logEmail.includes(q) && !logName.includes(q)) return false;
//         }

//         const dt = toDate(log);
//         if (dateFrom && dt && dt < new Date(dateFrom))             return false;
//         if (dateTo   && dt && dt > new Date(dateTo + "T23:59:59")) return false;
//         return true;
//     });

//     const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//     const clearFilters = () => {
//         setActionFilter("ALL");
//         setModuleFilter("ALL");
//         setSearchQuery("");
//         setDateFrom("");
//         setDateTo("");
//         setPage(0);
//     };

//     const hasFilters = actionFilter !== "ALL" || moduleFilter !== "ALL"
//         || dateFrom || dateTo || searchQuery;

//     // super_admin sees Organisation column; others don't
//     const colSpan = caller.isSuperAdmin ? 9 : 8;

//     // ── Render ────────────────────────────────────────────────────────────────
//     return (
//         <Box sx={{ p: 3 }}>

//             {/* Header */}
//             <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
//                 <Box>
//                     <Typography variant="h5" fontWeight={700}>Activity Logs</Typography>
//                     <Typography variant="caption" color="text.secondary">
//                         {caller.isSuperAdmin
//                             ? "Viewing logs across all organisations"
//                             : "Viewing logs for your organisation"}
//                     </Typography>
//                 </Box>
//                 <Tooltip title="Refresh">
//                     <IconButton onClick={fetchLogs} color="primary">
//                         <RefreshIcon />
//                     </IconButton>
//                 </Tooltip>
//             </Stack>

//             {/* Filters */}
//             <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
//                 <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>

//                     <FormControl size="small" sx={{ minWidth: 150 }}>
//                         <InputLabel>Action</InputLabel>
//                         <Select
//                             value={actionFilter}
//                             label="Action"
//                             onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
//                         >
//                             <MenuItem value="ALL">All Actions</MenuItem>
//                             {ALL_ACTIONS.map(a => (
//                                 <MenuItem key={a} value={a}>{ACTION_META[a].label}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>

//                     <FormControl size="small" sx={{ minWidth: 150 }}>
//                         <InputLabel>Module</InputLabel>
//                         <Select
//                             value={moduleFilter}
//                             label="Module"
//                             onChange={(e) => { setModuleFilter(e.target.value); setPage(0); }}
//                         >
//                             <MenuItem value="ALL">All Modules</MenuItem>
//                             {MODULE_LIST.map(m => (
//                                 <MenuItem key={m} value={m}>{m}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>

//                     <TextField
//                         size="small"
//                         label="Search name / email"
//                         value={searchQuery}
//                         onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
//                         sx={{ minWidth: 200 }}
//                     />

//                     <TextField
//                         size="small"
//                         label="From date"
//                         type="date"
//                         value={dateFrom}
//                         onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
//                         slotProps={{ inputLabel: { shrink: true } }}
//                         sx={{ minWidth: 150 }}
//                     />

//                     <TextField
//                         size="small"
//                         label="To date"
//                         type="date"
//                         value={dateTo}
//                         onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
//                         slotProps={{ inputLabel: { shrink: true } }}
//                         sx={{ minWidth: 150 }}
//                     />

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

//                 </Box> {/* ← closes the filter Box — this was </Stack> before, causing the build error */}
//             </Paper>

//             {/* Error */}
//             {error && (
//                 <Alert severity="error" sx={{ mb: 2 }}>
//                     Could not load logs: {error}
//                 </Alert>
//             )}

//             {/* Table */}
//             <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
//                 <TableContainer sx={{ maxHeight: "65vh" }}>
//                     <Table stickyHeader size="small">
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
//                                 {caller.isSuperAdmin && (
//                                     <TableCell sx={{ fontWeight: 700 }}>Organisation</TableCell>
//                                 )}
//                                 <TableCell sx={{ fontWeight: 700 }}>URL / Page</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
//                                 <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
//                                     Date &amp; Time (IST)
//                                 </TableCell>
//                             </TableRow>
//                         </TableHead>

//                         <TableBody>
//                             {loading ? (
//                                 <TableRow>
//                                     <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
//                                         <CircularProgress size={28} />
//                                     </TableCell>
//                                 </TableRow>
//                             ) : paginated.length === 0 ? (
//                                 <TableRow>
//                                     <TableCell
//                                         colSpan={colSpan}
//                                         align="center"
//                                         sx={{ py: 6, color: "text.secondary" }}
//                                     >
//                                         No logs found.
//                                     </TableCell>
//                                 </TableRow>
//                             ) : (
//                                 paginated.map((log, i) => {
//                                     const chip         = getChipProps(log.action);
//                                     const dt           = toDate(log);
//                                     const resolvedMod  = resolveModule(log);
//                                     const modColor     = MODULE_COLORS[resolvedMod] ?? "#6b7280";
//                                     const displayEmail = isValidEmail(log.email) ? log.email : null;

//                                     return (
//                                         <TableRow
//                                             key={log.id ?? log.idempotencyKey ?? i}
//                                             hover
//                                             sx={{ "&:last-child td": { borderBottom: 0 } }}
//                                         >
//                                             {/* # */}
//                                             <TableCell>{page * rowsPerPage + i + 1}</TableCell>

//                                             {/* Module */}
//                                             <TableCell>
//                                                 {resolvedMod ? (
//                                                     <Chip
//                                                         label={resolvedMod}
//                                                         size="small"
//                                                         sx={{
//                                                             bgcolor    : modColor + "22",
//                                                             color      : modColor,
//                                                             fontWeight : 600,
//                                                             fontSize   : "11px",
//                                                             border     : `1px solid ${modColor}55`,
//                                                         }}
//                                                     />
//                                                 ) : (
//                                                     <Typography variant="caption" color="text.disabled">—</Typography>
//                                                 )}
//                                             </TableCell>

//                                             {/* Action */}
//                                             <TableCell>
//                                                 <Chip
//                                                     label={chip.label}
//                                                     color={chip.color}
//                                                     size="small"
//                                                     sx={{
//                                                         fontWeight : 600,
//                                                         fontSize   : "11px",
//                                                         maxWidth   : 220,
//                                                         ...(ACTION_META[normaliseAction(log.action)]
//                                                             ? {}
//                                                             : {
//                                                                 bgcolor      : "#f1f5f9",
//                                                                 color        : "#475569",
//                                                                 border       : "1px solid #cbd5e1",
//                                                                 textOverflow : "ellipsis",
//                                                                 overflow     : "hidden",
//                                                                 whiteSpace   : "nowrap",
//                                                                 display      : "inline-flex",
//                                                             }),
//                                                     }}
//                                                 />
//                                             </TableCell>

//                                             {/* Name */}
//                                             <TableCell>{log.name || "—"}</TableCell>

//                                             {/* Email */}
//                                             <TableCell>
//                                                 {displayEmail ?? (
//                                                     <Typography variant="caption" color="text.disabled">—</Typography>
//                                                 )}
//                                             </TableCell>

//                                             {/* Organisation — super_admin only */}
//                                             {caller.isSuperAdmin && (
//                                                 <TableCell sx={{ fontSize: "11px", color: "text.secondary" }}>
//                                                     {log.organizationId || "—"}
//                                                 </TableCell>
//                                             )}

//                                             {/* URL */}
//                                             <TableCell sx={{
//                                                 maxWidth     : 180,
//                                                 overflow     : "hidden",
//                                                 textOverflow : "ellipsis",
//                                                 whiteSpace   : "nowrap",
//                                             }}>
//                                                 <Tooltip title={log.url || ""}>
//                                                     <span>{log.url || "—"}</span>
//                                                 </Tooltip>
//                                             </TableCell>

//                                             {/* Item */}
//                                             <TableCell sx={{ maxWidth: 280 }}>
//                                                 {log.item == null ? (
//                                                     <Typography variant="caption" color="text.disabled">—</Typography>
//                                                 ) : (
//                                                     <Tooltip title={formatItem(log.item) || ""}>
//                                                         <Typography
//                                                             variant="caption"
//                                                             sx={{
//                                                                 fontFamily   : "monospace",
//                                                                 display      : "block",
//                                                                 maxWidth     : 280,
//                                                                 overflow     : "hidden",
//                                                                 textOverflow : "ellipsis",
//                                                                 whiteSpace   : "nowrap",
//                                                             }}
//                                                         >
//                                                             {formatItem(log.item)}
//                                                         </Typography>
//                                                     </Tooltip>
//                                                 )}
//                                             </TableCell>

//                                             {/* Date & Time IST */}
//                                             <TableCell sx={{ whiteSpace: "nowrap" }}>
//                                                 {formatIST(dt)}
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

//-------------------------------------------///////////////////////////////////////////////////////--------------------
//DUPLICATE LOGS SHOWING
// 'use client'

// /**
//  * ListOfLogs.jsx
//  * Activity log viewer — role-aware, IST timestamps, module + action filter.
//  *
//  * Finalized action taxonomy (10 canonical actions):
//  *   VISITED | CLICK | CREATED | MODIFIED | UPDATED |
//  *   LOGGED_IN | LOGOUT | DELETE | UPLOAD | DOWNLOAD
//  *
//  * Legacy alias map handles old DB records written before the taxonomy was finalized.
//  *
//  * CHANGE LOG (this revision):
//  *   - MODULE_COLORS extended to cover Framework Compliance, DPIA, Policies
//  *     (previously fell back to default gray).
//  *   - resolveModule(): added action-prefix + URL fallbacks for DPIA, Policies,
//  *     Framework Compliance so logs missing an explicit `module` field still
//  *     resolve where possible. NOTE: DPIA logs currently arrive with BOTH
//  *     module and url empty (confirmed from screenshot) — no fallback can fix
//  *     that; the fix has to happen at the source that writes those log entries.
//  *   - SYSTEM_URL_BLOCKLIST: narrowed "/framework/" to "/framework/controls"
//  *     and "/framework/admin" only. The blanket "/framework/" prefix was
//  *     silently dropping legitimate Framework Compliance module logs before
//  *     they ever reached this table (isSystemLog() marked them as system logs
//  *     and fetchLogs() filtered them out entirely). If your Framework
//  *     Compliance pages use a different path than /framework/*, adjust below.
//  *   - fetchLogs(): replaced the assumption-based `[...list].reverse()` with
//  *     an explicit sort by createdAt/timestamp, descending (most recent
//  *     first). This no longer depends on backend insertion order.
//  */

// import React, { useEffect, useState, useCallback } from "react";
// import {
//     Box, Typography, Paper, Table, TableBody, TableCell,
//     TableContainer, TableHead, TableRow, TablePagination,
//     Chip, CircularProgress, Alert, Stack, TextField,
//     MenuItem, Select, InputLabel, FormControl,
//     IconButton, Tooltip, Button,
// } from "@mui/material";
// import RefreshIcon      from "@mui/icons-material/Refresh";
// import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

// // ── Endpoint ──────────────────────────────────────────────────────────────────
// const LOGGING_BASE_URL =
//     (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LOGGING_SERVICE_URL) ||
//     "https://api.calvant.com/logging-service/api/logs";

// // ── Canonical action taxonomy ─────────────────────────────────────────────────
// const ACTION_META = {
//     VISITED   : { color: "primary",   label: "VISITED"   },
//     CLICK     : { color: "default",   label: "CLICK"     },
//     CREATED   : { color: "success",   label: "CREATED"   },
//     MODIFIED  : { color: "info",      label: "MODIFIED"  },
//     UPDATED   : { color: "warning",   label: "UPDATED"   },
//     LOGGED_IN : { color: "success",   label: "LOGGED IN" },
//     LOGOUT    : { color: "warning",   label: "LOGOUT"    },
//     DELETE    : { color: "error",     label: "DELETE"    },
//     UPLOAD    : { color: "secondary", label: "UPLOAD"    },
//     DOWNLOAD  : { color: "info",      label: "DOWNLOAD"  },
// };

// // ── Legacy alias map ──────────────────────────────────────────────────────────
// const ACTION_ALIAS = {
//     PAGE_LOAD : "VISITED",
//     LOGIN     : "LOGGED_IN",
//     CREATE    : "CREATED",
//     UPDATE    : "UPDATED",
//     SELECT    : "CLICK",
// };

// const ALL_ACTIONS = Object.keys(ACTION_META);

// const normaliseAction = (action = "") => ACTION_ALIAS[action] ?? action;

// const getChipProps = (rawAction = "") => {
//     const action = normaliseAction(rawAction);
//     if (ACTION_META[action]) return ACTION_META[action];
//     return { color: "default", label: action.replace(/_/g, " ") };
// };

// // ── Module list — full canonical set ──────────────────────────────────────────
// const MODULE_LIST = [
//     "Auth", "Risk", "Task", "Audit", "Framework Compliance",
//     "Trust", "TPRM", "AIIA", "Dashboard", "DPIA", "Policies",
// ];

// // ── Module colors — one entry per MODULE_LIST item ────────────────────────────
// const MODULE_COLORS = {
//     Auth                  : "#6366f1",
//     Risk                  : "#ef4444",
//     Task                  : "#f59e0b",
//     Audit                 : "#10b981",
//     "Framework Compliance": "#3b82f6",
//     Trust                 : "#8b5cf6",
//     TPRM                  : "#ec4899",
//     AIIA                  : "#0ea5e9",
//     Dashboard             : "#64748b",
//     DPIA                  : "#14b8a6",
//     Policies              : "#a855f7",
//     System                : "#6b7280",
// };

// const resolveModule = (log) => {
//     if (log.module && MODULE_LIST.includes(log.module)) return log.module;
//     if (log.module) {
//         const match = MODULE_LIST.find(m => m.toLowerCase() === log.module.toLowerCase());
//         if (match) return match;
//     }

//     const action = normaliseAction(log.action || "");
//     if (["LOGGED_IN", "LOGOUT"].includes(action))  return "Auth";
//     if (action.startsWith("AIIA_"))                return "AIIA";
//     if (action.startsWith("RISK_"))                return "Risk";
//     if (action.startsWith("TASK_"))                return "Task";
//     if (action.startsWith("TRUST_"))               return "Trust";
//     if (action.startsWith("TPRM_"))                return "TPRM";
//     if (action.startsWith("AUDIT_"))               return "Audit";
//     if (action.startsWith("DPIA_"))                return "DPIA";
//     if (action.startsWith("POLICY_") || action.startsWith("POLICIES_")) return "Policies";
//     if (action.startsWith("COMPLIANCE_"))          return "Framework Compliance";

//     const url = (log.url || "").toLowerCase();
//     if (!url) return null; // nothing left to resolve from — e.g. DPIA logs with no url/module at source

//     if (url.includes("/risk"))                                return "Risk";
//     if (url.includes("/gap-assessment"))                      return "Audit";
//     if (url.includes("/task"))                                return "Task";
//     if (url.includes("/trust"))                                return "Trust";
//     if (url.includes("/tprm") || url.includes("/vendor"))      return "TPRM";
//     if (url.includes("/dpia"))                                  return "DPIA";
//     if (url.includes("/aiia"))                                  return "AIIA";
//     if (url.includes("/policies") || url.includes("/documentation")) return "Policies";
//     if (url.includes("/framework") || url.includes("/compliances"))  return "Framework Compliance";
//     if (url.includes("/login") || url.includes("/logout"))     return "Auth";
//     if (url === "/" || url.includes("/dashboard"))              return "Dashboard";
//     return null;
// };

// // ── System-log safety net ─────────────────────────────────────────────────────
// // NOTE: narrowed from a blanket "/framework/" prefix, which was catching
// // legitimate Framework Compliance module pages and silently dropping them
// // as "system" logs before they ever reached the table. Adjust the two
// // entries below if your actual admin/config routes differ.
// const SYSTEM_URL_BLOCKLIST = [
//     "/framework/controls",
//     "/framework/admin",
//     "/api/",
//     "/_next/",
//     "/static/",
//     "/health",
//     "/actuator",
// ];

// const isSystemLog = (log) => {
//     const url = (log.url || "").toLowerCase();
//     if (resolveModule(log) === null && log.module === "System") return true;
//     return SYSTEM_URL_BLOCKLIST.some(b => url.startsWith(b) || url.includes(b));
// };

// // ── Validation ────────────────────────────────────────────────────────────────
// const isValidEmail = (email) => {
//     if (!email) return false;
//     if (email === "unknown@example.com") return false;
//     if (/^[a-f0-9]{24}$/i.test(email)) return false;
//     return email.includes("@");
// };

// // ── JWT helpers ───────────────────────────────────────────────────────────────
// const decodeJwt = (token) => {
//     try {
//         if (!token) return {};
//         const base64   = token.split(".")[1];
//         const standard = base64.replace(/-/g, "+").replace(/_/g, "/");
//         const padded   = standard + "=".repeat((4 - standard.length % 4) % 4);
//         return JSON.parse(atob(padded));
//     } catch {
//         return {};
//     }
// };

// const getCallerInfo = () => {
//     try {
//         const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
//         if (!token) return { role: "user", orgId: "", email: "", name: "", isSuperAdmin: false };
//         const jwt   = decodeJwt(token);
//         const roles = Array.isArray(jwt.role) ? jwt.role : [jwt.role].filter(Boolean);
//         const role  = roles[0] || "user";
//         return {
//             role,
//             orgId        : jwt.organization || jwt.organizationId || jwt.orgId || "",
//             email        : jwt.email        || jwt.sub            || "",
//             name         : jwt.name         || "",
//             isSuperAdmin : role === "super_admin",
//         };
//     } catch {
//         return { role: "user", orgId: "", email: "", name: "", isSuperAdmin: false };
//     }
// };

// // ── Date helpers ──────────────────────────────────────────────────────────────
// const toDate = (log) => {
//     const raw = log.createdAt || log.timestamp;
//     if (!raw) return null;
//     const d = new Date(raw);
//     return isNaN(d.getTime()) ? null : d;
// };

// const formatIST = (d) =>
//     d ? d.toLocaleString("en-IN", {
//         timeZone : "Asia/Kolkata",
//         day      : "2-digit",
//         month    : "short",
//         year     : "numeric",
//         hour     : "2-digit",
//         minute   : "2-digit",
//         hour12   : true,
//     }) : "—";

// // ── Item formatter ────────────────────────────────────────────────────────────
// const SKIP_KEYS = ["password", "oldPassword", "processes", "auditorName", "organization"];

// const objectToText = (obj) => {
//     if (!obj || typeof obj !== "object") return String(obj);
//     return Object.entries(obj)
//         .filter(([k, v]) =>
//             !SKIP_KEYS.includes(k) &&
//             v !== null && v !== undefined && v !== "" &&
//             !(Array.isArray(v) && v.length === 0)
//         )
//         .map(([k, v]) => {
//             const label = k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
//             const value = Array.isArray(v) ? v.join(", ") : String(v);
//             return `${label}: ${value}`;
//         })
//         .join("  |  ");
// };

// const formatItem = (item) => {
//     if (item == null) return null;
//     try {
//         const arr = Array.isArray(item) ? item : [item];
//         return arr.map(e => typeof e === "object" ? objectToText(e) : String(e)).join(" | ");
//     } catch {
//         return String(item);
//     }
// };

// // ── Exact-duplicate collapse ──────────────────────────────────────────────────
// const collapseExactDuplicates = (logs) => {
//     const seen = new Set();
//     return logs.filter((log) => {
//         if (!log.idempotencyKey) return true;
//         if (seen.has(log.idempotencyKey)) return false;
//         seen.add(log.idempotencyKey);
//         return true;
//     });
// };

// // ── Sort — most recent first ──────────────────────────────────────────────────
// // Explicit sort by resolved date, descending. Logs with no parseable date
// // (toDate returns null) are pushed to the end rather than dropped, so
// // malformed records are still visible but don't disrupt ordering.
// const sortByDateDesc = (logs) =>
//     [...logs].sort((a, b) => {
//         const da = toDate(a);
//         const db = toDate(b);
//         if (!da && !db) return 0;
//         if (!da) return 1;
//         if (!db) return -1;
//         return db.getTime() - da.getTime();
//     });

// // ── Component ─────────────────────────────────────────────────────────────────
// const ListOfLogs = () => {
//     const caller = getCallerInfo();

//     const [logs,         setLogs        ] = useState([]);
//     const [loading,      setLoading     ] = useState(true);
//     const [error,        setError       ] = useState(null);

//     // Filters
//     const [actionFilter, setActionFilter] = useState("ALL");
//     const [moduleFilter, setModuleFilter] = useState("ALL");
//     const [searchQuery,  setSearchQuery ] = useState("");
//     const [dateFrom,     setDateFrom    ] = useState("");
//     const [dateTo,       setDateTo      ] = useState("");

//     // Pagination
//     const [page,         setPage        ] = useState(0);
//     const [rowsPerPage,  setRowsPerPage ] = useState(10);

//     // ── Fetch ─────────────────────────────────────────────────────────────────
//     const fetchLogs = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
//             if (!token) throw new Error("Not authenticated");

//             const res = await fetch(LOGGING_BASE_URL, {
//                 headers: {
//                     Authorization       : `Bearer ${token}`,
//                     "X-User-Role"       : caller.role,
//                     "X-Organization-Id" : caller.orgId,
//                 },
//             });

//             if (!res.ok) throw new Error(`Server returned ${res.status}`);

//             const data = await res.json();
//             const list = Array.isArray(data) ? data : (data.content ?? []);

//             const humanOnly = list.filter(log => !isSystemLog(log));
//             const deduped   = collapseExactDuplicates(humanOnly);
//             const sorted    = sortByDateDesc(deduped);
//             setLogs(sorted);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, [caller.role, caller.orgId]);

//     useEffect(() => { fetchLogs(); }, [fetchLogs]);

//     // ── Client-side filter ────────────────────────────────────────────────────
//     const filtered = logs.filter((log) => {
//         const normalisedAction = normaliseAction(log.action);

//         if (actionFilter !== "ALL" && normalisedAction !== actionFilter) return false;

//         const resolvedMod = resolveModule(log);
//         if (moduleFilter !== "ALL" && resolvedMod !== moduleFilter) return false;

//         if (searchQuery) {
//             const q        = searchQuery.toLowerCase();
//             const logEmail = isValidEmail(log.email) ? log.email.toLowerCase() : "";
//             const logName  = (log.name || "").toLowerCase();
//             if (!logEmail.includes(q) && !logName.includes(q)) return false;
//         }

//         const dt = toDate(log);
//         if (dateFrom && dt && dt < new Date(dateFrom))             return false;
//         if (dateTo   && dt && dt > new Date(dateTo + "T23:59:59")) return false;
//         return true;
//     });

//     const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//     const clearFilters = () => {
//         setActionFilter("ALL");
//         setModuleFilter("ALL");
//         setSearchQuery("");
//         setDateFrom("");
//         setDateTo("");
//         setPage(0);
//     };

//     const hasFilters = actionFilter !== "ALL" || moduleFilter !== "ALL"
//         || dateFrom || dateTo || searchQuery;

//     // super_admin sees Organisation column; others don't
//     const colSpan = caller.isSuperAdmin ? 9 : 8;

//     // ── Render ────────────────────────────────────────────────────────────────
//     return (
//         <Box sx={{ p: 3 }}>

//             {/* Header */}
//             <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
//                 <Box>
//                     <Typography variant="h5" fontWeight={700}>Activity Logs</Typography>
//                     <Typography variant="caption" color="text.secondary">
//                         {caller.isSuperAdmin
//                             ? "Viewing logs across all organisations"
//                             : "Viewing logs for your organisation"}
//                     </Typography>
//                 </Box>
//                 <Tooltip title="Refresh">
//                     <IconButton onClick={fetchLogs} color="primary">
//                         <RefreshIcon />
//                     </IconButton>
//                 </Tooltip>
//             </Stack>

//             {/* Filters */}
//             <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
//                 <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>

//                     <FormControl size="small" sx={{ minWidth: 150 }}>
//                         <InputLabel>Action</InputLabel>
//                         <Select
//                             value={actionFilter}
//                             label="Action"
//                             onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
//                         >
//                             <MenuItem value="ALL">All Actions</MenuItem>
//                             {ALL_ACTIONS.map(a => (
//                                 <MenuItem key={a} value={a}>{ACTION_META[a].label}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>

//                     <FormControl size="small" sx={{ minWidth: 150 }}>
//                         <InputLabel>Module</InputLabel>
//                         <Select
//                             value={moduleFilter}
//                             label="Module"
//                             onChange={(e) => { setModuleFilter(e.target.value); setPage(0); }}
//                         >
//                             <MenuItem value="ALL">All Modules</MenuItem>
//                             {MODULE_LIST.map(m => (
//                                 <MenuItem key={m} value={m}>{m}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>

//                     <TextField
//                         size="small"
//                         label="Search name / email"
//                         value={searchQuery}
//                         onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
//                         sx={{ minWidth: 200 }}
//                     />

//                     <TextField
//                         size="small"
//                         label="From date"
//                         type="date"
//                         value={dateFrom}
//                         onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
//                         slotProps={{ inputLabel: { shrink: true } }}
//                         sx={{ minWidth: 150 }}
//                     />

//                     <TextField
//                         size="small"
//                         label="To date"
//                         type="date"
//                         value={dateTo}
//                         onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
//                         slotProps={{ inputLabel: { shrink: true } }}
//                         sx={{ minWidth: 150 }}
//                     />

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

//                 </Box>
//             </Paper>

//             {/* Error */}
//             {error && (
//                 <Alert severity="error" sx={{ mb: 2 }}>
//                     Could not load logs: {error}
//                 </Alert>
//             )}

//             {/* Table */}
//             <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
//                 <TableContainer sx={{ maxHeight: "65vh" }}>
//                     <Table stickyHeader size="small">
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
//                                 {caller.isSuperAdmin && (
//                                     <TableCell sx={{ fontWeight: 700 }}>Organisation</TableCell>
//                                 )}
//                                 <TableCell sx={{ fontWeight: 700 }}>URL / Page</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
//                                 <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
//                                     Date &amp; Time (IST)
//                                 </TableCell>
//                             </TableRow>
//                         </TableHead>

//                         <TableBody>
//                             {loading ? (
//                                 <TableRow>
//                                     <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
//                                         <CircularProgress size={28} />
//                                     </TableCell>
//                                 </TableRow>
//                             ) : paginated.length === 0 ? (
//                                 <TableRow>
//                                     <TableCell
//                                         colSpan={colSpan}
//                                         align="center"
//                                         sx={{ py: 6, color: "text.secondary" }}
//                                     >
//                                         No logs found.
//                                     </TableCell>
//                                 </TableRow>
//                             ) : (
//                                 paginated.map((log, i) => {
//                                     const chip         = getChipProps(log.action);
//                                     const dt           = toDate(log);
//                                     const resolvedMod  = resolveModule(log);
//                                     const modColor     = MODULE_COLORS[resolvedMod] ?? "#6b7280";
//                                     const displayEmail = isValidEmail(log.email) ? log.email : null;

//                                     return (
//                                         <TableRow
//                                             key={log.id ?? log.idempotencyKey ?? i}
//                                             hover
//                                             sx={{ "&:last-child td": { borderBottom: 0 } }}
//                                         >
//                                             {/* # */}
//                                             <TableCell>{page * rowsPerPage + i + 1}</TableCell>

//                                             {/* Module */}
//                                             <TableCell>
//                                                 {resolvedMod ? (
//                                                     <Chip
//                                                         label={resolvedMod}
//                                                         size="small"
//                                                         sx={{
//                                                             bgcolor    : modColor + "22",
//                                                             color      : modColor,
//                                                             fontWeight : 600,
//                                                             fontSize   : "11px",
//                                                             border     : `1px solid ${modColor}55`,
//                                                         }}
//                                                     />
//                                                 ) : (
//                                                     <Typography variant="caption" color="text.disabled">—</Typography>
//                                                 )}
//                                             </TableCell>

//                                             {/* Action */}
//                                             <TableCell>
//                                                 <Chip
//                                                     label={chip.label}
//                                                     color={chip.color}
//                                                     size="small"
//                                                     sx={{
//                                                         fontWeight : 600,
//                                                         fontSize   : "11px",
//                                                         maxWidth   : 220,
//                                                         ...(ACTION_META[normaliseAction(log.action)]
//                                                             ? {}
//                                                             : {
//                                                                 bgcolor      : "#f1f5f9",
//                                                                 color        : "#475569",
//                                                                 border       : "1px solid #cbd5e1",
//                                                                 textOverflow : "ellipsis",
//                                                                 overflow     : "hidden",
//                                                                 whiteSpace   : "nowrap",
//                                                                 display      : "inline-flex",
//                                                             }),
//                                                     }}
//                                                 />
//                                             </TableCell>

//                                             {/* Name */}
//                                             <TableCell>{log.name || "—"}</TableCell>

//                                             {/* Email */}
//                                             <TableCell>
//                                                 {displayEmail ?? (
//                                                     <Typography variant="caption" color="text.disabled">—</Typography>
//                                                 )}
//                                             </TableCell>

//                                             {/* Organisation — super_admin only */}
//                                             {caller.isSuperAdmin && (
//                                                 <TableCell sx={{ fontSize: "11px", color: "text.secondary" }}>
//                                                     {log.organizationId || "—"}
//                                                 </TableCell>
//                                             )}

//                                             {/* URL */}
//                                             <TableCell sx={{
//                                                 maxWidth     : 180,
//                                                 overflow     : "hidden",
//                                                 textOverflow : "ellipsis",
//                                                 whiteSpace   : "nowrap",
//                                             }}>
//                                                 <Tooltip title={log.url || ""}>
//                                                     <span>{log.url || "—"}</span>
//                                                 </Tooltip>
//                                             </TableCell>

//                                             {/* Item */}
//                                             <TableCell sx={{ maxWidth: 280 }}>
//                                                 {log.item == null ? (
//                                                     <Typography variant="caption" color="text.disabled">—</Typography>
//                                                 ) : (
//                                                     <Tooltip title={formatItem(log.item) || ""}>
//                                                         <Typography
//                                                             variant="caption"
//                                                             sx={{
//                                                                 fontFamily   : "monospace",
//                                                                 display      : "block",
//                                                                 maxWidth     : 280,
//                                                                 overflow     : "hidden",
//                                                                 textOverflow : "ellipsis",
//                                                                 whiteSpace   : "nowrap",
//                                                             }}
//                                                         >
//                                                             {formatItem(log.item)}
//                                                         </Typography>
//                                                     </Tooltip>
//                                                 )}
//                                             </TableCell>

//                                             {/* Date & Time IST */}
//                                             <TableCell sx={{ whiteSpace: "nowrap" }}>
//                                                 {formatIST(dt)}
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

//+++++++++++++++++++++++++++++++++++++++++++++++++++/////////////////////////////////////////////////++++++++++++++++++++++

'use client'

/**
 * ListOfLogs.jsx
 * Activity log viewer — role-aware, IST timestamps, module + action filter.
 *
 * Finalized action taxonomy (10 canonical actions):
 *   VISITED | CLICK | CREATED | MODIFIED | UPDATED |
 *   LOGGED_IN | LOGOUT | DELETE | UPLOAD | DOWNLOAD
 *
 * Legacy alias map handles old DB records written before the taxonomy was finalized.
 *
 * CHANGE LOG (this revision):
 *   - MODULE_COLORS extended to cover Framework Compliance, DPIA, Policies
 *     (previously fell back to default gray).
 *   - resolveModule(): added action-prefix + URL fallbacks for DPIA, Policies,
 *     Framework Compliance so logs missing an explicit `module` field still
 *     resolve where possible.
 *   - SYSTEM_URL_BLOCKLIST: narrowed "/framework/" to "/framework/controls"
 *     and "/framework/admin" only, since the blanket "/framework/" prefix was
 *     silently dropping legitimate Framework Compliance module logs.
 *   - fetchLogs(): replaced the assumption-based `[...list].reverse()` with
 *     an explicit sort by createdAt/timestamp, descending.
 *   - **BUGFIX (this revision): reintroduced duplicate rows.**
 *     Narrowing SYSTEM_URL_BLOCKLIST let through internal backend sub-calls
 *     under /framework/* (e.g. one page view firing several logged calls to
 *     /framework/compliances/{id}, /framework/questions/{id}, etc.). These
 *     each carry a distinct (or missing) idempotencyKey, so the exact-match
 *     collapseExactDuplicates() pass didn't catch them — they showed up as
 *     several rows for what a user experiences as one action.
 *     Fix: added collapseNearDuplicates(), a second pass that collapses
 *     records sharing the same user + action + module/url occurring within
 *     a short time window (default 5s), keeping the earliest. This runs
 *     AFTER the exact-key pass and does not touch the blocklist narrowing,
 *     so the earlier "missing Framework Compliance logs" fix is preserved.
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

// ── Endpoint ──────────────────────────────────────────────────────────────────
const LOGGING_BASE_URL =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LOGGING_SERVICE_URL) ||
    "https://api.calvant.com/logging-service/api/logs";

// ── Canonical action taxonomy ─────────────────────────────────────────────────
const ACTION_META = {
    VISITED   : { color: "primary",   label: "VISITED"   },
    CLICK     : { color: "default",   label: "CLICK"     },
    CREATED   : { color: "success",   label: "CREATED"   },
    MODIFIED  : { color: "info",      label: "MODIFIED"  },
    UPDATED   : { color: "warning",   label: "UPDATED"   },
    LOGGED_IN : { color: "success",   label: "LOGGED IN" },
    LOGOUT    : { color: "warning",   label: "LOGOUT"    },
    DELETE    : { color: "error",     label: "DELETE"    },
    UPLOAD    : { color: "secondary", label: "UPLOAD"    },
    DOWNLOAD  : { color: "info",      label: "DOWNLOAD"  },
};

// ── Legacy alias map ──────────────────────────────────────────────────────────
const ACTION_ALIAS = {
    PAGE_LOAD : "VISITED",
    LOGIN     : "LOGGED_IN",
    CREATE    : "CREATED",
    UPDATE    : "UPDATED",
    SELECT    : "CLICK",
};

const ALL_ACTIONS = Object.keys(ACTION_META);

const normaliseAction = (action = "") => ACTION_ALIAS[action] ?? action;

const getChipProps = (rawAction = "") => {
    const action = normaliseAction(rawAction);
    if (ACTION_META[action]) return ACTION_META[action];
    return { color: "default", label: action.replace(/_/g, " ") };
};

// ── Module list — full canonical set ──────────────────────────────────────────
const MODULE_LIST = [
    "Auth", "Risk", "Task", "Audit", "Framework Compliance",
    "Trust", "TPRM", "AIIA", "Dashboard", "DPIA", "Policies",
];

// ── Module colors — one entry per MODULE_LIST item ────────────────────────────
const MODULE_COLORS = {
    Auth                  : "#6366f1",
    Risk                  : "#ef4444",
    Task                  : "#f59e0b",
    Audit                 : "#10b981",
    "Framework Compliance": "#3b82f6",
    Trust                 : "#8b5cf6",
    TPRM                  : "#ec4899",
    AIIA                  : "#0ea5e9",
    Dashboard             : "#64748b",
    DPIA                  : "#14b8a6",
    Policies              : "#a855f7",
    System                : "#6b7280",
};

const resolveModule = (log) => {
    if (log.module && MODULE_LIST.includes(log.module)) return log.module;
    if (log.module) {
        const match = MODULE_LIST.find(m => m.toLowerCase() === log.module.toLowerCase());
        if (match) return match;
    }

    const action = normaliseAction(log.action || "");
    if (["LOGGED_IN", "LOGOUT"].includes(action))  return "Auth";
    if (action.startsWith("AIIA_"))                return "AIIA";
    if (action.startsWith("RISK_"))                return "Risk";
    if (action.startsWith("TASK_"))                return "Task";
    if (action.startsWith("TRUST_"))               return "Trust";
    if (action.startsWith("TPRM_"))                return "TPRM";
    if (action.startsWith("AUDIT_"))               return "Audit";
    if (action.startsWith("DPIA_"))                return "DPIA";
    if (action.startsWith("POLICY_") || action.startsWith("POLICIES_")) return "Policies";
    if (action.startsWith("COMPLIANCE_"))          return "Framework Compliance";

    const url = (log.url || "").toLowerCase();
    if (!url) return null; // nothing left to resolve from — e.g. DPIA logs with no url/module at source

    if (url.includes("/risk"))                                return "Risk";
    if (url.includes("/gap-assessment"))                      return "Audit";
    if (url.includes("/task"))                                return "Task";
    if (url.includes("/trust"))                                return "Trust";
    if (url.includes("/tprm") || url.includes("/vendor"))      return "TPRM";
    if (url.includes("/dpia"))                                  return "DPIA";
    if (url.includes("/aiia"))                                  return "AIIA";
    if (url.includes("/policies") || url.includes("/documentation")) return "Policies";
    if (url.includes("/framework") || url.includes("/compliances"))  return "Framework Compliance";
    if (url.includes("/login") || url.includes("/logout"))     return "Auth";
    if (url === "/" || url.includes("/dashboard"))              return "Dashboard";
    return null;
};

// ── System-log safety net ─────────────────────────────────────────────────────
// Kept narrow deliberately — a blanket "/framework/" prefix previously caught
// legitimate Framework Compliance module pages and silently dropped them as
// "system" logs before they ever reached the table. Duplicate backend sub-calls
// under /framework/* are handled separately by collapseNearDuplicates() below,
// not by widening this blocklist again.
const SYSTEM_URL_BLOCKLIST = [
    "/framework/controls",
    "/framework/admin",
    "/api/",
    "/_next/",
    "/static/",
    "/health",
    "/actuator",
];

const isSystemLog = (log) => {
    const url = (log.url || "").toLowerCase();

    // CHANGE: previously only hid a log here if module was unresolved
    // AND explicitly tagged "System". In practice, unresolved-module logs
    // are almost always the noisy duplicate "Detail: ..." entries fired
    // from a component that forgot to pass module/url — they're never a
    // module we actually want to show as "—" in the table, they're just
    // clutter sitting alongside a properly-tagged log of the same visit.
    // So: any log we can't classify into a real module gets hidden here,
    // regardless of what (if anything) its module field actually says.
    // NOTE: this is a display-layer bandage, not a real fix — the
    // underlying call site is still writing junk rows into Mongo. Worth
    // tracking down (see console.warn added in activities.js) so the
    // "Item" detail text on those rows isn't silently thrown away forever.
    if (resolveModule(log) === null) return true;

    return SYSTEM_URL_BLOCKLIST.some(b => url.startsWith(b) || url.includes(b));
};

// ── Validation ────────────────────────────────────────────────────────────────
const isValidEmail = (email) => {
    if (!email) return false;
    if (email === "unknown@example.com") return false;
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

// ── Date helpers ──────────────────────────────────────────────────────────────
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

// ── Item formatter ────────────────────────────────────────────────────────────
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

// ── Exact-duplicate collapse ──────────────────────────────────────────────────
// Catches records that share the exact same idempotencyKey (true retries /
// double-submits of the identical event).
const collapseExactDuplicates = (logs) => {
    const seen = new Set();
    return logs.filter((log) => {
        if (!log.idempotencyKey) return true;
        if (seen.has(log.idempotencyKey)) return false;
        seen.add(log.idempotencyKey);
        return true;
    });
};

// ── Near-duplicate collapse ───────────────────────────────────────────────────
// Catches records that DON'T share an idempotencyKey but are, to a human
// reading the table, the same logical action: same user, same normalised
// action, same resolved module (or same url when module can't be resolved),
// firing more than once within `windowMs` of each other. This is what
// backend sub-calls under a single page view look like (e.g. one Framework
// Compliance page view logging separate VISITED entries for
// /framework/compliances/{id} and /framework/questions/{id} a few hundred
// ms apart). Keeps the earliest occurrence in each cluster.
const collapseNearDuplicates = (logs, windowMs = 5000) => {
    // logs must already be sorted ascending by time for the windowing below
    // to correctly compare "close in time" — sort ascending here regardless
    // of the caller's order, then restore nothing (caller re-sorts after).
    const asc = [...logs].sort((a, b) => {
        const da = toDate(a), db = toDate(b);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da.getTime() - db.getTime();
    });

    const lastSeenAt = new Map(); // key -> timestamp (ms) of last kept entry
    const result = [];

    for (const log of asc) {
        const dt = toDate(log);
        const identity = (isValidEmail(log.email) ? log.email.toLowerCase() : null)
            ?? (log.name || "").toLowerCase()
            ?? "unknown";
        const action  = normaliseAction(log.action || "");
        const mod     = resolveModule(log) || (log.url || "").toLowerCase();
        const key     = `${identity}|${action}|${mod}`;

        if (!dt) {
            // No parseable date — can't window it, keep it (visible, not silently dropped)
            result.push(log);
            continue;
        }

        const last = lastSeenAt.get(key);
        if (last !== undefined && dt.getTime() - last <= windowMs) {
            // within window of the last kept entry for this identity+action+module → drop
            continue;
        }

        lastSeenAt.set(key, dt.getTime());
        result.push(log);
    }

    return result;
};

// ── Sort — most recent first ──────────────────────────────────────────────────
const sortByDateDesc = (logs) =>
    [...logs].sort((a, b) => {
        const da = toDate(a);
        const db = toDate(b);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return db.getTime() - da.getTime();
    });

// ── Component ─────────────────────────────────────────────────────────────────
const ListOfLogs = () => {
    const caller = getCallerInfo();

    const [logs,         setLogs        ] = useState([]);
    const [loading,      setLoading     ] = useState(true);
    const [error,        setError       ] = useState(null);

    // Filters
    const [actionFilter, setActionFilter] = useState("ALL");
    const [moduleFilter, setModuleFilter] = useState("ALL");
    const [searchQuery,  setSearchQuery ] = useState("");
    const [dateFrom,     setDateFrom    ] = useState("");
    const [dateTo,       setDateTo      ] = useState("");

    // Pagination
    const [page,         setPage        ] = useState(0);
    const [rowsPerPage,  setRowsPerPage ] = useState(10);

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

            const humanOnly  = list.filter(log => !isSystemLog(log));
            const exactDeduped = collapseExactDuplicates(humanOnly);
            const fullyDeduped = collapseNearDuplicates(exactDeduped);
            const sorted        = sortByDateDesc(fullyDeduped);
            setLogs(sorted);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [caller.role, caller.orgId]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    // ── Client-side filter ────────────────────────────────────────────────────
    const filtered = logs.filter((log) => {
        const normalisedAction = normaliseAction(log.action);

        if (actionFilter !== "ALL" && normalisedAction !== actionFilter) return false;

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
        setSearchQuery("");
        setDateFrom("");
        setDateTo("");
        setPage(0);
    };

    const hasFilters = actionFilter !== "ALL" || moduleFilter !== "ALL"
        || dateFrom || dateTo || searchQuery;

    // super_admin sees Organisation column; others don't
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
                        <Select
                            value={actionFilter}
                            label="Action"
                            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="ALL">All Actions</MenuItem>
                            {ALL_ACTIONS.map(a => (
                                <MenuItem key={a} value={a}>{ACTION_META[a].label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Module</InputLabel>
                        <Select
                            value={moduleFilter}
                            label="Module"
                            onChange={(e) => { setModuleFilter(e.target.value); setPage(0); }}
                        >
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

                    <TextField
                        size="small"
                        label="From date"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 150 }}
                    />

                    <TextField
                        size="small"
                        label="To date"
                        type="date"
                        value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 150 }}
                    />

                    {hasFilters && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FilterAltOffIcon />}
                            onClick={clearFilters}
                        >
                            Clear
                        </Button>
                    )}

                    <Box sx={{ flexGrow: 1 }} />

                    <Typography variant="body2" color="text.secondary">
                        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                    </Typography>

                </Box>
            </Paper>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Could not load logs: {error}
                </Alert>
            )}

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
                                    <TableCell
                                        colSpan={colSpan}
                                        align="center"
                                        sx={{ py: 6, color: "text.secondary" }}
                                    >
                                        No logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((log, i) => {
                                    const chip         = getChipProps(log.action);
                                    const dt           = toDate(log);
                                    const resolvedMod  = resolveModule(log);
                                    const modColor     = MODULE_COLORS[resolvedMod] ?? "#6b7280";
                                    const displayEmail = isValidEmail(log.email) ? log.email : null;

                                    return (
                                        <TableRow
                                            key={log.id ?? log.idempotencyKey ?? i}
                                            hover
                                            sx={{ "&:last-child td": { borderBottom: 0 } }}
                                        >
                                            {/* # */}
                                            <TableCell>{page * rowsPerPage + i + 1}</TableCell>

                                            {/* Module */}
                                            <TableCell>
                                                {resolvedMod ? (
                                                    <Chip
                                                        label={resolvedMod}
                                                        size="small"
                                                        sx={{
                                                            bgcolor    : modColor + "22",
                                                            color      : modColor,
                                                            fontWeight : 600,
                                                            fontSize   : "11px",
                                                            border     : `1px solid ${modColor}55`,
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="caption" color="text.disabled">—</Typography>
                                                )}
                                            </TableCell>

                                            {/* Action */}
                                            <TableCell>
                                                <Chip
                                                    label={chip.label}
                                                    color={chip.color}
                                                    size="small"
                                                    sx={{
                                                        fontWeight : 600,
                                                        fontSize   : "11px",
                                                        maxWidth   : 220,
                                                        ...(ACTION_META[normaliseAction(log.action)]
                                                            ? {}
                                                            : {
                                                                bgcolor      : "#f1f5f9",
                                                                color        : "#475569",
                                                                border       : "1px solid #cbd5e1",
                                                                textOverflow : "ellipsis",
                                                                overflow     : "hidden",
                                                                whiteSpace   : "nowrap",
                                                                display      : "inline-flex",
                                                            }),
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell>{log.name || "—"}</TableCell>

                                            {/* Email */}
                                            <TableCell>
                                                {displayEmail ?? (
                                                    <Typography variant="caption" color="text.disabled">—</Typography>
                                                )}
                                            </TableCell>

                                            {/* Organisation — super_admin only */}
                                            {caller.isSuperAdmin && (
                                                <TableCell sx={{ fontSize: "11px", color: "text.secondary" }}>
                                                    {log.organizationId || "—"}
                                                </TableCell>
                                            )}

                                            {/* URL */}
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

                                            {/* Item */}
                                            <TableCell sx={{ maxWidth: 280 }}>
                                                {log.item == null ? (
                                                    <Typography variant="caption" color="text.disabled">—</Typography>
                                                ) : (
                                                    <Tooltip title={formatItem(log.item) || ""}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontFamily   : "monospace",
                                                                display      : "block",
                                                                maxWidth     : 280,
                                                                overflow     : "hidden",
                                                                textOverflow : "ellipsis",
                                                                whiteSpace   : "nowrap",
                                                            }}
                                                        >
                                                            {formatItem(log.item)}
                                                        </Typography>
                                                    </Tooltip>
                                                )}
                                            </TableCell>

                                            {/* Date & Time IST */}
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

export default ListOfLogs;