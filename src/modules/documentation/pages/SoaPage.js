import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import documentationService from "../services/documentationService";
import controlService from "../services/controlService";
import { useFramework, ALL_FRAMEWORKS } from "../../../context/FrameworkContex";
import { captureActivity, ACTIONS } from "../../../services/activities";

const MAPPINGS_API = "https://api.calvant.com/framework/api/mappings/framework";

const JUSTIFICATION_OPTIONS = [
  "Risk Identified",
  "Regulatory Requirement",
  "Management Decision",
  "Other",
];

// Natural sort: "A.5.1" < "A.5.2" < "A.10.1", "CC6.1" < "CC6.2"
function naturalSortKey(code = "") {
  return code
    .split(/(\d+)/)
    .map((p) => (p !== "" && !isNaN(p) ? p.padStart(8, "0") : p.toLowerCase()))
    .join("");
}

// ── Derive a light background from a hex color ──────────────────────────────
function hexToChipColors(hex = "#999") {
  return {
    bg: hex + "18",       // ~10% opacity
    border: hex + "88",   // ~53% opacity
    text: hex,
  };
}

const FrameworkBadge = ({ framework, color, small = false }) => {
  const c = hexToChipColors(color);
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: small ? "9px" : "10px",
        fontWeight: 700,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        padding: small ? "1px 5px" : "2px 7px",
        borderRadius: "10px",
        whiteSpace: "nowrap",
      }}
    >
      {framework}
    </span>
  );
};

const MappingChip = ({ code, framework, color }) => {
  const c = hexToChipColors(color);
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "6px",
        padding: "2px 7px",
        fontSize: "10px",
        fontWeight: 700,
        color: c.text,
        whiteSpace: "nowrap",
        lineHeight: 1.5,
      }}
    >
      <span>{code}</span>
      <span style={{ fontSize: "8px", fontWeight: 500, opacity: 0.75 }}>
        {framework}
      </span>
    </span>
  );
};

const MappedControlsCell = ({ mappings, colorByCode }) => {
  const [expanded, setExpanded] = useState(false);

  if (!mappings || mappings.length === 0) {
    return (
      <span style={{ fontSize: "11px", color: "#ccc", fontStyle: "italic" }}>
        —
      </span>
    );
  }
  const preview = mappings.slice(0, 2);
  const rest = mappings.slice(2);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "4px",
        alignItems: "center",
        maxWidth: "270px",
      }}
    >
      {preview.map((m) => (
        <MappingChip
          key={m.code + m.framework}
          code={m.code}
          framework={m.framework}
          color={colorByCode[m.framework] || "#999"}
        />
      ))}
      {rest.length > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            fontSize: "10px",
            fontWeight: 700,
            background: "#f0f4ff",
            border: "1px solid #c7d2fe",
            borderRadius: "10px",
            padding: "2px 7px",
            color: "#4338ca",
            cursor: "pointer",
          }}
        >
          +{rest.length} more
        </button>
      )}
      {expanded &&
        rest.map((m) => (
          <MappingChip
            key={m.code + m.framework}
            code={m.code}
            framework={m.framework}
            color={colorByCode[m.framework] || "#999"}
          />
        ))}
      {expanded && rest.length > 0 && (
        <button
          onClick={() => setExpanded(false)}
          style={{
            fontSize: "10px",
            fontWeight: 700,
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "10px",
            padding: "2px 7px",
            color: "#b91c1c",
            cursor: "pointer",
          }}
        >
          collapse
        </button>
      )}
    </div>
  );
};

const SORT_OPTIONS = [
  { value: "code_asc",        label: "Control Code (A → Z)" },
  { value: "code_desc",       label: "Control Code (Z → A)" },
  { value: "framework",       label: "By Framework" },
  { value: "applicable_first",label: "Applicable First" },
  { value: "mapped_first",    label: "Most Mapped First" },
];

function applySort(list, sortKey, mappingsBySource, fwOrder) {
  const clone = [...list];
  switch (sortKey) {
    case "code_asc":
      return clone.sort((a, b) =>
        naturalSortKey(a.controlCode).localeCompare(naturalSortKey(b.controlCode))
      );
    case "code_desc":
      return clone.sort((a, b) =>
        naturalSortKey(b.controlCode).localeCompare(naturalSortKey(a.controlCode))
      );
    case "framework":
      return clone.sort((a, b) => {
        const fw = (fwOrder[a.framework] ?? 99) - (fwOrder[b.framework] ?? 99);
        if (fw !== 0) return fw;
        return naturalSortKey(a.controlCode).localeCompare(naturalSortKey(b.controlCode));
      });
    case "applicable_first":
      return clone.sort((a, b) => {
        if (a.isApplicable !== b.isApplicable) return a.isApplicable ? -1 : 1;
        return naturalSortKey(a.controlCode).localeCompare(naturalSortKey(b.controlCode));
      });
    case "mapped_first":
      return clone.sort((a, b) => {
        const aLen = (mappingsBySource[a.controlCode] || []).length;
        const bLen = (mappingsBySource[b.controlCode] || []).length;
        if (bLen !== aLen) return bLen - aLen;
        return naturalSortKey(a.controlCode).localeCompare(naturalSortKey(b.controlCode));
      });
    default:
      return clone;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
const SoaPage = () => {
  const router = useRouter();
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError]   = useState("");

  // ── Global framework context ───────────────────────────────────────────
  const {
    selectedFrameworks,
    isAllSelected,
    toggleFramework,
    availableFrameworks,  // [{ id, code, label, color, path, sub }]
  } = useFramework();

  // Derived maps — never hardcode framework names
  const fwColorByCode = useMemo(
    () => Object.fromEntries(availableFrameworks.map((fw) => [fw.code, fw.color])),
    [availableFrameworks]
  );

  // Map context "id" (= label) → internal code  e.g. "ISO 27001" → "ISO27001"
  const fwLabelToCode = useMemo(
    () => Object.fromEntries(availableFrameworks.map((fw) => [fw.id, fw.code])),
    [availableFrameworks]
  );

  // Natural ordering from registry position
  const fwOrder = useMemo(
    () => Object.fromEntries(availableFrameworks.map((fw, i) => [fw.code, i])),
    [availableFrameworks]
  );

  // Active SOA-internal framework codes driven by global context
  const activeFrameworkKeys = useMemo(() => {
    if (isAllSelected) return new Set(availableFrameworks.map((fw) => fw.code));
    return new Set(selectedFrameworks.map((label) => fwLabelToCode[label]).filter(Boolean));
  }, [selectedFrameworks, isAllSelected, availableFrameworks, fwLabelToCode]);

  // ── Local state ────────────────────────────────────────────────────────
  const [allRows,         setAllRows]         = useState([]);
  const [showButtons,     setShowButtons]     = useState(true);
  const [lastScrollY,     setLastScrollY]     = useState(0);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [search,          setSearch]          = useState("");
  const [sortKey,         setSortKey]         = useState("code_asc");
  const controlsPerPage = 10;
  const [editedRows,      setEditedRows]      = useState(new Set());
  const [mappingsBySource,setMappingsBySource]= useState({});
  const [mappingsLoading, setMappingsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButtons(window.scrollY <= lastScrollY);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // ── Fetch all cross-framework mappings (cartesian product of codes) ─────
  useEffect(() => {
    if (availableFrameworks.length === 0) return;

    const fetchMappings = async () => {
      setMappingsLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const codes = availableFrameworks.map((fw) => fw.code);

        // Build every ordered pair (A → B) where A ≠ B
        const pairs = [];
        for (const src of codes) {
          for (const tgt of codes) {
            if (src !== tgt) pairs.push([src, tgt]);
          }
        }

        // Fetch all pairs in parallel
        const results = await Promise.all(
          pairs.map(([src, tgt]) =>
            fetch(`${MAPPINGS_API}/${src}/${tgt}`, { headers }).then((r) =>
              r.ok ? r.json() : []
            )
          )
        );

        const map = {};

        const addEntry = (srcCode, tgtCode, framework) => {
          if (!srcCode || !tgtCode) return;
          if (!map[srcCode]) map[srcCode] = [];
          if (!map[srcCode].find((e) => e.code === tgtCode && e.framework === framework)) {
            map[srcCode].push({ code: tgtCode, framework });
          }
        };

        pairs.forEach(([_src, tgt], i) => {
          (Array.isArray(results[i]) ? results[i] : []).forEach((m) =>
            addEntry(m.sourceControlCode, m.targetControlCode, tgt)
          );
        });

        // Sort each bucket
        Object.keys(map).forEach((k) =>
          map[k].sort((a, b) =>
            naturalSortKey(a.code).localeCompare(naturalSortKey(b.code))
          )
        );

        setMappingsBySource(map);
      } catch (err) {
        console.error("Failed to load framework mappings:", err);
      } finally {
        setMappingsLoading(false);
      }
    };

    fetchMappings();
  }, [availableFrameworks]);

  // ── Bootstrap controls ─────────────────────────────────────────────────
  const fetchControls = useCallback(async () => {
    if (availableFrameworks.length === 0) return;
    try {
      const [savedControls, soaEntries, ...fwResults] = await Promise.all([
        documentationService.getControls(),
        documentationService.getSoAEntries(),
        ...availableFrameworks.map((fw) =>
          controlService.getControlsByFramework(fw.code).catch(() => [])
        ),
      ]);

      const soaByControlCode = {};
      soaEntries
        .filter((e) => e.organization === effectiveOrgId)
        .forEach((e) => {
          const fw = e.framework || "";
          const key = fw
            ? `${fw}:${String(e.category)}`
            : String(e.category);

          if (!soaByControlCode[key]) {
            soaByControlCode[key] = e;
          }
        });

      const orgSavedByCategory = {};
      savedControls
        .filter((c) => c.organization === effectiveOrgId)
        .forEach((c) => {
          orgSavedByCategory[c.category] = c;
        });

      const rows = [];
      const addedCodes = new Set();

      availableFrameworks.forEach((fw, idx) => {
        const backendList = fwResults[idx] || [];

        backendList.forEach((ctrl) => {
          const uniqueKey = `${fw.code}:${ctrl.controlCode}`;

          if (addedCodes.has(uniqueKey)) return;
          addedCodes.add(uniqueKey);

          const soaEntry =
            soaByControlCode[`${fw.code}:${ctrl.controlCode}`] ||
            soaByControlCode[ctrl.controlCode] ||
            null;

          const savedCtrl =
            orgSavedByCategory[ctrl.controlCode] || null;

          // Default applicable if an SoA entry already exists
          const defaultApplicable = !!soaEntry;

          let defaultJustification = "";
          if (soaEntry?.justification) {
            defaultJustification = soaEntry.justification;
          } else if (savedCtrl?.justification) {
            defaultJustification = savedCtrl.justification;
          } else if (soaEntry) {
            defaultJustification = "Risk Identified";
          }

          rows.push({
            id: `${fw.code}:${ctrl.controlCode}`,
            soaId: soaEntry?.id || null,
            controlCode: ctrl.controlCode,
            description: ctrl.description || ctrl.title || "",
            framework: fw.code,
            soaEntry,
            isApplicable: defaultApplicable,
            justification: defaultJustification,
            savedId: savedCtrl?.id || null,
          });
        });
      });

      setAllRows(rows);
    } catch (error) {
      console.error("Error fetching controls:", error);
    }
  }, [availableFrameworks, effectiveOrgId]);

  useEffect(() => {
    if (mounted) {
      fetchControls();
    }
  }, [fetchControls, mounted]);
  // ── Filtered + sorted rows ──────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let list = [...allRows];

    if (!isAllSelected) {
      list = list.filter((r) => activeFrameworkKeys.has(r.framework));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.controlCode.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (mappingsBySource[r.controlCode] || []).some((m) =>
            m.code.toLowerCase().includes(q)
          )
      );
    }

    return applySort(list, sortKey, mappingsBySource, fwOrder);
  }, [allRows, activeFrameworkKeys, isAllSelected, search, sortKey, mappingsBySource, fwOrder]);

  const totalPages   = Math.ceil(filteredRows.length / controlsPerPage);
  const indexOfFirst = (currentPage - 1) * controlsPerPage;
  const currentRows  = filteredRows.slice(indexOfFirst, indexOfFirst + controlsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [activeFrameworkKeys, search, sortKey]);

  // ── Counts ──────────────────────────────────────────────────────────────
  const frameworkCounts = useMemo(() => {
    const counts = {};
    availableFrameworks.forEach((fw) => {
      counts[fw.code] = allRows.filter((r) => r.framework === fw.code).length;
    });
    return counts;
  }, [allRows, availableFrameworks]);

  const applicableCount = allRows.filter((r) => r.isApplicable).length;

  const mappedCount = useMemo(
    () =>
      allRows.filter(
        (r) => (mappingsBySource[r.controlCode] || []).length > 0
      ).length,
    [allRows, mappingsBySource]
  );

  // ── Handlers ────────────────────────────────────────────────────────────
  const markEdited = (id) =>
    setEditedRows((prev) => { const s = new Set(prev); s.add(id); return s; });

  const handleApplicableChange = (id, value) => {
    setAllRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, isApplicable: value, justification: value ? "Management Decision" : "" }
          : r
      )
    );
    markEdited(id);
  };

  const handleJustificationChange = (id, val) => {
    setAllRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, justification: val } : r))
    );
    markEdited(id);
  };

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    const rowsToSave = allRows.filter((r) => editedRows.has(r.id));
    if (rowsToSave.length === 0) return;

    const invalidRow = rowsToSave.find(
      (r) => !r.isApplicable && !r.justification?.trim()
    );
    if (invalidRow) {
      setValidationError("Justification is required when a control is marked not applicable.");
      return;
    }

    setValidationError("");
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    try {
      const rowsToSave  = allRows.filter((r) => editedRows.has(r.id));

      for (const row of rowsToSave) {
        if (!row.isApplicable) {
          if (row.soaId) await documentationService.deleteSoAEntry(row.soaId);
          continue;
        }
        const payload = {
          justification: row.justification,
          documentRef:   [],
          updatedAt:     new Date().toISOString(),
          organization:  effectiveOrgId,
          category:      row.controlCode,
          framework:     row.framework,
        };
        if (row.soaId) {
          await documentationService.updateSoAEntry(row.soaId, payload);
        } else {
          await documentationService.addSoAEntry({
            description: row.description,
            createdAt:   new Date().toISOString(),
            ...payload,
          });
        }
      }

      captureActivity({
        action: ACTIONS.UPDATE,
        url:    window.pathname,
        item:   rowsToSave,
      });

      setEditedRows(new Set());
      setShowConfirmModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Style helpers ───────────────────────────────────────────────────────
  const paginationButtonStyle = {
    padding: "8px 14px", borderRadius: "6px", border: "1px solid #007bff",
    margin: "0 4px", cursor: "pointer", fontWeight: "600",
    backgroundColor: "white", color: "#007bff", userSelect: "none",
    transition: "all 0.2s ease",
  };
  const activePageStyle    = { backgroundColor: "#007bff", color: "white", cursor: "default" };
  const disabledButtonStyle = { backgroundColor: "#e9ecef", color: "#6c757d", cursor: "not-allowed", border: "1px solid #dee2e6" };

  const filterPillStyle = (code, color) => {
    const isActive = code === "ALL"
      ? isAllSelected
      : !isAllSelected && activeFrameworkKeys.has(code);
    return {
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "6px 14px", borderRadius: "20px",
      border: `1.5px solid ${isActive ? color : "#dde3ef"}`,
      background: isActive ? color : "#f7f9fc",
      color: isActive ? "#fff" : "#555",
      fontWeight: isActive ? 700 : 500, fontSize: "13px", cursor: "pointer",
      transition: "all 0.15s ease",
      boxShadow: isActive ? `0 2px 8px ${color}44` : "none",
    };
  };

  const handlePillClick = (code) => {
    const label = code === "ALL" ? "All Frameworks" : code;
    captureActivity({
      action: ACTIONS.SELECT,
      url:    window.pathname,
      item:   [{ frameworkFilter: label, page: "Statement of Applicability" }],
    });
    if (code === "ALL") {
      toggleFramework(ALL_FRAMEWORKS);
    } else {
      // Find the context id (= label) for this code and toggle it
      const fw = availableFrameworks.find((f) => f.code === code);
      if (fw) toggleFramework(fw.id);
    }
  };

  const activeLabel = isAllSelected ? "All Frameworks" : selectedFrameworks.join(", ");

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", marginLeft: "auto", marginRight: "auto" }}>
      <button
        style={{
          position: "sticky", top: "0", margin: "10px",
          padding: "10px 24px", borderRadius: "8px",
          background: "#005FCC", border: "none", color: "#fff",
          fontWeight: "500", fontSize: "14px", cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "transform 0.3s ease, opacity 0.3s ease",
          zIndex: 0,
          transform: showButtons ? "translateY(0)" : "translateY(-100%)",
          opacity:   showButtons ? 1 : 0,
        }}
        onClick={() => router.push("/risk-assessment")}
      >
        ← Back to Dashboard
      </button>

      <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 3px 12px rgba(0,0,0,0.06)", border: "1px solid #e9ecef" }}>
        <h1 style={{ color: "#2c3e50", marginBottom: "4px" }}>📑 Statement of Applicability (SoA)</h1>

        {/* Global filter banner */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px",
          padding: "8px 14px",
          background: isAllSelected ? "#f0f4ff" : "#fff8ec",
          border: `1px solid ${isAllSelected ? "#c7d2fe" : "#fcd34d"}`,
          borderRadius: "8px", fontSize: "12px", color: "#374151",
        }}>
          <span style={{ fontWeight: 700 }}>🌐 Global Filter:</span>
          <span style={{ color: isAllSelected ? "#4338ca" : "#b45309", fontWeight: 600 }}>{activeLabel}</span>
          <span style={{ color: "#6b7280" }}>— Change this filter from the navbar profile menu.</span>
        </div>

        {/* Summary chips */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
          {[
            { label: "Total Controls", value: allRows.length,    color: "#667eea" },
            { label: "SoA Applicable", value: applicableCount,   color: "#28a745" },
            { label: "w/ Mappings",    value: mappedCount,        color: "#8b5cf6" },
            ...availableFrameworks.map((fw) => ({
              label: fw.label,
              value: frameworkCounts[fw.code] || 0,
              color: fw.color,
            })),
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#f8f9fa", border: `1px solid ${color}44`, borderRadius: "8px", padding: "8px 16px", fontSize: "13px" }}>
              <span style={{ fontWeight: 700, color }}>{value}</span>
              <span style={{ color: "#666", marginLeft: "6px" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Filters + Sort row */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search control, title or mapped code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #ccc", minWidth: "240px", fontSize: "13px" }}
            />
            {/* Sort */}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #ccc", background: "white", fontSize: "13px", cursor: "pointer" }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Framework pills — fully dynamic */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#666" }}>Framework:</span>
              <button style={filterPillStyle("ALL", "#667eea")} onClick={() => handlePillClick("ALL")}>
                All ({allRows.length})
              </button>
              {availableFrameworks.map((fw) => (
                <button
                  key={fw.code}
                  style={filterPillStyle(fw.code, fw.color)}
                  onClick={() => handlePillClick(fw.code)}
                >
                  {fw.label} ({frameworkCounts[fw.code] || 0})
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleSaveAll}
              disabled={editedRows.size === 0}
              style={{
                padding: "8px 16px", borderRadius: "8px", border: "none",
                background: editedRows.size === 0 ? "#ccc" : "#28a745",
                color: "white", fontWeight: "600", fontSize: "13px",
                cursor: editedRows.size === 0 ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              💾 Save Changes {editedRows.size > 0 && `(${editedRows.size})`}
            </button>
            <span style={{ fontSize: "13px", color: "#888" }}>
              Showing {currentRows.length} of {filteredRows.length}
            </span>
          </div>
        </div>

        {/* Mapping loading notice */}
        {mappingsLoading && (
          <div style={{ marginBottom: "10px", fontSize: "12px", color: "#8b5cf6", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "2px solid #8b5cf6", borderTop: "2px solid transparent", animation: "spin 0.8s linear infinite" }} />
            Loading framework mappings…
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", marginTop: "4px", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                {["Sl.No", "Requirement", "Framework", "Applicable", "Justification"].map((h) => (
                  <th key={h} style={{ border: "1px solid #dee2e6", padding: "10px 12px", fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap", textAlign: h === "Requirement" || h === "Justification" ? "left" : "center" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#aaa" }}>
                    No controls found
                    {!isAllSelected && (
                      <span style={{ display: "block", marginTop: "6px", fontSize: "12px", color: "#9ca3af" }}>
                        Filtered to: {activeLabel}. Change the framework filter in the navbar to see more controls.
                      </span>
                    )}
                  </td>
                </tr>
              ) : (
                currentRows.map((row, idx) => {
                  const isApplicable = row.isApplicable;
                  const rowBg        = isApplicable ? "#f0fff4" : "#ffffff";
                  const fwColor      = fwColorByCode[row.framework] || "#999";

                  return (
                    <tr
                      key={row.id}
                      style={{ borderBottom: "1px solid #f1f1f1", backgroundColor: rowBg, borderLeft: isApplicable ? "4px solid #28a745" : "4px solid transparent", transition: "background-color 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isApplicable ? "#e6f9ed" : "#f8f9fa"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = rowBg; }}
                    >
                      {/* Sl.No */}
                      <td style={{ border: "1px solid #dee2e6", padding: "10px 12px", textAlign: "center", fontWeight: 600, color: "#495057", fontSize: "13px", whiteSpace: "nowrap" }}>
                        {indexOfFirst + idx + 1}
                      </td>

                      {/* Control Code + Title */}
                      <td style={{ border: "1px solid #dee2e6", padding: "10px 12px", maxWidth: "260px" }}>
                        <span style={{ display: "block", fontWeight: 700, fontSize: "13px", color: "#2c3e50", whiteSpace: "nowrap" }}>
                          {row.controlCode}
                        </span>
                        {row.description && (
                          <span style={{ display: "block", fontSize: "11px", color: "#6b7280", fontWeight: 400, marginTop: "3px", lineHeight: "1.4", whiteSpace: "normal", wordBreak: "break-word" }}>
                            {row.description}
                          </span>
                        )}
                      </td>

                      {/* Framework */}
                      <td style={{ border: "1px solid #dee2e6", padding: "10px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <FrameworkBadge framework={row.framework} color={fwColor} />
                      </td>

                      {/* Applicable */}
                      <td style={{ border: "1px solid #dee2e6", padding: "10px 12px", textAlign: "center" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={isApplicable}
                            onChange={(e) => handleApplicableChange(row.id, e.target.checked)}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                          />
                        </label>
                      </td>

                      {/* Justification */}
                      <td style={{ border: "1px solid #dee2e6", padding: "10px 12px", minWidth: "200px" }}>
                        {isApplicable ? (
                          <select
                            value={row.justification || ""}
                            onChange={(e) => handleJustificationChange(row.id, e.target.value)}
                            style={{ width: "100%", padding: "5px 8px", fontSize: "12px", borderRadius: "6px", border: "1px solid #ccc", background: "white", cursor: "pointer", color: row.justification ? "#2c3e50" : "#9ca3af" }}
                          >
                            <option value="">— Select justification —</option>
                            {JUSTIFICATION_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row.justification || ""}
                            onChange={(e) => handleJustificationChange(row.id, e.target.value)}
                            style={{ width: "100%", padding: "5px 8px", fontSize: "12px", borderRadius: "6px", border: "1px solid #f5c6cb", background: "#fff5f5", color: "#721c24" }}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "24px", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} style={{ ...paginationButtonStyle, ...(currentPage === 1 ? disabledButtonStyle : {}) }}>
              ← Prev
            </button>
            {[...Array(totalPages).keys()].map((n) => {
              const p = n + 1;
              if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                if (p === 2 || p === totalPages - 1) return <span key={p} style={{ color: "#999" }}>…</span>;
                return null;
              }
              return (
                <button key={p} onClick={() => setCurrentPage(p)} disabled={p === currentPage} style={{ ...paginationButtonStyle, ...(p === currentPage ? activePageStyle : {}) }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} style={{ ...paginationButtonStyle, ...(currentPage === totalPages ? disabledButtonStyle : {}) }}>
              Next →
            </button>
          </div>
        )}

        {/* Floating nav buttons */}
        <div style={{ position: "fixed", bottom: "30px", left: "90px", zIndex: 100 }}>
          <button
            onClick={() => router.push("/documentation/mld")}
            style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(45deg,#3498db,#2980b9)", color: "white", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px rgba(52,152,219,0.3)", transition: "all 0.3s ease" }}
            onMouseEnter={(e) => { e.target.style.transform = "scale(1.1)"; }}
            onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
            title="Go to MLD"
          >
            MLD
          </button>
        </div>
        <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 100 }}>
          <button
            onClick={() => router.push("/risk-assessment/saved")}
            style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(45deg,#3498db,#2980b9)", color: "white", border: "none", fontSize: "24px", cursor: "pointer", boxShadow: "0 4px 15px rgba(52,152,219,0.3)", transition: "all 0.3s ease" }}
            onMouseEnter={(e) => { e.target.style.transform = "scale(1.1)"; }}
            onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
            title="Go to Saved Risks"
          >
            📁
          </button>
        </div>
      </div>

      <footer style={{ position: "fixed", bottom: 0, left: 0, width: "100%", background: "white", color: "#9ca3af", padding: "12px", textAlign: "center", fontSize: "13px", zIndex: 0 }}>
        © {new Date().getFullYear()} CalVant. All rights reserved.
      </footer>

      {/* Confirm modal */}
      {showConfirmModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "10px", width: "400px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginBottom: "10px" }}>Confirm Save</h3>
            {validationError && <p style={{ color: "red", fontSize: "13px" }}>{validationError}</p>}
            <p style={{ fontSize: "14px", color: "#555" }}>Are you sure you want to save changes?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc", background: "#f5f5f5", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={confirmSave} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#28a745", color: "white", cursor: "pointer" }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoaPage;
