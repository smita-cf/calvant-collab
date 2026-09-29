import React, { useEffect, useState } from "react";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";
import templateRiskService from "../services/templateRiskService";
import riskService from "../services/riskService";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const STAT_CONFIG = {
  Total: {
    gradient: "linear-gradient(135deg,#4f8ef7,#2563eb)",
    Icon: ClipboardList,
  },
  High: {
    gradient: "linear-gradient(135deg,#f97316,#ea580c)",
    Icon: AlertTriangle,
  },
  Critical: {
    gradient: "linear-gradient(135deg,#ef4444,#dc2626)",
    Icon: AlertOctagon,
  },
  Medium: {
    gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
    Icon: ShieldAlert,
  },
  Low: {
    gradient: "linear-gradient(135deg,#10b981,#059669)",
    Icon: CheckCircle2,
  },
};

function StatCard({ value, label, index }) {
  const s = STAT_CONFIG[label] || STAT_CONFIG["Total"];
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #f1f5f9",
        borderRadius: 12,
        padding: "14px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "default",
        transition: "box-shadow 0.2s",
        animation: `cardIn 0.4s ease ${index * 0.05}s both`,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.09)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)")
      }
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: s.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      >
        <s.Icon size={16} color="white" strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#1e293b",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: 2,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Risk Level pill ──────────────────────────────────────────────────────────
function RiskLevelPill({ level }) {
  const map = {
    high: { bg: "#fdf2e9", color: "#721c24" },
    medium: { bg: "#fef9e7", color: "#856404" },
    low: { bg: "#d5f4e6", color: "#155724" },
    critical: { bg: "#fadbd8", color: "#721c24" },
  };
  const c = map[String(level || "").toLowerCase()] || {
    bg: "#e9ecef",
    color: "#495057",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        background: c.bg,
        color: c.color,
      }}
    >
      {level || "—"}
    </span>
  );
}


// ─── Department Dropdown ──────────────────────────────────────────────────────
const DepartmentDropdown = ({ departments, risks, selected, onSelect }) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef(null);
  const inputRef = React.useRef(null);
  

  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [open]);

  const filtered = departments.filter((d) =>
    d.toLowerCase().includes(query.toLowerCase())
  );

  const getCount = (dept) =>
    dept === "All" ? risks.length : risks.filter((r) => r.department === dept).length;

  const highlight = (text, q) => {
    if (!q) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <mark style={{ background: "#fef08a", color: "#713f12", borderRadius: 2, padding: "0 1px", fontWeight: 700 }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </span>
    );
  };

  const selectedCount = getCount(selected);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "6px 11px",
          background: open ? "#fff" : "#f8fafc",
          border: `1.5px solid ${open ? "#3b82f6" : "#e2e8f0"}`,
          borderRadius: 8, cursor: "pointer",
          boxShadow: open ? "0 0 0 3px rgba(59,130,246,.1)" : "none",
          transition: "all 0.15s", userSelect: "none",
        }}
        onMouseEnter={(e) => {
          if (!open) { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.background = "#fff"; }
        }}
        onMouseLeave={(e) => {
          if (!open) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#3b82f6" strokeWidth="1.8" style={{ flexShrink: 0 }}>
          <rect x="2" y="2" width="12" height="12" rx="2" /><path d="M5 8h6M5 5.5h6M5 10.5h4" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected === "All" ? "All Departments" : selected}
        </span>
        <span style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20, flexShrink: 0 }}>
          {selectedCount}
        </span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#94a3b8" strokeWidth="2"
          style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M4 6l4 4 4-4" />
        </svg>
      </div>

      {/* Panel */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0,
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 999, overflow: "hidden", minWidth: 240,
        }}>
          {/* Search */}
          <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid #f1f5f9", position: "relative" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#94a3b8" strokeWidth="1.8"
              style={{ position: "absolute", left: 19, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5l3 3" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search department…"
              style={{
                width: "100%", padding: "7px 10px 7px 30px",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: 13, color: "#1e293b", background: "#f8fafc",
                outline: "none", transition: "all 0.15s", boxSizing: "border-box",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* List */}
          <div style={{ maxHeight: 210, overflowY: "auto", padding: 4 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "20px 10px", textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
                No departments found
              </div>
            ) : filtered.map((dept) => {
              const isActive = dept === selected;
              const count = getCount(dept);
              return (
                <div
                  key={dept}
                  onClick={() => { onSelect(dept); setOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 10px", borderRadius: 8, cursor: "pointer",
                    background: isActive ? "#eff6ff" : "transparent",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f1f5f9"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, opacity: isActive ? 1 : 0, transition: "opacity 0.15s" }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#1d4ed8" : "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {highlight(dept, query)}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#1d4ed8" : "#94a3b8", background: isActive ? "#dbeafe" : "#f1f5f9", padding: "2px 7px", borderRadius: 20, flexShrink: 0 }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Risk Level Chips ─────────────────────────────────────────────────────────
const LEVEL_STYLES = {
  All:      { idle: { background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#64748b" }, active: { background: "#eff6ff", border: "1.5px solid #3b82f6", color: "#1d4ed8" } },
  Critical: { idle: { background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#64748b" }, active: { background: "#fadbd8", border: "1.5px solid #e74c3c", color: "#721c24" } },
  High:     { idle: { background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#64748b" }, active: { background: "#fdf2e9", border: "1.5px solid #f97316", color: "#9a3412" } },
  Medium:   { idle: { background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#64748b" }, active: { background: "#fef9e7", border: "1.5px solid #f59e0b", color: "#856404" } },
  Low:      { idle: { background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#64748b" }, active: { background: "#d5f4e6", border: "1.5px solid #10b981", color: "#155724" } },
};

function RiskLevelChips({ selected, onSelect }) {
  const levels = ["All", "Critical", "High", "Medium", "Low"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
      {levels.map((level) => {
        const isActive = selected === level;
        const s = LEVEL_STYLES[level];
        return (
          <button
            key={level}
            onClick={() => onSelect(level)}
            style={{
              padding: "5px 12px", borderRadius: 20,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", transition: "all 0.15s",
              ...(isActive ? s.active : s.idle),
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "#93c5fd";
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#1e293b";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                Object.assign(e.currentTarget.style, s.idle);
              }
            }}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
}
// ─── Main Component ───────────────────────────────────────────────────────────
const RiskTemplateTable = () => {
  const [risks, setRisks] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [riskToRemove, setRiskToRemove] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const risksPerPage = 20;
  const router = useRouter();

  const [showButtons, setShowButtons] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const {
    user,
    mounted,
    isRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowButtons(false);
      } else {
        setShowButtons(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showInfoModal = (title, message, onConfirm = null) => {
    setInfoModal({ isOpen: true, title, message, onConfirm });
  };

  const closeInfoModal = () => {
    setInfoModal({ ...infoModal, isOpen: false });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await templateRiskService.getAllTemplateRisks();
        setRisks(data || []);
      } catch (err) {
        console.error("Failed to load template risks:", err);
      }
    };
    fetchData();
  }, []);

  // ── Original logic (UNCHANGED) ────────────────────────────────────────────
  const departments = [
    "All",
    ...new Set(risks.map((r) => r.department).filter(Boolean)),
  ];

 const filteredRisks = risks.filter((r) => {
  // Department filter
  const departmentMatch =
    selectedDepartment === "All" ||
    r.department === selectedDepartment;

  // Risk level filter
  const riskLevel = String(r.riskLevel || "").toLowerCase();
  const levelMatch =
    selectedLevel === "All" ||
    riskLevel === selectedLevel.toLowerCase();

  return departmentMatch && levelMatch;
});
  const indexOfLastRisk = currentPage * risksPerPage;
  const indexOfFirstRisk = indexOfLastRisk - risksPerPage;
  const currentRisks = filteredRisks.slice(indexOfFirstRisk, indexOfLastRisk);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRisks.length / risksPerPage),
  );

  // ── Stat counts (based on filteredRisks) ──────────────────────────────────
  const stats = React.useMemo(() => {
    let high = 0,
      medium = 0,
      low = 0,
      critical = 0;
    filteredRisks.forEach((r) => {
      const lvl = String(r.riskLevel || "").toLowerCase();
      if (lvl === "high") high++;
      if (lvl === "medium") medium++;
      if (lvl === "low") low++;
      if (lvl === "critical") critical++;
    });
    return { total: filteredRisks.length, high, medium, low, critical };
  }, [filteredRisks]);

  const getVisiblePages = (current, total) => {
    const pages = new Set();
    for (let i = 1; i <= Math.min(3, total); i++) pages.add(i);
    for (let i = Math.max(total - 2, 1); i <= total; i++) pages.add(i);
    for (let i = current - 1; i <= current + 1; i++) {
      if (i >= 1 && i <= total) pages.add(i);
    }
    return [...pages].sort((a, b) => a - b);
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (String(riskLevel || "").toLowerCase()) {
      case "high":
        return "#ffcccb";
      case "medium":
        return "#ffffcc";
      case "low":
        return "#ccffcc";
      default:
        return "#f0f0f0";
    }
  };

  const proceedAcceptRisk = async (risk, originalIndex) => {
    try {
      setSavingId(originalIndex);
      const existingRisks = await riskService.getAllRisks();
      const currentYear = new Date().getFullYear();
      const orgRisks = existingRisks.filter(
        (r) =>
          r.organization === effectiveOrgId &&
          r.riskId?.startsWith(`RR-${currentYear}-`),
      );
      const maxNumber = orgRisks.reduce((max, r) => {
        const match = r.riskId.match(/RR-\d{4}-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      const nextNumber = String(maxNumber + 1).padStart(3, "0");
      const nextRiskId = `RR-${currentYear}-${nextNumber}`;
      const newRisk = {
        ...risk,
        riskId: nextRiskId,
        date: new Date().toISOString().split("T")[0],
        probability: String(risk.probability ?? ""),
        numberOfDays: String(risk.numberOfDays ?? ""),
        likelihoodAfterTreatment: String(risk.likelihoodAfterTreatment ?? ""),
        impactAfterTreatment: String(risk.impactAfterTreatment ?? ""),
        controlReference: Array.isArray(risk.controlReference)
          ? risk.controlReference
          : [risk.controlReference].filter(Boolean),
        riskType: Array.isArray(risk.category)
          ? risk.riskType
          : [risk.riskType].filter(Boolean),
        vulnerability: Array.isArray(risk.vulnerability)
          ? risk.vulnerability
          : [risk.vulnerability].filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "Open",
        organization: effectiveOrgId,
      };
      await riskService.saveRisk(newRisk);
      showInfoModal("Success", `Risk ${nextRiskId} created successfully!`);
    } catch (error) {
      showInfoModal(
        "Error",
        `Failed to accept risk template: ${error?.message || error}`,
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleAcceptRisk = async (risk, originalIndex) => {
    try {
      const existingRisks = await riskService.getAllRisks();
      const currentYear = new Date().getFullYear();
      const orgScopedRisks = existingRisks.filter(
        (r) =>
          r.organization === effectiveOrgId &&
          r.riskId?.startsWith(`RR-${currentYear}-`),
      );
      const normalize = (value) =>
        value?.trim().toLowerCase().replace(/\s+/g, " ");
      const newDescription = normalize(risk.riskDescription);
      const duplicate = orgScopedRisks.some(
        (r) => normalize(r.riskDescription) === newDescription,
      );
      if (duplicate) {
        showInfoModal(
          "Duplicate Risk Found",
          "A risk with the same description already exists in your organization for this year. Do you want to continue adding it?",
          () => proceedAcceptRisk(risk, originalIndex),
        );
        return;
      }
      proceedAcceptRisk(risk, originalIndex);
    } catch (err) {
      showInfoModal("Error", "Failed to validate risk before adding.");
    }
  };

  const handleRejectRisk = (originalIndex) => {
    setRiskToRemove(originalIndex);
    setShowConfirmDialog(true);
  };

  const confirmRejectRisk = () => {
    if (riskToRemove == null) return;
    setRemovingId(riskToRemove);
    setTimeout(() => {
      setRisks((prev) => prev.filter((_, idx) => idx !== riskToRemove));
      setRemovingId(null);
      setShowConfirmDialog(false);
      showInfoModal(
        "Removed",
        `Risk template ${riskToRemove + 1} has been removed from view.`,
      );
      setRiskToRemove(null);
      const newFilteredLength =
        selectedDepartment === "All"
          ? risks.length - 1
          : risks.filter((r) => r.department === selectedDepartment).length - 1;
      const newTotalPages = Math.max(
        1,
        Math.ceil(newFilteredLength / risksPerPage),
      );
      if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
    }, 400);
  };

  const cancelRejectRisk = () => {
    setShowConfirmDialog(false);
    setRiskToRemove(null);
  };

  const handleViewFullRisk = (risk, originalIndex) => {
    setSelectedRisk({
      ...risk,
      serialNo: originalIndex + 1,
      serialIndex: originalIndex,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRisk(null);
  };

  const gotoPage = (pageNumber) => {
    const p = Math.max(1, Math.min(totalPages, pageNumber));
    setCurrentPage(p);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <main
          style={{
            flex: 1,
            maxWidth: 1400,
            margin: "0 auto",
            width: "100%",
            padding: "12px 20px 100px",
            boxSizing: "border-box",
          }}
        >
          {/* ── Back button ── */}
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => router.push("/risk-assessment")}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(37,99,235,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(37,99,235,0.3)";
              }}
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* ── Header card ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(241,245,249,0.8)",
              borderRadius: 14,
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              padding: "18px 24px 16px",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                }}
              >
                <ClipboardCheck size={22} color="white" strokeWidth={2} />
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1e293b",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  Sample Risks
                </h1>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: 13,
                    color: "#64748b",
                    fontWeight: 400,
                  }}
                >
                  Browse, accept or reject template risk assessments ·{" "}
                  <span
                    style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}
                  >
                    {filteredRisks.length}
                  </span>{" "}
                  risk{filteredRisks.length !== 1 ? "s" : ""} shown
                </p>
              </div>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 14,
              marginBottom: 18,
            }}
          >
            {[
              { label: "Total", value: stats.total },
              { label: "High", value: stats.high },
              { label: "Critical", value: stats.critical },
              { label: "Medium", value: stats.medium },
              { label: "Low", value: stats.low },
            ].map((s, i) => (
              <StatCard
                key={s.label}
                value={s.value}
                label={s.label}
                index={i}
              />
            ))}
          </section>

            {/* ── Toolbar: single horizontal line ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(241,245,249,0.8)", borderRadius: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              padding: "8px 16px", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 10,
              flexWrap: "nowrap", overflow: "visible",
              animation: "fadeUp 0.4s ease 0.2s both",
              position: "relative", zIndex: 100,
            }}
          >
            {/* Department label */}
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0 }}>
              Dept
            </span>

            <DepartmentDropdown
              departments={departments}
              risks={risks}
              selected={selectedDepartment}
              onSelect={(dept) => { setSelectedDepartment(dept); setCurrentPage(1); }}
            />

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: "#e2e8f0", flexShrink: 0 }} />

            {/* Risk Level label */}
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0 }}>
              Risk Level
            </span>

            <RiskLevelChips
              selected={selectedLevel}
              onSelect={(level) => { setSelectedLevel(level); setCurrentPage(1); }}
            />

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: "#e2e8f0", flexShrink: 0 }} />

            {/* Result count */}
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
              {filteredRisks.length} risk{filteredRisks.length !== 1 ? "s" : ""}
            </span>
          </div>


          {/* ── Table card ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(8px)",
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1px solid rgba(241,245,249,0.8)",
              overflow: "hidden",
              animation: "fadeUp 0.4s ease 0.25s both",
              marginBottom: 16,
            }}
          >
            <div
              style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 750,
                  background: "transparent",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    {[
                      { label: "#", align: "center", width: 60 },
                      {
                        label: "Risk Description",
                        align: "left",
                        minWidth: 300,
                      },
                      { label: "Department", align: "center", width: 140 },
                      { label: "Risk Score", align: "center", width: 110 },
                      { label: "Risk Level", align: "center", width: 120 },
                      {
                        label: "Actions",
                        align: "center",
                        width: 260,
                        accent: true,
                      },
                    ].map(({ label, align, width, minWidth, accent }) => (
                      <th
                        key={label}
                        style={{
                          padding: "11px 12px",
                          textAlign: align,
                          fontWeight: 700,
                          fontSize: 11,
                          color: accent ? "#3b82f6" : "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                          background: accent ? "#eff6ff" : "transparent",
                          ...(width ? { width } : {}),
                          ...(minWidth ? { minWidth } : {}),
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRisks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ padding: "48px 20px", textAlign: "center" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              background:
                                "linear-gradient(135deg,#8b5cf6,#7c3aed)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ClipboardList
                              size={22}
                              color="white"
                              strokeWidth={1.8}
                            />
                          </div>
                          <p
                            style={{
                              color: "#64748b",
                              fontWeight: 600,
                              fontSize: 14,
                              margin: 0,
                            }}
                          >
                            No risks to display.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentRisks.map((risk, displayIndex) => {
                      const originalIndex = risks.indexOf(risk);
                      const serialNo =
                        originalIndex >= 0
                          ? originalIndex + 1
                          : indexOfFirstRisk + displayIndex + 1;
                      const isSaving = savingId === originalIndex;
                      const isRemoving = removingId === originalIndex;

                      return (
                        <tr
                          key={serialNo}
                          style={{
                            background:
                              serialNo % 2 === 0
                                ? "transparent"
                                : "rgba(248,250,252,0.6)",
                            borderBottom: "1px solid #f1f5f9",
                            opacity: isRemoving ? 0.35 : 1,
                            transform: isRemoving ? "scale(0.995)" : "scale(1)",
                            transition: "all 0.25s ease",
                            borderLeft: "3px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!isRemoving) {
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.95)";
                              e.currentTarget.style.borderLeft =
                                "3px solid #cbd5e1";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              serialNo % 2 === 0
                                ? "transparent"
                                : "rgba(248,250,252,0.6)";
                            e.currentTarget.style.borderLeft =
                              "3px solid transparent";
                          }}
                        >
                          {/* # */}
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#7c3aed",
                                background: "#f3f0ff",
                                padding: "2px 7px",
                                borderRadius: 4,
                              }}
                            >
                              {serialNo}
                            </span>
                          </td>

                          {/* Description */}
                          <td
                            style={{
                              padding: "12px",
                              color: "#475569",
                              fontSize: 13,
                              fontWeight: 500,
                              lineHeight: 1.5,
                            }}
                          >
                            {risk.riskDescription || risk.description || "N/A"}
                          </td>

                          {/* Department */}
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                              }}
                            >
                              {risk.department || "N/A"}
                            </span>
                          </td>

                          {/* Risk Score */}
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: 15,
                                color:
                                  risk.riskScore >= 13
                                    ? "#c0392b"
                                    : risk.riskScore >= 9
                                      ? "#d97706"
                                      : risk.riskScore >= 4
                                        ? "#0369a1"
                                        : "#166534",
                              }}
                            >
                              {risk.riskScore ?? "—"}
                            </span>
                          </td>

                          {/* Risk Level */}
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <RiskLevelPill level={risk.riskLevel} />
                          </td>

                          {/* Actions */}
                          <td
                            style={{
                              padding: "10px 12px",
                              textAlign: "center",
                              background: "rgba(248,250,252,0.5)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                justifyContent: "center",
                                alignItems: "center",
                                flexWrap: "nowrap",
                              }}
                            >
                              {/* Accept */}
                              <button
                                onClick={() =>
                                  handleAcceptRisk(risk, originalIndex)
                                }
                                disabled={isSaving || isRemoving}
                                style={{
                                  background:
                                    isSaving || isRemoving
                                      ? "#adb5bd"
                                      : "linear-gradient(135deg,#27ae60,#2ecc71)",
                                  color: "white",
                                  border: "none",
                                  padding: "5px 12px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor:
                                    isSaving || isRemoving
                                      ? "not-allowed"
                                      : "pointer",
                                  whiteSpace: "nowrap",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  boxShadow: "0 1px 4px rgba(39,174,96,0.2)",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSaving && !isRemoving) {
                                    e.currentTarget.style.transform =
                                      "translateY(-1px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 10px rgba(39,174,96,0.3)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                  e.currentTarget.style.boxShadow =
                                    "0 1px 4px rgba(39,174,96,0.2)";
                                }}
                              >
                                {isSaving ? "Adding…" : "✓ Accept"}
                              </button>

                              {/* Reject */}
                              <button
                                onClick={() => handleRejectRisk(originalIndex)}
                                disabled={isSaving || isRemoving}
                                style={{
                                  background: "transparent",
                                  color: "#e74c3c",
                                  border: "1.5px solid #fca5a5",
                                  padding: "5px 12px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor:
                                    isSaving || isRemoving
                                      ? "not-allowed"
                                      : "pointer",
                                  whiteSpace: "nowrap",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  transition: "all 0.2s",
                                  opacity: isSaving || isRemoving ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSaving && !isRemoving) {
                                    e.currentTarget.style.background =
                                      "#e74c3c";
                                    e.currentTarget.style.color = "white";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "transparent";
                                  e.currentTarget.style.color = "#e74c3c";
                                }}
                              >
                                {isRemoving ? "Removing…" : "✕ Reject"}
                              </button>

                              {/* View */}
                              <button
                                onClick={() =>
                                  handleViewFullRisk(risk, originalIndex)
                                }
                                disabled={isSaving || isRemoving}
                                style={{
                                  background:
                                    "linear-gradient(135deg,#3b82f6,#2563eb)",
                                  color: "white",
                                  border: "none",
                                  padding: "5px 12px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor:
                                    isSaving || isRemoving
                                      ? "not-allowed"
                                      : "pointer",
                                  whiteSpace: "nowrap",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  boxShadow: "0 1px 4px rgba(37,99,235,0.2)",
                                  transition: "all 0.2s",
                                  opacity: isSaving || isRemoving ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSaving && !isRemoving) {
                                    e.currentTarget.style.transform =
                                      "translateY(-1px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 10px rgba(37,99,235,0.3)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                  e.currentTarget.style.boxShadow =
                                    "0 1px 4px rgba(37,99,235,0.2)";
                                }}
                              >
                                👁 View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "14px 16px",
                  gap: 6,
                  flexWrap: "wrap",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  onClick={() => gotoPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "6px 12px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#fff",
                    fontWeight: 700,
                    color: currentPage === 1 ? "#94a3b8" : "#475569",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ‹
                </button>

                {getVisiblePages(currentPage, totalPages).map(
                  (pageNum, index, arr) => {
                    const isActive = pageNum === currentPage;
                    const prevPage = arr[index - 1];
                    return (
                      <React.Fragment key={pageNum}>
                        {prevPage && pageNum - prevPage > 1 && (
                          <span
                            style={{
                              padding: "0 4px",
                              color: "#94a3b8",
                              fontSize: 13,
                            }}
                          >
                            …
                          </span>
                        )}
                        <button
                          onClick={() => gotoPage(pageNum)}
                          disabled={isActive}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1.5px solid",
                            borderColor: isActive ? "#3b82f6" : "#e2e8f0",
                            background: isActive ? "#3b82f6" : "#fff",
                            color: isActive ? "#fff" : "#475569",
                            fontWeight: 700,
                            cursor: isActive ? "default" : "pointer",
                          }}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    );
                  },
                )}

                <button
                  onClick={() => gotoPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "6px 12px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#fff",
                    fontWeight: 700,
                    color: currentPage === totalPages ? "#94a3b8" : "#475569",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid rgba(241,245,249,0.8)",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
            padding: "14px 24px",
            position: "sticky",
            bottom: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{ maxWidth: 1400, margin: "0 auto", textAlign: "center" }}
          >
            <p
              style={{
                fontSize: 13,
                color: "#64748b",
                fontWeight: 500,
                margin: 0,
              }}
            >
              © {new Date().getFullYear()} CalVant. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* ── Confirm Rejection Modal ── */}
      {showConfirmDialog && typeof riskToRemove === "number" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: 20,
          }}
          onClick={cancelRejectRisk}
        >
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "32px 28px",
              maxWidth: 460,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              animation: "fadeUp 0.25s ease both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                margin: "0 auto 16px",
                background: "linear-gradient(135deg,#ef4444,#dc2626)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
              }}
            >
              <AlertOctagon size={22} color="white" strokeWidth={2} />
            </div>
            <h3
              style={{
                margin: "0 0 10px",
                color: "#1e293b",
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              Confirm Rejection
            </h3>
            <p
              style={{
                color: "#64748b",
                margin: "0 0 24px",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              Are you sure you want to remove Risk Template{" "}
              <strong style={{ color: "#1e293b" }}>{riskToRemove + 1}</strong>{" "}
              from view? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={cancelRejectRisk}
                style={{
                  padding: "10px 22px",
                  borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  background: "white",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectRisk}
                style={{
                  padding: "10px 22px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(220,38,38,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(220,38,38,0.25)";
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full View Modal ── */}
      {showModal && selectedRisk && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            padding: 20,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 820,
              background: "white",
              borderRadius: 14,
              padding: "32px 28px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              maxHeight: "90vh",
              overflowY: "auto",
              animation: "fadeUp 0.25s ease both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ClipboardCheck size={18} color="white" strokeWidth={2} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    Sample Risk {selectedRisk.serialNo} — Full Details
                  </h3>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "#94a3b8",
                    }}
                  >
                    Read-only view
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  border: "1.5px solid #e2e8f0",
                  background: "white",
                  borderRadius: 8,
                  width: 34,
                  height: 34,
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                  e.currentTarget.style.color = "#dc2626";
                  e.currentTarget.style.borderColor = "#fca5a5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.color = "#64748b";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                { label: "Department", value: selectedRisk.department },
                { label: "Risk Type", value: selectedRisk.riskType },
                { label: "Asset Type", value: selectedRisk.assetType },
                { label: "Asset", value: selectedRisk.asset },
                {
                  label: "Risk Description",
                  value:
                    selectedRisk.riskDescription || selectedRisk.description,
                },
                { label: "Risk Score", value: selectedRisk.riskScore },
                { label: "Risk Level", value: selectedRisk.riskLevel },
                { label: "Likelihood", value: selectedRisk.probability },
                {
                  label: "Likelihood After Treatment",
                  value: selectedRisk.likelihoodAfterTreatment,
                },
                {
                  label: "Impact After Treatment",
                  value: selectedRisk.impactAfterTreatment,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 14px",
                    background: "#f8fafc",
                    borderRadius: 8,
                    border: "1px solid #e8ecf0",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 6,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}
                  >
                    {item.value ?? (
                      <span style={{ color: "#94a3b8" }}>N/A</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
                justifyContent: "flex-end",
                paddingTop: 16,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  padding: "10px 22px",
                  borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  background: "white",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAcceptRisk(selectedRisk, selectedRisk.serialIndex);
                  closeModal();
                }}
                style={{
                  padding: "10px 22px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(37,99,235,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(37,99,235,0.25)";
                }}
              >
                Accept Risk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Info / Confirm Modal ── */}
      {infoModal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1400,
            padding: 20,
          }}
          onClick={closeInfoModal}
        >
          <div
            style={{
              maxWidth: 460,
              width: "100%",
              background: "white",
              borderRadius: 14,
              padding: "32px 28px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              textAlign: "center",
              animation: "fadeUp 0.25s ease both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                margin: "0 auto 16px",
                background: infoModal.onConfirm
                  ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : infoModal.title === "Success"
                    ? "linear-gradient(135deg,#10b981,#059669)"
                    : infoModal.title === "Error"
                      ? "linear-gradient(135deg,#ef4444,#dc2626)"
                      : "linear-gradient(135deg,#3b82f6,#2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {infoModal.title === "Success" ? (
                <CheckCircle2 size={22} color="white" strokeWidth={2} />
              ) : infoModal.title === "Error" ? (
                <AlertOctagon size={22} color="white" strokeWidth={2} />
              ) : (
                <ShieldAlert size={22} color="white" strokeWidth={2} />
              )}
            </div>
            <h3
              style={{
                margin: "0 0 10px",
                color: "#1e293b",
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              {infoModal.title}
            </h3>
            <p
              style={{
                color: "#64748b",
                margin: "0 0 24px",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {infoModal.message}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              {infoModal.onConfirm && (
                <button
                  onClick={closeInfoModal}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 8,
                    border: "1.5px solid #e2e8f0",
                    background: "white",
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  if (infoModal.onConfirm) infoModal.onConfirm();
                  closeInfoModal();
                }}
                style={{
                  padding: "10px 22px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {infoModal.onConfirm ? "Confirm" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cardIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @media (max-width: 640px) {
          .modal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
};

export default RiskTemplateTable;
