import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Chip, Paper, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, CircularProgress, Alert, Snackbar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, InputLabel, FormControl, InputAdornment,
  Avatar, Divider, Badge
} from "@mui/material";
import {
  Add, Delete, Shield, Person, AccountTree, Search,
  AssignmentInd, FilterList, Refresh, CheckCircle,
  ExpandMore, Business, EditNote
} from "@mui/icons-material";
import * as api from "../../api/controlOwnershipApi";

// ── Style constants — matches TrustCentreAdmin palette ───────────────────────
const ACCENT  = "#0f62fe";
const SUCCESS = "#24a148";
const DANGER  = "#da1e28";
const SURFACE = "#f4f4f4";
const WARN    = "#f59e0b";

// ── Helpers ───────────────────────────────────────────────────────────────────
function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

function SectionCard({ title, icon, children, action }) {
  return (
    <Paper elevation={0} sx={{
      border: "1px solid #e0e0e0", borderRadius: 2, mb: 3, overflow: "hidden"
    }}>
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 2, borderBottom: "1px solid #e0e0e0", bgcolor: SURFACE
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {icon}
          <Typography fontWeight={600} fontSize={15}>{title}</Typography>
        </Box>
        {action}
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}

// Role chip colours
const ROLE_STYLE = {
  process_owner:   { bg: "#e8f0fe", color: ACCENT,   label: "Process Owner" },
  process_manager: { bg: "#fef3c7", color: "#92400e", label: "Process Manager" },
};

function RoleChip({ role }) {
  const s = ROLE_STYLE[role] || { bg: SURFACE, color: "#333", label: role };
  return (
    <Chip label={s.label} size="small"
      sx={{ fontWeight: 700, fontSize: 11, bgcolor: s.bg, color: s.color,
            border: `1px solid ${s.color}22` }} />
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ControlOwnershipAdmin() {
  const [tab, setTab]           = useState(0);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [snack, setSnack]       = useState({ open: false, msg: "", severity: "success" });

  // Data
  const [owners, setOwners]         = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [controls, setControls]     = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Assign dialog
  const [assignDialog, setAssignDialog]   = useState(false);
  const [assignForm, setAssignForm]       = useState({
    frameworkCode: "", controlId: "", ownerId: "", ownerRole: "process_owner", notes: ""
  });
  const [loadingControls, setLoadingControls] = useState(false);

  // Filters
  const [filterFramework, setFilterFramework] = useState("ALL");
  const [filterRole, setFilterRole]           = useState("ALL");
  const [filterSearch, setFilterSearch]       = useState("");

  // Notes edit dialog
  const [notesDialog, setNotesDialog]   = useState(false);
  const [notesTarget, setNotesTarget]   = useState(null); // { id, notes }
  const [notesValue, setNotesValue]     = useState("");

  const toast = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  // ── Load all data ───────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const [o, f, a] = await Promise.all([
        api.getEligibleOwners(),
        api.getAllFrameworks(),
        api.getAllOwnerships(),
      ]);
      setOwners(o || []);
      setFrameworks(f || []);
      setAssignments(a || []);
    } catch (e) {
      toast("Failed to load data. Check service connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Load controls when framework changes in dialog ──────────────────────────
  const handleFrameworkChange = async (code) => {
    setAssignForm((f) => ({ ...f, frameworkCode: code, controlId: "" }));
    if (!code) return;
    setLoadingControls(true);
    try {
      const c = await api.getControlsByFramework(code);
      setControls(c || []);
    } catch (e) {
      toast("Failed to load controls.", "error");
    } finally {
      setLoadingControls(false);
    }
  };

  // ── Assign ──────────────────────────────────────────────────────────────────
  const handleAssign = async () => {
    const { controlId, ownerId, ownerRole, notes } = assignForm;
    if (!controlId || !ownerId || !ownerRole) {
      toast("Please fill all required fields.", "warning");
      return;
    }
    setSaving(true);
    try {
      await api.assignOwnership({ controlId, ownerId, ownerRole, notes });
      await load();
      setAssignDialog(false);
      setAssignForm({ frameworkCode: "", controlId: "", ownerId: "", ownerRole: "process_owner", notes: "" });
      setControls([]);
      toast("Control ownership assigned successfully! ✅");
    } catch (e) {
      toast(e.message || "Assignment failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this ownership assignment?")) return;
    try {
      await api.deleteOwnership(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      toast("Assignment removed.");
    } catch (e) {
      toast("Failed to remove.", "error");
    }
  };

  // ── Update Notes ────────────────────────────────────────────────────────────
  const openNotesDialog = (record) => {
    setNotesTarget(record);
    setNotesValue(record.notes || "");
    setNotesDialog(true);
  };

  const handleSaveNotes = async () => {
    try {
      const updated = await api.updateOwnershipNotes(notesTarget.id, notesValue);
      setAssignments((prev) => prev.map((a) => a.id === updated.id ? updated : a));
      setNotesDialog(false);
      toast("Notes updated.");
    } catch (e) {
      toast("Failed to update notes.", "error");
    }
  };

  // ── Filtered assignments ────────────────────────────────────────────────────
  const filtered = assignments.filter((a) => {
    if (filterFramework !== "ALL" && a.frameworkCode !== filterFramework) return false;
    if (filterRole !== "ALL" && a.ownerRole !== filterRole) return false;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      return (
        a.ownerName?.toLowerCase().includes(q) ||
        a.controlCode?.toLowerCase().includes(q) ||
        a.controlTitle?.toLowerCase().includes(q) ||
        a.frameworkCode?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalOwners   = [...new Set(assignments.map((a) => a.ownerId))].length;
  const totalControls = [...new Set(assignments.map((a) => a.controlId))].length;
  const totalFrameworks = [...new Set(assignments.map((a) => a.frameworkCode))].length;

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress sx={{ color: ACCENT }} />
        <Typography mt={2} color="text.secondary">Loading Control Ownership…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        mb: 4, flexWrap: "wrap", gap: 2
      }}>
        <Box>
          <Typography variant="h5" fontWeight={700} letterSpacing={-0.5}>
            Control Ownership
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Assign framework controls to Process Owners and Process Managers
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={load} size="small"
              sx={{ border: "1px solid #e0e0e0", borderRadius: 1.5 }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />}
            onClick={() => setAssignDialog(true)}
            sx={{ bgcolor: ACCENT, "&:hover": { bgcolor: "#0353e9" }, fontWeight: 600 }}>
            Assign Control
          </Button>
        </Box>
      </Box>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 4 }}>
        {[
          { label: "Total Assignments", value: assignments.length, icon: <AssignmentInd />, color: ACCENT },
          { label: "Unique Owners",     value: totalOwners,        icon: <Person />,        color: SUCCESS },
          { label: "Controls Assigned", value: totalControls,      icon: <Shield />,        color: WARN },
          { label: "Frameworks Covered",value: totalFrameworks,    icon: <AccountTree />,   color: "#7c3aed" },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{
            border: "1px solid #e0e0e0", borderRadius: 2, p: 2.5,
            display: "flex", alignItems: "center", gap: 2
          }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: 1.5, bgcolor: s.color + "18",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: s.color, flexShrink: 0
            }}>
              {s.icon}
            </Box>
            <Box>
              <Typography fontSize={22} fontWeight={700} lineHeight={1}>{s.value}</Typography>
              <Typography fontSize={12} color="text.secondary" mt={0.5}>{s.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
          borderBottom: "1px solid #e0e0e0", bgcolor: SURFACE,
          "& .MuiTab-root": { fontSize: 13, fontWeight: 600, textTransform: "none", minWidth: 140 },
          "& .Mui-selected": { color: ACCENT },
          "& .MuiTabs-indicator": { bgcolor: ACCENT }
        }}>
          <Tab icon={<AssignmentInd fontSize="small" />} iconPosition="start" label="All Assignments" />
          <Tab icon={<Person fontSize="small" />}        iconPosition="start" label="By Owner" />
          <Tab icon={<AccountTree fontSize="small" />}   iconPosition="start" label="By Framework" />
        </Tabs>

        <Box sx={{ p: 3 }}>

          {/* ══ Tab 0: All Assignments ════════════════════════════════════════ */}
          <TabPanel value={tab} index={0}>
            <SectionCard
              title={`Assignments (${filtered.length})`}
              icon={<AssignmentInd sx={{ color: ACCENT, fontSize: 20 }} />}
              action={
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                  {/* Search */}
                  <TextField size="small" placeholder="Search…"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{ width: 200 }} />

                  {/* Framework filter */}
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select value={filterFramework}
                      onChange={(e) => setFilterFramework(e.target.value)}
                      displayEmpty>
                      <MenuItem value="ALL">All Frameworks</MenuItem>
                      {frameworks.map((f) => (
                        <MenuItem key={f.code} value={f.code}>{f.code}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Role filter */}
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      displayEmpty>
                      <MenuItem value="ALL">All Roles</MenuItem>
                      <MenuItem value="process_owner">Process Owner</MenuItem>
                      <MenuItem value="process_manager">Process Manager</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              }
            >
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <AssignmentInd sx={{ fontSize: 48, color: "#e0e0e0", mb: 1 }} />
                  <Typography color="text.secondary">
                    {assignments.length === 0
                      ? "No assignments yet. Click 'Assign Control' to get started."
                      : "No assignments match your filters."}
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}
                  sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: SURFACE }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Framework</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Control</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.map((a) => (
                        <TableRow key={a.id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Avatar sx={{
                                width: 30, height: 30, fontSize: 12, fontWeight: 700,
                                bgcolor: ACCENT + "22", color: ACCENT
                              }}>
                                {a.ownerName?.charAt(0)?.toUpperCase() || "?"}
                              </Avatar>
                              <Box>
                                <Typography fontSize={13} fontWeight={600}>{a.ownerName}</Typography>
                                <Typography fontSize={11} color="text.secondary">{a.ownerEmail}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell><RoleChip role={a.ownerRole} /></TableCell>
                          <TableCell>
                            <Chip label={a.frameworkCode} size="small"
                              sx={{ fontWeight: 700, fontSize: 11,
                                    bgcolor: "#f0fdf4", color: SUCCESS,
                                    border: "1px solid #bbf7d0" }} />
                          </TableCell>
                          <TableCell>
                            <Typography fontFamily="monospace" fontSize={13} fontWeight={600}>
                              {a.controlCode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={a.controlTitle || ""}>
                              <Typography fontSize={13} sx={{
                                maxWidth: 220, overflow: "hidden",
                                textOverflow: "ellipsis", whiteSpace: "nowrap"
                              }}>
                                {a.controlTitle}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Typography fontSize={12} color="text.secondary"
                              sx={{ maxWidth: 150, overflow: "hidden",
                                    textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {a.notes || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit Notes">
                              <IconButton size="small" onClick={() => openNotesDialog(a)}>
                                <EditNote fontSize="small" sx={{ color: ACCENT }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove Assignment">
                              <IconButton size="small" onClick={() => handleDelete(a.id)}>
                                <Delete fontSize="small" sx={{ color: DANGER }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </SectionCard>
          </TabPanel>

          {/* ══ Tab 1: By Owner ══════════════════════════════════════════════ */}
          <TabPanel value={tab} index={1}>
            {owners.length === 0 ? (
              <Alert severity="info">
                No users with process_owner or process_manager role found in your organization.
              </Alert>
            ) : (
              owners.map((owner) => {
                const ownerAssignments = assignments.filter((a) => a.ownerId === owner.id);
                const frameworksOwned = [...new Set(ownerAssignments.map((a) => a.frameworkCode))];
                return (
                  <SectionCard
                    key={owner.id}
                    title={owner.name}
                    icon={
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700,
                                    bgcolor: ACCENT + "22", color: ACCENT }}>
                        {owner.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    }
                    action={
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        {owner.role?.filter(r => ["process_owner","process_manager"].includes(r))
                          .map(r => <RoleChip key={r} role={r} />)}
                        <Chip label={`${ownerAssignments.length} controls`} size="small"
                          sx={{ bgcolor: ACCENT + "12", color: ACCENT, fontWeight: 600, fontSize: 11 }} />
                      </Box>
                    }
                  >
                    <Typography fontSize={12} color="text.secondary" mb={1.5}>
                      {owner.email}
                    </Typography>

                    {frameworksOwned.length === 0 ? (
                      <Typography color="text.secondary" variant="body2">
                        No controls assigned yet.
                      </Typography>
                    ) : (
                      frameworksOwned.map((fw) => {
                        const fwControls = ownerAssignments.filter((a) => a.frameworkCode === fw);
                        return (
                          <Box key={fw} sx={{ mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <Chip label={fw} size="small"
                                sx={{ fontWeight: 700, fontSize: 11,
                                      bgcolor: "#f0fdf4", color: SUCCESS,
                                      border: "1px solid #bbf7d0" }} />
                              <Typography fontSize={12} color="text.secondary">
                                {fwControls.length} control{fwControls.length !== 1 ? "s" : ""}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                              {fwControls.map((c) => (
                                <Tooltip key={c.id} title={c.controlTitle || ""}>
                                  <Chip
                                    label={c.controlCode}
                                    size="small"
                                    onDelete={() => handleDelete(c.id)}
                                    sx={{
                                      fontFamily: "monospace", fontWeight: 600, fontSize: 12,
                                      bgcolor: SURFACE, border: "1px solid #e0e0e0"
                                    }}
                                  />
                                </Tooltip>
                              ))}
                            </Box>
                          </Box>
                        );
                      })
                    )}
                  </SectionCard>
                );
              })
            )}
          </TabPanel>

          {/* ══ Tab 2: By Framework ══════════════════════════════════════════ */}
          <TabPanel value={tab} index={2}>
            {frameworks.length === 0 ? (
              <Alert severity="info">No frameworks found.</Alert>
            ) : (
              frameworks.map((fw) => {
                const fwAssignments = assignments.filter((a) => a.frameworkCode === fw.code);
                const uniqueOwners  = [...new Set(fwAssignments.map((a) => a.ownerId))].length;
                return (
                  <SectionCard
                    key={fw.id}
                    title={`${fw.name || fw.code} (${fw.code})`}
                    icon={<AccountTree sx={{ color: SUCCESS, fontSize: 20 }} />}
                    action={
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip label={`${fwAssignments.length} assigned`} size="small"
                          sx={{ bgcolor: SUCCESS + "18", color: SUCCESS, fontWeight: 600, fontSize: 11 }} />
                        <Chip label={`${uniqueOwners} owners`} size="small"
                          sx={{ bgcolor: ACCENT + "12", color: ACCENT, fontWeight: 600, fontSize: 11 }} />
                      </Box>
                    }
                  >
                    {fwAssignments.length === 0 ? (
                      <Typography color="text.secondary" variant="body2">
                        No controls assigned in this framework yet.
                      </Typography>
                    ) : (
                      <TableContainer component={Paper} elevation={0}
                        sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: SURFACE }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Control Code</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {fwAssignments.map((a) => (
                              <TableRow key={a.id} hover>
                                <TableCell>
                                  <Typography fontFamily="monospace" fontWeight={700} fontSize={13}>
                                    {a.controlCode}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={a.controlTitle || ""}>
                                    <Typography fontSize={13} sx={{
                                      maxWidth: 250, overflow: "hidden",
                                      textOverflow: "ellipsis", whiteSpace: "nowrap"
                                    }}>
                                      {a.controlTitle}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Typography fontSize={12} color="text.secondary">
                                    {a.controlCategory || "—"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                    <Avatar sx={{ width: 24, height: 24, fontSize: 11,
                                                  bgcolor: ACCENT + "22", color: ACCENT }}>
                                      {a.ownerName?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                    <Typography fontSize={13}>{a.ownerName}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell><RoleChip role={a.ownerRole} /></TableCell>
                                <TableCell align="right">
                                  <Tooltip title="Remove">
                                    <IconButton size="small" onClick={() => handleDelete(a.id)}>
                                      <Delete fontSize="small" sx={{ color: DANGER }} />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </SectionCard>
                );
              })
            )}
          </TabPanel>

        </Box>
      </Paper>

      {/* ── Assign Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: "1px solid #e0e0e0",
                           display: "flex", alignItems: "center", gap: 1.5 }}>
          <AssignmentInd sx={{ color: ACCENT }} />
          Assign Control Ownership
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "grid", gap: 2.5, mt: 1 }}>

            {/* Step 1: Framework */}
            <FormControl size="small" fullWidth required>
              <InputLabel>1. Select Framework</InputLabel>
              <Select value={assignForm.frameworkCode} label="1. Select Framework"
                onChange={(e) => handleFrameworkChange(e.target.value)}>
                {frameworks.map((f) => (
                  <MenuItem key={f.code} value={f.code}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountTree fontSize="small" sx={{ color: SUCCESS }} />
                      <span>{f.name || f.code}</span>
                      <Chip label={f.code} size="small"
                        sx={{ ml: "auto", fontSize: 10, height: 18, bgcolor: "#f0fdf4", color: SUCCESS }} />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Step 2: Control */}
            <FormControl size="small" fullWidth required
              disabled={!assignForm.frameworkCode || loadingControls}>
              <InputLabel>
                {loadingControls ? "Loading controls…" : "2. Select Control"}
              </InputLabel>
              <Select value={assignForm.controlId}
                label={loadingControls ? "Loading controls…" : "2. Select Control"}
                onChange={(e) => setAssignForm((f) => ({ ...f, controlId: e.target.value }))}>
                {controls.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                      <Typography fontFamily="monospace" fontWeight={700} fontSize={13}
                        sx={{ minWidth: 60, color: ACCENT }}>
                        {c.controlCode}
                      </Typography>
                      <Typography fontSize={13} sx={{
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>
                        {c.title}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {loadingControls && (
                <LinearProgressBar />
              )}
            </FormControl>

            {/* Step 3: Owner */}
            <FormControl size="small" fullWidth required>
              <InputLabel>3. Select Owner</InputLabel>
              <Select value={assignForm.ownerId} label="3. Select Owner"
                onChange={(e) => setAssignForm((f) => ({ ...f, ownerId: e.target.value }))}>
                {owners.length === 0 ? (
                  <MenuItem disabled>No eligible owners found</MenuItem>
                ) : (
                  owners.map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 700,
                                      bgcolor: ACCENT + "22", color: ACCENT }}>
                          {o.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontSize={13} fontWeight={600}>{o.name}</Typography>
                          <Typography fontSize={11} color="text.secondary">{o.email}</Typography>
                        </Box>
                        <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
                          {o.role?.filter(r => ["process_owner","process_manager"].includes(r))
                            .map(r => <RoleChip key={r} role={r} />)}
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Step 4: Role */}
            <FormControl size="small" fullWidth required>
              <InputLabel>4. Owner Role</InputLabel>
              <Select value={assignForm.ownerRole} label="4. Owner Role"
                onChange={(e) => setAssignForm((f) => ({ ...f, ownerRole: e.target.value }))}>
                <MenuItem value="process_owner">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RoleChip role="process_owner" />
                    <Typography fontSize={12} color="text.secondary" ml={1}>
                      Accountable for the control
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="process_manager">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RoleChip role="process_manager" />
                    <Typography fontSize={12} color="text.secondary" ml={1}>
                      Responsible for day-to-day execution
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Notes */}
            <TextField size="small" label="Notes (optional)" fullWidth multiline rows={2}
              value={assignForm.notes}
              onChange={(e) => setAssignForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. Assigned during Q1 compliance review" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setAssignDialog(false)} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAssign} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
            sx={{ bgcolor: ACCENT, "&:hover": { bgcolor: "#0353e9" }, fontWeight: 600 }}>
            {saving ? "Assigning…" : "Assign Ownership"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Notes Edit Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={notesDialog} onClose={() => setNotesDialog(false)}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: "1px solid #e0e0e0" }}>
          Edit Notes
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {notesTarget && (
            <Box sx={{ mb: 2 }}>
              <Typography fontSize={12} color="text.secondary">
                {notesTarget.controlCode} — {notesTarget.ownerName}
              </Typography>
            </Box>
          )}
          <TextField fullWidth multiline rows={3} size="small"
            label="Notes" value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNotesDialog(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNotes}
            sx={{ bgcolor: ACCENT }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ──────────────────────────────────────────────────────────── */}
      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// small inline component to avoid import issues
function LinearProgressBar() {
  return (
    <Box sx={{ width: "100%", mt: 0.5 }}>
      <Box sx={{
        height: 2, bgcolor: ACCENT + "33", borderRadius: 1, overflow: "hidden"
      }}>
        <Box sx={{
          height: "100%", bgcolor: ACCENT, width: "40%",
          animation: "slide 1s infinite linear",
          "@keyframes slide": {
            "0%": { transform: "translateX(-100%)" },
            "100%": { transform: "translateX(400%)" }
          }
        }} />
      </Box>
    </Box>
  );
}