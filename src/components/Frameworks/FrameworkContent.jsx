import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  Box, Typography, Paper, Button, IconButton, Chip, Stack, Alert,
  Snackbar, CircularProgress, Select, MenuItem, FormControl, Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Shield, Globe, Lock, Key, FileText, Settings, Rocket, Handshake,
  Scale, User, Users, Puzzle, CheckCircle, AlertTriangle, Database,
  Server, BarChart, TrendingUp, Award, Star, Zap, Plus, Trash2, X,
} from "lucide-react";
import "./framework-page.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.calvant.com/framework/api";

// ── Icons available for card icon-pickers ──────────────────────────────────
const ICON_MAP = {
  Shield, Globe, Lock, Key, FileText, Settings, Rocket, Handshake,
  Scale, User, Users, Puzzle, CheckCircle, AlertTriangle, Database,
  Server, BarChart, TrendingUp, Award, Star, Zap,
};
const ICON_NAMES = Object.keys(ICON_MAP);
const DynamicIcon = ({ name, size = 24 }) => {
  const Icon = ICON_MAP[name] || Shield;
  return <Icon size={size} />;
};

// ── Small inline style tokens for the editor chrome (kept separate from ────
//    the page's own fw-* CSS so we never fight its specificity) ────────────
const CHROME = {
  outline: "1px dashed #93c5fd",
  hoverBg: "rgba(59,130,246,0.06)",
  accent: "#2563eb",
  danger: "#dc2626",
};

const editableBoxStyle = (editing, tag) => ({
  cursor: "text",
  outline: editing ? `1px solid ${CHROME.accent}` : `1px dashed rgba(37,99,235,0.35)`,
  outlineOffset: 2,
  borderRadius: 4,
  transition: "outline-color .15s, background-color .15s",
  display: tag === "span" ? "inline" : "inline-block",
  width: tag === "span" ? "auto" : "100%",
});

// ── EditableText: click-to-edit span/heading/paragraph ─────────────────────
// Uses an UNCONTROLLED input (defaultValue + ref) so typing never round-trips
// through React state on every keystroke — that round-trip was what caused
// the field to keep re-selecting itself and swallowing what you typed.
const EditableText = ({ value, onChange, placeholder, tag = "span", className, multiline, editable = true }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    if (editing && inputRef.current) {
      const el = inputRef.current;
      // Belt-and-braces: some fw-* classes in framework-page.css set color
      // (and occasionally background) with !important for the read-only
      // display styling. A plain inline `style` object loses to !important,
      // so force it via setProperty(..., "important") instead — this wins
      // regardless of what the underlying class does.
      el.style.setProperty("color", "#111827", "important");
      el.style.setProperty("background-color", "#ffffff", "important");
      el.style.setProperty("-webkit-text-fill-color", "#111827", "important");
      el.focus();
      // caret at the end, not a full select — selecting-all on every focus
      // is what made typed text look like it kept vanishing/getting replaced
      const len = el.value.length;
      el.setSelectionRange?.(len, len);
    }
  }, [editing]);

  if (!editable) {
    const Tag = tag;
    return <Tag className={className}>{value || <span style={{ opacity: 0.35 }}>{placeholder}</span>}</Tag>;
  }

  const commit = () => {
    const newVal = inputRef.current ? inputRef.current.value : value;
    setEditing(false);
    if (newVal !== (value || "")) onChange(newVal);
  };

  const cancel = () => setEditing(false); // uncontrolled: never touched `value`, so nothing to revert

  if (editing) {
    const commonProps = {
      ref: inputRef,
      defaultValue: value || "",
      onBlur: commit,
      className,
      style: {
        ...editableBoxStyle(true, tag),
        font: "inherit",
        color: "#111827",
        background: "#fff",
        border: "none",
        padding: "2px 4px",
        resize: multiline ? "vertical" : "none",
      },
    };
    return multiline
      ? <textarea {...commonProps} rows={3} onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) commit(); if (e.key === "Escape") cancel(); }} />
      : <input {...commonProps} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }} />;
  }

  const Tag = tag;
  return (
    <Tag
      className={className}
      onClick={() => setEditing(true)}
      style={editableBoxStyle(false, tag)}
      onMouseEnter={(e) => { e.currentTarget.style.outlineColor = CHROME.outline.split(" ")[2]; e.currentTarget.style.backgroundColor = CHROME.hoverBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.outlineColor = "rgba(37,99,235,0.35)"; e.currentTarget.style.backgroundColor = "transparent"; }}
      title="Click to edit"
    >
      {value || <span style={{ opacity: 0.35 }}>{placeholder}</span>}
    </Tag>
  );
};

// ── Small delete "x" that appears on hover, pinned to a corner ─────────────
const HoverDelete = ({ onClick, label = "Remove" }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    title={label}
    style={{
      position: "absolute", top: -10, right: -10, zIndex: 5,
      width: 26, height: 26, borderRadius: "50%", border: "1px solid #fca5a5",
      background: "#fff", color: CHROME.danger, display: "flex",
      alignItems: "center", justifyContent: "center", cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
    }}
  >
    <Trash2 size={13} />
  </button>
);

// ── Wraps any card so it gets a hover outline + delete button in edit mode ─
const EditableCardShell = ({ editable, onRemove, children, style, className }) => {
  const [hover, setHover] = useState(false);
  if (!editable) return <div className={className} style={style}>{children}</div>;
  return (
    <div
      className={className}
      style={{
        ...style,
        position: "relative",
        outline: hover ? `1px dashed ${CHROME.accent}` : "1px dashed rgba(37,99,235,0.25)",
        outlineOffset: 4,
        borderRadius: 12,
        transition: "outline-color .15s",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && <HoverDelete onClick={onRemove} />}
      {children}
    </div>
  );
};

// ── Dashed "Add" tile that matches the card-grid look ───────────────────────
const AddCardTile = ({ label, onClick, minHeight = 140 }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      minHeight, borderRadius: 12, border: `1.5px dashed #c7d2fe`,
      background: "rgba(37,99,235,0.03)", color: CHROME.accent,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 6, cursor: "pointer", width: "100%",
      fontWeight: 600, fontSize: 13,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(37,99,235,0.07)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(37,99,235,0.03)")}
  >
    <Plus size={20} />
    {label}
  </button>
);

// ── Editable bullet list (used inside clause / domain / step cards) ────────
const EditableBulletList = ({ items = [], onChange, editable, addLabel = "Add point" }) => {
  const update = (i, v) => { const next = [...items]; next[i] = v; onChange(next); };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, "New point"]);

  if (!editable) {
    return items.length ? <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul> : null;
  }
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {items.map((it, i) => (
        <li key={i} style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ opacity: 0.5 }}>•</span>
          <EditableText value={it} onChange={(v) => update(i, v)} editable placeholder="Bullet point" />
          <button
            type="button" onClick={() => remove(i)} title="Remove point"
            style={{ border: "none", background: "none", color: CHROME.danger, cursor: "pointer", padding: 2, display: "flex" }}
          >
            <X size={13} />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button" onClick={add}
          style={{ border: "none", background: "none", color: CHROME.accent, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: "2px 0" }}
        >
          <Plus size={12} /> {addLabel}
        </button>
      </li>
    </ul>
  );
};

// ── Icon picker popover, click the icon bubble in a card to change it ──────
// Rendered through a portal to document.body: the card grid these icons
// live in has a hover transform (scale/tilt) on the card, and a normal
// absolutely-positioned child inherits that transform's containing block —
// that's what was making the picker render skewed. Escaping to <body> via
// a portal sidesteps it entirely; position is computed from the trigger's
// real screen coordinates instead.
const EditableIcon = ({ value, onChange, editable, size = 24 }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  if (!editable) return <DynamicIcon name={value} size={size} />;

  const openPicker = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 6, left: rect.left });
    setOpen(true);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        title="Change icon"
        style={{ border: "1px dashed transparent", background: "none", cursor: "pointer", padding: 4, borderRadius: 8, display: "flex" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = CHROME.accent)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
      >
        <DynamicIcon name={value} size={size} />
      </button>
      {open && createPortal(
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "fixed", top: pos.top, left: pos.left, zIndex: 1001,
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)", padding: 8,
            display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, width: 220,
          }}>
            {ICON_NAMES.map((name) => (
              <button
                key={name} type="button"
                onClick={() => { onChange(name); setOpen(false); }}
                title={name}
                style={{
                  border: "none", borderRadius: 6, cursor: "pointer", padding: 6,
                  background: name === value ? "rgba(37,99,235,0.12)" : "transparent",
                  color: name === value ? CHROME.accent : "#374151",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <DynamicIcon name={name} size={16} />
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Main component — one page that IS the preview, editable in place
// ─────────────────────────────────────────────────────────────────────────
const FrameworkContentEditor = () => {
  const [frameworks, setFrameworks] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    axios.get(`${API_BASE}/frameworks`)
      .then((r) => setFrameworks(r.data))
      .catch(() => setSnack({ open: true, message: "Failed to load frameworks", severity: "error" }));
  }, []);

  const loadFramework = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/frameworks/${id}`);
      setSelectedFramework(data);
      setPageContent(data.pageContent || getBlankPageContent());
    } catch {
      setSnack({ open: true, message: "Failed to load framework details", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (id) => { setSelectedId(id); loadFramework(id); };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/frameworks/${selectedId}/page-content`, pageContent);
      // Reflect the publish immediately — don't wait on a refetch for the
      // Draft/Published chip (and the framework picker's chips) to catch up.
      setSelectedFramework((prev) => (prev ? { ...prev, pageContent } : prev));
      setFrameworks((prev) => prev.map((f) => (f.id === selectedId ? { ...f, pageContent } : f)));
      setSnack({ open: true, message: "Page content saved successfully!", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Save failed. Please try again.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!selectedId || !window.confirm("This will unpublish the framework page. Continue?")) return;
    try {
      await axios.delete(`${API_BASE}/frameworks/${selectedId}/page-content`);
      setPageContent(getBlankPageContent());
      setSelectedFramework((prev) => (prev ? { ...prev, pageContent: null } : prev));
      setFrameworks((prev) => prev.map((f) => (f.id === selectedId ? { ...f, pageContent: null } : f)));
      setSnack({ open: true, message: "Page content cleared.", severity: "info" });
    } catch {
      setSnack({ open: true, message: "Clear failed.", severity: "error" });
    }
  };

  // ── Field helpers ─────────────────────────────────────────────────────
  const set = (key, value) => setPageContent((prev) => ({ ...prev, [key]: value }));

  const setListItem = (listKey, index, field, value) => {
    setPageContent((prev) => {
      const arr = [...(prev[listKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [listKey]: arr };
    });
  };

  const addListItem = (listKey, template) => {
    setPageContent((prev) => ({ ...prev, [listKey]: [...(prev[listKey] || []), template] }));
  };

  const removeListItem = (listKey, index) => {
    setPageContent((prev) => ({ ...prev, [listKey]: prev[listKey].filter((_, i) => i !== index) }));
  };

  const setListField = (listKey, index, field, value) => {
    setPageContent((prev) => {
      const arr = [...(prev[listKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [listKey]: arr };
    });
  };

  // ── Empty state: pick a framework first ─────────────────────────────────
  if (!pageContent) {
    return (
      <Box sx={{ maxWidth: 640, mx: "auto", p: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={1}>Framework Page Editor</Typography>
        <Typography color="text.secondary" mb={3}>
          Pick a framework to edit its public page directly, the way it will actually look at <code>/frameworks/[id]</code>.
        </Typography>
        <FormControl fullWidth>
          <Select displayEmpty value={selectedId} onChange={(e) => handleSelect(e.target.value)}>
            <MenuItem value="" disabled>Select a framework…</MenuItem>
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

  const pc = pageContent;
  const fw = selectedFramework || {};
  const ed = editMode; // shorthand used all over the JSX below

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f5f7" }}>
      {/* ── Sticky admin bar, WordPress-style ───────────────────────────── */}
      <Paper
        elevation={2}
        sx={{
          position: "sticky", top: 0, zIndex: 30, borderRadius: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 2, py: 1, gap: 2, flexWrap: "wrap",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="subtitle2" fontWeight={700} sx={{ whiteSpace: "nowrap" }}>
            Editing:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select value={selectedId} onChange={(e) => handleSelect(e.target.value)}>
              {frameworks.map((f) => (
                <MenuItem key={f.id} value={f.id}>{f.label || f.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Chip
            size="small"
            label={fw.pageContent ? "Published" : "Draft"}
            color={fw.pageContent ? "success" : "default"}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={ed ? "Switch to read-only preview" : "Switch to edit mode"}>
            <Button
              size="small"
              variant={ed ? "outlined" : "contained"}
              startIcon={ed ? <VisibilityIcon /> : <EditIcon />}
              onClick={() => setEditMode((v) => !v)}
            >
              {ed ? "Preview" : "Editing"}
            </Button>
          </Tooltip>
          <Tooltip title="Unpublish / clear page content">
            <IconButton color="error" onClick={handleClear}><ClearIcon /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </Stack>
      </Paper>

      {ed && (
        <Box sx={{
          px: 2, py: 1, bgcolor: "#eff6ff", borderBottom: "1px solid #bfdbfe",
          fontSize: 13, color: "#1e3a8a", display: "flex", alignItems: "center",
          gap: 1, flexWrap: "wrap",
        }}>
          <span style={{
            display: "inline-block", width: 14, height: 14, borderRadius: 3,
            border: "1.5px dashed #2563eb", flexShrink: 0,
          }} />
          <span>
            Anything with a dashed outline is editable — click it to type.
            Hover a card for a delete button. Dashed <b>+</b> tiles add new cards, stats, or bullet points.
          </span>
        </Box>
      )}

      {/* ── The actual page, editable in place ──────────────────────────── */}
      <div className="fw-root" style={{ "--fw-accent": "#6366f1" }}>
        <section className="fw-hero">
          <div className="fw-hero-inner">
            <div className="fw-hero-content">
              <EditableText tag="div" className="fw-badge" editable={ed} value={pc.heroBadgeText} placeholder="Badge text" onChange={(v) => set("heroBadgeText", v)} />
              <h2 className="fw-hero-title">
                <EditableText tag="span" editable={ed} value={pc.heroTitle} placeholder="Hero title" onChange={(v) => set("heroTitle", v)} />{" "}
                <EditableText tag="span" className="fw-highlight" editable={ed} value={pc.heroTitleHighlight} placeholder="highlighted words" onChange={(v) => set("heroTitleHighlight", v)} />
              </h2>
              <EditableText tag="p" className="fw-hero-desc" editable={ed} multiline value={pc.heroDescription} placeholder="Hero description" onChange={(v) => set("heroDescription", v)} />
              <div className="fw-hero-cta">
                {ed ? (
                  <div className="fw-btn-primary" style={{ cursor: "default" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                    <EditableText editable value={pc.heroPrimaryCtaText} placeholder="Get a demo" onChange={(v) => set("heroPrimaryCtaText", v)} />
                  </div>
                ) : (
                  <button className="fw-btn-primary" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                    {pc.heroPrimaryCtaText || "Get a demo"}
                  </button>
                )}
                <button className="fw-btn-secondary" disabled>Learn more</button>
              </div>

              <div className="fw-hero-stats">
                {(pc.heroStats || []).map((stat, i) => (
                  <EditableCardShell key={i} editable={ed} onRemove={() => removeListItem("heroStats", i)} className="fw-stat" style={{ padding: 6 }}>
                    <EditableText tag="span" className="fw-stat-value" editable={ed} value={stat.value} placeholder="93%" onChange={(v) => setListField("heroStats", i, "value", v)} />
                    <EditableText tag="span" className="fw-stat-label" editable={ed} value={stat.label} placeholder="Label" onChange={(v) => setListField("heroStats", i, "label", v)} />
                  </EditableCardShell>
                ))}
                {ed && (
                  <div style={{ minWidth: 90 }}>
                    <AddCardTile label="Add stat" minHeight={56} onClick={() => addListItem("heroStats", { label: "Label", value: "0" })} />
                  </div>
                )}
              </div>
            </div>

            <div className="fw-hero-visual">
              <div className="hero-sphere">
                <div className="hero-sphere-inner" />
                <div className="hero-sphere-badge">
                  <div className="hero-sphere-title">
                    {fw.label || fw.code}
                  </div>
                  <div className="hero-sphere-sub">
                    {fw.sub || fw.type || "Compliance Standard"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Overview ── */}
        <SectionShell
          ed={ed}
          title={pc.overviewTitle} onTitle={(v) => set("overviewTitle", v)}
          desc={pc.overviewDescription} onDesc={(v) => set("overviewDescription", v)}
        >
          <div className="fw-card-grid fw-card-grid-3">
            {(pc.overviewCards || []).map((card, i) => (
              <EditableCardShell key={i} editable={ed} onRemove={() => removeListItem("overviewCards", i)} className="fw-card">
                <div className="fw-card-icon"><EditableIcon editable={ed} value={card.icon} onChange={(v) => setListField("overviewCards", i, "icon", v)} /></div>
                <h3><EditableText editable={ed} value={card.title} placeholder="Title" onChange={(v) => setListField("overviewCards", i, "title", v)} /></h3>
                <EditableText tag="p" editable={ed} multiline value={card.description} placeholder="Description" onChange={(v) => setListField("overviewCards", i, "description", v)} />
              </EditableCardShell>
            ))}
            {ed && <AddCardTile label="Add card" onClick={() => addListItem("overviewCards", { icon: "Shield", title: "New card", description: "" })} />}
          </div>
        </SectionShell>

        {/* ── Clauses ── */}
        <SectionShell
          ed={ed} alt
          title={pc.clausesTitle} onTitle={(v) => set("clausesTitle", v)}
          desc={pc.clausesDescription} onDesc={(v) => set("clausesDescription", v)}
        >
          <div className="fw-card-grid fw-card-grid-3">
            {(pc.clauseCards || []).map((card, i) => (
              <EditableCardShell key={i} editable={ed} onRemove={() => removeListItem("clauseCards", i)} className="fw-clause-card">
                <EditableText tag="span" className="fw-clause-label" editable={ed} value={card.clauseLabel} placeholder="Clause 4" onChange={(v) => setListField("clauseCards", i, "clauseLabel", v)} />
                <h3><EditableText editable={ed} value={card.title} placeholder="Title" onChange={(v) => setListField("clauseCards", i, "title", v)} /></h3>
                <EditableText tag="p" editable={ed} multiline value={card.description} placeholder="Description" onChange={(v) => setListField("clauseCards", i, "description", v)} />
                <EditableBulletList editable={ed} items={card.bulletPoints || []} onChange={(bp) => setListField("clauseCards", i, "bulletPoints", bp)} />
              </EditableCardShell>
            ))}
            {ed && <AddCardTile label="Add clause" onClick={() => addListItem("clauseCards", { clauseLabel: "Clause", title: "New clause", description: "", bulletPoints: [] })} />}
          </div>
        </SectionShell>

        {/* ── Controls / Domains ── */}
        <SectionShell
          ed={ed}
          title={pc.controlsTitle} onTitle={(v) => set("controlsTitle", v)}
          desc={pc.controlsDescription} onDesc={(v) => set("controlsDescription", v)}
        >
          <div className="fw-card-grid fw-card-grid-auto">
            {(pc.domainCards || []).map((card, i) => (
              <EditableCardShell key={i} editable={ed} onRemove={() => removeListItem("domainCards", i)} className="fw-domain-card">
                <h4><EditableText editable={ed} value={card.domainTitle} placeholder="Domain title" onChange={(v) => setListField("domainCards", i, "domainTitle", v)} /></h4>
                <EditableText tag="p" editable={ed} multiline value={card.domainDescription} placeholder="Domain description" onChange={(v) => setListField("domainCards", i, "domainDescription", v)} />
                <EditableBulletList editable={ed} items={card.controls || []} addLabel="Add control" onChange={(c) => setListField("domainCards", i, "controls", c)} />
              </EditableCardShell>
            ))}
            {ed && <AddCardTile label="Add domain" onClick={() => addListItem("domainCards", { domainTitle: "New domain", domainDescription: "", controls: [] })} />}
          </div>
        </SectionShell>

        {/* ── Benefits ── */}
        <SectionShell
          ed={ed} alt
          title={pc.benefitsTitle} onTitle={(v) => set("benefitsTitle", v)}
          desc={pc.benefitsDescription} onDesc={(v) => set("benefitsDescription", v)}
        >
          <div className="fw-card-grid fw-card-grid-3">
            {(pc.benefitCards || []).map((card, i) => (
              <EditableCardShell key={i} editable={ed} onRemove={() => removeListItem("benefitCards", i)} className="fw-benefit-card">
                <div className="fw-benefit-icon"><EditableIcon editable={ed} value={card.icon} onChange={(v) => setListField("benefitCards", i, "icon", v)} /></div>
                <h3><EditableText editable={ed} value={card.title} placeholder="Title" onChange={(v) => setListField("benefitCards", i, "title", v)} /></h3>
                <EditableText tag="p" editable={ed} multiline value={card.description} placeholder="Description" onChange={(v) => setListField("benefitCards", i, "description", v)} />
              </EditableCardShell>
            ))}
            {ed && <AddCardTile label="Add benefit" onClick={() => addListItem("benefitCards", { icon: "Shield", title: "New benefit", description: "" })} />}
          </div>
        </SectionShell>

        {/* ── Implementation steps ── */}
        <SectionShell
          ed={ed}
          title={pc.stepsTitle} onTitle={(v) => set("stepsTitle", v)}
          desc={pc.stepsDescription} onDesc={(v) => set("stepsDescription", v)}
        >
          <div className="fw-card-grid fw-card-grid-3">
            {(pc.stepCards || []).map((card, i) => (
              <EditableCardShell key={i} editable={ed} onRemove={() => removeListItem("stepCards", i)} className="fw-step-card">
                <div className="fw-step-num">{card.stepNumber ?? i + 1}</div>
                <h3><EditableText editable={ed} value={card.title} placeholder="Title" onChange={(v) => setListField("stepCards", i, "title", v)} /></h3>
                <EditableText tag="p" editable={ed} multiline value={card.description} placeholder="Description" onChange={(v) => setListField("stepCards", i, "description", v)} />
                <EditableBulletList editable={ed} items={card.bulletPoints || []} onChange={(bp) => setListField("stepCards", i, "bulletPoints", bp)} />
              </EditableCardShell>
            ))}
            {ed && (
              <AddCardTile
                label="Add step"
                onClick={() => addListItem("stepCards", { stepNumber: (pc.stepCards?.length || 0) + 1, title: "New step", description: "", bulletPoints: [] })}
              />
            )}
          </div>
        </SectionShell>

        {/* ── CTA ── */}
        <section className="fw-section">
          <div className="fw-cta-box">
            <h2><EditableText editable={ed} value={pc.ctaTitle} placeholder="CTA title" onChange={(v) => set("ctaTitle", v)} /></h2>
            <EditableText tag="p" editable={ed} multiline value={pc.ctaDescription} placeholder="CTA description" onChange={(v) => set("ctaDescription", v)} />
            <div className="fw-cta-btns">
              <button className="fw-btn-primary" disabled>Get a demo</button>
              <button className="fw-btn-secondary" disabled>Talk to an expert</button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="fw-footer">
          <div className="fw-footer-inner">
            <div>
              <h4>CalVant</h4>
              <EditableText tag="p" editable={ed} value={pc.footerTagline} placeholder={`One platform to operationalize ${fw.name || ""}`} onChange={(v) => set("footerTagline", v)} />
            </div>
          </div>
          <div className="fw-footer-bottom">{fw.label || fw.name} · Made in India</div>
        </footer>
      </div>

      {/* ── Sticky save bar, mirrors the top bar so it's reachable from anywhere ── */}
      {ed && (
        <Paper elevation={4} sx={{ position: "sticky", bottom: 16, mx: 2, mb: 2, p: 1.5, display: "flex", justifyContent: "flex-end", gap: 2, borderRadius: 2 }}>
          <Button variant="outlined" color="error" startIcon={<ClearIcon />} onClick={handleClear}>Unpublish</Button>
          <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            {saving ? <><CircularProgress size={18} sx={{ mr: 1 }} color="inherit" />Saving…</> : "Save page content"}
          </Button>
        </Paper>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

// ── Shared section header + body wrapper (title/description editable) ─────
const SectionShell = ({ ed, alt, title, onTitle, desc, onDesc, children }) => (
  <section className={`fw-section${alt ? " fw-section-alt" : ""}`}>
    <div className="fw-section-header">
      <h2><EditableText editable={ed} value={title} placeholder="Section title" onChange={onTitle} /></h2>
      <EditableText tag="p" editable={ed} multiline value={desc} placeholder="Section description" onChange={onDesc} />
    </div>
    {children}
  </section>
);

// ── Helpers ─────────────────────────────────────────────────────────────
function getBlankPageContent() {
  return {
    heroBadgeText: "", heroTitle: "", heroTitleHighlight: "", heroDescription: "",
    heroPrimaryCtaText: "Get a demo", heroScrollTarget: "overview", heroStats: [],
    overviewTitle: "", overviewDescription: "", overviewCards: [],
    clausesTitle: "", clausesDescription: "", clauseCards: [],
    controlsTitle: "", controlsDescription: "", domainCards: [],
    benefitsTitle: "", benefitsDescription: "", benefitCards: [],
    stepsTitle: "", stepsDescription: "", stepCards: [],
    ctaTitle: "", ctaDescription: "", footerTagline: "",
  };
}

export default FrameworkContentEditor;