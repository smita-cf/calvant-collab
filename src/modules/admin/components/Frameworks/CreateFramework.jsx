'use client'

import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Box, Button, TextField, Typography, CircularProgress,
  MenuItem, Paper, IconButton, Alert, Chip, Divider, Popover,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://api.calvant.com";
const FRAMEWORK_URL = `${API_BASE}/framework/api/frameworks`;

const FRAMEWORK_TYPES = ["Standard", "Regulation", "Framework", "Guideline"];
const RISK_TYPE_OPTIONS = ["Security", "Cyber", "Privacy", "Fraud", "Artificial Intelligence"];

const COMMON_FRAMEWORKS = [
  {
    code: "ISO27001", name: "ISO/IEC 27001", version: "2022", type: "Standard",
    label: "ISO 27001", color: "#0066cc", path: "/iso-27001",
    sub: "Information Security", description: "Information Security Management",
    riskTypes: ["Security", "Cyber", "Fraud"], annexSectionTypes: ["ANNEX_A"],
    isMapped: false, mappingSources: [],
  },
  {
    code: "ISO27701", name: "ISO/IEC 27701", version: "2019", type: "Standard",
    label: "ISO 27701", color: "#00a3ff", path: "/iso-27701",
    sub: "Privacy", description: "Privacy Information Management",
    riskTypes: ["Privacy"], annexSectionTypes: ["Annex_A", "Annex_B", "Annex_A_Security"],
    isMapped: false, mappingSources: [],
  },
  {
    code: "ISO42001", name: "ISO/IEC 42001", version: "2023", type: "Standard",
    label: "ISO 42001", color: "#10b981", path: "/iso-42001",
    sub: "AI Management", description: "AI Management System",
    riskTypes: ["Artificial Intelligence"], annexSectionTypes: ["ANNEX_A", "ANNEX_B", "CORE"],
    isMapped: false, mappingSources: [],
  },
  {
    code: "SOC2", name: "SOC 2", version: "2017", type: "Standard",
    label: "SOC 2", color: "#ff9900", path: "/soc-2",
    sub: "Trust Services", description: "Trust Services Criteria",
    riskTypes: ["Security", "Cyber", "Privacy"], annexSectionTypes: ["COMMON_CRITERIA", "ADDITIONAL_CRITERIA"],
    isMapped: true, mappingSources: ["ISO27001", "ISO27701"],
  },
  {
    code: "GDPR", name: "General Data Protection Regulation", version: "2018", type: "Regulation",
    label: "GDPR", color: "#1078b9", path: "/gdpr",
    sub: "Global Data Protection Regulation", description: "General Data Protection Regulation",
    riskTypes: ["Privacy"], annexSectionTypes: [],
    isMapped: true, mappingSources: ["ISO27701", "KSA_PDPL", "SOC2", "ISO27001"],
  },
  {
    code: "KSA_PDPL", name: "KSA Personal Data Protection Law", version: "2021", type: "Regulation",
    label: "KSA PDPL", color: "#1078b9", path: "/ksa-pdpl",
    sub: "Saudi Data Protection", description: "Personal Data Protection Law",
    riskTypes: ["Privacy"], annexSectionTypes: ["GENERAL_PROVISIONS"],
    isMapped: true, mappingSources: ["ISO27001", "ISO27701", "SOC2"],
  },
  {
    code: "DPDPA", name: "Digital Personal Data Protection Act", version: "2023", type: "Regulation",
    label: "DPDPA", color: "#ff6b35", path: "/dpdpa",
    sub: "India Data Protection", description: "Digital Personal Data Protection Act, 2023",
    riskTypes: ["Privacy"], annexSectionTypes: ["OBLIGATIONS", "RIGHTS", "COMPLIANCE"],
    isMapped: true, mappingSources: ["ISO27701"],
  },
  {
    code: "DUBAI_ISR", name: "The Information Security Regulation", version: "3.1", type: "Regulation",
    label: "DUBAI ISR", color: "#a1ff35", path: "/isr",
    sub: "Dubai Information Security Regulation", description: "Information Security Regulation",
    riskTypes: ["Security"], annexSectionTypes: ["OBLIGATIONS", "RIGHTS", "COMPLIANCE"],
    isMapped: true, mappingSources: ["ISO27001", "SOC2", "ISO27701"],
  },
  {
    code: "NIST_CSF2", name: "National Institute of Standards and Technology Cybersecurity Framework", version: "2", type: "Guideline",
    label: "NIST CSF 2", color: "#7c3aed", path: "/nist-csf-2",
    sub: "Cybersecurity Framework", description: "NIST Cybersecurity Framework",
    riskTypes: ["Security", "Cyber"], annexSectionTypes: ["GOVERN", "IDENTIFY", "PROTECT", "DETECT", "RESPOND", "RECOVER"],
    isMapped: true, mappingSources: ["ISO27001", "SOC2", "DUBAI_ISR"],
  },
  {
    code: "HIPPA", name: "Health Insurance Portability and Accountability Act", version: "2024", type: "Regulation",
    label: "HIPAA", color: "#e11d48", path: "/hipaa",
    sub: "US Health Data", description: "Health Insurance Portability and Accountability Act",
    riskTypes: ["Privacy", "Security"], annexSectionTypes: ["PRIVACY_RULE", "SECURITY_RULE", "BREACH_NOTIFICATION"],
    isMapped: true, mappingSources: ["ISO27001", "SOC2", "NIST_CSF2"],
  },
];

const EMPTY_FORM = {
  code: "", name: "", version: "", type: "Standard",
  label: "", color: "#0066cc", path: "",
  sub: "", description: "",
  riskTypes: [],
  annexSectionTypes: "",
  isMapped: false,
  mappingSources: "",
};

// ─── Colour Wheel Picker ─────────────────────────────────────────────────────

function ColorWheelPicker({ color, onChange }) {
  const wheelRef   = useRef(null);
  const sliderRef  = useRef(null);
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const draggingWheel  = useRef(false);
  const draggingSlider = useRef(false);

  // keep internal hsv in sync when color prop changes from outside (presets)
  useEffect(() => { setHsv(hexToHsv(color)); }, [color]);

  function hexToHsv(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }
    return { h, s: max ? d / max : 0, v: max };
  }

  function hsvToHex({ h, s, v }) {
    const f = (n) => {
      const k = (n + h / 60) % 6;
      return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    };
    const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
    return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
  }

  function hsvToWheelXY(h, s, size) {
    const r = (size / 2) * s;
    const angle = (h - 90) * (Math.PI / 180);
    return {
      x: size / 2 + r * Math.cos(angle),
      y: size / 2 + r * Math.sin(angle),
    };
  }

  function wheelXYToHs(x, y, size) {
    const cx = x - size / 2, cy = y - size / 2;
    const r  = Math.sqrt(cx * cx + cy * cy);
    const maxR = size / 2;
    const s  = Math.min(r / maxR, 1);
    let h = Math.atan2(cy, cx) * (180 / Math.PI) + 90;
    if (h < 0) h += 360;
    return { h: Math.round(h), s };
  }

  const WHEEL_SIZE  = 200;
  const SLIDER_W    = 200;
  const SLIDER_H    = 16;

  function getWheelPos(e) {
    const rect = wheelRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function handleWheelInteract(e) {
    const { x, y } = getWheelPos(e);
    const { h, s } = wheelXYToHs(x, y, WHEEL_SIZE);
    const next = { ...hsv, h, s };
    setHsv(next);
    onChange(hsvToHex(next));
  }

  function handleSliderInteract(e) {
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const v = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const next = { ...hsv, v };
    setHsv(next);
    onChange(hsvToHex(next));
  }

  useEffect(() => {
    const up = () => { draggingWheel.current = false; draggingSlider.current = false; };
    const move = (e) => {
      if (draggingWheel.current)  handleWheelInteract(e);
      if (draggingSlider.current) handleSliderInteract(e);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",   up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend",  up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup",   up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend",  up);
    };
  });

  const thumbPos  = hsvToWheelXY(hsv.h, hsv.s, WHEEL_SIZE);
  const pureHue   = hsvToHex({ h: hsv.h, s: 1, v: 1 });
  const sliderThumbX = hsv.v * SLIDER_W;

  const handleHexInput = (e) => {
    const val = e.target.value;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setHsv(hexToHsv(val));
      onChange(val);
    } else {
      onChange(val); // let the text field update freely while typing
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "center", p: 1.5 }}>

      {/* Colour wheel canvas */}
      <Box
        ref={wheelRef}
        onMouseDown={(e) => { draggingWheel.current = true; handleWheelInteract(e); }}
        onTouchStart={(e) => { draggingWheel.current = true; handleWheelInteract(e); }}
        sx={{ position: "relative", width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: "50%", cursor: "crosshair", userSelect: "none", flexShrink: 0 }}
      >
        {/* Hue ring */}
        <Box sx={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
        }} />
        {/* Saturation mask (white centre fade) */}
        <Box sx={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(circle, white, transparent)`,
        }} />
        {/* Value (brightness) overlay */}
        <Box sx={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `rgba(0,0,0,${1 - hsv.v})`,
        }} />
        {/* Thumb */}
        <Box sx={{
          position: "absolute",
          left: thumbPos.x - 8, top: thumbPos.y - 8,
          width: 16, height: 16, borderRadius: "50%",
          border: "2.5px solid white",
          boxShadow: "0 0 0 1.5px rgba(0,0,0,0.4)",
          background: color,
          pointerEvents: "none",
        }} />
      </Box>

      {/* Brightness slider */}
      <Box
        ref={sliderRef}
        onMouseDown={(e) => { draggingSlider.current = true; handleSliderInteract(e); }}
        onTouchStart={(e) => { draggingSlider.current = true; handleSliderInteract(e); }}
        sx={{
          position: "relative", width: SLIDER_W, height: SLIDER_H,
          borderRadius: SLIDER_H / 2, cursor: "ew-resize", userSelect: "none",
          background: `linear-gradient(to right, #000, ${pureHue})`,
          border: "0.5px solid rgba(0,0,0,0.15)",
        }}
      >
        <Box sx={{
          position: "absolute",
          left: sliderThumbX - 10, top: -3,
          width: 22, height: 22, borderRadius: "50%",
          border: "2.5px solid white",
          boxShadow: "0 0 0 1.5px rgba(0,0,0,0.35)",
          background: color,
          pointerEvents: "none",
        }} />
      </Box>

      {/* Hex input + swatch */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: SLIDER_W }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 1,
          background: color, border: "0.5px solid rgba(0,0,0,0.2)", flexShrink: 0,
        }} />
        <TextField
          size="small"
          value={color}
          onChange={handleHexInput}
          inputProps={{ maxLength: 7, style: { fontFamily: "monospace", fontSize: 13 } }}
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function CreateFramework() {
  const navigate = useHistory();
  const [form, setForm]         = useState(EMPTY_FORM);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);
  const [colorAnchor, setColorAnchor] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleRiskType = (rt) =>
    setForm((prev) => ({
      ...prev,
      riskTypes: prev.riskTypes.includes(rt)
        ? prev.riskTypes.filter((r) => r !== rt)
        : [...prev.riskTypes, rt],
    }));

  const applyPreset = (preset) => {
    setForm({
      ...preset,
      annexSectionTypes: (preset.annexSectionTypes ?? []).join(", "),
      mappingSources:    (preset.mappingSources    ?? []).join(", "),
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setError("Framework Code and Name are required.");
      return;
    }
    const splitCSV = (str) =>
      str.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        code:              form.code.trim().toUpperCase(),
        name:              form.name.trim(),
        version:           form.version.trim(),
        type:              form.type,
        label:             form.label.trim() || form.code.trim().toUpperCase(),
        color:             form.color,
        path:              form.path.trim() || `/${form.code.trim().toLowerCase()}`,
        sub:               form.sub.trim(),
        description:       form.description.trim(),
        riskTypes:         form.riskTypes,
        annexSectionTypes: splitCSV(form.annexSectionTypes),
        isMapped:          form.isMapped,
        mappingSources:    splitCSV(form.mappingSources),
      };
      await axios.post(FRAMEWORK_URL, payload);
      setSuccess(`Framework "${payload.code}" created successfully.`);
      setForm(EMPTY_FORM);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "Create failed.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 820, margin: "auto" }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate.push(-1)} size="small"><ArrowBackIcon /></IconButton>
        <AccountTreeIcon sx={{ color: "primary.main", fontSize: 28 }} />
        <Typography variant="h4" fontWeight={800}>Create Framework</Typography>
      </Box>

      {/* Presets */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}
          sx={{ mb: 1.5, display: "block", textTransform: "uppercase", letterSpacing: 0.8 }}>
          Quick Presets — fills all fields automatically
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {COMMON_FRAMEWORKS.map((fw) => (
            <Chip key={fw.code} label={fw.code} size="small" variant="outlined" clickable
              onClick={() => applyPreset(fw)}
              sx={{
                fontWeight: 600, fontSize: "0.72rem",
                "&:hover": { bgcolor: "primary.main", color: "white", borderColor: "primary.main" },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Form */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
        {error   && <Alert severity="error"   sx={{ mb: 2.5 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* ── Core Identity ── */}
          <Typography variant="overline" color="text.secondary" fontWeight={700}>Core Identity</Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Framework Code *" placeholder="e.g. ISO27001"
              value={form.code} onChange={handleChange("code")} fullWidth
              inputProps={{ style: { textTransform: "uppercase" } }}
              helperText="Unique identifier, uppercase."
            />
            <TextField
              label="Version" placeholder="e.g. 2022"
              value={form.version} onChange={handleChange("version")}
              sx={{ minWidth: 140 }}
            />
          </Box>

          <TextField
            label="Framework Name *"
            placeholder="e.g. ISO/IEC 27001 — Information Security Management"
            value={form.name} onChange={handleChange("name")} fullWidth
          />

          <TextField select label="Type" value={form.type} onChange={handleChange("type")} fullWidth>
            {FRAMEWORK_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>

          <Divider />

          {/* ── Display Config ── */}
          <Typography variant="overline" color="text.secondary" fontWeight={700}>Display Config</Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField
              label="Label" placeholder="e.g. ISO 27001"
              value={form.label} onChange={handleChange("label")} fullWidth
              helperText="Short display name shown in the UI."
            />

            {/* Colour picker trigger */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 160 }}>
              <Typography variant="caption" color="text.secondary" sx={{ pl: 0.25 }}>
                Colour
              </Typography>
              <Box
                onClick={(e) => setColorAnchor(e.currentTarget)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1.5,
                  px: 1.5, py: 1, borderRadius: 1, cursor: "pointer",
                  border: "1px solid", borderColor: "divider",
                  "&:hover": { borderColor: "text.primary" },
                  transition: "border-color 0.15s",
                }}
              >
                <Box sx={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: form.color,
                  border: "0.5px solid rgba(0,0,0,0.2)",
                  flexShrink: 0,
                }} />
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 13 }}>
                  {form.color}
                </Typography>
              </Box>

              <Popover
                open={Boolean(colorAnchor)}
                anchorEl={colorAnchor}
                onClose={() => setColorAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" } }}
              >
                <ColorWheelPicker
                  color={/^#[0-9a-fA-F]{6}$/.test(form.color) ? form.color : "#0066cc"}
                  onChange={(c) => setForm((prev) => ({ ...prev, color: c }))}
                />
              </Popover>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Route Path" placeholder="e.g. /iso-27001"
              value={form.path} onChange={handleChange("path")} fullWidth
              helperText="Auto-derived from code if left blank."
            />
            <TextField
              label="Sub-label" placeholder="e.g. Information Security"
              value={form.sub} onChange={handleChange("sub")} fullWidth
            />
          </Box>

          <TextField
            label="Description" placeholder="e.g. Information Security Management"
            value={form.description} onChange={handleChange("description")} fullWidth
          />

          <Divider />

          {/* ── Risk & Mapping ── */}
          <Typography variant="overline" color="text.secondary" fontWeight={700}>Risk Types</Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {RISK_TYPE_OPTIONS.map((rt) => (
              <Chip key={rt} label={rt} size="small" clickable
                onClick={() => toggleRiskType(rt)}
                color={form.riskTypes.includes(rt) ? "primary" : "default"}
                variant={form.riskTypes.includes(rt) ? "filled" : "outlined"}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>

          <TextField
            label="Annex / Section Types" placeholder="e.g. ANNEX_A, ANNEX_B, CORE"
            value={form.annexSectionTypes} onChange={handleChange("annexSectionTypes")} fullWidth
            helperText="Comma-separated. Stored as an array."
          />

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="Mapping Sources" placeholder="e.g. ISO27001, SOC2"
              value={form.mappingSources} onChange={handleChange("mappingSources")} fullWidth
              helperText="Comma-separated framework codes this maps from."
            />
            <TextField
              select label="Is Mapped?"
              value={form.isMapped}
              onChange={(e) => setForm((p) => ({ ...p, isMapped: e.target.value === "true" }))}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
            </TextField>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1 }}>
            <Button variant="outlined" onClick={() => navigate.push(-1)} disabled={loading}>Cancel</Button>
            <Button
              variant="contained" onClick={handleSubmit} disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ minWidth: 160 }}
            >
              {loading ? "Creating…" : "Create Framework"}
            </Button>
          </Box>

        </Box>
      </Paper>
    </Box>
  );
}