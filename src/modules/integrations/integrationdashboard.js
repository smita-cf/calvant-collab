import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CircularProgress,
  Snackbar,
  SnackbarContent,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
  Box,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  CloudDownload as CloudSyncIcon,
  Functions as FunctionsIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Security as SecurityIcon,
  VpnKey as PrivacyTipIcon,
  VerifiedUser as Soc2Icon,
  Apps as AppsIcon,
  Description as DescriptionIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@material-ui/icons";
import { ChevronDown, ClipboardList, Brain, Table2Icon } from "lucide-react";
import Evidence_Modal from "./evidencemodal";
import taskService from "../taskManagement/services/taskService";
import documentationService from "../documentation/services/documentationService";
import { useFramework } from "../../context/FrameworkContex";
import ComplianceCapSpreadsheet from "./ComplianceCapSpreadsheet";
import { useSearchParams } from "next/navigation";

const MAPPINGS_API = "https://api.calvant.com/framework/api/mappings/framework";
const CONTROLS_API = "https://api.calvant.com/framework/api/controls/framework";

const ALL_FRAMEWORKS_OPTION = "ALL";

const extractArticleKey = (code = "") => {
  const s = String(code).trim();
  // Capture: Article-<digits> + optional (digits) + optional (letter)
  // Stops before any trailing "-Word" descriptor suffix
  const match = s.match(/^(Article-\d+(?:\(\d+\))?(?:\([a-z]\))?)/i);
  if (match) return match[1].toUpperCase();
  // Fallback for non-Article codes
  return s.toUpperCase().replace(/[^A-Z0-9()]/g, "");
};
// ─── Pure helpers ─────────────────────────────────────────────────────────────

const formatPercentage = (value) => {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "number" ? value : parseFloat(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

// Mirrors the emptiness rules used by Evidence_Modal's normalise(): a piece of
// evidence "has data" if it is a non-empty string/array/object, OR a bare
// number/boolean — including 0 and false, which are legitimate results and
// were previously treated as falsy ("no evidence") due to a `!evidence` check.
const hasEvidence = (evidence) => {
  if (evidence === null || evidence === undefined || evidence === "") return false;
  if (typeof evidence === "number" || typeof evidence === "boolean") return true;
  if (typeof evidence === "string") {
    try {
      const parsed = JSON.parse(evidence);
      return hasEvidence(parsed);
    } catch {
      // Any non-empty string is real evidence (including error/status strings —
      // those are still shown, just rendered as an error card in the modal
      // rather than being hidden from the eye icon entirely).
      return evidence.trim().length > 0;
    }
  }
  if (Array.isArray(evidence)) return evidence.length > 0;
  if (typeof evidence === "object") return Object.keys(evidence).length > 0;
  return false;
};

function naturalSortKey(code = "") {
  return code
    .split(/(\d+)/)
    .map((p) => (p !== "" && !isNaN(p) ? p.padStart(8, "0") : p.toLowerCase()))
    .join("");
}

const SOC2_PREFIX_ORDER = ["CC", "A", "C", "PI", "P"];
function soc2SortKey(code = "") {
  const upper = code.trim().toUpperCase();
  const prefix = (upper.match(/^([A-Z]+)/) || ["", ""])[1];
  const idx = SOC2_PREFIX_ORDER.indexOf(prefix);
  return (
    (idx >= 0 ? String(idx).padStart(2, "0") : "99") + naturalSortKey(code)
  );
}

function unifiedIdSortKey(uid = "") {
  const match = uid.match(/^([A-Za-z]+)-(\d+)$/);
  if (match) {
    return `${match[1].toLowerCase()}:${match[2].padStart(10, "0")}`;
  }
  return uid.toLowerCase();
}

function frameworkSortKey(code = "", fw = "") {
  if (fw === "KSA_PDPL") {
    const match = code.match(/Article-(\d+)/i);
    return match
      ? `article:${match[1].padStart(6, "0")}`
      : `article:${code.toLowerCase()}`;
  }
  const c = code.trim().toUpperCase();
  if (fw === "SOC2") return soc2SortKey(c);
  const isAnnex = c.startsWith("A.");
  const isNumeric = /^\d+(\.\d+)*$/.test(c);
  let bucket;
  if (isNumeric) bucket = "0";
  else if (isAnnex) bucket = "1";
  else bucket = "2";
  let normalized;
  if (isNumeric) {
    normalized = c
      .split(".")
      .map((n) => n.padStart(5, "0"))
      .join(".");
  } else if (isAnnex) {
    normalized = c
      .replace("A.", "")
      .split(".")
      .map((n) => n.padStart(5, "0"))
      .join(".");
  } else {
    normalized = c;
  }
  return `${bucket}:${normalized}`;
}

// Strip leading "A." annex prefix — module-level, never attached to fw objects
const toBareCode = (c) => (c?.startsWith("A.") ? c.substring(2) : c);

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusDot = ({ status }) => {
  const config = {
    connected: { color: "#1976d2" },
    mapped: { color: "#2e7d32" },
    disconnected: { color: "#f44336" },
  }[status] || { color: "#e0e0e0" };
  const isSolid = status === "connected" || status === "mapped";
  return (
    <Box
      style={{
        width: 11,
        height: 11,
        borderRadius: "50%",
        backgroundColor: isSolid ? config.color : "transparent",
        border: isSolid ? "none" : `2.5px solid ${config.color}`,
        display: "inline-block",
        flexShrink: 0,
        cursor: "default",
      }}
    />
  );
};

// Derive icon for a framework from its metadata — no hardcoded code checks
const FrameworkIcon = ({ fw, size = 18 }) => {
  const riskTypes = fw?.riskTypes || [];
  if (riskTypes.includes("Privacy"))
    return <PrivacyTipIcon style={{ fontSize: size }} />;
  if (riskTypes.includes("Artificial Intelligence"))
    return <Brain size={size} />;
  if (riskTypes.includes("Trust Services"))
    return <Soc2Icon style={{ fontSize: size }} />;
  return <SecurityIcon style={{ fontSize: size }} />;
};

// Build the framework dropdown options dynamically
const getFrameworkOptions = (availableFrameworks) => [
  {
    code: ALL_FRAMEWORKS_OPTION,
    label: "All Frameworks",
    description: "Unified view across all frameworks",
    color: "#334155",
    bg: "#f1f5f9",
    icon: <AppsIcon style={{ fontSize: 18 }} />,
  },
  ...(availableFrameworks || []).map((fw) => ({
    code: fw.code,
    label: fw.label,
    description: fw.description || fw.sub || fw.label,
    color: fw.color || "#1565c0",
    bg: (fw.color || "#1565c0") + "15",
    icon: <FrameworkIcon fw={fw} size={18} />,
  })),
];

const getFrameworkStyle = (fwCode, availableFrameworks) => {
  const fw = availableFrameworks?.find((f) => f.code === fwCode);
  if (!fw)
    return {
      bg: "#f1f5f9",
      border: "#cbd5e1",
      color: "#475569",
      label: fwCode,
    };
  return {
    bg: fw.color + "15",
    border: fw.color + "40",
    color: fw.color,
    label: fw.label,
  };
};

const MappedSourceBadge = ({
  sourceCode,
  sourceFramework,
  availableFrameworks,
}) => {
  const style = getFrameworkStyle(sourceFramework, availableFrameworks);
  const fw = availableFrameworks?.find((f) => f.code === sourceFramework);
  const isPrivacy = fw?.riskTypes?.includes("Privacy");
  return (
    <Box
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 6px",
        borderRadius: 4,
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      {isPrivacy ? (
        <PrivacyTipIcon style={{ fontSize: 9, color: style.color }} />
      ) : (
        <SecurityIcon style={{ fontSize: 9, color: style.color }} />
      )}
      <Typography
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: style.color,
          whiteSpace: "nowrap",
        }}
      >
        {sourceCode}
      </Typography>
    </Box>
  );
};

const FrameworkBadge = ({ frameworkCode, availableFrameworks }) => {
  const style = getFrameworkStyle(frameworkCode, availableFrameworks);
  if (!style) return null;
  return (
    <Box
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 7px",
        borderRadius: 5,
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        flexShrink: 0,
      }}
    >
      <Typography
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: style.color,
          letterSpacing: "0.02em",
        }}
      >
        {style.label}
      </Typography>
    </Box>
  );
};

const PdfPreviewModal = ({ open, onClose, pdfUrl, fileName }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="lg"
    fullWidth
    PaperProps={{ style: { borderRadius: 12, height: "90vh" } }}
  >
    <DialogTitle
      style={{
        padding: "16px 24px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box display="flex" alignItems="center" style={{ gap: 10 }}>
        <PdfIcon style={{ color: "#d32f2f", fontSize: 22 }} />
        <Typography style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
          {fileName || "Evidence Document"}
        </Typography>
      </Box>
      <IconButton size="small" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent style={{ padding: 0, display: "flex", flex: 1 }}>
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="PDF Preview"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            minHeight: 600,
          }}
        />
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ width: "100%", height: 400 }}
        >
          <CircularProgress />
        </Box>
      )}
    </DialogContent>
    <DialogActions
      style={{ padding: "12px 24px", borderTop: "1px solid #e2e8f0" }}
    >
      <Button
        onClick={onClose}
        variant="outlined"
        style={{ borderRadius: 8, textTransform: "none", fontWeight: 600 }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

const ManualUploadCell = ({
  controlId,
  onUpload,
  uploadedFileName,
  uploadedFileId,
  isUploading,
  onViewFile,
}) => {
  const inputRef = React.useRef();
  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      onUpload(controlId, null, "Only PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onUpload(controlId, null, "File size exceeds 10MB limit");
      return;
    }
    await onUpload(controlId, file, null);
  };
  return (
    <Box display="flex" alignItems="center" style={{ gap: 4 }}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={handleChange}
        disabled={isUploading}
      />
      <Tooltip
        title={
          uploadedFileName
            ? `Re-upload (current: ${uploadedFileName})`
            : "Upload PDF evidence"
        }
        arrow
      >
        <span>
          <IconButton
            size="small"
            onClick={() => !isUploading && inputRef.current?.click()}
            disabled={isUploading}
            style={{
              backgroundColor: uploadedFileName ? "#e8f5e9" : "#f3e5f5",
              color: uploadedFileName ? "#388e3c" : "#9c27b0",
              width: 32,
              height: 32,
            }}
          >
            {isUploading ? (
              <CircularProgress size={14} style={{ color: "#9c27b0" }} />
            ) : (
              <AttachFileIcon style={{ fontSize: 16 }} />
            )}
          </IconButton>
        </span>
      </Tooltip>
      {uploadedFileId && (
        <Tooltip title={`View: ${uploadedFileName}`} arrow>
          <IconButton
            size="small"
            onClick={() =>
              onViewFile(controlId, uploadedFileId, uploadedFileName)
            }
            style={{
              backgroundColor: "#e3f2fd",
              color: "#0288d1",
              width: 32,
              height: 32,
            }}
          >
            <PdfIcon style={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

const TargetScoreCell = ({
  controlId,
  tenantId,
  frameworkCode,
  targetScore,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleClick = () => {
    setInputValue(
      targetScore !== null && targetScore !== undefined
        ? String(targetScore)
        : "",
    );
    setEditing(true);
  };
  const handleSave = async () => {
    const numeric = parseFloat(inputValue);
    if (isNaN(numeric) || numeric < 0 || numeric > 100) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `https://api.calvant.com/compliance-brain/compliance/${tenantId}/${frameworkCode}/${controlId}/target-score`,
        { targetScore: numeric },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      onSave(controlId, numeric);
    } catch (err) {
      console.error("Failed to save target score", err);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (saving) return <CircularProgress size={18} />;
  if (editing)
    return (
      <TextField
        type="number"
        size="small"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setEditing(false);
        }}
        autoFocus
        inputProps={{
          min: 0,
          max: 100,
          step: 0.01,
          style: { textAlign: "center", width: 65 },
        }}
      />
    );
  if (targetScore !== null && targetScore !== undefined)
    return (
      <Chip
        label={`${formatPercentage(targetScore)}%`}
        color="primary"
        size="small"
        onClick={handleClick}
        style={{ fontWeight: 600, cursor: "pointer" }}
      />
    );
  return (
    <Chip
      label="Set target"
      size="small"
      onClick={handleClick}
      style={{
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 11,
        backgroundColor: "#f1f5f9",
        color: "#64748b",
        border: "1px dashed #94a3b8",
      }}
    />
  );
};

function AddTaskModal({
  controlId,
  controlName,
  auditors,
  onClose,
  onCreated,
}) {
  const rawUser = sessionStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const orgId = user?.organization?._id || user?.organization || "";
  const changedBy = user?.name || user?.username || "System";
  const reporterId = user?.id || user?._id || "";

  const [form, setForm] = useState({
    description: controlName ? "CAP: " + controlName.slice(0, 80) : "",
    assignee: "",
    assigneeId: "",
    priority: "Medium",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "To-Do",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }
    setSaving(true);
    setError("");
    const assignedAuditor = auditors.find((a) => a.name === form.assignee);
    const employeeId =
      form.assigneeId || assignedAuditor?.id || assignedAuditor?._id || null;
    const employeeName = form.assignee || changedBy;
    const finalEmployeeId = !form.assignee ? reporterId || null : employeeId;
    const payload = {
      description: form.description.trim(),
      employee: employeeName,
      employeeId: finalEmployeeId,
      employeeName,
      employeeEmail: assignedAuditor?.email || user?.email || "",
      reporter: changedBy,
      reporterId: reporterId || null,
      reporterEmail: user?.email || "",
      priority: form.priority,
      startDate: form.startDate,
      endDate: form.endDate || null,
      status: form.status,
      organization: orgId,
      department: user?.department?.[0] || user?.department || "",
      source: "Compliance",
      controlId,
    };
    taskService
      .saveTask(payload, changedBy)
      .then(() => {
        setSaving(false);
        if (onCreated) onCreated();
        onClose();
      })
      .catch((err) => {
        setError(err.message || "Failed to create task.");
        setSaving(false);
      });
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 1300,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const boxStyle = {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 520,
    boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    overflow: "hidden",
  };
  const field = { display: "flex", flexDirection: "column", gap: 5 };
  const lbl = {
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
  const inp = {
    padding: "9px 12px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    background: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box",
    width: "100%",
  };
  const sel = { ...inp, cursor: "pointer", appearance: "none" };

  return (
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={boxStyle}>
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b, #312e81)",
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ClipboardList size={18} color="#818cf8" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                Create Corrective Action Task
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                Control:{" "}
                <span style={{ color: "#c7d2fe", fontWeight: 700 }}>
                  {controlId}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: 18,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={field}>
            <label style={lbl}>
              Description <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe the corrective action..."
              style={{ ...inp, resize: "vertical" }}
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={field}>
              <label style={lbl}>Assign To</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.assignee}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const selectedAuditor = auditors.find(
                      (a) => a.name === selectedName,
                    );
                    setForm((p) => ({
                      ...p,
                      assignee: selectedName,
                      assigneeId:
                        selectedAuditor?.id || selectedAuditor?._id || "",
                    }));
                  }}
                  style={sel}
                >
                  <option value="">Self ({changedBy})</option>
                  {auditors.map((a) => (
                    <option key={a.id || a._id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  color="#94a3b8"
                  style={{
                    position: "absolute",
                    right: 9,
                    top: 11,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
            <div style={field}>
              <label style={lbl}>Priority</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, priority: e.target.value }))
                  }
                  style={sel}
                >
                  {["Critical", "High", "Medium", "Low"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  color="#94a3b8"
                  style={{
                    position: "absolute",
                    right: 9,
                    top: 11,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
            <div style={field}>
              <label style={lbl}>Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
                style={inp}
              />
            </div>
            <div style={field}>
              <label style={lbl}>Due Date</label>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
                style={inp}
              />
            </div>
          </div>
          {error && (
            <div
              style={{
                padding: "8px 12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                fontSize: 13,
                color: "#991b1b",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}
        </div>
        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            background: "#f8fafc",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "none",
              background: saving ? "#94a3b8" : "#4f46e5",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ClipboardList size={13} />
            {saving ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const RiskAssessmentTable = () => {
  // ── 1. Context — must come before any useMemo that references availableFrameworks
  const { selectedFrameworks, isAllSelected, availableFrameworks } =
    useFramework();

  // ── 2. Derive active framework from context selection ────────────────────────
  const normalizeFw = (raw) => {
    const trimmed = (raw || "").trim();
    const ALIASES = {
      "ISO 27001": "ISO27001",
      "ISO 27701": "ISO27701",
      "ISO 42001": "ISO42001",
      "SOC 2": "SOC2",
      SOC2: "SOC2",
      "KSA PDPL": "KSA_PDPL",
      KSA_PDPL: "KSA_PDPL",
      ISO27001: "ISO27001",
      ISO27701: "ISO27701",
      ISO42001: "ISO42001",
    };
    const upper = trimmed.toUpperCase();
    for (const [alias, key] of Object.entries(ALIASES)) {
      if (alias.toUpperCase() === upper) return key;
    }
    return upper.replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "");
  };

  const normalizedSelected = selectedFrameworks.map(normalizeFw);
  const isMultiSelect = isAllSelected || normalizedSelected.length > 1;
  const isAllFrameworks = isMultiSelect;

  // Default to first available framework's code, never a hardcoded string
  const activeFramework = isMultiSelect
    ? ALL_FRAMEWORKS_OPTION
    : normalizedSelected[0] || availableFrameworks[0]?.code || "";

  // ── 3. Dynamic state — keys seeded from availableFrameworks ─────────────────
  //    Initialised once; new frameworks added to FRAMEWORK_CONFIG are picked up
  //    automatically because availableFrameworks drives everything.

  const [controlLibraries, setControlLibraries] = useState({});
  const [controlsLoading, setControlsLoading] = useState({});
  const [apiDataMap, setApiDataMap] = useState({});

  // Seed the three maps whenever availableFrameworks changes (e.g. after initial load)
  useEffect(() => {
    if (availableFrameworks.length === 0) return;
    setControlLibraries((prev) => {
      const next = { ...prev };
      availableFrameworks.forEach((fw) => {
        if (!(fw.code in next)) next[fw.code] = [];
      });
      return next;
    });
    setControlsLoading((prev) => {
      const next = { ...prev };
      availableFrameworks.forEach((fw) => {
        if (!(fw.code in next)) next[fw.code] = true;
      });
      return next;
    });
    setApiDataMap((prev) => {
      const next = { ...prev };
      availableFrameworks.forEach((fw) => {
        if (!(fw.code in next)) next[fw.code] = [];
      });
      return next;
    });
  }, [availableFrameworks]);

  // ── 4. Mappings — still needed for SOC2-style cross-framework lookup ─────────
  //    These are stored per "source framework" pair (e.g. SOC2→ISO27001).
  //    The index shape: { [sourceControlCode]: [{ code, framework }] }
  const [mappingsIndex, setMappingsIndex] = useState({}); // keyed by fw code that NEEDS mappings
  const [mappingsLoading, setMappingsLoading] = useState(false);

  // ── 5. Rest of state ─────────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [evidenceModal, setEvidenceModal] = useState({ open: false, data: [] });
  const [loading, setLoading] = useState(true);
  const [manualUploads, setManualUploads] = useState({});
  const [uploadingControls, setUploadingControls] = useState({});
  const [deletingControls, setDeletingControls] = useState({});
  const [approvingControls, setApprovingControls] = useState({});
  const [approvalStatuses, setApprovalStatuses] = useState({});
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    controlId: null,
    fileId: null,
    fileName: null,
  });
  const [manualScores, setManualScores] = useState({});
  const [manualTargetScores, setManualTargetScores] = useState({});
  const [editingControl, setEditingControl] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [tenantError, setTenantError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [pdfModal, setPdfModal] = useState({
    open: false,
    url: null,
    fileName: null,
  });
  const [addTaskFor, setAddTaskFor] = useState(null);
  const [taskCreatedFor, setTaskCreatedFor] = useState({});
  const [auditors, setAuditors] = useState([]);
  const [mldDocuments, setMldDocuments] = useState([]);
  const [mldSoas, setMldSoas] = useState([]);
  const [mldDocsLoading, setMldDocsLoading] = useState(false);
  const [showCapSpreadsheet, setShowCapSpreadsheet] = useState(false);
  const [soaApplicableSet, setSoaApplicableSet] = useState(null);
  const [highlightedControlId, setHighlightedControlId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Resolved config for currently active single framework (null when ALL)
  const fwConfig = isAllFrameworks
    ? null
    : availableFrameworks.find((f) => f.code === activeFramework);

  // ── Frameworks that use cross-framework mappings (i.e. they don't have
  //    native cloud metrics and inherit scores from other frameworks).
  //    Determined purely from availableFrameworks metadata — no hardcoded codes.
  //    Convention: a framework is "mapping-only" when its riskTypes does NOT
  //    include "Information Security" and is NOT "Trust Services" natively.
  //    For now we detect this by the presence of a `mappingSources` array on
  //    the framework object (set in frameworkService.js).  Frameworks without
  //    native cloud integration list their source frameworks there.
  const mappingOnlyCodes = useMemo(
    () =>
      new Set(
        availableFrameworks
          .filter(
            (fw) =>
              Array.isArray(fw.mappingSources) && fw.mappingSources.length > 0,
          )
          .map((fw) => fw.code),
      ),
    [availableFrameworks],
  );

  const isActiveMappingOnly = mappingOnlyCodes.has(activeFramework);

  // ── SoA fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSoaEntries = async () => {
      try {
        const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
        const orgId =
          userData?.organization?._id ?? userData?.organization ?? null;
        const res = await fetch("https://api.calvant.com/control-soa/api/soa", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        const entries = await res.json();
        const seen = new Set();
        const deduped = entries.filter((e) => {
          const eOrg = e.organization?._id ?? e.organization;
          if (orgId && String(eOrg) !== String(orgId)) return false;
          const key = `${e.framework}:${String(e.category)}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const applicable = new Set(
          deduped.map((e) => `${e.framework}:${String(e.category)}`),
        );
        setSoaApplicableSet(applicable);
      } catch (err) {
        console.error("Failed to fetch SoA entries for filter:", err);
        setSoaApplicableSet(new Set());
      }
    };
    fetchSoaEntries();
  }, []);

  const isControlInSoa = useCallback(
    (controlCode, frameworkCode) => {
      if (soaApplicableSet === null || soaApplicableSet.size === 0) return true;
      if (soaApplicableSet.has(`${frameworkCode}:${controlCode}`)) return true;
      // ISO annex-A style: try both with and without leading "A."
      if (controlCode.startsWith("A.")) {
        return false; // exact match only for annex controls
      } else {
        return soaApplicableSet.has(`${frameworkCode}:A.${controlCode}`);
      }
    },
    [soaApplicableSet],
  );

  // ── MLD documents ────────────────────────────────────────────────────────────
  const fetchMldDocs = async () => {
    setMldDocsLoading(true);
    try {
      const rawUser = sessionStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      const orgId = user?.organization;
      const [docs, soaList] = await Promise.all([
        documentationService.getDocuments().catch(() => []),
        documentationService.getSoAEntries().catch(() => []),
      ]);
      const normalizeOrg = (o) =>
        o && typeof o === "object" ? (o._id ?? o.id) : o;
      setMldDocuments(
        (docs || []).filter((d) => normalizeOrg(d.organization) === orgId),
      );
      setMldSoas(
        (soaList || []).filter((s) => normalizeOrg(s.organization) === orgId),
      );
    } catch (err) {
      console.error("Failed to fetch MLD docs:", err);
      setMldDocuments([]);
      setMldSoas([]);
    } finally {
      setMldDocsLoading(false);
    }
  };

  const getLatestDocForSoA = useCallback(
    (soaId) => {
      const docs = mldDocuments
        .filter((d) => String(d.soaId) === String(soaId))
        .sort((a, b) => b.version - a.version);
      return docs.find((d) => !d.deleted) || docs[0];
    },
    [mldDocuments],
  );

  const hasAnyDocument = useCallback(
    (controlId) => {
      if (manualUploads[controlId]?.fileId) return true;
      const framework = isAllFrameworks ? null : activeFramework;
      if (!framework) return false;
      const withA = controlId.startsWith("A.") ? controlId : `A.${controlId}`;
      const withoutA = controlId.startsWith("A.")
        ? controlId.substring(2)
        : controlId;
      const candidates = [...new Set([controlId, withA, withoutA])];
      return candidates.some((code) => {
        const matchingSoas = mldSoas.filter(
          (s) =>
            (s.framework || "").trim() === framework &&
            String(s.category).trim() === code,
        );
        return matchingSoas.some((soa) => {
          const doc = getLatestDocForSoA(soa.id ?? soa._id);
          return !!doc && !doc.deleted;
        });
      });
    },
    [
      manualUploads,
      mldSoas,
      activeFramework,
      isAllFrameworks,
      getLatestDocForSoA,
    ],
  );

  const handlePreviewDoc = (soaEntry, doc) => {
    if (!doc || doc.deleted || !doc.url) {
      setSnackbar({
        open: true,
        message: "Document not available for preview.",
        severity: "warning",
      });
      return;
    }
    const baseUrl = `${process.env.NEXT_PUBLIC_SP}/doc-service`;
    const url =
      baseUrl + encodeURI(doc.url.startsWith("/") ? doc.url : `/${doc.url}`);
    setPdfModal({
      open: true,
      url,
      fileName:
        doc.originalFileName || soaEntry?.documentRef?.[0] || "Document",
    });
  };

  useEffect(() => {
    fetchMldDocs();
  }, []);

  // ── Auditors ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!organizationId) return;
    axios
      .get("https://api.calvant.com/user-service/api/users", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
      .then((res) => {
        setAuditors(
          (res.data || []).filter(
            (u) =>
              u.organization === organizationId &&
              !u.role?.includes("super_admin"),
          ),
        );
      })
      .catch(console.error);
  }, [organizationId]);

  // Reset per-framework UI state when active framework changes
  useEffect(() => {
    setPage(0);
    setSearch("");
    setManualUploads({});
    setManualScores({});
    setManualTargetScores({});
    setApprovalStatuses({});
  }, [activeFramework]);

  // ── Load control libraries — fully dynamic ────────────────────────────────
  const loadControls = useCallback(
    async (frameworkCode) => {
      if (availableFrameworks.length === 0) return;
      const fw = availableFrameworks.find((f) => f.code === frameworkCode);
      if (!fw) return; // framework not registered — skip silently

      const cacheKey = `${fw.code.toLowerCase()}_controls_cache_v1`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setControlLibraries((prev) => ({
            ...prev,
            [frameworkCode]: JSON.parse(cached),
          }));
          setControlsLoading((prev) => ({ ...prev, [frameworkCode]: false }));
          return;
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }
      try {
        const res = await axios.get(`${CONTROLS_API}/${frameworkCode}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        const controls = res.data || [];
        setControlLibraries((prev) => ({ ...prev, [frameworkCode]: controls }));
        localStorage.setItem(cacheKey, JSON.stringify(controls));
      } catch (err) {
        console.error(`Failed to load ${frameworkCode} control library`, err);
        setSnackbar({
          open: true,
          message: `Failed to load ${fw.label} control library`,
          severity: "error",
        });
      } finally {
        setControlsLoading((prev) => ({ ...prev, [frameworkCode]: false }));
      }
    },
    [availableFrameworks],
  );

  // ── Load cross-framework mappings for any mapping-only framework ──────────
  //    mappingSources is an array of fw codes this framework inherits from,
  const loadMappingsForFramework = useCallback(
    async (fwCode) => {
      const fw = availableFrameworks.find((f) => f.code === fwCode);
      if (!fw || !fw.mappingSources) return;

      setMappingsLoading(true);
      try {
        // Fetch mappings for every source defined in the framework metadata
        const results = await Promise.all(
          fw.mappingSources.map(
            (sourceCode) =>
              axios
                .get(`${MAPPINGS_API}/${fwCode}/${sourceCode}`, {
                  headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                  },
                })
                .catch(() => ({ data: [] })), // Graceful fail for missing pairs
          ),
        );

        const index = {};
        results.forEach((res, i) => {
          const sourceFrameworkCode = fw.mappingSources[i];
          (res.data || []).forEach((m) => {
            // Index under BOTH the raw key AND the canonical extracted key
            // so lookup succeeds whether fwMappings is queried with the raw
            // library code or the normalized article key.
            const rawKey = m.sourceControlCode;
            const canonicalKey = extractArticleKey(m.sourceControlCode);
            const keysToIndex = new Set([rawKey, canonicalKey]);

            keysToIndex.forEach((key) => {
              if (!index[key]) index[key] = [];
              const alreadyExists = index[key].some(
                (e) =>
                  e.code === m.targetControlCode &&
                  e.framework === sourceFrameworkCode,
              );
              if (!alreadyExists) {
                index[key].push({
                  code: m.targetControlCode,
                  framework: sourceFrameworkCode,
                });
              }
            });
          });
        });

        setMappingsIndex((prev) => ({ ...prev, [fwCode]: index }));
      } catch (err) {
        console.error(`Dynamic mapping failed for ${fwCode}:`, err);
      } finally {
        setMappingsLoading(false);
      }
    },
    [availableFrameworks],
  );

  // Kick off all fetches once availableFrameworks is populated
  useEffect(() => {
    if (availableFrameworks.length === 0) return;
    availableFrameworks.forEach((fw) => loadControls(fw.code));
    availableFrameworks
      .filter((fw) => mappingOnlyCodes.has(fw.code))
      .forEach((fw) => loadMappingsForFramework(fw.code));
  }, [
    availableFrameworks,
    mappingOnlyCodes,
    loadControls,
    loadMappingsForFramework,
  ]);

  // right after: availableFrameworks.forEach((fw) => loadControls(fw.code));
useEffect(() => {
  console.log("mappingsIndex", mappingsIndex);
  console.log("mappingOnlyCodes", [...mappingOnlyCodes]);
}, [mappingsIndex]);

  // ── controlMaps: bare-code → library entry, per framework ────────────────
  const controlMaps = useMemo(() => {
    if (availableFrameworks.length === 0) return {};
    const result = {};
    for (const fw of availableFrameworks) {
      const map = {};
      (controlLibraries[fw.code] || []).forEach((c) => {
        map[toBareCode(c.controlCode)] = c;
      });
      result[fw.code] = map;
    }
    return result;
  }, [controlLibraries, availableFrameworks]);

  const controlMap = useMemo(
    () => (isAllFrameworks ? {} : controlMaps[activeFramework] || {}),
    [controlMaps, activeFramework, isAllFrameworks],
  );

  // ── Tenant ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTenantId = async () => {
      try {
        const userDataStr = sessionStorage.getItem("user");
        if (!userDataStr) throw new Error("No user data in session storage.");
        const userData = JSON.parse(userDataStr);
        const orgId = userData.organization;
        if (!orgId) throw new Error("No organization assigned to current user");
        setOrganizationId(orgId);
        const tenantResponse = await axios.get(
          `https://api.calvant.com/user-service/api/organizations/${orgId}/tenant`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          },
        );
        setTenantId(tenantResponse.data);
        setSnackbar({
          open: true,
          message: `Connected to tenant: ${tenantResponse.data}`,
          severity: "success",
        });
        sessionStorage.setItem("tenantId", tenantResponse.data);
      } catch (err) {
        let msg = "Failed to load tenant configuration";
        if (err.response?.status === 404)
          msg = "No tenant configured for your organization.";
        else if (err.message) msg = err.message;
        setTenantError(msg);
        setSnackbar({ open: true, message: msg, severity: "error" });
        setLoading(false);
      }
    };
    fetchTenantId();
  }, []);

  // ── Compliance data fetch / sync ─────────────────────────────────────────────
  const fetchComplianceData = async (showLoader = true) => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    if (showLoader) setLoading(true);
    try {
      const res = await axios.get(
        `https://api.calvant.com/compliance-brain/compliance/controls?tenantId=${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      const results = res.data || [];

      // Distribute results into per-framework buckets dynamically
      // Each item has a frameworkCode; for frameworks without that field we
      // fall back to prefix-based heuristics (ISO27001 clause vs annex).
      const newMap = {};
      availableFrameworks.forEach((fw) => {
        newMap[fw.code] = [];
      });

      results.forEach((item) => {
        if (item.frameworkCode && newMap[item.frameworkCode] !== undefined) {
          newMap[item.frameworkCode].push(item);
        } else {
          // Legacy heuristic: items without frameworkCode come from ISO27001 sync
          const isAnnex = item.controlId?.startsWith("A.");
          if (newMap["ISO27001"] !== undefined && !isAnnex)
            newMap["ISO27001"].push(item);
          if (newMap["ISO27701"] !== undefined && isAnnex)
            newMap["ISO27701"].push(item);
          // ✅ Mapping-only frameworks (GDPR, SOC2, KSA_PDPL) do NOT store raw items.
          //    They resolve scores at render time from their mappingSources via mappingsIndex.
        }
      });

      setApiDataMap(newMap);

      // Persist caches dynamically
      availableFrameworks.forEach((fw) => {
        localStorage.setItem(
          `risk_assessment_cache_${fw.code.toLowerCase()}_v1`,
          JSON.stringify(newMap[fw.code] || []),
        );
      });

      if (showLoader)
        setSnackbar({
          open: true,
          message: `Loaded ${results.length} compliance controls`,
          severity: "success",
        });
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "Failed to load compliance data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncComplianceData = async () => {
    if (!tenantId) {
      setSnackbar({
        open: true,
        message: "No tenant configured. Cannot sync.",
        severity: "warning",
      });
      return;
    }
    try {
      setLoading(true);
      setSnackbar({
        open: true,
        message: "Syncing compliance data from cloud providers...",
        severity: "info",
      });
      await axios.post(
        `https://api.calvant.com/compliance-brain/compliance/sync?tenantId=${tenantId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      setSnackbar({
        open: true,
        message: "Compliance data synced successfully!",
        severity: "success",
      });
      await fetchComplianceData(false);
    } catch (err) {
      const msg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to sync compliance data";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Restore from localStorage caches on mount (dynamic)
  useEffect(() => {
    if (availableFrameworks.length === 0) return;
    availableFrameworks.forEach((fw) => {
      const cached = localStorage.getItem(
        `risk_assessment_cache_${fw.code.toLowerCase()}_v1`,
      );
      if (cached) {
        try {
          setApiDataMap((prev) => ({ ...prev, [fw.code]: JSON.parse(cached) }));
        } catch {
          localStorage.removeItem(
            `risk_assessment_cache_${fw.code.toLowerCase()}_v1`,
          );
        }
      }
    });
    setLoading(false);
  }, [availableFrameworks]); // eslint-disable-line

  useEffect(() => {
    if (tenantId) {
      fetchComplianceData(true);
      fetchUploadedEvidence();
      fetchAllTargetScores();
    }
  }, [tenantId]); // eslint-disable-line

  useEffect(() => {
    if (tenantId) {
      fetchUploadedEvidence();
      fetchAllTargetScores();
    }
    setPage(0);
  }, [activeFramework, tenantId]); // eslint-disable-line

  const apiData = isAllFrameworks ? [] : apiDataMap[activeFramework] || [];

  // ── Processed data — ALL frameworks (unified view) ───────────────────────────
  const allFrameworksProcessedData = useMemo(() => {
    if (!isAllFrameworks || availableFrameworks.length === 0) return [];

    // Frameworks with native cloud data (not mapping-only)
    const nativeFwCodes = availableFrameworks
      .filter((fw) => !mappingOnlyCodes.has(fw.code) && fw.code !== "SOC2")
      .map((fw) => fw.code);

const unifiedMap = {};

    // ✅ ADD THIS — fwCode -> { code/bareCode/normalizedCode : uid }
    const normalizeCodeForLookupEarly = (c) => {
      const s = String(c || "").trim();
      const articleMatch = s.match(/^article[-\s]?(\d+)/i);
      if (articleMatch) return articleMatch[1].toUpperCase();
      return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
    };
    const nativeUidByFw = {};
    const registerNativeUid = (fwCode, controlCode, uid) => {
      if (!nativeUidByFw[fwCode]) nativeUidByFw[fwCode] = {};
      const bare = toBareCode(controlCode);
      const withA = controlCode.startsWith("A.") ? controlCode : `A.${controlCode}`;
      [controlCode, bare, withA, normalizeCodeForLookupEarly(controlCode), normalizeCodeForLookupEarly(bare)]
        .forEach((k) => { if (!(k in nativeUidByFw[fwCode])) nativeUidByFw[fwCode][k] = uid; });
    };

    // Seed from all non-SOC2, non-mapping-only libraries
    nativeFwCodes.forEach((fwCode) => {
      (controlLibraries[fwCode] || []).forEach((c) => {
        const uid = c.unifiedId || c.controlCode;
        registerNativeUid(fwCode, c.controlCode, uid); // ✅ ADD THIS LINE
        if (!unifiedMap[uid]) {
          unifiedMap[uid] = {
            unifiedId: uid,
            controlId: uid,
            controlCode: c.controlCode,
            controlName: c.title,
            metric: c.metric,
            formula: c.formula,
            documents: c.documents || [],
            metrics: [],
            status: "disconnected",
            frameworks: [],
            frameworkControls: [],
            _framework: fwCode,
          };
        } else {
          if (c.documents?.length > 0 && unifiedMap[uid].documents.length === 0)
            unifiedMap[uid].documents = c.documents;
        }
        if (!unifiedMap[uid].frameworks.includes(fwCode))
          unifiedMap[uid].frameworks.push(fwCode);
        unifiedMap[uid].frameworkControls.push({
          frameworkCode: fwCode,
          controlCode: c.controlCode,
          unifiedId: c.unifiedId,
        });
      });
    });

    // Seed SOC2 (always present as a mapping target framework)
    const soc2Fw = availableFrameworks.find((fw) => fw.code === "SOC2");
    if (soc2Fw) {
      (controlLibraries["SOC2"] || []).forEach((c) => {
        const uid = c.unifiedId || c.controlCode;
        registerNativeUid("SOC2", c.controlCode, uid);
        if (!unifiedMap[uid]) {
          unifiedMap[uid] = {
            unifiedId: uid,
            controlId: uid,
            controlCode: c.controlCode,
            controlName: c.title,
            metric: c.metric,
            formula: c.formula,
            documents: c.documents || [],
            metrics: [],
            status: "disconnected",
            frameworks: [],
            frameworkControls: [],
            _framework: "SOC2",
          };
        }
        if (!unifiedMap[uid].frameworks.includes("SOC2"))
          unifiedMap[uid].frameworks.push("SOC2");
        unifiedMap[uid].frameworkControls.push({
          frameworkCode: "SOC2",
          controlCode: c.controlCode,
          unifiedId: c.unifiedId,
        });
      });
    }

    // Populate metrics from native framework API data
    nativeFwCodes.forEach((fwCode) => {
      (apiDataMap[fwCode] || []).forEach((item) => {
        const key = toBareCode(item.controlId);
        const libEntry = (controlLibraries[fwCode] || []).find(
          (c) =>
            toBareCode(c.controlCode) === key ||
            c.controlCode === item.controlId,
        );
        const uid = libEntry?.unifiedId || key;
        if (unifiedMap[uid]) {
          unifiedMap[uid].status = "connected";
          unifiedMap[uid].metrics.push({
            metricName: `${item.cloud} - ${item.controlName}`,
            currentPerformance: item.score ?? (item.compliant ? 100 : 0),
            evidence: item.evidence,
            sourceFramework: fwCode,
          });
        }
      });
    });

    // Build lookup tables from native frameworks for mapping resolution
    const normalizeCodeForLookup = (c) => {
      const s = String(c || "").trim();
      const articleMatch = s.match(/^article[-\s]?(\d+)/i);
      if (articleMatch) return articleMatch[1].toUpperCase();
      return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
    };
    const lookupByFw = {};
    nativeFwCodes.forEach((fwCode) => {
      lookupByFw[fwCode] = {};
      (apiDataMap[fwCode] || []).forEach((item) => {
        const raw = item.controlId || "";
        const bare = toBareCode(raw); // strips leading "A."
        const withA = raw.startsWith("A.") ? raw : `A.${raw}`;
        const keysToIndex = new Set([
          raw,
          bare,
          withA,
          normalizeCodeForLookup(raw),
          normalizeCodeForLookup(bare),
        ]);
        keysToIndex.forEach((k) => {
          if (!lookupByFw[fwCode][k]) lookupByFw[fwCode][k] = [];
          lookupByFw[fwCode][k].push(item);
        });
      });
    });

    // Library metric fallback per native framework
    const libMetricByFw = {};
    nativeFwCodes.forEach((fwCode) => {
      libMetricByFw[fwCode] = {};
      (controlLibraries[fwCode] || []).forEach((lc) => {
        if (lc.metric) {
          libMetricByFw[fwCode][lc.controlCode] = lc.metric;
          const bare = toBareCode(lc.controlCode);
          if (bare !== lc.controlCode) libMetricByFw[fwCode][bare] = lc.metric;
        }
      });
    });

// Resolve metrics for mapping-only frameworks via their mappingSources
  // Resolve metrics for mapping-only frameworks via their mappingSources
    availableFrameworks
      .filter((fw) => mappingOnlyCodes.has(fw.code))
      .forEach((fw) => {
        const fwMappings = mappingsIndex[fw.code] || {};
        (controlLibraries[fw.code] || []).forEach((c) => {
          const articleKey = extractArticleKey(c.controlCode);
          const mappedEntries =
            fwMappings[c.controlCode] || fwMappings[articleKey] || [];
          if (mappedEntries.length === 0) return;

          mappedEntries.forEach(
            ({ code: sourceCode, framework: sourceFramework }) => {
              // ✅ Resolve via the NATIVE control's uid, not this control's own code
              const srcUidMap = nativeUidByFw[sourceFramework] || {};
              const bare = toBareCode(sourceCode);
              const targetUid =
                srcUidMap[sourceCode] ||
                srcUidMap[bare] ||
                srcUidMap[normalizeCodeForLookup(sourceCode)] ||
                srcUidMap[normalizeCodeForLookup(bare)];

              if (!targetUid || !unifiedMap[targetUid]) return;

              const row = unifiedMap[targetUid];

              if (!row.frameworks.includes(fw.code)) row.frameworks.push(fw.code);
              row.frameworkControls.push({
                frameworkCode: fw.code,
                controlCode: c.controlCode,
                unifiedId: c.unifiedId,
              });

              const srcLookup = lookupByFw[sourceFramework] || {};
              const items =
                srcLookup[sourceCode] ||
                srcLookup[bare] ||
                srcLookup[normalizeCodeForLookup(sourceCode)] ||
                [];
              if (items.length > 0) {
                items.forEach((item) => {
                  const key = `${item.cloud} - ${item.controlName}`;
                  if (!row.metrics.find((m) => m.metricName === key)) {
                    row.metrics.push({
                      metricName: key,
                      currentPerformance: item.score ?? (item.compliant ? 100 : 0),
                      evidence: item.evidence,
                      sourceCode,
                      sourceFramework,
                    });
                  }
                });
                row.status = "mapped";
              } else {
                const libMetric =
                  (libMetricByFw[sourceFramework] || {})[sourceCode] ||
                  (libMetricByFw[sourceFramework] || {})[bare];
                if (libMetric) {
                  row.fallbackMetrics = row.fallbackMetrics || [];
                  if (!row.fallbackMetrics.find((f) => f.metricName === libMetric)) {
                    row.fallbackMetrics.push({
                      metricName: libMetric,
                      sourceCode,
                      sourceFramework,
                      isFallback: true,
                    });
                  }
                }
              }
            },
          );
        });
      });
    // Deduplicate metrics
    Object.values(unifiedMap).forEach((entry) => {
      const seen = new Set();
      entry.metrics = entry.metrics.filter((m) => {
        if (seen.has(m.metricName)) return false;
        seen.add(m.metricName);
        return true;
      });
      if (entry.metrics.length > 0) entry.status = "connected";
    });

    return Object.values(unifiedMap).sort((a, b) =>
      unifiedIdSortKey(a.unifiedId || a.controlId).localeCompare(
        unifiedIdSortKey(b.unifiedId || b.controlId),
      ),
    );
  }, [
    isAllFrameworks,
    availableFrameworks,
    controlLibraries,
    apiDataMap,
    mappingsIndex,
    mappingOnlyCodes,
  ]);

  // ── Processed data — single framework ────────────────────────────────────────
  const singleFrameworkProcessedData = useMemo(() => {
    if (isAllFrameworks || availableFrameworks.length === 0) return [];

    const grouped = {};
    const isMappingOnly = mappingOnlyCodes.has(activeFramework);

    if (isMappingOnly) {
      const fw = availableFrameworks.find((f) => f.code === activeFramework);
      const sources = fw?.mappingSources || [];
      const fwMappings = mappingsIndex[activeFramework] || {};

      // ✅ Match the normalization logic from your frameworkMappings.js
      const normalizeCode = (c) => {
        const s = String(c || "").trim();
        // Handles "Article-5" -> "5", "Art. 5" -> "5", etc.
        const articleMatch = s.match(/^article[-\s]?(\d+)/i);
        if (articleMatch) return articleMatch[1].toUpperCase();
        return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
      };

      // 1. Build lookup tables for each source framework with NORMALIZED keys
      const lookupBySource = {};
      sources.forEach((srcCode) => {
        lookupBySource[srcCode] = {};
        (apiDataMap[srcCode] || []).forEach((item) => {
          const bare = item.controlId || "";
          const keysToIndex = new Set([
            normalizeCode(bare),
            normalizeCode(bare.startsWith("A.") ? bare.slice(2) : `A.${bare}`),
          ]);
          keysToIndex.forEach((k) => {
            if (!lookupBySource[srcCode][k]) lookupBySource[srcCode][k] = [];
            lookupBySource[srcCode][k].push(item);
          });
        });
      });

      // 2. Map library items
      (controlLibraries[activeFramework] || []).forEach((c) => {
        grouped[c.controlCode] = {
          controlId: c.unifiedId || c.controlCode,
          controlCode: c.controlCode,
          unifiedId: c.unifiedId || null,
          controlName: c.title,
          metric: c.metric,
          formula: c.formula,
          documents: c.documents || [],
          metrics: [],
          status: "disconnected",
          _framework: activeFramework,
        };
      });

      // 3. Resolve metrics through normalized mappings
      Object.keys(grouped).forEach((fwControlCode) => {
        // extractArticleKey normalizes both sides to the same canonical form:
        // "Article-5(1)(a)-Lawfulness," → "ARTICLE-5(1)(A)"
        // "Article-5(1)(a)"             → "ARTICLE-5(1)(A)"  ← mapping key
        // Exact match is tried first as a fast path.
        const articleKey = extractArticleKey(fwControlCode);
        const mappedEntries =
          fwMappings[fwControlCode] || // exact match first
          fwMappings[articleKey] || // canonical extracted key
          [];

        let hasAnyLiveMetric = false;

        mappedEntries.forEach(
          ({ code: sourceControlCode, framework: sourceFramework }) => {
            const srcLookup = lookupBySource[sourceFramework] || {};
            const targetKey = normalizeCode(sourceControlCode);
            const items = srcLookup[targetKey] || [];

            if (items.length > 0) {
              items.forEach((item) => {
                grouped[fwControlCode].metrics.push({
                  metricName: `${item.cloud} - ${item.controlName}`,
                  currentPerformance: item.score ?? (item.compliant ? 100 : 0),
                  evidence: item.evidence,
                  sourceCode: sourceControlCode,
                  sourceFramework: sourceFramework,
                });
              });
              hasAnyLiveMetric = true;
            }
          },
        );

        if (hasAnyLiveMetric) grouped[fwControlCode].status = "mapped";
      });

      // 4. Deduplicate and Sort
      Object.values(grouped).forEach((group) => {
        const seen = new Set();
        group.metrics = group.metrics.filter((m) => {
          const key = `${m.sourceFramework}-${m.metricName}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });

      return Object.values(grouped).sort((a, b) =>
        frameworkSortKey(a.controlId, activeFramework).localeCompare(
          frameworkSortKey(b.controlId, activeFramework),
        ),
      );
    }

    // ── Native cloud-connected framework (e.g. ISO27001, ISO27701, ISO42001) ──
    (controlLibraries[activeFramework] || []).forEach((c) => {
      const key = toBareCode(c.controlCode);
      grouped[key] = {
        controlId: key,
        controlCode: c.controlCode,
        unifiedId: c.unifiedId || null,
        controlName: c.title,
        metric: c.metric,
        formula: c.formula,
        documents: c.documents || [],
        metrics: [],
        status: "disconnected",
        _framework: activeFramework,
      };
    });

    apiData.forEach((item) => {
      const key = toBareCode(item.controlId);

      // Determine whether this API result belongs to the active framework.
      // Prefer the explicit frameworkCode on the item; fall back to structural heuristics.
      let belongsToFramework;
      if (item.frameworkCode) {
        belongsToFramework = item.frameworkCode === activeFramework;
      } else {
        // Legacy heuristic: ISO27001 = non-annex, ISO27701 = annex-A
        const isAnnex = item.controlId?.startsWith("A.");
        if (activeFramework === "ISO27001") belongsToFramework = !isAnnex;
        else if (activeFramework === "ISO27701") belongsToFramework = isAnnex;
        else belongsToFramework = true;
      }
      if (!belongsToFramework) return;

      if (!grouped[key]) {
        grouped[key] = {
          controlId: key,
          controlCode: item.controlId,
          controlName: item.controlName,
          metric: item.controlName,
          formula: null,
          documents: [],
          metrics: [],
          status: "connected",
          _framework: activeFramework,
        };
      }
      grouped[key].status = "connected";
      grouped[key].metrics.push({
        metricName: `${item.cloud} - ${item.controlName}`,
        currentPerformance: item.score ?? (item.compliant ? 100 : 0),
        evidence: item.evidence,
      });
    });

    Object.values(grouped).forEach((group) => {
      const seen = new Set();
      group.metrics = group.metrics.filter((m) => {
        if (seen.has(m.metricName)) return false;
        seen.add(m.metricName);
        return true;
      });
      if (group.metrics.length > 0) group.status = "connected";
    });

    return Object.values(grouped).sort((a, b) =>
      frameworkSortKey(a.controlId, activeFramework).localeCompare(
        frameworkSortKey(b.controlId, activeFramework),
      ),
    );
  }, [
    isAllFrameworks,
    availableFrameworks,
    controlLibraries,
    apiData,
    apiDataMap,
    activeFramework,
    mappingsIndex,
    mappingOnlyCodes,
  ]);

  const processedData = isAllFrameworks
    ? allFrameworksProcessedData
    : singleFrameworkProcessedData;

  // ── Filtered data ─────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = processedData;

    // 1. Framework selection filter
    if (!isAllSelected) {
      data = data.filter((group) => {
        const rowFrameworks = group.frameworks || [group._framework];
        return rowFrameworks.some((fw) => normalizedSelected.includes(fw));
      });
    }

    // 2. SoA applicability filter
    if (soaApplicableSet !== null && soaApplicableSet.size > 0) {
      data = data.filter((group) => {
        if (isAllFrameworks) {
          return (group.frameworks || []).some((fw) => {
            // Show all controls for mapping-only frameworks regardless of SoA
            if (mappingOnlyCodes.has(fw)) return true;
            return isControlInSoa(group.controlCode || group.controlId, fw);
          });
        }
        // Show all controls for mapping-only frameworks regardless of SoA
        if (mappingOnlyCodes.has(activeFramework)) return true;
        return isControlInSoa(
          group.controlCode || group.controlId,
          activeFramework,
        );
      });
    }

    // 3. Text search
    const filtered = !search.trim()
      ? data
      : data.filter(
        (g) =>
          (g.controlId || "").toLowerCase().includes(search.toLowerCase()) ||
          (g.unifiedId || "").toLowerCase().includes(search.toLowerCase()) ||
          (g.controlName || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (g.metric || "").toLowerCase().includes(search.toLowerCase()),
      );

    return filtered;
  }, [
    processedData,
    search,
    soaApplicableSet,
    isAllFrameworks,
    activeFramework,
    isControlInSoa,
    normalizedSelected,
    isAllSelected,
    mappingOnlyCodes,
  ]);

  const searchParams = useSearchParams();

  useEffect(() => {
    const openControlId = searchParams.get("openControlId");
    if (!openControlId || filteredData.length === 0) return;
    const match = filteredData.find((g) => g.controlId === openControlId || g.controlCode === openControlId);
    if (match) {
      setHighlightedControlId(match.controlId);
      setTimeout(() => {
        document.getElementById(`compliance-row-${match.controlId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      const t = setTimeout(() => setHighlightedControlId(null), 4000);
      return () => clearTimeout(t);
    }
  }, [searchParams, filteredData]);

  const soaApplicableCountForFramework = useMemo(() => {
    if (!soaApplicableSet || soaApplicableSet.size === 0) return 0;
    if (mappingOnlyCodes.has(activeFramework) || isAllFrameworks)
      return filteredData.length;
    return [...soaApplicableSet].filter((key) =>
      key.startsWith(`${activeFramework}:`),
    ).length;
  }, [
    soaApplicableSet,
    activeFramework,
    isAllFrameworks,
    filteredData.length,
    mappingOnlyCodes,
  ]);

  // ── Flat rows for pagination ──────────────────────────────────────────────────
  const allFlatRows = useMemo(() => {
    const rows = [];
    for (const group of filteredData) {
      const uniqueDocs = [
        ...new Map(
          (group.documents || []).filter((d) => d.doc).map((d) => [d.doc, d]),
        ).values(),
      ];
      const hasDocs = uniqueDocs.length > 0;
      if (group.metrics.length === 0) {
        rows.push({ group, metric: null, isFirst: true, isLast: true });
        if (hasDocs)
          rows.push({
            group,
            metric: null,
            isFirst: false,
            isLast: false,
            isDocRow: true,
          });
      } else {
        group.metrics.forEach((metric, idx) => {
          const isLast = idx === group.metrics.length - 1;
          rows.push({ group, metric, isFirst: idx === 0, isLast });
          if (isLast && hasDocs)
            rows.push({
              group,
              metric: null,
              isFirst: false,
              isLast: false,
              isDocRow: true,
            });
        });
      }
    }
    return rows;
  }, [filteredData]);

  const totalRows = allFlatRows.length;
  const currentPageRows = useMemo(
    () =>
      allFlatRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [allFlatRows, page, rowsPerPage],
  );

  // ── File handlers ─────────────────────────────────────────────────────────────
  const handleViewFile = async (controlId, fileId, fileName) => {
    try {
      setPdfModal({ open: true, url: null, fileName });
      const response = await axios.get(
        `https://api.calvant.com/compliance-brain/compliance/${tenantId}/${controlId}/${fileId}/download`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          responseType: "blob",
        },
      );
      const url = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      setPdfModal({ open: true, url, fileName });
    } catch {
      setPdfModal({ open: false, url: null, fileName: null });
      setSnackbar({
        open: true,
        message: "Failed to load file for preview",
        severity: "error",
      });
    }
  };

  const handleClosePdfModal = () => {
    if (pdfModal.url && pdfModal.url.startsWith("blob:"))
      URL.revokeObjectURL(pdfModal.url);
    setPdfModal({ open: false, url: null, fileName: null });
  };

  const handleDeleteFile = (controlId, fileId, fileName) =>
    setConfirmDelete({ open: true, controlId, fileId, fileName });

  const handleDeleteConfirmed = async () => {
    const { controlId, fileId } = confirmDelete;
    setConfirmDelete({
      open: false,
      controlId: null,
      fileId: null,
      fileName: null,
    });
    setDeletingControls((prev) => ({ ...prev, [controlId]: true }));
    try {
      await axios.delete(
        `https://api.calvant.com/compliance-brain/compliance/${tenantId}/${controlId}/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      setManualUploads((prev) => {
        const u = { ...prev };
        delete u[controlId];
        return u;
      });
      setSnackbar({
        open: true,
        message: `🗑️ Evidence deleted for ${controlId}`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to delete: ${err.response?.data?.message || err.message}`,
        severity: "error",
      });
    } finally {
      setDeletingControls((prev) => ({ ...prev, [controlId]: false }));
    }
  };

  const handleApprove = async (controlId) => {
    setApprovingControls((prev) => ({ ...prev, [controlId]: true }));
    try {
      await axios.post(
        `https://api.calvant.com/compliance-brain/compliance/${tenantId}/${activeFramework}/${controlId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      setApprovalStatuses((prev) => ({ ...prev, [controlId]: "APPROVED" }));
      setSnackbar({
        open: true,
        message: `✅ Control ${controlId} approved`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to approve: ${err.response?.data?.message || err.message}`,
        severity: "error",
      });
    } finally {
      setApprovingControls((prev) => ({ ...prev, [controlId]: false }));
    }
  };

  const handleTargetScoreSaved = (controlId, value) => {
    setManualTargetScores((prev) => ({ ...prev, [controlId]: value }));
    setSnackbar({
      open: true,
      message: `✅ Target score saved for ${controlId}: ${value}%`,
      severity: "success",
    });
  };

  const handleManualUpload = async (controlId, file, validationError) => {
    if (validationError) {
      setSnackbar({
        open: true,
        message: `Upload failed: ${validationError}`,
        severity: "error",
      });
      return;
    }
    if (!file || !tenantId) return;
    setUploadingControls((prev) => ({ ...prev, [controlId]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const response = await axios.post(
        "https://api.calvant.com/compliance-brain/compliance/upload-evidence",
        formData,
        {
          params: {
            tenantId,
            controlId,
            frameworkCode: isAllFrameworks ? "ALL" : activeFramework,
          },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      if (response.data.success) {
        setManualUploads((prev) => ({
          ...prev,
          [controlId]: { fileName: file.name, fileId: response.data.fileId },
        }));
        setSnackbar({
          open: true,
          message: `✅ Evidence uploaded for ${controlId}: ${file.name}`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Upload failed: ${response.data.message}`,
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Upload error: ${err.response?.data?.message || err.message || "Failed to upload file"}`,
        severity: "error",
      });
    } finally {
      setUploadingControls((prev) => ({ ...prev, [controlId]: false }));
    }
  };

  const handleScoreChange = (controlId, value) =>
    setManualScores((prev) => ({ ...prev, [controlId]: value }));

  const handleScoreSave = async (controlId, frameworkForControl) => {
    setEditingControl(null);
    const numeric = parseFloat(manualScores[controlId]);
    if (isNaN(numeric) || numeric < 0 || numeric > 100) return;
    const targetFw = frameworkForControl || activeFramework;
    try {
      await axios.post(
        `https://api.calvant.com/compliance-brain/compliance/${tenantId}/${targetFw}/${controlId}/current-score`,
        { currentScore: numeric },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      setSnackbar({
        open: true,
        message: `✅ Current score saved for ${controlId}: ${numeric}%`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to save current score: ${err.response?.data?.message || err.message}`,
        severity: "error",
      });
    }
  };

  const fetchUploadedEvidence = async () => {
    if (!tenantId) return;
    try {
      const res = await axios.get(
        `https://api.calvant.com/compliance-brain/compliance/${tenantId}/evidence`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          params: {
            frameworkCode: isAllFrameworks ? undefined : activeFramework,
          },
        },
      );
      const files = res.data || [];
      const map = {};
      files.forEach((f) => {
        if (f.controlId)
          map[f.controlId] = { fileName: f.originalFileName, fileId: f.fileId };
      });
      setManualUploads(map);
    } catch (err) {
      console.warn("Could not fetch uploaded evidence:", err?.message);
      setManualUploads({});
    }
  };

  const fetchAllTargetScores = async () => {
    if (!tenantId) return;
    try {
      const res = await axios.get(
        `https://api.calvant.com/compliance-brain/compliance/${tenantId}/scores`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      const scores = res.data || [];
      const targetMap = {},
        currentMap = {},
        approvalMap = {};
      scores
        .filter(
          (ts) => !ts.frameworkCode || ts.frameworkCode === activeFramework,
        )
        .forEach((ts) => {
          if (!ts.controlId) return;
          if (
            ts.targetScore !== undefined &&
            ts.targetScore !== null &&
            ts.targetScore !== ""
          )
            targetMap[ts.controlId] = ts.targetScore;
          if (
            ts.currentScore !== undefined &&
            ts.currentScore !== null &&
            ts.currentScore !== ""
          )
            currentMap[ts.controlId] = ts.currentScore;
          if (ts.approvalStatus) approvalMap[ts.controlId] = ts.approvalStatus;
        });
      setManualTargetScores(targetMap);
      setManualScores(currentMap);
      setApprovalStatuses(approvalMap);
    } catch (err) {
      console.warn("Could not fetch target scores:", err?.message);
    }
  };

  const getPerformanceColor = (p) => {
    if (p === 100) return { backgroundColor: "#4CAF50", color: "white" };
    if (p >= 70) return { backgroundColor: "#FF9800", color: "white" };
    return { backgroundColor: "#F44336", color: "white" };
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  const anyControlsLoading = Object.values(controlsLoading).some(Boolean);
  const isLoading =
    loading ||
    (isAllFrameworks ? anyControlsLoading : controlsLoading[activeFramework]) ||
    mappingsLoading;

  const selectedOption =
    getFrameworkOptions(availableFrameworks).find(
      (o) => o.code === activeFramework,
    ) || getFrameworkOptions(availableFrameworks)[0];
  const tabColor = selectedOption?.color || "#334155";
  const colSpanCount = isAllFrameworks ? 10 : 9;

  const docCellStyle = (docIdx, controlDocs, extra = {}) => ({
    padding: "5px 8px",
    backgroundColor: "#ffffff",
    borderBottom: docIdx < controlDocs.length - 1 ? "none" : undefined,
    ...extra,
  });

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {showCapSpreadsheet && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1250,
            background: "#f1f5f9",
            overflow: "hidden",
          }}
        >
          <ComplianceCapSpreadsheet
            filteredData={filteredData}
            manualScores={manualScores}
            manualTargetScores={manualTargetScores}
            auditors={auditors}
            tenantId={tenantId}
            activeFramework={activeFramework}
            isAllFrameworks={isAllFrameworks}
            taskService={taskService}
            onBack={() => setShowCapSpreadsheet(false)}
          />
        </div>
      )}

      <Box style={{ paddingTop: 24, paddingBottom: 16 }}>
        <Container maxWidth="xl">
          <Box
            display="flex"
            alignItems="center"
            style={{ gap: 12, marginBottom: 20 }}
          >
            {isAllFrameworks && (
              <Box
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <AppsIcon style={{ fontSize: 14, color: "#64748b" }} />
                <Typography
                  style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}
                >
                  Showing unified controls with{" "}
                  <strong style={{ color: "#334155" }}>Unified ID</strong>{" "}
                  across all frameworks
                </Typography>
              </Box>
            )}
          </Box>

          {tenantId && (
            <Paper
              elevation={0}
              style={{
                padding: "12px 20px",
                marginBottom: 16,
                borderRadius: 10,
                backgroundColor: "#e3f2fd",
                border: "1px solid #90caf9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                <span style={{ fontSize: 20 }}>🏢</span>
                <span
                  style={{ fontSize: 14, color: "#1565c0", fontWeight: 600 }}
                >
                  Organization ID: <strong>{tenantId}</strong>
                </span>
              </Box>
              <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                {soaApplicableSet !== null && soaApplicableSet.size > 0 && (
                  <Chip
                    label={`📑 SoA: ${soaApplicableCountForFramework} applicable`}
                    size="small"
                    style={{
                      backgroundColor: "#f0fdf4",
                      color: "#15803d",
                      fontWeight: 600,
                      fontSize: 11,
                      border: "1px solid #86efac",
                    }}
                  />
                )}
                <Chip
                  label={selectedOption?.label || activeFramework}
                  size="small"
                  style={{
                    fontWeight: 700,
                    backgroundColor: tabColor,
                    color: "white",
                    fontSize: 12,
                  }}
                />
              </Box>
            </Paper>
          )}

          {tenantError && (
            <Paper
              elevation={0}
              style={{
                padding: "16px 20px",
                marginBottom: 16,
                borderRadius: 10,
                backgroundColor: "#ffebee",
                border: "1px solid #ef5350",
              }}
            >
              <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <span
                  style={{ fontSize: 14, color: "#c62828", fontWeight: 500 }}
                >
                  {tenantError}
                </span>
              </Box>
            </Paper>
          )}

          <Paper
            elevation={0}
            style={{
              padding: isMobile ? "20px 16px" : "32px 24px",
              marginBottom: 24,
              borderRadius: 12,
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              border: "1px solid #e2e8f0",
            }}
          >
            <Box
              display="flex"
              flexDirection={isMobile ? "column" : "row"}
              style={{ gap: 16 }}
              alignItems={isMobile ? "stretch" : "center"}
              justifyContent="space-between"
            >
              <Box flex={1}>
                <TextField
                  fullWidth
                  label={
                    <span
                      style={{
                        fontSize: isMobile ? "16px" : "18px",
                        fontWeight: 700,
                        color: "#1e293b",
                      }}
                    >
                      Search Controls
                    </span>
                  }
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder={
                    isAllFrameworks
                      ? "Search by Unified ID, control name or metric"
                      : `Search ${fwConfig?.label || activeFramework} controls by ID or name`
                  }
                  variant="outlined"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          style={{ fontSize: 24, color: "#64748b" }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: search && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSearch("");
                            setPage(0);
                          }}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    style: {
                      fontSize: isMobile ? "16px" : "18px",
                      fontWeight: 700,
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 12,
                      backgroundColor: "white",
                      fontSize: isMobile ? "15px" : "16px",
                    },
                  }}
                />
              </Box>
              <Box
                display="flex"
                style={{ gap: 8 }}
                flexWrap="wrap"
                justifyContent={isMobile ? "center" : "flex-end"}
              >
                <Button
                  variant="contained"
                  style={{
                    backgroundColor: tenantId ? "#7b1fa2" : "#bdbdbd",
                    color: "white",
                    minWidth: 150,
                    height: 42,
                    borderRadius: 10,
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: tenantId ? "pointer" : "not-allowed",
                  }}
                  startIcon={<CloudSyncIcon />}
                  onClick={syncComplianceData}
                  disabled={!tenantId || isLoading}
                >
                  Sync from Cloud
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Table2Icon />}
                  onClick={() => setShowCapSpreadsheet(true)}
                  disabled={filteredData.length === 0}
                  size="large"
                  style={{
                    minWidth: 170,
                    height: 42,
                    borderRadius: 10,
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 700,
                    background:
                      filteredData.length > 0
                        ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                        : "#e2e8f0",
                    color: filteredData.length > 0 ? "#fff" : "#94a3b8",
                    boxShadow:
                      filteredData.length > 0
                        ? "0 2px 10px rgba(99,102,241,0.3)"
                        : "none",
                  }}
                >
                  Manage CAP
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchComplianceData(true)}
                  disabled={!tenantId || isLoading}
                  size="large"
                  style={{
                    minWidth: 140,
                    height: 42,
                    borderRadius: 10,
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Refresh Snapshot
                </Button>
              </Box>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              style={{ gap: 20, marginTop: 14 }}
              flexWrap="wrap"
            >
              <Box display="flex" alignItems="center" style={{ gap: 7 }}>
                <StatusDot status="connected" />
                <Typography style={{ fontSize: 12, color: "#64748b" }}>
                  Connected (live cloud data)
                </Typography>
              </Box>
              {mappingOnlyCodes.has(activeFramework) ? (
                <Box display="flex" alignItems="center" style={{ gap: 7 }}>
                  <StatusDot status="mapped" />
                  <Typography style={{ fontSize: 12, color: "#64748b" }}>
                    Mapped (inherited from{" "}
                    {availableFrameworks
                      .find((fw) => fw.code === activeFramework)
                      ?.mappingSources?.map(
                        (src) =>
                          availableFrameworks.find((f) => f.code === src)
                            ?.label || src,
                      )
                      .join(" & ") || "other frameworks"}
                    )
                  </Typography>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" style={{ gap: 7 }}>
                  <StatusDot status="disconnected" />
                  <Typography style={{ fontSize: 12, color: "#64748b" }}>
                    Not connected (manual upload available)
                  </Typography>
                </Box>
              )}
              <Box display="flex" alignItems="center" style={{ gap: 7 }}>
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: "#dcfce7",
                    border: "1px solid #86efac",
                  }}
                />
                <Typography style={{ fontSize: 12, color: "#64748b" }}>
                  Document Available
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" style={{ gap: 7 }}>
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: "#fef9c3",
                    border: "1px solid #fde047",
                  }}
                />
                <Typography style={{ fontSize: 12, color: "#64748b" }}>
                  Document Required
                </Typography>
              </Box>
            </Box>
            {totalRows > 0 && (
              <Box mt={1} style={{ color: "#64748b", fontSize: 13 }}>
                Showing {filteredData.length} requirements ({totalRows} total
                rows)
                {search && (
                  <span style={{ color: "#1976d2", fontWeight: 600 }}>
                    {" "}
                    • "{search}"
                  </span>
                )}
                {soaApplicableSet !== null && soaApplicableSet.size > 0 && (
                  <span style={{ color: "#15803d", fontWeight: 600 }}>
                    {" "}
                    • Filtered to SoA applicable controls
                  </span>
                )}
              </Box>
            )}
          </Paper>

          <Paper elevation={2} style={{ padding: 24, borderRadius: 12 }}>
            {isLoading ? (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                height={300}
                style={{ gap: 16 }}
              >
                <CircularProgress size={48} thickness={4} />
                <div
                  style={{ fontSize: 16, color: "#64748b", fontWeight: 500 }}
                >
                  {anyControlsLoading
                    ? `Loading ${isAllFrameworks ? "all framework" : fwConfig?.label || activeFramework} control libraries...`
                    : mappingsLoading
                      ? "Loading framework mappings..."
                      : "Loading compliance data..."}
                </div>
              </Box>
            ) : (
              <>
                <div style={{ overflowX: "auto", borderRadius: 8 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          style={{
                            fontWeight: 700,
                            backgroundColor: "#f8fafc",
                            fontSize: 15,
                            width: 36,
                            padding: "12px 8px",
                          }}
                        />
                        <TableCell
                          style={{
                            fontWeight: 700,
                            backgroundColor: "#f8fafc",
                            fontSize: 15,
                          }}
                        >
                          Unified ID
                        </TableCell>
                        <TableCell
                          style={{
                            fontWeight: 700,
                            backgroundColor: "#f8fafc",
                            fontSize: 15,
                          }}
                        >
                          Requirement ID
                        </TableCell>
                        {isAllFrameworks && (
                          <TableCell
                            style={{
                              fontWeight: 700,
                              backgroundColor: "#f8fafc",
                              fontSize: 15,
                            }}
                          >
                            Frameworks
                          </TableCell>
                        )}
                        <TableCell
                          style={{
                            fontWeight: 700,
                            backgroundColor: "#f8fafc",
                            fontSize: 15,
                          }}
                        >
                          Metric
                        </TableCell>
                        <TableCell
                          style={{
                            fontWeight: 700,
                            backgroundColor: "#f8fafc",
                            fontSize: 15,
                            textAlign: "center",
                          }}
                        >
                          Target
                        </TableCell>
                        <TableCell
                          style={{
                            fontWeight: 700,
                            backgroundColor: "#f8fafc",
                            fontSize: 15,
                            textAlign: "center",
                          }}
                        >
                          Current
                        </TableCell>
                        <TableCell
                          style={{
                            fontWeight: 700,
                            backgroundColor: "#f8fafc",
                            fontSize: 15,
                            textAlign: "center",
                          }}
                        >
                          Evidence / Formula
                        </TableCell>
                        <TableCell
                          style={{
                            fontWeight: 700,
                            backgroundColor: "#f8fafc",
                            fontSize: 15,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          CAP Task
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentPageRows.map(
                        (
                          { group, metric, isFirst, isLast, isDocRow },
                          rowIdx,
                        ) => {
                          if (isDocRow) {
                            const controlDocs = [
                              ...new Map(
                                (group.documents || [])
                                  .filter((d) => d.doc)
                                  .map((d) => [d.doc, d]),
                              ).values(),
                            ];
                            if (controlDocs.length === 0) return null;

                            return controlDocs.map((docItem, docIdx) => {
                              const docName = docItem.doc || "";
                              if (!docName) return null;

                              const framework =
                                group._framework ||
                                (isAllFrameworks
                                  ? availableFrameworks[0]?.code
                                  : activeFramework) ||
                                "";
                              const rawCode =
                                group.controlCode || group.controlId;
                              const bareCode =
                                group.controlId || group.controlCode;
                              const withPrefix = rawCode.startsWith("A.")
                                ? rawCode
                                : `A.${rawCode}`;
                              const candidates = [
                                ...new Set([rawCode, bareCode, withPrefix]),
                              ].filter(Boolean);

                              let soaEntry = null;
                              for (const code of candidates) {
                                const matchingSoas = mldSoas.filter(
                                  (s) =>
                                    (s.framework || "").trim() === framework &&
                                    String(s.category).trim() === code,
                                );
                                if (matchingSoas.length > 0) {
                                  for (const soa of matchingSoas) {
                                    const doc = getLatestDocForSoA(
                                      soa.id ?? soa._id,
                                    );
                                    if (doc && !doc.deleted) {
                                      soaEntry = soa;
                                      break;
                                    }
                                  }
                                  if (!soaEntry) soaEntry = matchingSoas[0];
                                  break;
                                }
                                const fallbackSoas = mldSoas.filter(
                                  (s) =>
                                    String(s.category).trim() === code &&
                                    (s.documentRef?.[0] || "").trim() ===
                                    docName,
                                );
                                if (fallbackSoas.length > 0) {
                                  for (const soa of fallbackSoas) {
                                    const doc = getLatestDocForSoA(
                                      soa.id ?? soa._id,
                                    );
                                    if (doc && !doc.deleted) {
                                      soaEntry = soa;
                                      break;
                                    }
                                  }
                                  if (!soaEntry) soaEntry = fallbackSoas[0];
                                  break;
                                }
                              }

                              const doc = soaEntry
                                ? getLatestDocForSoA(
                                  soaEntry.id ?? soaEntry._id,
                                )
                                : null;
                              const available = !!doc && !doc.deleted;

                              return (
                                <TableRow
                                  key={`doc-${group.controlId}-${docIdx}`}
                                  sx={{
                                    backgroundColor: "#ffffff !important",
                                    "& > td": {
                                      backgroundColor: "#ffffff !important",
                                    },
                                  }}
                                >
                                  <TableCell
                                    style={docCellStyle(docIdx, controlDocs, {
                                      width: 36,
                                    })}
                                  />
                                  <TableCell
                                    style={docCellStyle(docIdx, controlDocs)}
                                  />
                                  <TableCell
                                    style={docCellStyle(docIdx, controlDocs)}
                                  />
                                  {isAllFrameworks && (
                                    <TableCell
                                      style={docCellStyle(docIdx, controlDocs)}
                                    />
                                  )}
                                  <TableCell
                                    style={docCellStyle(docIdx, controlDocs, {
                                      padding: "5px 16px",
                                    })}
                                  >
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      style={{ gap: 8 }}
                                    >
                                      <DescriptionIcon
                                        style={{
                                          fontSize: 14,
                                          color: "#94a3b8",
                                          flexShrink: 0,
                                        }}
                                      />
                                      <Typography
                                        style={{
                                          fontSize: 12,
                                          color: "#475569",
                                          fontWeight: 500,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {docName}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    style={docCellStyle(docIdx, controlDocs)}
                                  >
                                    <Box
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "3px 10px",
                                        borderRadius: 20,
                                        backgroundColor: "#3f51b5",
                                      }}
                                    >
                                      <Typography
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 700,
                                          color: "#ffffff",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Available
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    style={docCellStyle(docIdx, controlDocs)}
                                  >
                                    {available ? (
                                      <Box
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 4,
                                          padding: "3px 10px",
                                          borderRadius: 20,
                                          backgroundColor: "#4caf50",
                                        }}
                                      >
                                        <Typography
                                          style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#fffae8",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          Available
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Box
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 4,
                                          padding: "3px 10px",
                                          borderRadius: 20,
                                          backgroundColor: "#f44336",
                                          border: "1px solid #fca5a5",
                                        }}
                                      >
                                        <Typography
                                          style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#ffffff",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          Unavailable
                                        </Typography>
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    style={docCellStyle(docIdx, controlDocs)}
                                  >
                                    {available ? (
                                      <Tooltip title={`View: ${docName}`} arrow>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handlePreviewDoc(soaEntry, doc)
                                          }
                                          style={{
                                            backgroundColor: "#e3f2fd",
                                            color: "#0288d1",
                                            width: 32,
                                            height: 32,
                                          }}
                                        >
                                          <PdfIcon style={{ fontSize: 16 }} />
                                        </IconButton>
                                      </Tooltip>
                                    ) : (
                                      <Typography
                                        style={{
                                          fontSize: 12,
                                          color: "#cbd5e1",
                                        }}
                                      >
                                        —
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell
                                    style={docCellStyle(docIdx, controlDocs)}
                                  />
                                </TableRow>
                              );
                            });
                          }

                          // ── Regular data row ────────────────────────────────────
                          const showEvidence =
                            metric && hasEvidence(metric.evidence);
                          const upload = manualUploads[group.controlId];
                          const isMappingOnlyFw = mappingOnlyCodes.has(
                            group._framework || activeFramework,
                          );
                          const hasTask = !!taskCreatedFor[group.controlId];

                          return (
                            <TableRow
                              key={`${group.controlId}-${metric?.metricName ?? "empty"}-${rowIdx}`}
                              id={isFirst ? `compliance-row-${group.controlId}` : undefined}  // ← add this
                              hover
                              style={{
                                backgroundColor: group.controlId === highlightedControlId ? "#fff3cd" : "#ffffff",  // ← highlight
                                transition: "background-color 0.3s ease",
                              }}
                            >
                              <TableCell
                                style={{
                                  textAlign: "center",
                                  padding: "0 8px",
                                  width: 36,
                                }}
                              >
                                {isFirst && <StatusDot status={group.status} />}
                              </TableCell>
                              <TableCell
                                style={{ fontSize: 14, minWidth: 140 }}
                              >
                                {isFirst && (
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    style={{ gap: 5 }}
                                  >
                                    <Typography
                                      style={{
                                        fontWeight: 600,
                                        fontSize: 12,
                                        color: "#334155",
                                        fontFamily: "monospace",
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      {group.unifiedId || group.controlId}
                                    </Typography>
                                  </Box>
                                )}
                              </TableCell>
                              <TableCell
                                style={{ fontSize: 14, minWidth: 180 }}
                              >
                                {isFirst && (
                                  <Box
                                    display="flex"
                                    flexDirection="column"
                                    style={{ gap: 2 }}
                                  >
                                    <Typography
                                      style={{
                                        fontWeight: 700,
                                        fontSize: 13,
                                        color: "#1e293b",
                                        fontFamily: "monospace",
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      {group.controlCode || group.controlId}
                                    </Typography>
                                    {group.controlName && (
                                      <Typography
                                        style={{
                                          fontSize: 11,
                                          color: "#64748b",
                                          lineHeight: 1.4,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {group.controlName}
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </TableCell>
                              {isAllFrameworks && (
                                <TableCell style={{ minWidth: 160 }}>
                                  {isFirst &&
                                    (() => {
                                      const fws = group.frameworks || [];
                                      if (fws.length === 0)
                                        return (
                                          <Typography
                                            style={{
                                              fontSize: 11,
                                              color: "#cbd5e1",
                                            }}
                                          >
                                            —
                                          </Typography>
                                        );
                                      return (
                                        <Box
                                          display="flex"
                                          flexWrap="wrap"
                                          style={{ gap: 4 }}
                                        >
                                          {fws.map((fw) => (
                                            <FrameworkBadge
                                              key={fw}
                                              frameworkCode={fw}
                                              availableFrameworks={availableFrameworks}
                                            />
                                          ))}
                                        </Box>
                                      );
                                    })()}
                                </TableCell>
                              )}
                              <TableCell style={{ fontSize: 13 }}>
                                <Box>
                                  {isFirst && (
                                    <Box>
                                      <Typography
                                        style={{
                                          fontSize: 12,
                                          fontWeight: 600,
                                          color: "#334155",
                                          lineHeight: 1.4,
                                          marginBottom: 0,
                                        }}
                                      >
                                        {group.metric &&
                                          group.metric.trim() !==
                                          group.controlName?.trim()
                                          ? group.metric
                                          : null}
                                      </Typography>
                                    </Box>
                                  )}
                                  {metric && (
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      style={{
                                        gap: 5,
                                        marginTop: isFirst ? 4 : 0,
                                      }}
                                    >
                                      {(isMappingOnlyFw || isAllFrameworks) &&
                                        metric.sourceCode && (
                                          <MappedSourceBadge
                                            availableFrameworks={
                                              availableFrameworks
                                            }
                                            sourceCode={metric.sourceCode}
                                            sourceFramework={
                                              metric.sourceFramework || ""
                                            }
                                          />
                                        )}
                                      {isAllFrameworks &&
                                        !metric.sourceCode &&
                                        metric.sourceFramework && (
                                          <FrameworkBadge
                                            frameworkCode={
                                              metric.sourceFramework
                                            }
                                            availableFrameworks={
                                              availableFrameworks
                                            }
                                          />
                                        )}
                                      <Typography
                                        style={{
                                          fontSize: 11,
                                          color: "#64748b",
                                          lineHeight: 1.4,
                                        }}
                                      >
                                        {metric.metricName}
                                      </Typography>
                                    </Box>
                                  )}
                                  {!metric &&
                                    isFirst &&
                                    (isMappingOnlyFw || isAllFrameworks) &&
                                    group.fallbackMetrics?.length > 0 && (
                                      <Box style={{ marginTop: 6 }}>
                                        {group.fallbackMetrics.map((fb, i) => (
                                          <Box
                                            key={i}
                                            display="flex"
                                            alignItems="flex-start"
                                            style={{
                                              gap: 5,
                                              marginBottom:
                                                i <
                                                  group.fallbackMetrics.length - 1
                                                  ? 4
                                                  : 0,
                                            }}
                                          >
                                            <MappedSourceBadge
                                              availableFrameworks={
                                                availableFrameworks
                                              }
                                              sourceCode={fb.sourceCode}
                                              sourceFramework={
                                                fb.sourceFramework
                                              }
                                            />
                                            <Typography
                                              style={{
                                                fontSize: 11,
                                                color: "#64748b",
                                                lineHeight: 1.5,
                                              }}
                                            >
                                              {fb.metricName}
                                            </Typography>
                                          </Box>
                                        ))}
                                      </Box>
                                    )}
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                {metric ? (
                                  <Chip
                                    label="100.00%"
                                    color="primary"
                                    size="small"
                                    style={{ fontWeight: 600 }}
                                  />
                                ) : isFirst ? (
                                  <TargetScoreCell
                                    controlId={group.controlId}
                                    tenantId={tenantId}
                                    frameworkCode={activeFramework}
                                    targetScore={
                                      manualTargetScores[group.controlId] ??
                                      null
                                    }
                                    onSave={handleTargetScoreSaved}
                                  />
                                ) : (
                                  <span
                                    style={{ color: "#cbd5e1", fontSize: 13 }}
                                  >
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {metric ? (
                                  <Chip
                                    label={`${formatPercentage(metric.currentPerformance)}%`}
                                    size="small"
                                    style={{
                                      fontWeight: 700,
                                      fontSize: 12,
                                      minWidth: 70,
                                      height: 28,
                                      cursor: "default",
                                      ...getPerformanceColor(
                                        metric.currentPerformance,
                                      ),
                                    }}
                                  />
                                ) : editingControl === group.controlId ? (
                                  <TextField
                                    type="number"
                                    size="small"
                                    value={manualScores[group.controlId] ?? ""}
                                    onChange={(e) =>
                                      handleScoreChange(
                                        group.controlId,
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() =>
                                      handleScoreSave(group.controlId)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        handleScoreSave(group.controlId);
                                    }}
                                    autoFocus
                                    inputProps={{
                                      min: 0,
                                      max: 100,
                                      step: 0.01,
                                      style: { textAlign: "center", width: 70 },
                                    }}
                                  />
                                ) : (
                                  <Tooltip
                                    title={
                                      isAllFrameworks
                                        ? "Score editing not available in unified view"
                                        : isMappingOnlyFw && group.status !== "disconnected"
                                          ? "Score is derived from mapped framework data"
                                          : !hasAnyDocument(group.controlId)
                                            ? "Upload a document first to enter score"
                                            : "Click to edit score"
                                    }
                                    arrow
                                  >
                                    <span>
                                      <Chip
                                        label={
                                          manualScores[group.controlId] !==
                                            undefined &&
                                            manualScores[group.controlId] !== null
                                            ? `${manualScores[group.controlId]}%`
                                            : "—"
                                        }
                                        size="small"
                                        onClick={() => {
                                          // Allow editing only when a document exists, regardless of framework type.
                                          // For mapping-only frameworks: also requires status = disconnected
                                          // (mapped controls derive their score from source framework data).
                                          const canEdit =
                                            (!isMappingOnlyFw &&
                                              !isAllFrameworks &&
                                              hasAnyDocument(group.controlId)) ||
                                            (isMappingOnlyFw &&
                                              group.status === "disconnected" &&
                                              hasAnyDocument(group.controlId));
                                          if (canEdit)
                                            setEditingControl(group.controlId);
                                        }}
                                        style={{
                                          cursor: (() => {
                                            if (isAllFrameworks) return "not-allowed";
                                            if (isMappingOnlyFw && group.status !== "disconnected") return "not-allowed";
                                            return hasAnyDocument(group.controlId) ? "pointer" : "not-allowed";
                                          })(),
                                          fontWeight: 700,
                                          fontSize: 12,
                                          minWidth: 70,
                                          height: 28,
                                          opacity: (() => {
                                            if (isAllFrameworks) return 0.5;
                                            if (isMappingOnlyFw && group.status !== "disconnected") return 0.5;
                                            return hasAnyDocument(group.controlId) ? 1 : 0.5;
                                          })(),
                                          ...(manualScores[group.controlId] !==
                                            undefined &&
                                            manualScores[group.controlId] !== null
                                            ? getPerformanceColor(
                                              parseFloat(
                                                manualScores[group.controlId],
                                              ),
                                            )
                                            : {
                                              backgroundColor: "#f5f5f5",
                                              color: "#666",
                                            }),
                                        }}
                                      />
                                    </span>
                                  </Tooltip>
                                )}
                              </TableCell>
                              <TableCell
                                align="center"
                                style={{ minWidth: 220 }}
                              >
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  style={{ gap: 4 }}
                                >
                                  {showEvidence && (
                                    <>
                                      <Tooltip title="View evidence" arrow>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            setEvidenceModal({
                                              open: true,
                                              data: metric.evidence,
                                            })
                                          }
                                          style={{
                                            backgroundColor: "#e3f2fd",
                                            color: "#1976d2",
                                            width: 32,
                                            height: 32,
                                          }}
                                        >
                                          <VisibilityIcon
                                            style={{ fontSize: 16 }}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                      {group.formula && (
                                        <Tooltip title="View formula" arrow>
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              setEvidenceModal({
                                                open: true,
                                                data: group.formula,
                                              })
                                            }
                                            style={{
                                              backgroundColor: "#f0f4ff",
                                              color: "#5c6bc0",
                                              width: 32,
                                              height: 32,
                                            }}
                                          >
                                            <FunctionsIcon
                                              style={{ fontSize: 16 }}
                                            />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </>
                                  )}
                                  {group.status === "disconnected" && (
                                    <>
                                      <ManualUploadCell
                                        controlId={group.controlId}
                                        tenantId={tenantId}
                                        onUpload={handleManualUpload}
                                        uploadedFileName={
                                          upload?.fileName || null
                                        }
                                        uploadedFileId={upload?.fileId || null}
                                        isUploading={
                                          uploadingControls[group.controlId] ||
                                          false
                                        }
                                        onViewFile={handleViewFile}
                                      />
                                      {upload?.fileId && (
                                        <Tooltip
                                          title="Delete evidence file"
                                          arrow
                                        >
                                          <span>
                                            <IconButton
                                              size="small"
                                              disabled={
                                                deletingControls[
                                                group.controlId
                                                ]
                                              }
                                              onClick={() =>
                                                handleDeleteFile(
                                                  group.controlId,
                                                  upload.fileId,
                                                  upload.fileName,
                                                )
                                              }
                                              style={{
                                                backgroundColor: "#ffebee",
                                                color: "#d32f2f",
                                                width: 32,
                                                height: 32,
                                              }}
                                            >
                                              {deletingControls[
                                                group.controlId
                                              ] ? (
                                                <CircularProgress
                                                  size={14}
                                                  style={{ color: "#d32f2f" }}
                                                />
                                              ) : (
                                                <DeleteIcon
                                                  style={{ fontSize: 16 }}
                                                />
                                              )}
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                      )}
                                      {!isAllFrameworks &&
                                        !mappingOnlyCodes.has(
                                          activeFramework,
                                        ) &&
                                        (approvalStatuses[group.controlId] ===
                                          "APPROVED" ? (
                                          <Tooltip title="Approved" arrow>
                                            <CheckCircleIcon
                                              style={{
                                                fontSize: 24,
                                                color: "#2e7d32",
                                              }}
                                            />
                                          </Tooltip>
                                        ) : (
                                          <Tooltip
                                            title="Approve this control"
                                            arrow
                                          >
                                            <span>
                                              <IconButton
                                                size="small"
                                                disabled={
                                                  approvingControls[
                                                  group.controlId
                                                  ]
                                                }
                                                onClick={() =>
                                                  handleApprove(group.controlId)
                                                }
                                                style={{
                                                  backgroundColor: "#e8f5e9",
                                                  color: "#2e7d32",
                                                  width: 32,
                                                  height: 32,
                                                }}
                                              >
                                                {approvingControls[
                                                  group.controlId
                                                ] ? (
                                                  <CircularProgress
                                                    size={14}
                                                    style={{ color: "#2e7d32" }}
                                                  />
                                                ) : (
                                                  <CheckCircleOutlineIcon
                                                    style={{ fontSize: 16 }}
                                                  />
                                                )}
                                              </IconButton>
                                            </span>
                                          </Tooltip>
                                        ))}
                                    </>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell
                                align="center"
                                style={{ minWidth: 120 }}
                              >
                                {isFirst &&
                                  (hasTask ? (
                                    <Box
                                      display="flex"
                                      flexDirection="column"
                                      alignItems="center"
                                      style={{ gap: 4 }}
                                    >
                                      <CheckCircleIcon
                                        style={{
                                          fontSize: 20,
                                          color: "#22c55e",
                                        }}
                                      />
                                      <span
                                        style={{
                                          fontSize: 10,
                                          color: "#22c55e",
                                          fontWeight: 700,
                                        }}
                                      >
                                        Task created
                                      </span>
                                      <Button
                                        size="small"
                                        onClick={() =>
                                          setAddTaskFor({
                                            controlId: group.controlId,
                                            controlName: group.controlName,
                                          })
                                        }
                                        style={{
                                          fontSize: 10,
                                          padding: "2px 8px",
                                          minWidth: 0,
                                          textTransform: "none",
                                          border: "1px solid #bbf7d0",
                                          background: "#f0fdf4",
                                          color: "#166534",
                                        }}
                                      >
                                        + Another
                                      </Button>
                                    </Box>
                                  ) : (
                                    <Tooltip
                                      title="Create Corrective Action Task"
                                      arrow
                                    >
                                      <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() =>
                                          setAddTaskFor({
                                            controlId: group.controlId,
                                            controlName: group.controlName,
                                          })
                                        }
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 700,
                                          textTransform: "none",
                                          background: "#4f46e5",
                                          color: "#fff",
                                          borderRadius: 8,
                                          padding: "5px 10px",
                                          minWidth: 0,
                                          boxShadow:
                                            "0 2px 6px rgba(79,70,229,0.3)",
                                        }}
                                        startIcon={<ClipboardList size={11} />}
                                      >
                                        Add CAP
                                      </Button>
                                    </Tooltip>
                                  ))}
                              </TableCell>
                            </TableRow>
                          );
                        },
                      )}

                      {currentPageRows.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={colSpanCount}
                            align="center"
                            style={{ padding: "60px 20px" }}
                          >
                            <div
                              style={{
                                color: "#64748b",
                                fontSize: 18,
                                fontWeight: 500,
                              }}
                            >
                              {search
                                ? "No matching controls found"
                                : tenantError
                                  ? "Unable to load compliance data"
                                  : isAllFrameworks
                                    ? "No unified compliance data available"
                                    : `No ${fwConfig?.label || activeFramework} compliance data available`}
                            </div>
                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: 14,
                                marginTop: 8,
                              }}
                            >
                              {search
                                ? "Try adjusting your search"
                                : tenantError
                                  ? "Please contact your administrator"
                                  : isAllFrameworks
                                    ? "Make sure at least one framework has controls configured"
                                    : mappingOnlyCodes &&
                                      mappingOnlyCodes.has(activeFramework)
                                      ? `Make sure source framework data is synced for ${fwConfig?.label || activeFramework}`
                                      : "Try syncing from cloud or refresh the data"}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <Box mt={3}>
                  <TablePagination
                    component="div"
                    count={totalRows}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50]}
                    labelRowsPerPage="Rows per page:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} of ${count}`
                    }
                  />
                </Box>
              </>
            )}
          </Paper>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <SnackbarContent
              style={{
                backgroundColor:
                  snackbar.severity === "error"
                    ? "#d32f2f"
                    : snackbar.severity === "warning"
                      ? "#f57c00"
                      : snackbar.severity === "success"
                        ? "#388e3c"
                        : "#1976d2",
                color: "white",
                fontSize: 14,
                fontWeight: 500,
                minWidth: 288,
                borderRadius: 4,
                boxShadow: "0 3px 5px -1px rgba(0,0,0,0.2)",
              }}
              message={
                <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                  <span style={{ fontSize: 18 }}>
                    {snackbar.severity === "error" && "❌"}
                    {snackbar.severity === "warning" && "⚠️"}
                    {snackbar.severity === "success" && "✅"}
                    {snackbar.severity === "info" && "ℹ️"}
                  </span>
                  <span>{snackbar.message}</span>
                </Box>
              }
              action={
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => setSnackbar({ ...snackbar, open: false })}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              }
            />
          </Snackbar>

          <Dialog
            open={confirmDelete.open}
            onClose={() =>
              setConfirmDelete({
                open: false,
                controlId: null,
                fileId: null,
                fileName: null,
              })
            }
            PaperProps={{ style: { borderRadius: 12, padding: 8 } }}
          >
            <DialogTitle style={{ fontWeight: 700, color: "#1e293b" }}>
              Delete Evidence File?
            </DialogTitle>
            <DialogContent>
              <Typography style={{ color: "#475569", fontSize: 14 }}>
                Are you sure you want to delete{" "}
                <strong>{confirmDelete.fileName}</strong> for control{" "}
                <strong>{confirmDelete.controlId}</strong>? This cannot be
                undone.
              </Typography>
            </DialogContent>
            <DialogActions style={{ padding: "12px 24px", gap: 8 }}>
              <Button
                onClick={() =>
                  setConfirmDelete({
                    open: false,
                    controlId: null,
                    fileId: null,
                    fileName: null,
                  })
                }
                variant="outlined"
                style={{
                  borderRadius: 8,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirmed}
                variant="contained"
                style={{
                  borderRadius: 8,
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: "#d32f2f",
                  color: "white",
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Evidence_Modal
            open={evidenceModal.open}
            evidence={evidenceModal.data}
            onClose={() => setEvidenceModal({ open: false, data: [] })}
          />
          <PdfPreviewModal
            open={pdfModal.open}
            onClose={handleClosePdfModal}
            pdfUrl={pdfModal.url}
            fileName={pdfModal.fileName}
          />

          {addTaskFor && (
            <AddTaskModal
              controlId={addTaskFor.controlId}
              controlName={addTaskFor.controlName}
              auditors={auditors}
              onClose={() => setAddTaskFor(null)}
              onCreated={() => {
                setTaskCreatedFor((prev) => ({
                  ...prev,
                  [addTaskFor.controlId]: true,
                }));
                setSnackbar({
                  open: true,
                  message: `✅ CAP task created for ${addTaskFor.controlId}`,
                  severity: "success",
                });
              }}
            />
          )}
        </Container>
      </Box>
    </>
  );
};

export default RiskAssessmentTable;