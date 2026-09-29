import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Chip, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  CircularProgress, Alert, Tooltip, Switch, FormControlLabel,
  Snackbar, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField
} from "@mui/material";
import {
  CheckCircle, Cancel, ContentCopy, Link, Refresh,
  PersonAdd, Business, Email, Schedule, VerifiedUser,
  LinkOff, OpenInNew, Person
} from "@mui/icons-material";

// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE to your existing trustCentreApi.js file
// ─────────────────────────────────────────────────────────────────────────────
//
// const BASE = `${process.env.REACT_APP_TRUST_CENTRE_URL}/api/trust-centre`;
//
// // ── Share link ────────────────────────────────────────────────────────────
// export const toggleShare = (enabled) =>
//   fetch(`${BASE}/share/toggle`, {
//     method: "POST",
//     headers: { ...authHeaders(), "Content-Type": "application/json" },
//     body: JSON.stringify({ enabled }),
//   }).then((r) => r.json());
//
// export const regenerateShareToken = () =>
//   fetch(`${BASE}/share/regenerate`, {
//     method: "POST",
//     headers: authHeaders(),
//   }).then((r) => r.json());
//
// // ── Access requests ───────────────────────────────────────────────────────
// export const listAccessRequests = (status) => {
//   const q = status ? `?status=${status}` : "";
//   return fetch(`${process.env.REACT_APP_TRUST_CENTRE_URL}/api/access-requests${q}`, {
//     headers: authHeaders(),
//   }).then((r) => r.json());
// };
//
// export const approveAccessRequest = (id) =>
//   fetch(`${process.env.REACT_APP_TRUST_CENTRE_URL}/api/access-requests/${id}/approve`, {
//     method: "POST",
//     headers: authHeaders(),
//   }).then((r) => r.json());
//
// export const rejectAccessRequest = (id) =>
//   fetch(`${process.env.REACT_APP_TRUST_CENTRE_URL}/api/access-requests/${id}/reject`, {
//     method: "POST",
//     headers: authHeaders(),
//   }).then((r) => r.json());
//
// // ── Team access ───────────────────────────────────────────────────────────
// export const getTeamAccess = () =>
//   fetch(`${process.env.REACT_APP_TRUST_CENTRE_URL}/api/team-access`, {
//     headers: authHeaders(),
//   }).then((r) => r.json());
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT  = "#0f62fe";
const SUCCESS = "#24a148";
const DANGER  = "#da1e28";
const SURFACE = "#f4f4f4";
const WARN    = "#f59e0b";

// ── Inline API helpers (replace with imports from your trustCentreApi.js) ────
// In your real app, import these from ../../api/trustCentreApi
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });
const BASE_URL = process.env.REACT_APP_TRUST_CENTRE_URL || "";

const api = {
  toggleShare: (enabled) =>
    fetch(`${BASE_URL}/api/trust-centre/share/toggle`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    }).then((r) => r.json()),

  regenerateShareToken: () =>
    fetch(`${BASE_URL}/api/trust-centre/share/regenerate`, {
      method: "POST",
      headers: authHeaders(),
    }).then((r) => r.json()),

  listAccessRequests: (status) => {
    const q = status ? `?status=${status}` : "";
    return fetch(`${BASE_URL}/api/access-requests${q}`, {
      headers: authHeaders(),
    }).then((r) => r.json());
  },

  approveRequest: (id) =>
    fetch(`${BASE_URL}/api/access-requests/${id}/approve`, {
      method: "POST",
      headers: authHeaders(),
    }).then((r) => r.json()),

  rejectRequest: (id) =>
    fetch(`${BASE_URL}/api/access-requests/${id}/reject`, {
      method: "POST",
      headers: authHeaders(),
    }).then((r) => r.json()),

  getTeamAccess: () =>
    fetch(`${BASE_URL}/api/team-access`, {
      headers: authHeaders(),
    }).then((r) => r.json()),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const requesterTypeChip = (type) => {
  const map = {
    USER:             { label: "Internal User", color: "#0f62fe", bg: "#e8f0fe" },
    AUDIT_USER:       { label: "Auditor",        color: "#7c3aed", bg: "#ede9fe" },
    CUSTOMER_COMPANY: { label: "Customer",       color: "#d97706", bg: "#fef3c7" },
  };
  const c = map[type] || { label: type, color: "#555", bg: "#f0f0f0" };
  return (
    <Chip
      label={c.label} size="small"
      sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, fontSize: 11 }}
    />
  );
};

// ── Sub-section wrapper ───────────────────────────────────────────────────────
function SubSection({ title, subtitle, children }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography fontWeight={700} fontSize={15} color="#1a1a1a">{title}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        )}
      </Box>
      {children}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT — drop this as Tab 5 in your TrustCentreAdmin
// Props:
//   tc        — the TrustCentre object from your state
//   setTc     — state setter
//   isPublished — boolean
// ─────────────────────────────────────────────────────────────────────────────
export default function TrustCentreAccessTab({ tc, setTc, isPublished }) {

  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests,     setAllRequests]     = useState([]);
  const [teamAccess,      setTeamAccess]      = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [actionId,        setActionId]        = useState(null);   // id being approved/rejected
  const [regenerating,    setRegenerating]    = useState(false);
  const [toggling,        setToggling]        = useState(false);
  const [snack,           setSnack]           = useState({ open: false, msg: "", severity: "success" });

  // Confirm regenerate dialog
  const [confirmRegen, setConfirmRegen] = useState(false);

  const toast = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  // ── Derived share URL ────────────────────────────────────────────────────
  const shareUrl = tc?.shareToken
  ? `${process.env.REACT_APP_PUBLIC_URL || window.location.origin}/trust-centre/${tc.shareToken}`
  : null;

  // ── Load all access data ─────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pending, all, team] = await Promise.all([
        api.listAccessRequests("PENDING"),
        api.listAccessRequests(),
        api.getTeamAccess(),
      ]);
      setPendingRequests(Array.isArray(pending) ? pending : []);
      setAllRequests(Array.isArray(all) ? all : []);
      setTeamAccess(Array.isArray(team) ? team : []);
    } catch (e) {
      toast("Failed to load access data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Approve ──────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await api.approveRequest(id);
      toast("Request approved. User added to team access.");
      await loadAll();
    } catch (e) {
      toast("Approval failed.", "error");
    } finally {
      setActionId(null);
    }
  };

  // ── Reject ───────────────────────────────────────────────────────────────
  const handleReject = async (id) => {
    setActionId(id);
    try {
      await api.rejectRequest(id);
      toast("Request rejected.");
      await loadAll();
    } catch (e) {
      toast("Rejection failed.", "error");
    } finally {
      setActionId(null);
    }
  };

  // ── Toggle share ─────────────────────────────────────────────────────────
  const handleToggleShare = async (enabled) => {
    if (!isPublished) {
      toast("Publish the Trust Centre first before enabling sharing.", "warning");
      return;
    }
    setToggling(true);
    try {
      const result = await api.toggleShare(enabled);
      setTc((prev) => ({
        ...prev,
        shareEnabled: result.shareEnabled,
        shareToken:   result.shareToken || prev.shareToken,
      }));
      toast(enabled ? "Shareable link enabled." : "Shareable link disabled.");
    } catch (e) {
      toast("Toggle failed.", "error");
    } finally {
      setToggling(false);
    }
  };

  // ── Regenerate token ─────────────────────────────────────────────────────
  const handleRegenerate = async () => {
    setConfirmRegen(false);
    setRegenerating(true);
    try {
      const result = await api.regenerateShareToken();
      setTc((prev) => ({ ...prev, shareToken: result.shareToken }));
      toast("Share link regenerated. Old links are now invalid.");
    } catch (e) {
      toast("Regeneration failed.", "error");
    } finally {
      setRegenerating(false);
    }
  };

  // ── Copy to clipboard ────────────────────────────────────────────────────
  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    toast("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} sx={{ color: ACCENT }} />
      </Box>
    );
  }

  const rejectedRequests = allRequests.filter((r) => r.status === "REJECTED");

  return (
    <Box>

      {/* ══ 1. SHAREABLE LINK ═══════════════════════════════════════════════ */}
      <SubSection
        title="Public Shareable Link"
        subtitle="Generate a magic link anyone can use to view your Trust Centre — no login required."
      >
        <Paper elevation={0} sx={{
          border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden"
        }}>
          {/* Toggle row */}
          <Box sx={{
            px: 3, py: 2,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 2,
            borderBottom: tc?.shareEnabled ? "1px solid #e0e0e0" : "none",
            bgcolor: SURFACE,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {tc?.shareEnabled
                ? <Link sx={{ color: SUCCESS, fontSize: 20 }} />
                : <LinkOff sx={{ color: "#999", fontSize: 20 }} />}
              <Box>
                <Typography fontWeight={600} fontSize={14}>
                  {tc?.shareEnabled ? "Sharing is ON" : "Sharing is OFF"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {tc?.shareEnabled
                    ? "Anyone with the link can view your published Trust Centre."
                    : "Only internal org users can view your Trust Centre."}
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={!!tc?.shareEnabled}
                  onChange={(e) => handleToggleShare(e.target.checked)}
                  disabled={toggling || !isPublished}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: SUCCESS },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: SUCCESS },
                  }}
                />
              }
              label={toggling ? <CircularProgress size={14} /> : (tc?.shareEnabled ? "Disable" : "Enable")}
              labelPlacement="start"
              sx={{ m: 0, gap: 1 }}
            />
          </Box>

          {/* Link display */}
          {tc?.shareEnabled && shareUrl && (
            <Box sx={{ px: 3, py: 2.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Shareable URL
              </Typography>
              <Box sx={{
                mt: 1, display: "flex", alignItems: "center", gap: 1,
                p: 1.5, borderRadius: 1.5,
                bgcolor: "#f0f7ff", border: "1px solid #c7deff",
                flexWrap: "wrap",
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1, fontFamily: "monospace", fontSize: 13,
                    color: ACCENT, wordBreak: "break-all",
                  }}
                >
                  {shareUrl}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                  <Tooltip title="Copy link">
                    <IconButton size="small" onClick={copyLink}
                      sx={{ color: ACCENT, "&:hover": { bgcolor: "#dceeff" } }}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open in new tab">
                    <IconButton size="small"
                      onClick={() => window.open(shareUrl, "_blank")}
                      sx={{ color: ACCENT, "&:hover": { bgcolor: "#dceeff" } }}>
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Regenerate */}
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Button
                  size="small" variant="outlined" startIcon={<Refresh />}
                  onClick={() => setConfirmRegen(true)}
                  disabled={regenerating}
                  sx={{ borderColor: DANGER, color: DANGER,
                    "&:hover": { bgcolor: "#fff5f5", borderColor: DANGER } }}
                >
                  Regenerate Link
                </Button>
                <Typography variant="caption" color="text.secondary">
                  ⚠️ Regenerating invalidates all previously shared URLs.
                </Typography>
              </Box>
            </Box>
          )}

          {/* Not published warning */}
          {!isPublished && (
            <Box sx={{ px: 3, py: 2 }}>
              <Alert severity="warning" sx={{ fontSize: 13 }}>
                Publish your Trust Centre first to enable the shareable link.
              </Alert>
            </Box>
          )}
        </Paper>
      </SubSection>

      <Divider sx={{ my: 4 }} />

      {/* ══ 2. PENDING ACCESS REQUESTS ══════════════════════════════════════ */}
      <SubSection
        title={`Pending Access Requests ${pendingRequests.length > 0 ? `(${pendingRequests.length})` : ""}`}
        subtitle="Users, auditors, and external companies requesting access to this Trust Centre."
      >
        {pendingRequests.length === 0 ? (
          <Paper elevation={0} sx={{
            border: "1px dashed #e0e0e0", borderRadius: 2,
            py: 4, textAlign: "center"
          }}>
            <CheckCircle sx={{ color: "#bdbdbd", fontSize: 36, mb: 1 }} />
            <Typography color="text.secondary" fontSize={14}>
              No pending requests. You're all caught up!
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0}
            sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: SURFACE }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Requester</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Message</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Requested</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography fontSize={13} fontWeight={600}>{req.requesterName || "—"}</Typography>
                        <Typography fontSize={11} color="text.secondary"
                          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Email sx={{ fontSize: 11 }} />
                          {req.requesterEmail || "—"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={13}>{req.requesterCompany || "—"}</Typography>
                    </TableCell>
                    <TableCell>{requesterTypeChip(req.requesterType)}</TableCell>
                    <TableCell>
                      <Tooltip title={req.message || "No message"}>
                        <Typography fontSize={12} color="text.secondary"
                          sx={{
                            maxWidth: 180, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap"
                          }}>
                          {req.message || <em style={{ color: "#aaa" }}>No message</em>}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary">
                        {formatDate(req.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <Tooltip title="Approve">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(req.id)}
                              disabled={actionId === req.id}
                              sx={{
                                color: SUCCESS,
                                border: `1px solid ${SUCCESS}`,
                                borderRadius: 1,
                                p: 0.5,
                                "&:hover": { bgcolor: "#d9f2e6" }
                              }}
                            >
                              {actionId === req.id
                                ? <CircularProgress size={14} color="inherit" />
                                : <CheckCircle fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleReject(req.id)}
                              disabled={actionId === req.id}
                              sx={{
                                color: DANGER,
                                border: `1px solid ${DANGER}`,
                                borderRadius: 1,
                                p: 0.5,
                                "&:hover": { bgcolor: "#fff5f5" }
                              }}
                            >
                              {actionId === req.id
                                ? <CircularProgress size={14} color="inherit" />
                                : <Cancel fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SubSection>

      <Divider sx={{ my: 4 }} />

      {/* ══ 3. APPROVED TEAM ACCESS ════════════════════════════════════════ */}
      <SubSection
        title={`Approved Access (${teamAccess.length})`}
        subtitle="These users and companies have been granted access to view this Trust Centre."
      >
        {teamAccess.length === 0 ? (
          <Paper elevation={0} sx={{
            border: "1px dashed #e0e0e0", borderRadius: 2,
            py: 4, textAlign: "center"
          }}>
            <PersonAdd sx={{ color: "#bdbdbd", fontSize: 36, mb: 1 }} />
            <Typography color="text.secondary" fontSize={14}>
              No approved users yet. Approve access requests above.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0}
            sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: SURFACE }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Granted By</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Granted On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamAccess.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <VerifiedUser sx={{ fontSize: 15, color: SUCCESS }} />
                        <Typography fontSize={13} fontWeight={600}>
                          {entry.requesterName || "—"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary">
                        {entry.requesterEmail || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={13}>{entry.requesterCompany || "—"}</Typography>
                    </TableCell>
                    <TableCell>{requesterTypeChip(entry.requesterType)}</TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary">
                        {entry.grantedBy || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary">
                        {formatDate(entry.grantedAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SubSection>

      {/* ══ 4. REJECTED (collapsed summary) ═══════════════════════════════ */}
      {rejectedRequests.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <SubSection
            title={`Rejected Requests (${rejectedRequests.length})`}
            subtitle="History of declined access requests."
          >
            <TableContainer component={Paper} elevation={0}
              sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: SURFACE }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Requester</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Rejected On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rejectedRequests.map((req) => (
                    <TableRow key={req.id} hover sx={{ opacity: 0.7 }}>
                      <TableCell>
                        <Typography fontSize={13}>{req.requesterName || "—"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontSize={12} color="text.secondary">
                          {req.requesterEmail || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>{requesterTypeChip(req.requesterType)}</TableCell>
                      <TableCell>
                        <Typography fontSize={12} color="text.secondary">
                          {formatDate(req.reviewedAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </SubSection>
        </>
      )}

      {/* ── Confirm Regenerate Dialog ──────────────────────────────────────── */}
      <Dialog open={confirmRegen} onClose={() => setConfirmRegen(false)}
        PaperProps={{ sx: { borderRadius: 2, maxWidth: 420 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: DANGER }}>
          ⚠️ Regenerate Share Link?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will <strong>invalidate your current link</strong> immediately.
            Anyone who has the old link will lose access. A new link will be generated.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2, fontSize: 13 }}>
            This action cannot be undone. Make sure you re-share the new link with anyone who needs it.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmRegen(false)} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button variant="contained"
            onClick={handleRegenerate}
            sx={{ bgcolor: DANGER, "&:hover": { bgcolor: "#b71c1c" } }}>
            Yes, Regenerate
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}