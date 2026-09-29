import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiBilling from "../../services/apiBilling";

import {
  Box, Button, Container, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, IconButton,
  Tooltip, CircularProgress, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Divider,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon     from "@mui/icons-material/CancelOutlined";
import RefreshIcon            from "@mui/icons-material/Refresh";
import BusinessIcon           from "@mui/icons-material/Business";
import HourglassEmptyIcon     from "@mui/icons-material/HourglassEmpty";
import InfoOutlinedIcon       from "@mui/icons-material/InfoOutlined";

// Same shape as ApproveOrgs.jsx's StatusChip, but derived from a row's
// (trialExtensionGranted, latestRequest) pair rather than a single status
// field — a tenant on trial may have never requested anything at all, which
// ApproveOrgs.jsx's request-only list never has to represent.
const ExtensionStatusChip = ({ row }) => {
  if (row.trialExtensionGranted) {
    return <Chip label="Extended" color="success" size="small" variant="outlined" />;
  }
  if (!row.latestRequest) {
    return <Chip label="No Request" color="default" size="small" variant="outlined" />;
  }
  const map = {
    PENDING:  { color: "warning", label: "Pending Review" },
    REJECTED: { color: "error",   label: "Rejected" },
    APPROVED: { color: "success", label: "Approved" }, // shouldn't co-occur with !trialExtensionGranted, but stay safe
  };
  const cfg = map[row.latestRequest.status] || { color: "default", label: row.latestRequest.status };
  return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
};

const daysLeft = (dateStr) => {
  if (!dateStr) return null;
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const FILTERS = [
  { label: "All",           value: "ALL" },
  { label: "Pending",       value: "PENDING" },
  { label: "No Request",    value: "NONE" },
  { label: "Extended",      value: "EXTENDED" },
  { label: "Rejected",      value: "REJECTED" },
];

const TrialExtensions = () => {
  const navigate = useNavigate();

  const role         = localStorage.getItem("role") || "{}";
  const isSuperAdmin = role?.includes("super_admin");

  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [successMsg,  setSuccessMsg]  = useState("");
  const [filter,      setFilter]      = useState("ALL");

  // Dialog
  const [dialog,     setDialog]     = useState({ open: false, action: null, row: null });
  const [comments,   setComments]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const { data } = await apiBilling.get("/billing/trial-extension/overview");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load trial data.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (filter === "ALL") return rows;
    if (filter === "NONE") return rows.filter((r) => !r.latestRequest);
    if (filter === "EXTENDED") return rows.filter((r) => r.trialExtensionGranted);
    return rows.filter((r) => !r.trialExtensionGranted && r.latestRequest?.status === filter);
  }, [rows, filter]);

  const openDialog = (action, row) => {
    setComments("");
    setDialog({ open: true, action, row });
  };

  const closeDialog = () => setDialog({ open: false, action: null, row: null });

  const handleConfirm = async () => {
    const { action, row } = dialog;
    setSubmitting(true);
    try {
      await apiBilling.patch(`/billing/trial-extension/${row.latestRequest.id}/${action}`, { comments });
      setSuccessMsg(
        `Trial extension ${action === "approve" ? "approved" : "rejected"} for ${row.orgName || row.tenantId}.`
      );
      closeDialog();
      fetchOverview();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || `Failed to ${action}.`);
      closeDialog();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
        <Alert severity="error">Access denied. Super Admin only.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Trial Extensions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Every organization currently on trial (or lapsed and unpaid), with their trial dates and any
            extension request awaiting your review.
          </Typography>
        </Box>
        <Tooltip title="Reload">
          <IconButton onClick={fetchOverview}><RefreshIcon /></IconButton>
        </Tooltip>
      </Box>

      {/* Filter tabs */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        {FILTERS.map(({ label, value }) => (
          <Button
            key={value}
            variant={filter === value ? "contained" : "outlined"}
            size="small"
            onClick={() => setFilter(value)}
            sx={{ textTransform: "none", borderRadius: 5, px: 2 }}
          >
            {label}
          </Button>
        ))}
      </Box>

      {error      && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : filteredRows.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <HourglassEmptyIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">No organizations match this filter.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Organization</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Trial Started</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Trial Ends</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Days Left</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Extension Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Reason / Comments</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => {
                  const left = daysLeft(row.trialEndsAt);
                  return (
                    <TableRow key={row.tenantId} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>

                      {/* Org */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <BusinessIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600">
                              {row.orgName || "—"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                              {row.tenantId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Trial started */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(row.trialStartedAt)}
                        </Typography>
                      </TableCell>

                      {/* Trial ends */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(row.trialEndsAt)}
                        </Typography>
                      </TableCell>

                      {/* Days left */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={left != null && left <= 0 ? "error" : "text.primary"}
                        >
                          {left == null ? "—" : left <= 0 ? "Expired" : `${left} day(s)`}
                        </Typography>
                      </TableCell>

                      {/* Extension status */}
                      <TableCell>
                        <ExtensionStatusChip row={row} />
                      </TableCell>

                      {/* Reason / comments */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {row.latestRequest?.status === "PENDING"
                            ? (row.latestRequest?.reason || "—")
                            : (row.latestRequest?.comments || "—")}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        {row.latestRequest?.status === "PENDING" ? (
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <Tooltip title="Approve">
                              <IconButton color="success" onClick={() => openDialog("approve", row)}>
                                <CheckCircleOutlineIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton color="error" onClick={() => openDialog("reject", row)}>
                                <CancelOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : row.latestRequest ? (
                          <Tooltip
                            title={`Reviewed: ${
                              row.latestRequest.reviewedAt
                                ? new Date(row.latestRequest.reviewedAt).toLocaleDateString()
                                : "—"
                            }`}
                          >
                            <InfoOutlinedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Confirm Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {dialog.action === "approve" ? "✅ Approve Trial Extension" : "❌ Reject Trial Extension"}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {dialog.row && (
            <Alert
              severity={dialog.action === "approve" ? "success" : "error"}
              sx={{ mb: 3 }}
            >
              You are about to <strong>{dialog.action}</strong> a{" "}
              {dialog.row.latestRequest?.requestedDays || 3}-day trial extension for:{" "}
              <strong>{dialog.row.orgName || dialog.row.tenantId}</strong>
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Comments (optional)"
            placeholder="Add a note for the requesting root user..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={submitting}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDialog} disabled={submitting} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={submitting}
            variant="contained"
            color={dialog.action === "approve" ? "success" : "error"}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting
              ? "Processing..."
              : dialog.action === "approve"
              ? "Confirm Approve"
              : "Confirm Reject"}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default TrialExtensions;
