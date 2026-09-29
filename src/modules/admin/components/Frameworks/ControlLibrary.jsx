'use client'

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
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
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://api.calvant.com";
const FW_URL       = `${API_BASE}/framework/api/frameworks`;
const CONTROLS_URL = (code) => `${API_BASE}/framework/api/controls/framework/${code}`;
const CONTROL_PUT  = (id)   => `${API_BASE}/framework/api/controls/${id}`;

const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];

const SECTION_COLORS = {
  CLAUSE:  "primary",
  ANNEX_A: "secondary",
  ANNEX_B: "info",
  DEFAULT: "default",
};

function sectionColor(s) {
  return SECTION_COLORS[s] || SECTION_COLORS.DEFAULT;
}

/* ─────────────── Read-only field ─────────────── */
function ReadOnlyField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}
        sx={{ textTransform: "uppercase", letterSpacing: 0.6, display: "block", mb: 0.3 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: "0.8rem" }}>
        {value || <em style={{ color: "#aaa" }}>—</em>}
      </Typography>
    </Box>
  );
}

/* ─────────────── Edit Dialog ─────────────── */
function EditControlDialog({ open, control, onClose, onSaved }) {
  const [form,           setForm]           = useState({});
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState(null);
  const [auditQuestions, setAuditQuestions] = useState([]);
  const [departmentIds,  setDepartmentIds]  = useState([]);
  const [documents,      setDocuments]      = useState([]);

  useEffect(() => {
    if (control) {
      setForm({
        title:       control.title       || "",
        description: control.description || "",
        category:    control.category    || "",
        metric:      control.metric      || "",
        formula:     control.formula     || "",
        sectionType: control.sectionType || "",
        unifiedId:   control.unifiedId   || "",   // ← now editable
      });
      setAuditQuestions(control.auditQuestions ? [...control.auditQuestions] : []);
      setDepartmentIds(control.departmentIds   ? [...control.departmentIds]  : []);
      setDocuments(control.documents
        ? control.documents.map((d) => ({ type: d.type || "", dept: d.dept || "", doc: d.doc || "" }))
        : []);
      setError(null);
    }
  }, [control]);

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  /* audit questions */
  const updateAuditQ = (i, val) => setAuditQuestions((p) => p.map((q, idx) => idx === i ? val : q));
  const addAuditQ    = () => setAuditQuestions((p) => [...p, ""]);
  const removeAuditQ = (i) => setAuditQuestions((p) => p.filter((_, idx) => idx !== i));

  /* departments */
  const updateDept = (i, val) => setDepartmentIds((p) => p.map((d, idx) => idx === i ? val : d));
  const addDept    = () => setDepartmentIds((p) => [...p, ""]);
  const removeDept = (i) => setDepartmentIds((p) => p.filter((_, idx) => idx !== i));

  /* documents */
  const updateDoc = (i, field, val) =>
    setDocuments((p) => p.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  const addDoc    = () => setDocuments((p) => [...p, { type: "", dept: "", doc: "" }]);
  const removeDoc = (i) => setDocuments((p) => p.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...control,
        ...form,                                          // includes unifiedId now
        auditQuestions: auditQuestions.filter((q) => q.trim()),
        departmentIds:  departmentIds.filter((d)  => d.trim()),
        documents:      documents.filter((d) => d.doc?.trim()),
      };
      await axios.put(CONTROL_PUT(control.id), payload);
      onSaved(payload);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "Save failed.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  if (!control) return null;

  const labelSx = {
    fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: 0.8, color: "text.secondary", mb: 0.5, display: "block",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>

      {/* Title bar */}
      <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Edit Control</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
            <Chip label={control.frameworkCode} size="small" color="primary" />
            <Chip label={control.controlCode}   size="small" variant="outlined" />
            {control.sectionType && (
              <Chip label={control.sectionType} size="small"
                color={sectionColor(control.sectionType)} variant="outlined" />
            )}
          </Stack>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <Stack spacing={3}>

          {/* Identity — MongoDB _id and Framework ID stay read-only; unifiedId moves to Core */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
            <Typography sx={labelSx}>Identity (read-only)</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <ReadOnlyField label="MongoDB _id"  value={control.id} />
              <ReadOnlyField label="Framework ID" value={control.frameworkId} />
            </Box>
          </Paper>

          {/* Core fields */}
          <Box>
            <Typography sx={labelSx}>Core Fields</Typography>
            <Stack spacing={2}>
              <TextField label="Title *" fullWidth value={form.title} onChange={handleChange("title")} />
              <TextField label="Description" fullWidth multiline rows={3}
                value={form.description} onChange={handleChange("description")} />

              {/* Unified ID — editable, sits alongside Section Type */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Unified ID"
                  fullWidth
                  value={form.unifiedId}
                  onChange={handleChange("unifiedId")}
                  helperText="Cross-framework mapping identifier (e.g. ISO27001-A.5.1)"
                  inputProps={{ style: { fontFamily: "monospace", fontSize: "0.85rem" } }}
                />
                <TextField label="Section Type" fullWidth value={form.sectionType} onChange={handleChange("sectionType")} />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Category" fullWidth value={form.category} onChange={handleChange("category")} />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Metric"  fullWidth value={form.metric}  onChange={handleChange("metric")} />
                <TextField label="Formula" fullWidth value={form.formula} onChange={handleChange("formula")} />
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Departments */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={labelSx}>Departments ({departmentIds.length})</Typography>
              <Button size="small" onClick={addDept}>+ Add</Button>
            </Box>
            <Stack spacing={1}>
              {departmentIds.length === 0 && (
                <Typography variant="caption" color="text.disabled">No departments assigned.</Typography>
              )}
              {departmentIds.map((d, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField size="small" fullWidth value={d}
                    onChange={(e) => updateDept(i, e.target.value)}
                    placeholder="e.g. ISMS Steering Committee / CISO" />
                  <IconButton size="small" onClick={() => removeDept(i)} color="error">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Audit Questions */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={labelSx}>Audit Questions ({auditQuestions.length})</Typography>
              <Button size="small" onClick={addAuditQ}>+ Add</Button>
            </Box>
            <Stack spacing={1}>
              {auditQuestions.length === 0 && (
                <Typography variant="caption" color="text.disabled">No audit questions defined.</Typography>
              )}
              {auditQuestions.map((q, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <Typography variant="caption" color="text.disabled"
                    sx={{ minWidth: 20, pt: 1.2, fontWeight: 700 }}>
                    {i + 1}.
                  </Typography>
                  <TextField size="small" fullWidth multiline maxRows={5} value={q}
                    onChange={(e) => updateAuditQ(i, e.target.value)}
                    placeholder={`Audit question ${i + 1}`} />
                  <IconButton size="small" onClick={() => removeAuditQ(i)} color="error" sx={{ mt: 0.3 }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Documents */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={labelSx}>Required Documents ({documents.length})</Typography>
              <Button size="small" onClick={addDoc}>+ Add</Button>
            </Box>
            <Stack spacing={1.5}>
              {documents.length === 0 && (
                <Typography variant="caption" color="text.disabled">No documents defined.</Typography>
              )}
              {documents.map((doc, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      Document {i + 1}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small" onClick={() => removeDoc(i)} color="error">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "120px 1fr 2fr", gap: 1 }}>
                    <TextField size="small" label="Type" value={doc.type}
                      onChange={(e) => updateDoc(i, "type", e.target.value)}
                      placeholder="Guideline / Doc / Log" />
                    <TextField size="small" label="Department" value={doc.dept}
                      onChange={(e) => updateDoc(i, "dept", e.target.value)}
                      placeholder="e.g. ISO" />
                    <TextField size="small" label="Document Name" value={doc.doc}
                      onChange={(e) => updateDoc(i, "doc", e.target.value)}
                      placeholder="e.g. ISMS Manual" />
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>

        </Stack>
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

/* ─────────────── Main Page ─────────────── */
export default function ControlsLibrary() {
  const navigate           = useHistory();
  const { code: urlCode }  = useParams();

  const [frameworks,    setFrameworks]    = useState([]);
  const [selectedCode,  setSelectedCode]  = useState(urlCode || "");
  const [controls,      setControls]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  const [search,        setSearch]        = useState("");
  const [filterSection, setFilterSection] = useState("ALL");
  const [showFilters,   setShowFilters]   = useState(false);
  const [page,          setPage]          = useState(0);
  const [rowsPerPage,   setRowsPerPage]   = useState(25);

  const [editOpen,    setEditOpen]    = useState(false);
  const [editControl, setEditControl] = useState(null);

  useEffect(() => {
    axios.get(FW_URL)
      .then((r) => setFrameworks(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCode) return;
    setLoading(true);
    setError(null);
    setControls([]);
    setPage(0);
    axios.get(CONTROLS_URL(selectedCode))
      .then((r) => setControls(Array.isArray(r.data) ? r.data : []))
      .catch((err) => setError(err.response?.data?.message || err.message || "Failed to load controls."))
      .finally(() => setLoading(false));
  }, [selectedCode]);

  const sectionOptions = useMemo(() => {
    const set = new Set(controls.map((c) => c.sectionType).filter(Boolean));
    return ["ALL", ...Array.from(set).sort()];
  }, [controls]);

  const filtered = useMemo(() => {
    let rows = controls;
    if (filterSection !== "ALL") rows = rows.filter((c) => c.sectionType === filterSection);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((c) =>
        (c.controlCode || "").toLowerCase().includes(q) ||
        (c.title       || "").toLowerCase().includes(q) ||
        (c.category    || "").toLowerCase().includes(q) ||
        (c.metric      || "").toLowerCase().includes(q) ||
        (c.unifiedId   || "").toLowerCase().includes(q)   // ← also searchable
      );
    }
    return rows;
  }, [controls, search, filterSection]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const openEdit = (ctrl) => { setEditControl(ctrl); setEditOpen(true); };

  const handleSaved = useCallback((updated) => {
    setControls((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditOpen(false);
    setEditControl(null);
  }, []);

  const skeletonRows = Array.from({ length: 8 });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1300, margin: "auto" }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate.push(-1)} size="small"><ArrowBackIcon /></IconButton>
        <AccountTreeIcon sx={{ color: "primary.main", fontSize: 28 }} />
        <Typography variant="h4" fontWeight={800}>Controls Library</Typography>
      </Box>

      {/* Toolbar */}
      <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <TextField select label="Framework" value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            sx={{ minWidth: 220 }} size="small">
            <MenuItem value="" disabled><em>— Select framework —</em></MenuItem>
            {frameworks.map((fw) => (
              <MenuItem key={fw.id} value={fw.code}>
                <strong>{fw.code}</strong>&nbsp;
                <Typography variant="caption" color="text.secondary">{fw.name}</Typography>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            placeholder="Search code, title, category, unified ID…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            size="small" sx={{ minWidth: 300, flex: 1 }}
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

          {selectedCode && (
            <Chip
              label={`${filtered.length} / ${controls.length} control${controls.length !== 1 ? "s" : ""}`}
              size="small" color="primary" variant="outlined" />
          )}
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>Section:</Typography>
            {sectionOptions.map((s) => (
              <Chip key={s} label={s} size="small"
                variant={filterSection === s ? "filled" : "outlined"}
                color={filterSection === s ? sectionColor(s) : "default"}
                clickable onClick={() => { setFilterSection(s); setPage(0); }} />
            ))}
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
                <TableCell sx={{ fontWeight: 700, width: 140 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 160 }}>Unified ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 160 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 110 }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 80 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!selectedCode && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    Select a framework to view its controls.
                  </TableCell>
                </TableRow>
              )}

              {selectedCode && loading && skeletonRows.map((_, i) => (
                <TableRow key={i}>
                  {[50, 140, 160, "auto", 160, 110, 80].map((w, j) => (
                    <TableCell key={j} sx={{ width: w }}><Skeleton variant="text" width="80%" /></TableCell>
                  ))}
                </TableRow>
              ))}

              {!loading && selectedCode && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No controls found{search ? ` for "${search}"` : ""}.
                  </TableCell>
                </TableRow>
              )}

              {!loading && paginated.map((ctrl, idx) => (
                <TableRow key={ctrl.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell sx={{ color: "text.disabled", fontSize: "0.75rem" }}>
                    {page * rowsPerPage + idx + 1}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}
                      sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                      {ctrl.controlCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {ctrl.unifiedId
                      ? (
                        <Chip
                          label={ctrl.unifiedId}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontFamily: "monospace", fontSize: "0.7rem", maxWidth: 150 }}
                        />
                      )
                      : <Typography variant="caption" color="text.disabled">—</Typography>
                    }
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                      {ctrl.title || <em style={{ color: "#999" }}>—</em>}
                    </Typography>
                    {ctrl.description && (
                      <Typography variant="caption" color="text.secondary" sx={{
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {ctrl.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {ctrl.category
                      ? <Chip label={ctrl.category} size="small" sx={{ fontSize: "0.7rem", maxWidth: 150 }} />
                      : <Typography variant="caption" color="text.disabled">—</Typography>}
                  </TableCell>
                  <TableCell>
                    {ctrl.sectionType
                      ? <Chip label={ctrl.sectionType} size="small"
                          color={sectionColor(ctrl.sectionType)} variant="outlined"
                          sx={{ fontSize: "0.7rem" }} />
                      : <Typography variant="caption" color="text.disabled">—</Typography>}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit control">
                      <IconButton size="small" onClick={() => openEdit(ctrl)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedCode && !loading && filtered.length > 0 && (
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

      {/* Edit Dialog */}
      <EditControlDialog
        open={editOpen}
        control={editControl}
        onClose={() => { setEditOpen(false); setEditControl(null); }}
        onSaved={handleSaved}
      />
    </Box>
  );
}