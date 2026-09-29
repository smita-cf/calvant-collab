/**
 * Logslist.jsx
 * Activity log viewer — MUI table with date range filter and action filter.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    Chip, CircularProgress, Alert, Stack, TextField,
    MenuItem, Select, InputLabel, FormControl, IconButton, Tooltip, Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

const LOGGING_BASE_URL =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_LOGGING_SERVICE_URL) ||
    "https://api.calvant.com/logging-service/api/logs";

// ── Action chip colours ───────────────────────────────────────────────────────
const ACTION_META = {
    PAGE_LOAD: { color: "primary", label: "PAGE LOAD" },
    LOGIN: { color: "success", label: "LOGIN" },
    LOGOUT: { color: "warning", label: "LOGOUT" },
    CREATE: { color: "success", label: "CREATE" },
    UPDATE: { color: "warning", label: "UPDATE" },
    DELETE: { color: "error", label: "DELETE" },
    // BULK_FILE: { color: "secondary", label: "BULK FILE" },
    // SELECT: { color: "info", label: "SELECT" },
    // CLICK: { color: "default", label: "CLICK" },
};

const ALL_ACTIONS = Object.keys(ACTION_META);

const getChipProps = (action = "") => ACTION_META[action] ?? { color: "default", label: action };

// ── Helpers ───────────────────────────────────────────────────────────────────
const toDateStr = (log) => {
    const raw = log.timestamp || log.createdAt;
    return raw ? new Date(raw) : null;
};

// Convert one object to plain readable text: "Key: value | Key: value"
const objectToText = (obj) => {
    if (!obj || typeof obj !== "object") return String(obj);
    const SKIP = ["password", "oldPassword", "processes", "auditorName", "organization"];
    return Object.entries(obj)
        .filter(([k, v]) =>
            !SKIP.includes(k) &&
            v !== null && v !== undefined && v !== "" &&
            !(Array.isArray(v) && v.length === 0)
        )
        .map(([k, v]) => {
            const label = k.replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase());
            const value = Array.isArray(v) ? v.join(", ") : String(v);
            return `${label}: ${value}`;
        })
        .join("  |  ");
};

const formatItem = (item) => {
    if (item === null || item === undefined) return null;
    try {
        const arr = Array.isArray(item) ? item : [item];
        return arr.map((entry) =>
            typeof entry === "object" ? objectToText(entry) : String(entry)
        ).join(" | ");
    } catch {
        return String(item);
    }
};

// ── Component ─────────────────────────────────────────────────────────────────
const DupLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [actionFilter, setActionFilter] = useState("ALL");
    const [dateFrom, setDateFrom] = useState("");   // "YYYY-MM-DD"
    const [dateTo, setDateTo] = useState("");

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // ── Fetch ───────────────────────────────────────────────────────────────────
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await fetch(LOGGING_BASE_URL, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.content ?? []);
            // Show newest first
            setLogs([...list].reverse());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    // ── Filter ──────────────────────────────────────────────────────────────────
    const filtered = logs.filter((log) => {
        if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
        const dt = toDateStr(log);
        if (dateFrom && dt && dt < new Date(dateFrom)) return false;
        if (dateTo && dt && dt > new Date(dateTo + "T23:59:59")) return false;
        return true;
    });

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const clearFilters = () => {
        setActionFilter("ALL");
        setDateFrom("");
        setDateTo("");
        setPage(0);
    };

    const hasFilters = actionFilter !== "ALL" || dateFrom || dateTo;

    return (
        <Box sx={{ p: 3 }}>
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h5" fontWeight={700}>Activity Logs</Typography>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchLogs} color="primary">
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* ── Filters ────────────────────────────────────────────────────────── */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">

                    {/* Action filter */}
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Action</InputLabel>
                        <Select
                            value={actionFilter}
                            label="Action"
                            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="ALL">All Actions</MenuItem>
                            {ALL_ACTIONS.map((a) => (
                                <MenuItem key={a} value={a}>{ACTION_META[a].label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Date from */}
                    <TextField
                        size="small"
                        label="From date"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 160 }}
                    />

                    {/* Date to */}
                    <TextField
                        size="small"
                        label="To date"
                        type="date"
                        value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 160 }}
                    />

                    {/* Clear filters */}
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
                </Stack>
            </Paper>

            {/* ── Error ──────────────────────────────────────────────────────────── */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Could not load logs: {error}
                </Alert>
            )}

            {/* ── Table ──────────────────────────────────────────────────────────── */}
            <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight: "65vh" }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>URL / Page</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Date & Time</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                        No logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((log, i) => {
                                    const chip = getChipProps(log.action);
                                    const dt = toDateStr(log);
                                    return (
                                        <TableRow
                                            key={log.id ?? i}
                                            hover
                                            sx={{ "&:last-child td": { borderBottom: 0 } }}
                                        >
                                            <TableCell>{page * rowsPerPage + i + 1}</TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={chip.label}
                                                    color={chip.color}
                                                    size="small"
                                                    sx={{ fontWeight: 600, fontSize: "11px" }}
                                                />
                                            </TableCell>

                                            <TableCell>{log.name || "—"}</TableCell>
                                            <TableCell>{log.email || "—"}</TableCell>

                                            <TableCell sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                <Tooltip title={log.url || ""}>
                                                    <span>{log.url || "—"}</span>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell sx={{ maxWidth: 280 }}>
                                                {log.item == null ? (
                                                    <Typography variant="caption" color="text.disabled">—</Typography>
                                                ) : (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontFamily: "monospace",
                                                            display: "block",
                                                            maxWidth: 280,
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        <Tooltip title={formatItem(log.item)}>
                                                            <span>{formatItem(log.item)}</span>
                                                        </Tooltip>
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                {dt ? dt.toLocaleString("en-IN", {
                                                    day: "2-digit", month: "short", year: "numeric",
                                                    hour: "2-digit", minute: "2-digit",
                                                }) : "—"}
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

export default DupLog;
