import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HandshakeIcon from "@mui/icons-material/Handshake";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import {
  Shield,
  Globe,
  Lock,
  Key,
  FileText,
  Settings,
  Rocket,
  Handshake,
  Scale,
  User,
  Users,
  Puzzle,
  CheckCircle,
  AlertTriangle,
  Database,
  Server,
  BarChart,
  TrendingUp,
  Award,
  Star,
  Zap,
  Plus,
  Trash2,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bell,
  FileSpreadsheet,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import "./collaboration-page.css";

const COLLAB_API =
  import.meta.env.VITE_COLLAB_API || "http://localhost:4035/api/collaboration";

const DEFAULT_PAGE_CONTENT = {
  id: "current",
  heroBadge: "🤝 CROSS-FUNCTIONAL COLLABORATION",
  heroTitle: "Collaborating with Consultants Factory",
  heroHighlight: "",
  heroDescription:
    "CF helps you scale, win bigger mandates, and manage resource gaps. All while protecting your client relationships and enhancing your consulting capabilities. Let's explore how our consultants collaborations can drive shared success.",
  heroImageUrl:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop",
  heroStats: [],
  overviewTag: "01 · COLLABORATION BENEFITS",
  overviewTitle: "Why Collaborate with Consultants Factory?",
  overviewDescription: "",
  pillars: [
    {
      title: "Expand Without Hiring",
      description:
        "Access a ready pool of expert consultants without growing your internal headcount.",
      icon: "Users",
    },
    {
      title: "Bridge Resource Gaps",
      description:
        "Rely on us when facing tight client deadlines or limited availability.",
      icon: "Clock",
    },
    {
      title: "Tap into New Expertise",
      description:
        "Leverage niche skills and domain-specific knowledge across industries.",
      icon: "Zap",
    },
    {
      title: "Bid for Bigger Projects",
      description:
        "Collaborate on large-scale tenders and assignments with full confidence.",
      icon: "ShieldCheck",
    },
  ],
  workflowTag: "",
  workflowTitle: "",
  workflowDescription: "",
  workflowSteps: [],
  featuresTag: "",
  featuresTitle: "",
  featuresDescription: "",
  featureCards: [],
  benefitsTag: "",
  benefitsTitle: "",
  benefitsDescription: "",
  matrixTitle: "Our Collaboration Matrix",
  matrixHeaders: [
    "References",
    "Co-Delivery",
    "Staff Augmentation",
    "Reverse Approach",
  ],
  matrixRows: [
    {
      rowLabel: "Summary",
      cells: [
        "You refer a client to us. We handle the sales, delivery, and billing directly with the client.",
        "We work together to win and deliver the project. Responsibilities are split based on our respective strengths.",
        "You own the client relationship and the project. We provide our consultants to work as part of your team.",
        "We own the project but lack specific expertise or capacity. We bring you in to deliver specific components.",
      ],
    },
    {
      rowLabel: "Suitable If",
      cells: [
        "You don't have the capability or desire to deliver the project yourself.",
        "The project requires combined expertise to win or deliver successfully.",
        "You want to scale up quickly for a specific project without hiring full-time staff.",
        "You have niche expertise or capacity that complements our core offerings.",
      ],
    },
    {
      rowLabel: "Client Contract",
      cells: [
        "Between Consultants Factory and the Client",
        "Joint contract or one party acts as prime contractor",
        "Between You and the Client",
        "Between Consultants Factory and the Client",
      ],
    },
    {
      rowLabel: "Invoicing",
      cells: [
        "Consultants Factory invoices the Client.",
        "Prime contractor invoices Client; Sub invoices Prime.",
        "You invoice the Client. We invoice you.",
        "Consultants Factory invoices Client. You invoice us.",
      ],
    },
    {
      rowLabel: "Branding",
      cells: [
        "Consultants Factory",
        "Co-branded or Prime contractor branded",
        "Your Brand (White-labeled)",
        "Consultants Factory",
      ],
    },
  ],
  footerHeadline: "Let's grow together by building stronger networks.",
  footerText1:
    "Partner with Consultants Factory to create meaningful opportunities, expand your capabilities, and deliver greater value to your clients.",
  footerText2:
    "Whether you're looking to collaborate, expand your service offerings, or build a long-term strategic partnership, let's explore how we can grow together.",
  footerText3:
    "Take the first step towards a more secure and compliant future.",
  footerContact:
    "Get in touch with us at +91 99450 77727 or email us at info@consultantsfactory.com",
  formBadge: "🤝 Connect With Us",
  formTitle: "Interested in Collaborating?",
  formSubtitle: "",
  formSubmitButtonText: "Submit Request",
};

const ICON_MAP = {
  Shield,
  Globe,
  Lock,
  Key,
  FileText,
  Settings,
  Rocket,
  Handshake,
  Scale,
  User,
  Users,
  Puzzle,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Database,
  Server,
  BarChart,
  TrendingUp,
  Award,
  Star,
  Zap,
  ShieldCheck,
  Clock,
  Bell,
  FileSpreadsheet,
};
const ICON_NAMES = Object.keys(ICON_MAP);

const DynamicIcon = ({ name, size = 24 }) => {
  if (!name || name === "None") return null;
  const Icon = ICON_MAP[name] || Handshake;
  return <Icon size={size} />;
};

const CHROME = {
  outline: "1px dashed #93c5fd",
  hoverBg: "rgba(59,130,246,0.06)",
  accent: "#4f46e5",
  danger: "#dc2626",
};

const editableBoxStyle = (editing, tag) => ({
  cursor: "text",
  outline: editing
    ? `1px solid ${CHROME.accent}`
    : `1px dashed rgba(79,70,229,0.35)`,
  outlineOffset: 2,
  borderRadius: 4,
  transition: "outline-color .15s, background-color .15s",
  display: tag === "span" ? "inline" : "inline-block",
  width: tag === "span" ? "auto" : "100%",
});

const EditableText = ({
  value,
  onChange,
  placeholder,
  tag = "span",
  className,
  multiline,
  editable = true,
}) => {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    if (editing && inputRef.current) {
      const el = inputRef.current;
      el.style.setProperty("color", "#111827", "important");
      el.style.setProperty("background-color", "#ffffff", "important");
      el.style.setProperty("-webkit-text-fill-color", "#111827", "important");
      el.focus();
      const len = el.value.length;
      el.setSelectionRange?.(len, len);
    }
  }, [editing]);

  if (!editable) {
    const Tag = tag;
    return (
      <Tag className={className}>
        {value || <span style={{ opacity: 0.35 }}>{placeholder}</span>}
      </Tag>
    );
  }

  const commit = () => {
    const newVal = inputRef.current ? inputRef.current.value : value;
    setEditing(false);
    if (newVal !== (value || "")) onChange(newVal);
  };

  const cancel = () => setEditing(false);

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
    return multiline ? (
      <textarea
        {...commonProps}
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) commit();
          if (e.key === "Escape") cancel();
        }}
      />
    ) : (
      <input
        {...commonProps}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
      />
    );
  }

  const Tag = tag;
  return (
    <Tag
      className={className}
      onClick={() => setEditing(true)}
      style={editableBoxStyle(false, tag)}
      onMouseEnter={(e) => {
        e.currentTarget.style.outlineColor = CHROME.outline.split(" ")[2];
        setHovered(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.outlineColor = "rgba(79,70,229,0.35)";
        setHovered(false);
      }}
      title="Click to edit"
    >
      {value || <span style={{ opacity: 0.35 }}>{placeholder}</span>}
      {hovered && value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Are you sure you want to delete this text?")) {
              onChange("");
              setHovered(false);
            }
          }}
          style={{
            marginLeft: 8,
            background: "none",
            border: "none",
            color: "#ef4444",
            cursor: "pointer",
            padding: "2px 4px",
            verticalAlign: "middle",
            borderRadius: 4,
          }}
          title="Clear text"
        >
          <Trash2 size={14} />
        </button>
      )}
    </Tag>
  );
};

const HoverDelete = ({ onClick, label = "Remove" }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    title={label}
    style={{
      position: "absolute",
      top: -10,
      right: -10,
      zIndex: 5,
      width: 26,
      height: 26,
      borderRadius: "50%",
      border: "1px solid #fca5a5",
      background: "#fff",
      color: CHROME.danger,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
    }}
  >
    <Trash2 size={13} />
  </button>
);

const EditableCardShell = ({
  editable,
  onRemove,
  children,
  style,
  className,
}) => {
  const [hover, setHover] = useState(false);
  if (!editable)
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  return (
    <div
      className={className}
      style={{
        ...style,
        position: "relative",
        outline: hover
          ? `1px dashed ${CHROME.accent}`
          : "1px dashed rgba(79,70,229,0.25)",
        outlineOffset: 4,
        borderRadius: 12,
        transition: "outline-color .15s",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {onRemove && <HoverDelete onClick={onRemove} />}
      {children}
    </div>
  );
};

const AddCardTile = ({ label, onClick, minHeight = 140 }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      minHeight,
      borderRadius: 12,
      border: `1.5px dashed #c7d2fe`,
      background: "rgba(79,70,229,0.03)",
      color: CHROME.accent,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      cursor: "pointer",
      width: "100%",
      fontWeight: 600,
      fontSize: 13,
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.background = "rgba(79,70,229,0.07)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.background = "rgba(79,70,229,0.03)")
    }
  >
    <Plus size={20} />
    {label}
  </button>
);

const EditableBulletList = ({
  items = [],
  onChange,
  editable,
  addLabel = "Add point",
}) => {
  const update = (i, v) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, "New point"]);

  if (!editable) {
    return items.length ? (
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    ) : null;
  }
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <span style={{ opacity: 0.5, color: "#818cf8" }}>•</span>
          <EditableText
            value={it}
            onChange={(v) => update(i, v)}
            editable
            placeholder="Bullet point"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            title="Remove point"
            style={{
              border: "none",
              background: "none",
              color: CHROME.danger,
              cursor: "pointer",
              padding: 2,
              display: "flex",
            }}
          >
            <X size={13} />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={add}
          style={{
            border: "none",
            background: "none",
            color: CHROME.accent,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 0",
          }}
        >
          <Plus size={12} /> {addLabel}
        </button>
      </li>
    </ul>
  );
};

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
        title={!value || value === "None" ? "Add icon" : "Change icon"}
        style={{
          border: "1px dashed transparent",
          background: "none",
          cursor: "pointer",
          padding: 4,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: size + 8,
          minHeight: size + 8,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = CHROME.accent)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "transparent")
        }
      >
        {!value || value === "None" ? (
          <span style={{ fontSize: 10, color: "#9ca3af" }}>No Icon</span>
        ) : (
          <DynamicIcon name={value} size={size} />
        )}
      </button>
      {open &&
        createPortal(
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 1000 }}
              onClick={() => setOpen(false)}
            />
            <div
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                zIndex: 1001,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                padding: 8,
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 4,
                width: 220,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onChange("None");
                  setOpen(false);
                }}
                title="Remove Icon"
                style={{
                  gridColumn: "span 6",
                  border: "1px dashed #ef4444",
                  borderRadius: 6,
                  cursor: "pointer",
                  padding: "4px 0",
                  background: "rgba(239,68,68,0.05)",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <Trash2 size={14} style={{ marginRight: 4 }} /> Remove Icon
              </button>
              {ICON_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  title={name}
                  style={{
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    padding: 6,
                    background:
                      name === value ? "rgba(79,70,229,0.12)" : "transparent",
                    color: name === value ? CHROME.accent : "#374151",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DynamicIcon name={name} size={16} />
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

// ── Image Upload Button / Dropzone Component ─────────────────────────────────
const PhotoUploader = ({
  imageUrl,
  onImageUploaded,
  label = "Upload Photograph",
  editable = true,
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await axios.post(`${COLLAB_API}/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) {
        onImageUploaded(res.data.url);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please ensure backend is running.");
    } finally {
      setUploading(false);
    }
  };

  if (!editable) {
    return imageUrl ? (
      <img
        src={imageUrl}
        alt="Collaboration Visual"
        style={{ width: "100%", borderRadius: "8px" }}
      />
    ) : null;
  }

  return (
    <div style={{ marginTop: 8, marginBottom: 8 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {imageUrl ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={imageUrl}
            alt="Uploaded preview"
            style={{
              width: "100%",
              borderRadius: "8px",
              border: "1px solid rgba(79,70,229,0.2)",
            }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Replace Photo"}
            </Button>
            <Button
              size="small"
              color="error"
              variant="text"
              startIcon={<Trash2 size={14} />}
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to remove this photo? (Don't forget to click 'Publish Page' to save this change!)",
                  )
                ) {
                  onImageUploaded("");
                }
              }}
            >
              Remove
            </Button>
          </Stack>
        </div>
      ) : (
        <Button
          size="small"
          variant="outlined"
          startIcon={
            uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />
          }
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          sx={{ borderStyle: "dashed", borderColor: "#818cf8" }}
        >
          {uploading ? "Uploading..." : label}
        </Button>
      )}
      {/* <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#6b7280' }}>
        Recommended photo size: 1200 x 800 pixels (Landscape)
      </Typography> */}
    </div>
  );
};

// ── Main Collaboration Content Editor ───────────────────────────────────────
const CollaborationContent = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Editor/Page, 1 = Submitted Inquiries
  const [pageContent, setPageContent] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("desc");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${COLLAB_API}`);
      if (res.data && Object.keys(res.data).length > 0) {
        setPageContent(res.data);
      } else {
        setPageContent(DEFAULT_PAGE_CONTENT);
      }
    } catch (err) {
      console.warn(
        "Backend not reachable yet (or starting up). Loading local default template:",
        err.message,
      );
      setPageContent(DEFAULT_PAGE_CONTENT);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInquiries = useCallback(async () => {
    try {
      const res = await axios.get(`${COLLAB_API}/inquiries`);
      setInquiries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Inquiries endpoint offline:", err.message);
      setInquiries([]);
    }
  }, []);

  useEffect(() => {
    loadContent();
    loadInquiries();
  }, [loadContent, loadInquiries]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${COLLAB_API}/page-content`, pageContent);
      setSnack({
        open: true,
        message: "Collaboration page published successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Save error:", err);
      setSnack({
        open: true,
        message: "Save failed. Please verify backend service.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?"))
      return;
    try {
      await axios.delete(`${COLLAB_API}/inquiries/${id}`);
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      setSnack({ open: true, message: "Inquiry deleted.", severity: "info" });
    } catch (err) {
      console.error("Delete failed:", err);
      setSnack({ open: true, message: "Delete failed.", severity: "error" });
    }
  };

  // Field helpers
  const set = (key, value) =>
    setPageContent((prev) => ({ ...prev, [key]: value }));

  const setListField = (listKey, index, field, value) => {
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

  const setMatrixCell = (rowIndex, colIndex, value) => {
    setPageContent((prev) => {
      const arr = [...(prev.matrixRows || [])];
      if (arr[rowIndex]) {
        const newCells = [...(arr[rowIndex].cells || [])];
        newCells[colIndex] = value;
        arr[rowIndex] = { ...arr[rowIndex], cells: newCells };
      }
      return { ...prev, matrixRows: arr };
    });
  };

  const setMatrixHeader = (colIndex, value) => {
    setPageContent((prev) => {
      const arr = [...(prev.matrixHeaders || [])];
      arr[colIndex] = value;
      return { ...prev, matrixHeaders: arr };
    });
  };

  const addMatrixColumn = () => {
    setPageContent((prev) => {
      const headers = [...(prev.matrixHeaders || [])];
      headers.push("New Column");
      const rows = (prev.matrixRows || []).map((row) => ({
        ...row,
        cells: [...(row.cells || []), ""],
      }));
      return { ...prev, matrixHeaders: headers, matrixRows: rows };
    });
  };

  const removeMatrixColumn = (colIndex) => {
    if (!window.confirm("Are you sure you want to delete this column?")) return;
    setPageContent((prev) => {
      const headers = [...(prev.matrixHeaders || [])];
      headers.splice(colIndex, 1);
      const rows = (prev.matrixRows || []).map((row) => {
        const cells = [...(row.cells || [])];
        cells.splice(colIndex, 1);
        return { ...row, cells };
      });
      return { ...prev, matrixHeaders: headers, matrixRows: rows };
    });
  };

  const sortedInquiries = [...inquiries].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const paginatedInquiries = sortedInquiries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (loading || !pageContent) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const pc = pageContent;
  const ed = editMode;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#050816", color: "#f8fafc" }}>
      {/* ── Sticky Admin Control Bar ────────────────────────────────────────── */}
      <Paper
        elevation={4}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderRadius: 0,
          bgcolor: "#0f172a",
          borderBottom: "1px solid rgba(148,163,184,0.2)",
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <HandshakeIcon sx={{ color: "#4f46e5" }} /> Collaboration Page
            Editor
          </Typography>
        </Stack>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          textColor="inherit"
          indicatorColor="primary"
        >
          <Tab
            icon={<EditIcon fontSize="small" />}
            iconPosition="start"
            label="Page Editor"
            sx={{
              opacity: 1,
              fontWeight: 700,
              color: "#ffffff !important",
              borderRadius: "8px 8px 0 0",
              px: 3,
            }}
          />
          <Tab
            icon={<EmailIcon fontSize="small" />}
            iconPosition="start"
            label={`Form Leads (${inquiries.length})`}
            sx={{
              opacity: 1,
              fontWeight: 700,
              color: "#ffffff !important",
              borderRadius: "8px 8px 0 0",
              px: 3,
            }}
          />
        </Tabs>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {activeTab === 0 && (
            <>
              <Tooltip
                title={ed ? "Switch to Live Preview" : "Switch to Edit Mode"}
              >
                <Button
                  size="small"
                  variant={ed ? "outlined" : "contained"}
                  startIcon={ed ? <VisibilityIcon /> : <EditIcon />}
                  onClick={() => setEditMode((v) => !v)}
                  sx={{
                    color: ed ? "#050e31ff" : "#090808ff",
                    borderColor: "#4f46e5",
                  }}
                >
                  {ed ? "Preview Mode" : "Edit Mode"}
                </Button>
              </Tooltip>

              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{ bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
              >
                {saving ? "Saving..." : "Publish Page"}
              </Button>
            </>
          )}
        </Stack>
      </Paper>

      {/* ── Tab 1: Leads / Form Submissions List ───────────────────────────── */}
      {activeTab === 1 && (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={1}>
            Received Collaboration Requests
          </Typography>
          <Typography color="text.secondary" mb={3} sx={{ color: "#94a3b8" }}>
            All leads submitted through the Collaboration Form.
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              bgcolor: "#0b1020",
              border: "1px solid rgba(148,163,184,0.15)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(79,70,229,0.1)" }}>
                  <TableCell sx={{ color: "#0c1021ff", fontWeight: 700 }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: "#0c1021ff", fontWeight: 700 }}>
                    Work Email
                  </TableCell>
                  <TableCell sx={{ color: "#0c1021ff", fontWeight: 700 }}>
                    Contact Number
                  </TableCell>
                  <TableCell sx={{ color: "#0c1021ff", fontWeight: 700 }}>
                    Organization
                  </TableCell>
                  <TableCell sx={{ color: "#0c1021ff", fontWeight: 700 }}>
                    <TableSortLabel
                      active={true}
                      direction={sortOrder}
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      sx={{
                        color: "inherit !important",
                        "& .MuiTableSortLabel-icon": {
                          color: "inherit !important",
                        },
                      }}
                    >
                      Date Received
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inquiries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ color: "#94a3b8", py: 4 }}
                    >
                      No collaboration requests received yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInquiries.map((inq) => (
                    <TableRow
                      key={inq.id}
                      sx={{
                        borderBottom: "1px solid rgba(148,163,184,0.15)",
                        "&:hover": {
                          backgroundColor: "transparent !important",
                          outline: "2px solid #3b82f6",
                          outlineOffset: "-2px",
                        },
                        "&:hover td, &.MuiTableRow-hover:hover td": {
                          backgroundColor: "transparent !important",
                        },
                      }}
                    >
                      <TableCell sx={{ color: "#f8fafc", fontWeight: 600 }}>
                        {inq.name}
                      </TableCell>
                      <TableCell sx={{ color: "#818cf8" }}>
                        {inq.email}
                      </TableCell>
                      <TableCell sx={{ color: "#f8fafc" }}>
                        {inq.contactNumber}
                      </TableCell>
                      <TableCell sx={{ color: "#f8fafc" }}>
                        {inq.organization}
                      </TableCell>
                      <TableCell sx={{ color: "#94a3b8" }}>
                        {new Date(inq.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={inquiries.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              color: "#94a3b8",
              ".MuiTablePagination-selectIcon": {
                color: "#94a3b8",
              },
              ".MuiTablePagination-actions button": {
                color: "#94a3b8",
              },
            }}
          />
        </Box>
      )}

      {/* ── Tab 0: Live WYSIWYG Page Editor ───────────────────────────────── */}
      {activeTab === 0 && (
        <div
          className="fw-root collab-page-container"
          style={{ "--fw-accent": "#6366f1" }}
        >
          <div className="collab-layout-wrapper">
            {/* ─── LEFT COLUMN: SCROLLABLE NARRATIVE CONTENT ─── */}
            <div className="collab-content-column">
              {/* Hero Narrative Block */}
              <div className="collab-hero-block">
                <div className="collab-badge">
                  <EditableText
                    editable={ed}
                    value={pc.heroBadge}
                    placeholder="Hero Badge"
                    onChange={(v) => set("heroBadge", v)}
                  />
                </div>
                <h1 className="collab-title">
                  <EditableText
                    editable={ed}
                    value={pc.heroTitle}
                    placeholder="Hero Title"
                    onChange={(v) => set("heroTitle", v)}
                  />
                </h1>
                <p className="collab-lead">
                  <EditableText
                    tag="span"
                    editable={ed}
                    multiline
                    value={pc.heroDescription}
                    placeholder="Hero Description"
                    onChange={(v) => set("heroDescription", v)}
                  />
                </p>
              </div>

              {/* 1. Pillars */}
              <div className="collab-narrative-section">
                <span className="collab-section-tag">
                  <EditableText
                    editable={ed}
                    value={pc.overviewTag}
                    placeholder="Section 1 Tag"
                    onChange={(v) => set("overviewTag", v)}
                  />
                </span>
                <h2>
                  <EditableText
                    editable={ed}
                    value={pc.overviewTitle}
                    placeholder="Section 1 Title"
                    onChange={(v) => set("overviewTitle", v)}
                  />
                </h2>
                <div className="collab-points-list">
                  {(pc.pillars || []).map((card, i) => (
                    <EditableCardShell
                      key={i}
                      editable={ed}
                      onRemove={() => removeListItem("pillars", i)}
                      className="collab-point-item"
                    >
                      <div className="collab-point-icon">
                        <EditableIcon
                          editable={ed}
                          value={card.icon}
                          onChange={(v) =>
                            setListField("pillars", i, "icon", v)
                          }
                        />
                      </div>
                      <div className="collab-point-text">
                        <h4>
                          <EditableText
                            editable={ed}
                            value={card.title}
                            placeholder="Title"
                            onChange={(v) =>
                              setListField("pillars", i, "title", v)
                            }
                          />
                        </h4>
                        <p>
                          <EditableText
                            tag="span"
                            editable={ed}
                            multiline
                            value={card.description}
                            placeholder="Description"
                            onChange={(v) =>
                              setListField("pillars", i, "description", v)
                            }
                          />
                        </p>
                      </div>
                    </EditableCardShell>
                  ))}
                  {ed && (
                    <AddCardTile
                      label="+ Add Collaboration Benefit"
                      minHeight={70}
                      onClick={() =>
                        addListItem("pillars", {
                          icon: "Users",
                          title: "New Reason",
                          description: "Reason description",
                        })
                      }
                    />
                  )}
                </div>

                {/* Admin Image Upload for the page */}
                <div style={{ marginTop: "2rem" }}>
                  <PhotoUploader
                    imageUrl={pc.heroImageUrl}
                    onImageUploaded={(url) => set("heroImageUrl", url)}
                    label="Upload Collaboration Image"
                    editable={ed}
                  />
                </div>
              </div>
            </div>

            {/* ─── RIGHT COLUMN: ALWAYS VISIBLE STICKY FORM ─── */}
            <aside className="collab-sidebar-column">
              <div className="collab-sticky-form-box">
                <div className="collab-form-head">
                  <div className="collab-form-badge">
                    <span>
                      <EditableText
                        editable={ed}
                        value={pc.formBadge}
                        placeholder="Form Badge"
                        onChange={(v) => set("formBadge", v)}
                      />
                    </span>
                  </div>
                  <h3>
                    <EditableText
                      editable={ed}
                      value={pc.formTitle}
                      placeholder="Form Title"
                      onChange={(v) => set("formTitle", v)}
                    />
                  </h3>
                </div>

                <div className="collab-form">
                  <div className="collab-input-group">
                    <label>Full Name *</label>
                    <input type="text" disabled placeholder="e.g. John Doe" />
                  </div>
                  <div className="collab-input-group">
                    <label>Work Email *</label>
                    <input
                      type="email"
                      disabled
                      placeholder="e.g. john@company.com"
                    />
                  </div>
                  <div className="collab-input-group">
                    <label>Contact Number *</label>
                    <input
                      type="tel"
                      disabled
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                  <div className="collab-input-group">
                    <label>Organization *</label>
                    <input type="text" disabled placeholder="e.g. Acme Corp" />
                  </div>
                  <button type="button" disabled className="collab-submit-btn">
                    <span>
                      <EditableText
                        editable={ed}
                        value={pc.formSubmitButtonText}
                        placeholder="Submit Button"
                        onChange={(v) => set("formSubmitButtonText", v)}
                      />
                    </span>
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {/* ── MATRIX SECTION ── */}
          <div className="collab-matrix-section">
            <h2>
              <EditableText
                editable={ed}
                value={pc.matrixTitle}
                placeholder="Matrix Title"
                onChange={(v) => set("matrixTitle", v)}
              />
            </h2>
            <div className="collab-matrix-table-wrapper">
              <table className="collab-matrix-table">
                <thead>
                  <tr>
                    <th></th>
                    {(
                      pc.matrixHeaders || [
                        "References",
                        "Co-Delivery",
                        "Staff Augmentation",
                        "Reverse Approach",
                      ]
                    ).map((hdr, i) => (
                      <th key={i} style={{ position: "relative" }}>
                        <EditableText
                          editable={ed}
                          value={hdr}
                          placeholder="Column Name"
                          onChange={(v) => setMatrixHeader(i, v)}
                        />
                        {ed && (
                          <HoverDelete
                            label="Remove Column"
                            onClick={() => removeMatrixColumn(i)}
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(pc.matrixRows || []).map((row, i) => {
                    const headers = pc.matrixHeaders || [
                      "References",
                      "Co-Delivery",
                      "Staff Augmentation",
                      "Reverse Approach",
                    ];
                    return (
                      <tr key={i} style={{ position: "relative" }}>
                        <td
                          className="collab-matrix-row-label"
                          data-label="Category"
                          style={{ position: "relative" }}
                        >
                          {ed && (
                            <HoverDelete
                              label="Remove Row"
                              onClick={() => removeListItem("matrixRows", i)}
                            />
                          )}
                          <EditableText
                            editable={ed}
                            multiline
                            value={row.rowLabel}
                            placeholder="Row Label"
                            onChange={(v) =>
                              setListField("matrixRows", i, "rowLabel", v)
                            }
                          />
                        </td>
                        {(row.cells || []).map((cell, cIdx) => (
                          <td key={cIdx} data-label={headers[cIdx] || ""}>
                            <EditableText
                              editable={ed}
                              multiline
                              value={cell}
                              placeholder={`Col ${cIdx + 1}`}
                              onChange={(v) => setMatrixCell(i, cIdx, v)}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {ed && (
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    addListItem("matrixRows", {
                      rowLabel: "New Row",
                      cells: (pc.matrixHeaders || []).map(() => ""),
                    })
                  }
                >
                  + Add Matrix Row
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => addMatrixColumn()}
                >
                  + Add Matrix Column
                </Button>
              </div>
            )}
          </div>

          {/* ── FOOTER CTA SECTION ── */}
          <div className="collab-footer-section">
            <h2>
              <EditableText
                editable={ed}
                value={pc.footerHeadline}
                placeholder="Footer Headline"
                onChange={(v) => set("footerHeadline", v)}
              />
            </h2>
            <p>
              <EditableText
                editable={ed}
                value={pc.footerText1}
                multiline
                placeholder="Text 1"
                onChange={(v) => set("footerText1", v)}
              />
            </p>
            <p>
              <EditableText
                editable={ed}
                value={pc.footerText2}
                multiline
                placeholder="Text 2"
                onChange={(v) => set("footerText2", v)}
              />
            </p>
            <p>
              <EditableText
                editable={ed}
                value={pc.footerText3}
                multiline
                placeholder="Text 3"
                onChange={(v) => set("footerText3", v)}
              />
            </p>
            <p className="collab-footer-contact">
              <EditableText
                editable={ed}
                value={pc.footerContact}
                multiline
                placeholder="Contact Info"
                onChange={(v) => set("footerContact", v)}
              />
            </p>
          </div>
        </div>
      )}

      {/* ── Bottom Floating Save Bar ───────────────────────────────────────── */}
      {activeTab === 0 && ed && (
        <Paper
          elevation={8}
          sx={{
            position: "sticky",
            bottom: 16,
            mx: 3,
            mb: 2,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: 3,
            bgcolor: "#0f172a",
            border: "1px solid rgba(79,70,229,0.4)",
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              bgcolor: "#4f46e5",
              px: 4,
              py: 1.2,
              fontWeight: 700,
              "&:hover": { bgcolor: "#4338ca" },
            }}
          >
            {saving ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} color="inherit" />
                Publishing...
              </>
            ) : (
              "Publish Collaboration Page"
            )}
          </Button>
        </Paper>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CollaborationContent;
