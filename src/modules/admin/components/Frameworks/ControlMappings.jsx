'use client'

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  MenuItem,
  Paper,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Skeleton,
  Stack,
  Divider,
  Collapse,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import axios from "axios";

const API_BASE     = process.env.REACT_APP_API_BASE_URL || "https://api.calvant.com";
const FW_URL       = `${API_BASE}/framework/api/frameworks`;
const MAPPINGS_URL = `${API_BASE}/framework/api/mappings`;
const MAPPING_DELETE = (id) => `${API_BASE}/framework/api/mappings/${id}`;

const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];

const labelSx = {
  fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
  letterSpacing: 0.8, color: "text.secondary", mb: 0.5, display: "block",
};

/* ─────────────── Shared Mapping Form Fields ─────────────── */
function MappingFormFields({ form, onChange, frameworks, error, onClearError }) {
  const fwOptions = frameworks.map((fw) => (
    <MenuItem key={fw.id} value={fw.code}>
      <strong>{fw.code}</strong>&nbsp;
      <Typography variant="caption" color="text.secondary">{fw.name}</Typography>
    </MenuItem>
  ));

  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error" onClose={onClearError}>{error}</Alert>}

      {/* Source */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography sx={labelSx}>Source</Typography>
        <Stack spacing={1.5}>
          <TextField select label="Source Framework *" fullWidth size="small"
            value={form.sourceFrameworkCode} onChange={onChange("sourceFrameworkCode")}>
            <MenuItem value="" disabled><em>— Select —</em></MenuItem>
            {fwOptions}
          </TextField>
          <TextField label="Source Control Code *" fullWidth size="small"
            value={form.sourceControlCode} onChange={onChange("sourceControlCode")}
            placeholder="e.g. Article-2"
            inputProps={{ style: { fontFamily: "monospace" } }} />
        </Stack>
      </Paper>

      {/* Arrow */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CompareArrowsIcon sx={{ color: "text.disabled", fontSize: 28 }} />
      </Box>

      {/* Target */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography sx={labelSx}>Target</Typography>
        <Stack spacing={1.5}>
          <TextField select label="Target Framework *" fullWidth size="small"
            value={form.targetFrameworkCode} onChange={onChange("targetFrameworkCode")}>
            <MenuItem value="" disabled><em>— Select —</em></MenuItem>
            {fwOptions}
          </TextField>
          <TextField label="Target Control Code *" fullWidth size="small"
            value={form.targetControlCode} onChange={onChange("targetControlCode")}
            placeholder="e.g. 4.1"
            inputProps={{ style: { fontFamily: "monospace" } }} />
        </Stack>
      </Paper>
    </Stack>
  );
}

function validateForm(form) {
  const { sourceFrameworkCode, sourceControlCode, targetFrameworkCode, targetControlCode } = form;
  if (!sourceFrameworkCode || !sourceControlCode || !targetFrameworkCode || !targetControlCode)
    return "All four fields are required.";
  if (sourceFrameworkCode === targetFrameworkCode && sourceControlCode === targetControlCode)
    return "Source and target cannot be identical.";
  return null;
}

/* ─────────────── Add Mapping Dialog ─────────────── */
function AddMappingDialog({ open, frameworks, onClose, onSaved }) {
  const EMPTY = { sourceFrameworkCode: "", sourceControlCode: "", targetFrameworkCode: "", targetControlCode: "" };
  const [form,   setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  useEffect(() => { if (open) { setForm(EMPTY); setError(null); } }, [open]);

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    const err = validateForm(form);
    if (err) { setError(err); return; }
    setSaving(true); setError(null);
    try {
      const res = await axios.post(MAPPINGS_URL, {
        sourceFrameworkCode: form.sourceFrameworkCode.trim().toUpperCase(),
        sourceControlCode:   form.sourceControlCode.trim(),
        targetFrameworkCode: form.targetFrameworkCode.trim().toUpperCase(),
        targetControlCode:   form.targetControlCode.trim(),
      });
      onSaved(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "Save failed.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Add Control Mapping</Typography>
          <Typography variant="caption" color="text.secondary">Link a source control to a target control</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <MappingFormFields form={form} onChange={handleChange} frameworks={frameworks}
          error={error} onClearError={() => setError(null)} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}>
          {saving ? "Saving…" : "Add Mapping"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─────────────── Edit Mapping Dialog ─────────────── */
function EditMappingDialog({ open, mapping, frameworks, onClose, onSaved }) {
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  useEffect(() => {
    if (mapping) {
      setForm({
        sourceFrameworkCode: mapping.sourceFrameworkCode || "",
        sourceControlCode:   mapping.sourceControlCode   || "",
        targetFrameworkCode: mapping.targetFrameworkCode || "",
        targetControlCode:   mapping.targetControlCode   || "",
      });
      setError(null);
    }
  }, [mapping]);

  if (!mapping) return null;

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    const err = validateForm(form);
    if (err) { setError(err); return; }

    // Check if anything actually changed
    const unchanged =
      form.sourceFrameworkCode === mapping.sourceFrameworkCode &&
      form.sourceControlCode   === mapping.sourceControlCode   &&
      form.targetFrameworkCode === mapping.targetFrameworkCode &&
      form.targetControlCode   === mapping.targetControlCode;
    if (unchanged) { onClose(); return; }

    setSaving(true); setError(null);
    try {
      // DELETE old, POST new
      await axios.delete(MAPPING_DELETE(mapping.id));
      const res = await axios.post(MAPPINGS_URL, {
        sourceFrameworkCode: form.sourceFrameworkCode.trim().toUpperCase(),
        sourceControlCode:   form.sourceControlCode.trim(),
        targetFrameworkCode: form.targetFrameworkCode.trim().toUpperCase(),
        targetControlCode:   form.targetControlCode.trim(),
      });
      onSaved(mapping.id, res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "Update failed.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Edit Control Mapping</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
            <Chip label={mapping.sourceFrameworkCode} size="small" color="primary" />
            <Chip label={mapping.sourceControlCode}   size="small" variant="outlined"
              sx={{ fontFamily: "monospace", fontSize: "0.75rem" }} />
            <CompareArrowsIcon sx={{ color: "text.disabled", fontSize: 16 }} />
            <Chip label={mapping.targetFrameworkCode} size="small" color="secondary" />
            <Chip label={mapping.targetControlCode}   size="small" variant="outlined"
              sx={{ fontFamily: "monospace", fontSize: "0.75rem" }} />
          </Stack>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        {/* Read-only identity */}
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", mb: 2.5 }}>
          <Typography sx={{ ...labelSx, mb: 0.8 }}>Identity (read-only)</Typography>
          <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.78rem", color: "text.secondary" }}>
            {mapping.id}
          </Typography>
        </Paper>

        <MappingFormFields form={form} onChange={handleChange} frameworks={frameworks}
          error={error} onClearError={() => setError(null)} />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─────────────── Delete Confirm Dialog ─────────────── */
function ConfirmDeleteDialog({ open, mapping, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState(null);

  const handleDelete = async () => {
    setDeleting(true); setError(null);
    try {
      await axios.delete(MAPPING_DELETE(mapping.id));
      onDeleted(mapping.id);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Delete failed.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally { setDeleting(false); }
  };

  if (!mapping) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>Delete Mapping?</Typography>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          This will permanently remove the mapping:
        </Typography>
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Chip label={mapping.sourceFrameworkCode} size="small" color="primary" />
            <Chip label={mapping.sourceControlCode}   size="small" variant="outlined"
              sx={{ fontFamily: "monospace", fontSize: "0.75rem" }} />
            <CompareArrowsIcon sx={{ color: "text.disabled", fontSize: 18 }} />
            <Chip label={mapping.targetFrameworkCode} size="small" color="secondary" />
            <Chip label={mapping.targetControlCode}   size="small" variant="outlined"
              sx={{ fontFamily: "monospace", fontSize: "0.75rem" }} />
          </Stack>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={deleting}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}>
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─────────────── Main Page ─────────────── */
export default function ControlMappings() {
  const navigate = useHistory();

  const [frameworks,   setFrameworks]   = useState([]);
  const [mappings,     setMappings]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [targetFilter, setTargetFilter] = useState("ALL");
  const [search,       setSearch]       = useState("");
  const [showFilters,  setShowFilters]  = useState(false);
  const [page,         setPage]         = useState(0);
  const [rowsPerPage,  setRowsPerPage]  = useState(25);

  const [addOpen,      setAddOpen]      = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [editMapping,  setEditMapping]  = useState(null);
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    axios.get(FW_URL)
      .then((r) => setFrameworks(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const fetchMappings = useCallback(() => {
    setLoading(true); setError(null);
    axios.get(MAPPINGS_URL)
      .then((r) => setMappings(Array.isArray(r.data) ? r.data : []))
      .catch((err) => setError(err.response?.data?.message || err.message || "Failed to load mappings."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMappings(); }, [fetchMappings]);

  const normalize = (m) => ({ ...m, id: m.id || m._id });

  const sourceFrameworks = useMemo(() => {
    const set = new Set(mappings.map((m) => m.sourceFrameworkCode).filter(Boolean));
    return ["ALL", ...Array.from(set).sort()];
  }, [mappings]);

  const targetFrameworks = useMemo(() => {
    const set = new Set(mappings.map((m) => m.targetFrameworkCode).filter(Boolean));
    return ["ALL", ...Array.from(set).sort()];
  }, [mappings]);

  const filtered = useMemo(() => {
    let rows = mappings;
    if (sourceFilter !== "ALL") rows = rows.filter((m) => m.sourceFrameworkCode === sourceFilter);
    if (targetFilter !== "ALL") rows = rows.filter((m) => m.targetFrameworkCode === targetFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((m) =>
        (m.sourceFrameworkCode || "").toLowerCase().includes(q) ||
        (m.sourceControlCode   || "").toLowerCase().includes(q) ||
        (m.targetFrameworkCode || "").toLowerCase().includes(q) ||
        (m.targetControlCode   || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [mappings, sourceFilter, targetFilter, search]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const handleAdded = useCallback((newMapping) => {
    setMappings((prev) => [normalize(newMapping), ...prev]);
    setAddOpen(false);
  }, []);

  const openEdit = (m) => { setEditMapping(normalize(m)); setEditOpen(true); };

  // Replace old mapping with the newly created one (different _id from backend)
  const handleEdited = useCallback((oldId, newMapping) => {
    setMappings((prev) => prev.map((m) => (m.id === oldId || m._id === oldId) ? normalize(newMapping) : m));
    setEditOpen(false);
    setEditMapping(null);
  }, []);

  const openDelete = (m) => { setDeleteTarget(normalize(m)); setDeleteOpen(true); };

  const handleDeleted = useCallback((id) => {
    setMappings((prev) => prev.filter((m) => m.id !== id && m._id !== id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  }, []);

  const skeletonRows = Array.from({ length: 8 });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "auto" }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate.push(-1)} size="small"><ArrowBackIcon /></IconButton>
        <CompareArrowsIcon sx={{ color: "primary.main", fontSize: 28 }} />
        <Typography variant="h4" fontWeight={800}>Control Mappings</Typography>
      </Box>

      {/* Toolbar */}
      <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <TextField
            placeholder="Search framework or control code…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            size="small" sx={{ minWidth: 280, flex: 1 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}><CloseIcon fontSize="small" /></IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title="Toggle filters">
            <IconButton onClick={() => setShowFilters((v) => !v)} color={showFilters ? "primary" : "default"}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          <Chip
            label={`${filtered.length} / ${mappings.length} mapping${mappings.length !== 1 ? "s" : ""}`}
            size="small" color="primary" variant="outlined" />

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} sx={{ ml: "auto" }}>
            Add Mapping
          </Button>
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Source:</Typography>
              {sourceFrameworks.map((s) => (
                <Chip key={s} label={s} size="small"
                  variant={sourceFilter === s ? "filled" : "outlined"}
                  color={sourceFilter === s ? "primary" : "default"}
                  clickable onClick={() => { setSourceFilter(s); setPage(0); }} />
              ))}
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Target:</Typography>
              {targetFrameworks.map((t) => (
                <Chip key={t} label={t} size="small"
                  variant={targetFilter === t ? "filled" : "outlined"}
                  color={targetFilter === t ? "secondary" : "default"}
                  clickable onClick={() => { setTargetFilter(t); setPage(0); }} />
              ))}
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 160 }}>Source Framework</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 180 }}>Source Control</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 60, textAlign: "center" }}>→</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 160 }}>Target Framework</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 180 }}>Target Control</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && skeletonRows.map((_, i) => (
                <TableRow key={i}>
                  {[50, 160, 180, 60, 160, 180, 100].map((w, j) => (
                    <TableCell key={j} sx={{ width: w }}><Skeleton variant="text" width="80%" /></TableCell>
                  ))}
                </TableRow>
              ))}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    {search ? `No mappings found for "${search}".` : "No mappings yet. Click Add Mapping to create one."}
                  </TableCell>
                </TableRow>
              )}

              {!loading && paginated.map((m, idx) => (
                <TableRow key={m.id || m._id} hover sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell sx={{ color: "text.disabled", fontSize: "0.75rem" }}>
                    {page * rowsPerPage + idx + 1}
                  </TableCell>
                  <TableCell>
                    <Chip label={m.sourceFrameworkCode} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}
                      sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                      {m.sourceControlCode}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <CompareArrowsIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={m.targetFrameworkCode} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}
                      sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                      {m.targetControlCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit mapping">
                      <IconButton size="small" onClick={() => openEdit(m)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete mapping">
                      <IconButton size="small" color="error" onClick={() => openDelete(m)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && filtered.length > 0 && (
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            labelRowsPerPage="Per page:"
          />
        )}
      </Paper>

      {/* Add Dialog */}
      <AddMappingDialog
        open={addOpen}
        frameworks={frameworks}
        onClose={() => setAddOpen(false)}
        onSaved={handleAdded}
      />

      {/* Edit Dialog */}
      <EditMappingDialog
        open={editOpen}
        mapping={editMapping}
        frameworks={frameworks}
        onClose={() => { setEditOpen(false); setEditMapping(null); }}
        onSaved={handleEdited}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={deleteOpen}
        mapping={deleteTarget}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onDeleted={handleDeleted}
      />
    </Box>
  );
}