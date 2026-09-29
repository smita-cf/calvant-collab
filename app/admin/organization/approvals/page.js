'use client'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/modules/admin/api/adminAxios";

import {
  Box, Button, Container, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, IconButton,
  Tooltip, CircularProgress, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Divider,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon     from "@mui/icons-material/CancelOutlined";
import RefreshIcon            from "@mui/icons-material/Refresh";
import BusinessIcon           from "@mui/icons-material/Business";
import HourglassEmptyIcon     from "@mui/icons-material/HourglassEmpty";
import InfoOutlinedIcon       from "@mui/icons-material/InfoOutlined";

// ── Status chip ───────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const map = {
    PENDING:  { color: "warning",  label: "Pending" },
    APPROVED: { color: "success",  label: "Approved" },
    REJECTED: { color: "error",    label: "Rejected" },
  };
  const cfg = map[status] || { color: "default", label: status };
  return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
};

export default function OrgApprovalPage() {
  const router = useRouter();

  // Guard — super_admin only
  const user        = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isSuperAdmin = user?.role?.includes("super_admin");

  const [requests,   setRequests]   = useState([]);
  const [orgMap,     setOrgMap]     = useState({});   // orgId → org object
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [filterStatus, setFilter]   = useState("PENDING");

  // Dialog state
  const [dialog,     setDialog]     = useState({ open: false, action: null, req: null });
  const [comments,   setComments]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg,  setActionMsg]  = useState("");

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(
        `/org-approvals${filterStatus ? `?status=${filterStatus}` : ""}`
      );
      const list = Array.isArray(data) ? data : [];
      setRequests(list);

      // Fetch org details for each unique orgId
      const uniqueOrgIds = [...new Set(list.map((r) => r.orgId))];
      const orgEntries   = await Promise.all(
        uniqueOrgIds.map(async (id) => {
          try {
            const res = await api.get(`/organizations/${id}`);
            return [id, res.data];
          } catch {
            return [id, null];
          }
        })
      );
      setOrgMap(Object.fromEntries(orgEntries));
    } catch (err) {
      setError("Failed to load approval requests.");
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (action, req) => {
    setComments("");
    setActionMsg("");
    setDialog({ open: true, action, req });
  };

  const closeDialog = () => setDialog({ open: false, action: null, req: null });

  const handleConfirm = async () => {
    const { action, req } = dialog;
    setSubmitting(true);
    try {
      await api.patch(`/org-approvals/${req.id}/${action}`, { comments });
      setActionMsg(`Organization ${action === "approve" ? "approved" : "rejected"} successfully.`);
      closeDialog();
      fetchRequests();
    } catch (err) {
      setActionMsg(err.response?.data || `Failed to ${action}.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
        <Alert severity="error">Access denied. Super Admin only.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/dashboard")}>
          Go to Dashboard
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
            Organization Approval Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve or reject new organization creation requests from partner roots.
          </Typography>
        </Box>
        <Tooltip title="Reload">
          <IconButton onClick={fetchRequests}><RefreshIcon /></IconButton>
        </Tooltip>
      </Box>

      {/* Filter tabs */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
          <Button
            key={s || "ALL"}
            variant={filterStatus === s ? "contained" : "outlined"}
            size="small"
            onClick={() => setFilter(s)}
            sx={{ textTransform: "none", borderRadius: 5, px: 2 }}
          >
            {s || "All"}
          </Button>
        ))}
      </Box>

      {error      && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
      {actionMsg  && <Alert severity="success" sx={{ mb: 2 }}>{actionMsg}</Alert>}

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <HourglassEmptyIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">No {filterStatus.toLowerCase() || ""} requests found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Organization</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Frameworks</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Requested By</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Requested At</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Comments</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => {
                  const org = orgMap[req.orgId];
                  return (
                    <TableRow key={req.id} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>

                      {/* Org name */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <BusinessIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600">
                              {org?.name || req.orgId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                              {req.orgId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Frameworks */}
                      <TableCell>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {(org?.frameworks || []).map((fw) => (
                            <Chip key={fw} label={fw} size="small" variant="outlined" color="primary" />
                          ))}
                          {!org?.frameworks?.length && (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Requested by */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                          {req.requestedBy || "—"}
                        </Typography>
                      </TableCell>

                      {/* Requested at */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {req.requestedAt
                            ? new Date(req.requestedAt).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                              })
                            : "—"}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusChip status={req.status} />
                      </TableCell>

                      {/* Comments */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {req.comments || "—"}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        {req.status === "PENDING" ? (
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <Tooltip title="Approve">
                              <IconButton
                                color="success"
                                onClick={() => openDialog("approve", req)}
                              >
                                <CheckCircleOutlineIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                onClick={() => openDialog("reject", req)}
                              >
                                <CancelOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Tooltip title={`Reviewed at ${req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : "—"}`}>
                            <InfoOutlinedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                          </Tooltip>
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
          {dialog.action === "approve" ? "✅ Approve Organization" : "❌ Reject Organization"}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {dialog.req && (
            <Alert
              severity={dialog.action === "approve" ? "success" : "error"}
              sx={{ mb: 3 }}
              icon={dialog.action === "approve" ? <CheckCircleOutlineIcon /> : <CancelOutlinedIcon />}
            >
              You are about to <strong>{dialog.action}</strong> the organization:{" "}
              <strong>{orgMap[dialog.req?.orgId]?.name || dialog.req?.orgId}</strong>
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
}