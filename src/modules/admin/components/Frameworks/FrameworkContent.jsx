'use client'

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box, Typography, Paper, Tabs, Tab, TextField, Button,
  IconButton, Divider, Chip, Stack, Alert, Snackbar,
  CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  Select, MenuItem, FormControl, InputLabel, Grid, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import PreviewIcon from "@mui/icons-material/Preview";
import ClearIcon from "@mui/icons-material/Clear";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const API_BASE     = process.env.REACT_APP_API_BASE_URL || "https://api.calvant.com/framework/api";

// ── Available lucide icon names for dropdowns ─────────────────────────────────
const ICON_OPTIONS = [
  "Shield", "Globe", "Lock", "Key", "FileText", "Settings",
  "Rocket", "Handshake", "Scale", "User", "Users", "Puzzle",
  "CheckCircle", "AlertTriangle", "Database", "Server",
  "BarChart", "TrendingUp", "Award", "Star", "Zap",
];

// ── Reusable bullet list editor ───────────────────────────────────────────────
const BulletListEditor = ({ label, items = [], onChange }) => {
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, val) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={add}>Add point</Button>
      </Stack>
      {items.map((item, i) => (
        <Stack key={i} direction="row" spacing={1} mb={1} alignItems="center">
          <TextField
            fullWidth size="small" value={item}
            placeholder={`Bullet point ${i + 1}`}
            onChange={(e) => update(i, e.target.value)}
          />
          <IconButton size="small" color="error" onClick={() => remove(i)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}
    </Box>
  );
};

// ── Section wrapper with expand/collapse ─────────────────────────────────────
const SectionAccordion = ({ title, subtitle, children, defaultExpanded = false }) => (
  <Accordion defaultExpanded={defaultExpanded} sx={{ mb: 2, border: "1px solid", borderColor: "divider", borderRadius: "8px !important", "&:before": { display: "none" } }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box>
        <Typography fontWeight={700}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <Stack spacing={2}>{children}</Stack>
    </AccordionDetails>
  </Accordion>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const FrameworkContent = () => {
  const [frameworks, setFrameworks] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // Load all frameworks for the selector
  useEffect(() => {
    axios.get(`${API_BASE}/frameworks`)
      .then((r) => setFrameworks(r.data))
      .catch(() => setSnack({ open: true, message: "Failed to load frameworks", severity: "error" }));
  }, []);

  // When user picks a framework, fetch its full detail
  const loadFramework = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/frameworks/${id}`);
      setSelectedFramework(data);
      // Initialise pageContent: use existing or blank template
      setPageContent(data.pageContent || getBlankPageContent());
    } catch {
      setSnack({ open: true, message: "Failed to load framework details", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (id) => {
    setSelectedId(id);
    loadFramework(id);
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/frameworks/${selectedId}/page-content`, pageContent);
      setSnack({ open: true, message: "Page content saved successfully!", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Save failed. Please try again.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ── Clear page content ───────────────────────────────────────────────────
  const handleClear = async () => {
    if (!selectedId || !window.confirm("This will unpublish the framework page. Continue?")) return;
    try {
      await axios.delete(`${API_BASE}/frameworks/${selectedId}/page-content`);
      setPageContent(getBlankPageContent());
      setSnack({ open: true, message: "Page content cleared.", severity: "info" });
    } catch {
      setSnack({ open: true, message: "Clear failed.", severity: "error" });
    }
  };

  // ── Field helpers ────────────────────────────────────────────────────────
  const set = (path, value) => {
    setPageContent((prev) => setNested({ ...prev }, path, value));
  };

  const setListItem = (listKey, index, field, value) => {
    setPageContent((prev) => {
      const arr = [...(prev[listKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [listKey]: arr };
    });
  };

  const addListItem = (listKey, template) => {
    setPageContent((prev) => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), template],
    }));
  };

  const removeListItem = (listKey, index) => {
    setPageContent((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  };

  const setBullets = (listKey, index, bullets) => {
    setPageContent((prev) => {
      const arr = [...(prev[listKey] || [])];
      arr[index] = { ...arr[index], bulletPoints: bullets };
      return { ...prev, [listKey]: arr };
    });
  };

  if (!pageContent) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", p: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={1}>Framework Page Content</Typography>
        <Typography color="text.secondary" mb={3}>
          Select a framework to edit its public marketing page at <code>/frameworks/[id]</code>
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Select Framework</InputLabel>
          <Select value={selectedId} label="Select Framework" onChange={(e) => handleSelect(e.target.value)}>
            {frameworks.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {f.color && <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: f.color }} />}
                  <span>{f.label || f.name}</span>
                  <Chip label={f.code} size="small" variant="outlined" />
                  {f.pageContent ? <Chip label="Published" size="small" color="success" /> : <Chip label="Draft" size="small" />}
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>}
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", p: { xs: 2, md: 4 } }}>
      {/* ── Header ── */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={3} spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {selectedFramework?.label || selectedFramework?.name} — Page Content
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Public URL: <code>/frameworks/{selectedId}</code>
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select value={selectedId} onChange={(e) => handleSelect(e.target.value)}>
              {frameworks.map((f) => (
                <MenuItem key={f.id} value={f.id}>{f.label || f.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Preview page (opens in new tab)">
            <IconButton onClick={() => window.open(`/frameworks/${selectedId}`, "_blank")}>
              <PreviewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Unpublish / clear page content">
            <IconButton color="error" onClick={handleClear}><ClearIcon /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </Stack>
      </Stack>

      {/* ── Hero Section ── */}
      <SectionAccordion title="Hero Section" subtitle="Top of the page — badge, title, description, CTA" defaultExpanded>
        <TextField label="Badge text" fullWidth size="small" value={pageContent.heroBadgeText || ""} onChange={(e) => set("heroBadgeText", e.target.value)} placeholder="ISO 27001 · Information Security Management" />
        <TextField label="Hero title (main)" fullWidth size="small" value={pageContent.heroTitle || ""} onChange={(e) => set("heroTitle", e.target.value)} placeholder="Build a world-class ISMS" />
        <TextField label="Hero title highlight (the <span> part)" fullWidth size="small" value={pageContent.heroTitleHighlight || ""} onChange={(e) => set("heroTitleHighlight", e.target.value)} placeholder="Information Security" />
        <TextField label="Hero description" fullWidth multiline rows={2} size="small" value={pageContent.heroDescription || ""} onChange={(e) => set("heroDescription", e.target.value)} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Primary CTA button text" fullWidth size="small" value={pageContent.heroPrimaryCtaText || ""} onChange={(e) => set("heroPrimaryCtaText", e.target.value)} placeholder="Get a demo" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Scroll target section id" fullWidth size="small" value={pageContent.heroScrollTarget || ""} onChange={(e) => set("heroScrollTarget", e.target.value)} placeholder="overview" />
          </Grid>
        </Grid>

        {/* Hero stats */}
        <Divider />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>Hero stats</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => addListItem("heroStats", { label: "", value: "", isMain: false })}>Add stat</Button>
        </Stack>
        {(pageContent.heroStats || []).map((stat, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={700}>Stat {i + 1}</Typography>
              <IconButton size="small" color="error" onClick={() => removeListItem("heroStats", i)}><DeleteIcon fontSize="small" /></IconButton>
            </Stack>
            <Grid container spacing={1}>
              <Grid item xs={6}><TextField label="Value" fullWidth size="small" value={stat.value || ""} onChange={(e) => setListItem("heroStats", i, "value", e.target.value)} placeholder="93%" /></Grid>
              <Grid item xs={6}><TextField label="Label" fullWidth size="small" value={stat.label || ""} onChange={(e) => setListItem("heroStats", i, "label", e.target.value)} placeholder="Controls" /></Grid>
            </Grid>
          </Paper>
        ))}
      </SectionAccordion>

      {/* ── Overview ── */}
      <SectionAccordion title="Overview Section" subtitle="What is this framework? — 3 overview cards">
        <TextField label="Section title" fullWidth size="small" value={pageContent.overviewTitle || ""} onChange={(e) => set("overviewTitle", e.target.value)} />
        <TextField label="Section description" fullWidth multiline rows={2} size="small" value={pageContent.overviewDescription || ""} onChange={(e) => set("overviewDescription", e.target.value)} />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>Overview cards</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => addListItem("overviewCards", { icon: "Shield", title: "", description: "" })}>Add card</Button>
        </Stack>
        {(pageContent.overviewCards || []).map((card, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="caption" fontWeight={700}>Card {i + 1}</Typography>
              <IconButton size="small" color="error" onClick={() => removeListItem("overviewCards", i)}><DeleteIcon fontSize="small" /></IconButton>
            </Stack>
            <Stack spacing={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Icon</InputLabel>
                <Select label="Icon" value={card.icon || ""} onChange={(e) => setListItem("overviewCards", i, "icon", e.target.value)}>
                  {ICON_OPTIONS.map((ic) => <MenuItem key={ic} value={ic}>{ic}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Title" fullWidth size="small" value={card.title || ""} onChange={(e) => setListItem("overviewCards", i, "title", e.target.value)} />
              <TextField label="Description" fullWidth multiline rows={2} size="small" value={card.description || ""} onChange={(e) => setListItem("overviewCards", i, "description", e.target.value)} />
            </Stack>
          </Paper>
        ))}
      </SectionAccordion>

      {/* ── Clauses ── */}
      <SectionAccordion title="Clauses / Requirements Section" subtitle="Key clauses with bullet points">
        <TextField label="Section title" fullWidth size="small" value={pageContent.clausesTitle || ""} onChange={(e) => set("clausesTitle", e.target.value)} />
        <TextField label="Section description" fullWidth multiline rows={2} size="small" value={pageContent.clausesDescription || ""} onChange={(e) => set("clausesDescription", e.target.value)} />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>Clause cards</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => addListItem("clauseCards", { clauseLabel: "", title: "", description: "", bulletPoints: [] })}>Add clause</Button>
        </Stack>
        {(pageContent.clauseCards || []).map((card, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="caption" fontWeight={700}>Clause {i + 1}</Typography>
              <IconButton size="small" color="error" onClick={() => removeListItem("clauseCards", i)}><DeleteIcon fontSize="small" /></IconButton>
            </Stack>
            <Stack spacing={1}>
              <TextField label="Clause label" fullWidth size="small" value={card.clauseLabel || ""} onChange={(e) => setListItem("clauseCards", i, "clauseLabel", e.target.value)} placeholder="Clause 4" />
              <TextField label="Title" fullWidth size="small" value={card.title || ""} onChange={(e) => setListItem("clauseCards", i, "title", e.target.value)} />
              <TextField label="Description" fullWidth multiline rows={2} size="small" value={card.description || ""} onChange={(e) => setListItem("clauseCards", i, "description", e.target.value)} />
              <BulletListEditor label="Bullet points" items={card.bulletPoints || []} onChange={(bullets) => setBullets("clauseCards", i, bullets)} />
            </Stack>
          </Paper>
        ))}
      </SectionAccordion>

      {/* ── Controls / Domains ── */}
      <SectionAccordion title="Controls / Domains Section" subtitle="Domain cards with control lists">
        <TextField label="Section title" fullWidth size="small" value={pageContent.controlsTitle || ""} onChange={(e) => set("controlsTitle", e.target.value)} />
        <TextField label="Section description" fullWidth multiline rows={2} size="small" value={pageContent.controlsDescription || ""} onChange={(e) => set("controlsDescription", e.target.value)} />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>Domain cards</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => addListItem("domainCards", { domainTitle: "", domainDescription: "", controls: [] })}>Add domain</Button>
        </Stack>
        {(pageContent.domainCards || []).map((card, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="caption" fontWeight={700}>Domain {i + 1}</Typography>
              <IconButton size="small" color="error" onClick={() => removeListItem("domainCards", i)}><DeleteIcon fontSize="small" /></IconButton>
            </Stack>
            <Stack spacing={1}>
              <TextField label="Domain title" fullWidth size="small" value={card.domainTitle || ""} onChange={(e) => setListItem("domainCards", i, "domainTitle", e.target.value)} />
              <TextField label="Domain description" fullWidth multiline rows={2} size="small" value={card.domainDescription || ""} onChange={(e) => setListItem("domainCards", i, "domainDescription", e.target.value)} />
              <BulletListEditor label="Controls" items={card.controls || []} onChange={(controls) => { const arr = [...(pageContent.domainCards || [])]; arr[i] = { ...arr[i], controls }; setPageContent((p) => ({ ...p, domainCards: arr })); }} />
            </Stack>
          </Paper>
        ))}
      </SectionAccordion>

      {/* ── Benefits ── */}
      <SectionAccordion title="Benefits Section" subtitle="Why use this framework?">
        <TextField label="Section title" fullWidth size="small" value={pageContent.benefitsTitle || ""} onChange={(e) => set("benefitsTitle", e.target.value)} />
        <TextField label="Section description" fullWidth multiline rows={2} size="small" value={pageContent.benefitsDescription || ""} onChange={(e) => set("benefitsDescription", e.target.value)} />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>Benefit cards</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => addListItem("benefitCards", { icon: "Shield", title: "", description: "" })}>Add benefit</Button>
        </Stack>
        {(pageContent.benefitCards || []).map((card, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="caption" fontWeight={700}>Benefit {i + 1}</Typography>
              <IconButton size="small" color="error" onClick={() => removeListItem("benefitCards", i)}><DeleteIcon fontSize="small" /></IconButton>
            </Stack>
            <Stack spacing={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Icon</InputLabel>
                <Select label="Icon" value={card.icon || ""} onChange={(e) => setListItem("benefitCards", i, "icon", e.target.value)}>
                  {ICON_OPTIONS.map((ic) => <MenuItem key={ic} value={ic}>{ic}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Title" fullWidth size="small" value={card.title || ""} onChange={(e) => setListItem("benefitCards", i, "title", e.target.value)} />
              <TextField label="Description" fullWidth multiline rows={2} size="small" value={card.description || ""} onChange={(e) => setListItem("benefitCards", i, "description", e.target.value)} />
            </Stack>
          </Paper>
        ))}
      </SectionAccordion>

      {/* ── Steps ── */}
      <SectionAccordion title="Implementation Steps" subtitle="Numbered rollout guide">
        <TextField label="Section title" fullWidth size="small" value={pageContent.stepsTitle || ""} onChange={(e) => set("stepsTitle", e.target.value)} />
        <TextField label="Section description" fullWidth multiline rows={2} size="small" value={pageContent.stepsDescription || ""} onChange={(e) => set("stepsDescription", e.target.value)} />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>Steps</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => addListItem("stepCards", { stepNumber: (pageContent.stepCards?.length || 0) + 1, title: "", description: "", bulletPoints: [] })}>Add step</Button>
        </Stack>
        {(pageContent.stepCards || []).map((card, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="caption" fontWeight={700}>Step {card.stepNumber}</Typography>
              <IconButton size="small" color="error" onClick={() => removeListItem("stepCards", i)}><DeleteIcon fontSize="small" /></IconButton>
            </Stack>
            <Stack spacing={1}>
              <TextField label="Title" fullWidth size="small" value={card.title || ""} onChange={(e) => setListItem("stepCards", i, "title", e.target.value)} />
              <TextField label="Description" fullWidth multiline rows={2} size="small" value={card.description || ""} onChange={(e) => setListItem("stepCards", i, "description", e.target.value)} />
              <BulletListEditor label="Bullet points" items={card.bulletPoints || []} onChange={(bullets) => setBullets("stepCards", i, bullets)} />
            </Stack>
          </Paper>
        ))}
      </SectionAccordion>

      {/* ── CTA & Footer ── */}
      <SectionAccordion title="CTA & Footer" subtitle="Bottom call-to-action and footer tagline">
        <TextField label="CTA title" fullWidth size="small" value={pageContent.ctaTitle || ""} onChange={(e) => set("ctaTitle", e.target.value)} />
        <TextField label="CTA description" fullWidth multiline rows={2} size="small" value={pageContent.ctaDescription || ""} onChange={(e) => set("ctaDescription", e.target.value)} />
        <TextField label="Footer tagline" fullWidth size="small" value={pageContent.footerTagline || ""} onChange={(e) => set("footerTagline", e.target.value)} placeholder="ISO 27001 · Made in India" />
      </SectionAccordion>

      {/* ── Save bar ── */}
      <Paper elevation={3} sx={{ position: "sticky", bottom: 16, p: 2, display: "flex", justifyContent: "flex-end", gap: 2, borderRadius: 2 }}>
        <Button variant="outlined" color="error" startIcon={<ClearIcon />} onClick={handleClear}>Unpublish</Button>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
          {saving ? <><CircularProgress size={18} sx={{ mr: 1 }} />Saving…</> : "Save page content"}
        </Button>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function setNested(obj, path, value) {
  // simple top-level only — all fields are flat on pageContent
  obj[path] = value;
  return obj;
}

function getBlankPageContent() {
  return {
    heroBadgeText: "",
    heroTitle: "",
    heroTitleHighlight: "",
    heroDescription: "",
    heroPrimaryCtaText: "Get a demo",
    heroScrollTarget: "overview",
    heroStats: [],
    overviewTitle: "",
    overviewDescription: "",
    overviewCards: [],
    clausesTitle: "",
    clausesDescription: "",
    clauseCards: [],
    controlsTitle: "",
    controlsDescription: "",
    domainCards: [],
    benefitsTitle: "",
    benefitsDescription: "",
    benefitCards: [],
    stepsTitle: "",
    stepsDescription: "",
    stepCards: [],
    ctaTitle: "",
    ctaDescription: "",
    footerTagline: "",
  };
}

export default FrameworkContent;