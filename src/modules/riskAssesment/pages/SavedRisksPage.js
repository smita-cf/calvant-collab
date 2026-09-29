//cf-tool-frontend-main\src\modules\riskAssesment\pages\SavedRisksPage.js


import React, { useState, useEffect } from "react";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { useRouter, useSearchParams } from "next/navigation";
import { matchesDepartment, getUserRoles, getUserDepartments, isSameOrg } from "@/utils/departmentUtils";
import {
  ClipboardList,
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Unlock,
  Lock,
  ClipboardCheck,
} from "lucide-react";
import riskService from "../services/riskService";
import documentationService from "../../documentation/services/documentationService";
import controlService from "../../documentation/services/controlService";
import DigitalTimer from "../components/DigitalTimer";
import { getDepartments } from "../../departments/services/userService";
import { useFramework } from "../../../context/FrameworkContex";
import { captureActivity, ACTIONS, logPageLoad, logClick, MODULES } from "../../admin/shell/services/activities";

function riskMatchesFilter(risk, allowedRiskTypes) {
  const types = Array.isArray(risk.riskType)
    ? risk.riskType.map((t) => t.trim().toLowerCase())
    : risk.riskType
      ? String(risk.riskType).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [];
  if (types.length === 0) return false;
  const normalizedAllowed = new Set([...allowedRiskTypes].map((t) => t.toLowerCase()));
  return types.some((t) => normalizedAllowed.has(t));
}

const STAT_CONFIG = {
  Total:    { gradient: "linear-gradient(135deg,#4f8ef7,#2563eb)",  Icon: ClipboardList  },
  High:     { gradient: "linear-gradient(135deg,#ef4444,#dc2626)",  Icon: AlertTriangle  },
  Medium:   { gradient: "linear-gradient(135deg,#f59e0b,#d97706)",  Icon: ShieldAlert    },
  Low:      { gradient: "linear-gradient(135deg,#10b981,#059669)",  Icon: CheckCircle2   },
  Open:     { gradient: "linear-gradient(135deg,#6366f1,#4f46e5)",  Icon: Unlock         },
  Closed:   { gradient: "linear-gradient(135deg,#14b8a6,#0d9488)",  Icon: Lock           },
};

function StatCard({ value, label, index, onClick }) {
  const s = STAT_CONFIG[label] || STAT_CONFIG["Total"];
  return (
    <div
      onClick={onClick}
      style={{
        background: "white", border: "1px solid #f1f5f9", borderRadius: 12,
        padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex", alignItems: "center", gap: 12, cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s, transform 0.2s", animation: `cardIn 0.4s ease ${index * 0.05}s both`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: s.gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
      }}>
        <s.Icon size={16} color="white" strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

const SavedRisksPage = () => {
  const router = useRouter();

  const { selectedFrameworks, isAllSelected, availableFrameworks } = useFramework();

  const allowedRiskTypes = React.useMemo(() => {
    if (isAllSelected) return null;
    const allowed = new Set();
    selectedFrameworks.forEach((fwId) => {
      const fw = availableFrameworks?.find(f => f.id === fwId);
      if (fw && fw.riskTypes) fw.riskTypes.forEach(rt => allowed.add(rt));
    });
    return allowed;
  }, [selectedFrameworks, isAllSelected, availableFrameworks]);

  const [savedRisks, setSavedRisks] = useState([]);
  const [editedRisks, setEditedRisks] = useState([]);
  const [newlyCreatedRiskId, setNewlyCreatedRiskId] = useState(null);
  const [lastEditedRiskId, setLastEditedRiskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState("");
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");
  const [resolvedControls, setResolvedControls] = useState({});
  const [resolving, setResolving] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [generatingSoA, setGeneratingSoA] = useState(false);
  const [soaProgress, setSoaProgress] = useState({ current: 0, total: 0 });

  const {
    user, mounted, isRoot, isRiskOwner, isPrivilegedRole, isViewingManagedOrg,
    effectiveOrgId, effectiveOrgIds, selectedChildOrg,
  } = useEffectiveOrg();

  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role].filter(Boolean);
  const isSuperAdmin = userRoles.includes("super_admin");

  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter") || "Total";

  const baseRisks = React.useMemo(() => {
    if (!allowedRiskTypes) return savedRisks;
    return savedRisks.filter((r) => riskMatchesFilter(r, allowedRiskTypes));
  }, [savedRisks, allowedRiskTypes]);

  const displayedRisks = React.useMemo(() => {
    let base = baseRisks;
    if (filterParam === "High") {
      base = base.filter((r) => calculateRiskLevel(r) === "High");
    } else if (filterParam === "Medium") {
      base = base.filter((r) => calculateRiskLevel(r) === "Medium");
    } else if (filterParam === "Low") {
      base = base.filter((r) => calculateRiskLevel(r) === "Low");
    } else if (filterParam === "Open") {
      base = base.filter((r) => (r.status || "").toLowerCase() !== "closed");
    } else if (filterParam === "Closed") {
      base = base.filter((r) => (r.status || "").toLowerCase() === "closed");
    }
    return base;
  }, [baseRisks, filterParam]);

  const stats = React.useMemo(() => {
    const total = baseRisks.length;
    let high = 0, medium = 0, low = 0, open = 0, closed = 0;
    baseRisks.forEach((risk) => {
      const level = calculateRiskLevel(risk);
      if (level === "High") high++;
      if (level === "Medium") medium++;
      if (level === "Low") low++;
      const s = (risk.status || "").toLowerCase();
      if (s === "closed") closed++; else open++;
    });
    return { total, high, medium, low, open, closed };
  }, [baseRisks]); // eslint-disable-line

  // ── Scroll hide/show ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setShowButtons(window.scrollY <= lastScrollY);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // ── Load risks ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mounted && user) {
      loadSavedRisks();
    }
  }, [mounted, user, effectiveOrgId]); // eslint-disable-line

  useEffect(() => {
    const storedEdits = JSON.parse(localStorage.getItem("editedRisks")) || [];
    const newRiskId = localStorage.getItem("newlyCreatedRiskId");
    const lastEdited = localStorage.getItem("lastEditedRiskId");
    setEditedRisks(storedEdits);
    setNewlyCreatedRiskId(newRiskId);
    setLastEditedRiskId(lastEdited);
  }, []);

  const loadSavedRisks = async () => {
    try {
      setLoading(true);
      if (!user || Object.keys(user).length === 0) return;

      // ── LOG: VISITED — fires only when user is confirmed real ─────────────
      // Placed here so it only fires after user + effectiveOrgId are both
      // resolved, preventing stale previous-user data being logged.
      captureActivity({
        action: ACTIONS.VISITED,
        module: MODULES.RISK,
        url: "/risk-assessment/saved",
      });

      const [risks, departmentsList] = await Promise.all([
        riskService.getAllRisks(),
        getDepartments().catch(() => []),
      ]);
      if (!Array.isArray(risks)) { setSavedRisks([]); return; }

      // Privileged roles see all.
      const seeAll = isRoot || isSuperAdmin || isPrivilegedRole || isViewingManagedOrg;
      const userDepts = getUserDepartments(user);

      const filteredRisks = risks.filter((r) => {
        if (!isSameOrg(r.organization, effectiveOrgId)) {
          return false;
        }
        if (seeAll) return true;
        return matchesDepartment(r.department, userDepts, departmentsList);
      });

      const deptDisplay = seeAll
        ? "All"
        : userDepts.length > 1
        ? "Multiple Departments"
        : userDepts[0]?.name || (typeof userDepts[0] === "string" ? userDepts[0] : "Your");
      setDepartmentName(deptDisplay);
      setSavedRisks(filteredRisks);
    } catch (error) {
      console.error("Error loading risks:", error);
      setSavedRisks([]);
    } finally {
      setLoading(false);
    }
  };

  const sortRisks = (risks) =>
    [...risks].sort((a, b) => {
      const aEdit = editedRisks.find((e) => e.riskId === a.riskId);
      const bEdit = editedRisks.find((e) => e.riskId === b.riskId);
      if (aEdit && bEdit) return new Date(bEdit.editedAt) - new Date(aEdit.editedAt);
      if (aEdit) return -1;
      if (bEdit) return 1;
      if (newlyCreatedRiskId) {
        if (a.riskId === newlyCreatedRiskId) return -1;
        if (b.riskId === newlyCreatedRiskId) return 1;
      }
      return 0;
    });

  // ── FIX 1: ACTIONS.UPDATE → ACTIONS.UPDATED + added module: MODULES.RISK ─
  const handleEditRisk = (riskId) => {
    const riskToEdit = savedRisks.find((r) => r.riskId === riskId);
    captureActivity({
      action: ACTIONS.UPDATED,
      module: MODULES.RISK,
      url: "/risk-assessment/saved",
      item: [{
        riskId,
        department: riskToEdit?.department,
        status: riskToEdit?.status,
        action: "Opened for editing",
      }],
    });
    const updatedEdits = [
      { riskId, editedAt: new Date().toISOString() },
      ...editedRisks.filter((e) => e.riskId !== riskId),
    ];
    setEditedRisks(updatedEdits);
    localStorage.setItem("editedRisks", JSON.stringify(updatedEdits));
    setLastEditedRiskId(riskId);
    localStorage.setItem("lastEditedRiskId", riskId);
    setNewlyCreatedRiskId(null);
    localStorage.removeItem("newlyCreatedRiskId");
    router.push(`/risk-assessment/add?editRiskId=${encodeURIComponent(riskId)}`);
  };

  // ── FIX 2: added module: MODULES.RISK to handleDeleteRisk ────────────────
  const handleDeleteRisk = async (riskId) => {
    const confirmed = window.confirm("Are you sure you want to delete this risk?");
    if (!confirmed) return;
    const riskToDelete = savedRisks.find((r) => r.riskId === riskId);
    const success = await riskService.deleteRisk(riskId, effectiveOrgId);
    if (success) {
      captureActivity({
        action: ACTIONS.DELETE,
        module: MODULES.RISK,
        url: "/risk-assessment/saved",
        item: [{
          riskId,
          department: riskToDelete?.department,
          status: riskToDelete?.status,
          riskDescription: riskToDelete?.riskDescription?.slice(0, 80),
        }],
      });
      setSavedRisks((prev) => prev.filter((r) => r.riskId !== riskId));
      const updatedEdits = editedRisks.filter((e) => e.riskId !== riskId);
      setEditedRisks(updatedEdits);
      localStorage.setItem("editedRisks", JSON.stringify(updatedEdits));
      if (riskId === lastEditedRiskId) {
        localStorage.removeItem("lastEditedRiskId");
        setLastEditedRiskId(null);
      }
      if (riskId === newlyCreatedRiskId) {
        localStorage.removeItem("newlyCreatedRiskId");
        setNewlyCreatedRiskId(null);
      }
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case "Low":      return { bgColor: "#d5f4e6", color: "#155724" };
      case "Medium":   return { bgColor: "#fef9e7", color: "#856404" };
      case "High":     return { bgColor: "#fdf2e9", color: "#721c24" };
      case "Critical": return { bgColor: "#fadbd8", color: "#721c24" };
      default:         return { bgColor: "#e9ecef", color: "#495057" };
    }
  };

  function calculateRiskLevel(risk) {
    const impact = Math.max(
      parseInt(risk.confidentiality) || 0,
      parseInt(risk.integrity) || 0,
      parseInt(risk.availability) || 0,
    );
    const probability = parseInt(risk.probability) || 0;
    let riskScore = impact * probability;
    if ((risk.status || "").toLowerCase() === "closed") {
      riskScore = parseInt(risk.likelihoodAfterTreatment) * parseInt(risk.impactAfterTreatment);
    }
    if (riskScore <= 3) return "Low";
    if (riskScore <= 8) return "Medium";
    return "High";
  }

  const calculateRiskScore = (risk) => {
    if ((risk.status || "").toLowerCase() === "closed") {
      return parseInt(risk.likelihoodAfterTreatment) * parseInt(risk.impactAfterTreatment);
    }
    const impact = Math.max(
      parseInt(risk.confidentiality) || 0,
      parseInt(risk.integrity) || 0,
      parseInt(risk.availability) || 0,
    );
    return impact * (parseInt(risk.probability) || 0);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch { return "Invalid Date"; }
  };

  const getTaskAssignmentText = (risk) => {
    if (!risk.date) return null;
    const startDate = new Date(risk.date);
    const today = new Date();
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return ` Task starts in ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`;
    if (risk.numberOfDays) {
      const deadlineDate = new Date(startDate);
      deadlineDate.setDate(deadlineDate.getDate() + Number(risk.numberOfDays));
      const remaining = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));
      return remaining >= 0
        ? ` ${remaining} day${remaining !== 1 ? "s" : ""} left until deadline`
        : ` Deadline missed by ${Math.abs(remaining)} day${Math.abs(remaining) !== 1 ? "s" : ""}`;
    }
    return ` Started ${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  const deriveFramework = (ctrl) => {
    const code = (ctrl.frameworkCode || "").toUpperCase();
    if (code.includes("42001")) return "ISO 42001";
    if (code.includes("27701")) return "ISO 27701";
    if (code.includes("27001")) return "ISO 27001";
    return ctrl.frameworkCode || "Unknown";
  };

  useEffect(() => {
    if (!showModal || !selectedRisk) return;
    const ids = Array.isArray(selectedRisk.controlReference)
      ? selectedRisk.controlReference
      : String(selectedRisk.controlReference || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return;
    setResolving(true);
    Promise.allSettled(ids.map((id) => controlService.getControlById(id)))
      .then((results) => {
        const map = {};
        results.forEach((r, i) => {
          if (r.status === "fulfilled") {
            const ctrl = r.value;
            map[ids[i]] = { controlCode: ctrl.controlCode, frameworkCode: deriveFramework(ctrl) };
          }
        });
        setResolvedControls(map);
      })
      .finally(() => setResolving(false));
  }, [showModal, selectedRisk]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerateSoA = async () => {
    logClick("Generate SoA", MODULES.RISK, { url: "/risk-assessment/saved" });
    if (displayedRisks.length === 0) { alert("No risks available to generate SoA"); return; }
    setGeneratingSoA(true);
    const now = new Date().toISOString();
    const allIds = [...new Set(
      displayedRisks.flatMap((risk) => {
        let refs = risk.controlReference;
        if (!refs) return [];
        if (!Array.isArray(refs)) refs = String(refs).split(",").map((r) => r.trim()).filter(Boolean);
        return refs;
      }),
    )];
    setSoaProgress({ current: 0, total: allIds.length });
    try {
      const controlResults = await Promise.allSettled(allIds.map((id) => controlService.getControlById(id)));
      const ctrlById = {};
      controlResults.forEach((result, i) => {
        if (result.status === "fulfilled") ctrlById[allIds[i]] = result.value;
        else console.warn(`Control id ${allIds[i]} not found — skipping`);
      });
      const existingSoas = await documentationService.getSoAEntries();
      const orgSoas = existingSoas.filter((e) => e.organization === effectiveOrgId);
      const soaSet = new Set(orgSoas.map((e) => `${e.controlId}::${e.documentRef?.[0]}`));
      const existingDocControls = await documentationService.getControls();
      let processed = 0;
      for (const id of allIds) {
        const backendCtrl = ctrlById[id] ?? null;
        const controlCode = backendCtrl?.controlCode ?? id;
        const docs = backendCtrl?.documents?.length > 0
          ? backendCtrl.documents
          : [{ doc: "N/A", type: "", dept: "" }];
        const controlExistsForOrg = existingDocControls.some(
          (c) => c.category === controlCode && c.organization === effectiveOrgId,
        );
        let addedControl;
        if (!controlExistsForOrg) {
          addedControl = await documentationService.addControl({
            category: controlCode,
            description: backendCtrl?.title ?? "No description available",
            organization: effectiveOrgId,
          });
        } else {
          addedControl = existingDocControls.find(
            (c) => c.category === controlCode && c.organization === effectiveOrgId,
          );
        }
        for (const { doc, type, dept } of docs) {
          const key = `${controlCode}::${doc}`;
          if (soaSet.has(key)) continue;
          await documentationService.addSoAEntry({
            controlId: addedControl.id, category: addedControl.category,
            description: addedControl.description, status: "Planned",
            documentRef: [doc], type: type || "", dept: dept || "",
            justification: "Risk Identified", createdAt: now,
            organization: effectiveOrgId, framework: backendCtrl?.frameworkCode ?? "",
          });
          soaSet.add(key);
        }
        processed++;
        setSoaProgress({ current: processed, total: allIds.length });
      }
      if (isSuperAdmin || isRoot) {
        setRedirectMessage("✅ Redirecting to SoA Page.");
        router.push("/risk-assessment/soa");
      } else {
        setRedirectMessage("⚠️ Redirecting to master list of documents...");
        setTimeout(() => { setRedirectMessage(""); router.push("/documentation/mld"); }, 2000);
      }
    } catch (error) {
      console.error("Error generating SoA:", error);
      alert("⚠️ Failed to generate SoA. Check console for details.");
    } finally {
      setGeneratingSoA(false);
      setSoaProgress({ current: 0, total: 0 });
    }
  };

  const RiskPill = ({ level }) => {
    const c = getRiskLevelColor(level);
    return (
      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", background: c.bgColor, color: c.color }}>
        {level}
      </span>
    );
  };

  const StatusPill = ({ status, riskLevel }) => {
    const c = getRiskLevelColor(riskLevel);
    const isClosedStatus = (status || "").toLowerCase() === "closed";
    return (
      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", background: isClosedStatus ? "#d5f4e6" : c.bgColor, color: isClosedStatus ? "#155724" : c.color }}>
        {status}
      </span>
    );
  };

  const FrameworkFilterInfo = () => {
    const hasFilter = filterParam && filterParam !== "Total";
    if (isAllSelected && !hasFilter) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9", fontSize: 11, color: "#64748b" }}>
        <span style={{ fontWeight: 600, color: "#475569" }}>Filtered by:</span>
        {!isAllSelected && selectedFrameworks.map((fwId) => {
          const fwObj = availableFrameworks?.find(f => f.id === fwId);
          const bg = fwObj?.color ? fwObj.color + "15" : "#f1f5f9";
          const color = fwObj?.color || "#334155";
          const border = fwObj?.color ? fwObj.color + "40" : "#cbd5e1";
          return (
            <span key={fwId} style={{ padding: "2px 9px", borderRadius: 12, background: bg, color, border: `1px solid ${border}`, fontWeight: 700, fontSize: 11 }}>
              {fwId}
            </span>
          );
        })}
        {hasFilter && (
          <span style={{ padding: "2px 9px", borderRadius: 12, background: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe", fontWeight: 700, fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
            {filterParam} Risks
            <button 
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.delete("filter");
                router.push(`${window.location.pathname}?${params.toString()}`);
              }}
              style={{ background: "transparent", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: "bold", fontSize: 10, padding: 0, marginLeft: 2 }}
            >
              ✕
            </button>
          </span>
        )}
        <span style={{ color: "#94a3b8" }}>·</span>
        <span style={{ color: "#475569", fontWeight: 600 }}>{displayedRisks.length} of {savedRisks.length} risks shown</span>
        {allowedRiskTypes && allowedRiskTypes.size > 0 && (
          <>
            <span style={{ color: "#94a3b8" }}>·</span>
            <span style={{ color: "#94a3b8" }}>Types:</span>
            {[...allowedRiskTypes].map((rt) => (
              <span key={rt} style={{ padding: "1px 7px", borderRadius: 10, background: "#dbeafe", color: "#1d4ed8", fontWeight: 600, border: "1px solid #93c5fd", fontSize: 10 }}>
                {rt}
              </span>
            ))}
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "white", borderRadius: 16, padding: "48px 60px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", textAlign: "center", border: "1px solid #e8ecf0" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", margin: "0 auto 14px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#64748b", fontSize: 14, fontWeight: 500, margin: 0 }}>Loading Saved Risk Assessments…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <main style={{ flex: 1, maxWidth: 1400, margin: "0 auto", width: "100%", padding: "12px 20px 100px", boxSizing: "border-box" }}>

          {redirectMessage && (
            <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#2ecc71", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
              {redirectMessage}
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => { logClick("Back to Risk Assessment", MODULES.RISK, { url: "/risk-assessment/saved" }); router.push("/risk-assessment"); }}
              style={{ padding: "10px 20px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(37,99,235,0.3)", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; }}
            >
              ← Back to Risk Assessment
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(241,245,249,0.8)", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", padding: "18px 24px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
                  <ClipboardCheck size={22} color="white" strokeWidth={2} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em", lineHeight: 1.2 }}>Saved Risk Assessments</h1>
                  <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b", fontWeight: 400 }}>
                    Risk Assessment · <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{displayedRisks.length}</span> risk{displayedRisks.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 8, flexShrink: 0 }}>
                <svg width="13" height="20" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5, marginTop: "-18px" }}>
                  <circle cx="12" cy="12" r="9" stroke="#475569" strokeWidth="1.8" />
                  <path d="M12 7v5l3 3" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <DigitalTimer />
              </div>
            </div>
            <FrameworkFilterInfo />
          </div>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 18 }}>
            {[
              { label: "Total",    value: stats.total    },
              { label: "High",     value: stats.high     },
              { label: "Medium",   value: stats.medium   },
              { label: "Low",      value: stats.low      },
              { label: "Open",     value: stats.open     },
              { label: "Closed",   value: stats.closed   },
            ].map((s, i) => (
              <StatCard 
                key={s.label} 
                value={s.value} 
                label={s.label} 
                index={i} 
                onClick={() => router.push(s.label === "Total" ? "/risk-assessment/saved" : `/risk-assessment/saved?filter=${encodeURIComponent(s.label)}`)} 
              />
            ))}
          </section>



          {displayedRisks.length === 0 ? (
            savedRisks.length > 0 && !isAllSelected ? (
              <div style={{ textAlign: "center", padding: "56px 20px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e8ecf0" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
                <h2 style={{ color: "#1e293b", marginBottom: 10, fontSize: 16, fontWeight: 700 }}>No Risks Found for Selected Framework</h2>
                <p style={{ color: "#64748b", marginBottom: 6, fontSize: 13 }}>
                  The current filter (<strong style={{ color: "#1d4ed8" }}>{selectedFrameworks.join(" + ")}</strong>) doesn't match any saved risks.
                </p>
                <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 24 }}>Change the framework filter on the main dashboard or add a new risk for this framework.</p>
                <button onClick={() => router.push("/risk-assessment/add")} style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "white", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  + Add Risk for This Framework
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "64px 20px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e8ecf0" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
                    <ClipboardList size={26} color="white" strokeWidth={1.8} />
                  </div>
                </div>
                <h2 style={{ color: "#1e293b", marginBottom: 10, fontSize: 17, fontWeight: 700 }}>No Risks Assigned Yet</h2>
                <p style={{ color: "#64748b", marginBottom: 24, fontSize: 13 }}>Keep up the good work! Start by creating your first risk assessment.</p>
                <button onClick={() => router.push("/risk-assessment/add")} style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "white", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
                  + Create First Risk Assessment
                </button>
              </div>
            )
          ) : (
            <div style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(241,245,249,0.8)", overflow: "hidden", animation: "fadeUp 0.4s ease 0.25s both" }}>
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900, background: "transparent" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      {[
                        { label: "Risk ID",            align: "center", width: 110                   },
                        { label: "Description",        align: "left"                                 },
                        { label: "Time Stamp",         align: "center", width: 130                   },
                        { label: "Current Risk Score", align: "center", width: 120                   },
                        { label: "Current Risk Level", align: "center", width: 130                   },
                        { label: "Status",             align: "center", width: 110                   },
                        { label: "Actions",            align: "center", width: 160, accent: true     },
                      ].map(({ label, align, width, accent }) => (
                        <th key={label} style={{ padding: "11px 12px", textAlign: align, fontWeight: 700, fontSize: 11, color: accent ? "#3b82f6" : "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", background: accent ? "#eff6ff" : "transparent", ...(width ? { width } : {}) }}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortRisks(displayedRisks).map((risk, idx) => {
                      const riskLevel = calculateRiskLevel(risk);
                      const riskScore = calculateRiskScore(risk);
                      return (
                        <tr
                          key={risk.riskId}
                          style={{ background: idx % 2 === 0 ? "transparent" : "rgba(248,250,252,0.6)", borderBottom: "1px solid #f1f5f9", transition: "background 0.12s, border-left 0.12s", borderLeft: "3px solid transparent" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.95)"; e.currentTarget.style.borderLeft = "3px solid #cbd5e1"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "rgba(248,250,252,0.6)"; e.currentTarget.style.borderLeft = "3px solid transparent"; }}
                        >
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "#f3f0ff", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>
                                {risk.riskId}
                              </span>
                              {risk.riskId === lastEditedRiskId && (
                                <span style={{ fontSize: 9, background: "#fef9c3", color: "#854d0e", padding: "2px 6px", borderRadius: 10, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", border: "1px solid #fde047" }}>
                                  ✏️ Recently Edited
                                </span>
                              )}
                            </div>
                          </td>

                          <td
                            style={{ padding: "12px", textAlign: "left", color: "#475569", overflowWrap: "break-word", whiteSpace: "normal", cursor: "pointer", fontSize: 13, fontWeight: 600, lineHeight: 1.5, transition: "color 0.15s" }}
                            title="Click to view risk details"
                            onClick={() => { captureActivity({ action: ACTIONS.CLICK, module: MODULES.RISK, item: `Risk Detail Modal - ${risk.riskId}`, url: "/risk-assessment/saved" }); setSelectedRisk(risk); setShowModal(true); }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{risk.riskDescription}</span>
                            </div>
                          </td>

                          <td style={{ padding: "12px", textAlign: "center", fontSize: 12, color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>
                            {risk.date ? risk.date.split("-").reverse().join("-") : "—"}
                          </td>

                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span style={{ display: "inline-block", fontWeight: 800, fontSize: 15, color: riskScore >= 13 ? "#c0392b" : riskScore >= 9 ? "#d97706" : riskScore >= 4 ? "#0369a1" : "#166534" }}>
                              {riskScore}
                            </span>
                          </td>

                          <td style={{ padding: "12px", textAlign: "center" }}><RiskPill level={riskLevel} /></td>

                          <td style={{ padding: "12px", textAlign: "center" }}><StatusPill status={risk.status} riskLevel={riskLevel} /></td>

                          <td style={{ padding: "10px 12px", textAlign: "center", background: "rgba(248,250,252,0.5)" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center", flexWrap: "nowrap" }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditRisk(risk.riskId); }}
                                style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "white", border: "none", padding: "5px 13px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4, boxShadow: "0 1px 4px rgba(37,99,235,0.2)", transition: "all 0.2s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(37,99,235,0.3)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(37,99,235,0.2)"; }}
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Edit
                              </button>
                              {user.role !== "risk_manager" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteRisk(risk.riskId); }}
                                  style={{ background: "transparent", color: "#e74c3c", border: "1.5px solid #fca5a5", padding: "5px 13px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4, transition: "all 0.2s" }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = "#e74c3c"; e.currentTarget.style.color = "white"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e74c3c"; }}
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                  </svg>
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        <footer style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(241,245,249,0.8)", boxShadow: "0 -2px 10px rgba(0,0,0,0.04)", padding: "14px 24px", position: "sticky", bottom: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500, margin: 0 }}>© {new Date().getFullYear()} CalVant. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {showModal && selectedRisk && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "20px", overflow: "auto" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", borderRadius: "12px", maxWidth: "90vw", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "40px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", fontSize: "28px", cursor: "pointer", color: "#333", fontWeight: "bold" }} onMouseEnter={(e) => { e.target.style.color = "#e74c3c"; }} onMouseLeave={(e) => { e.target.style.color = "#333"; }}>✕</button>

            <h2 style={{ margin: "0 0 30px", color: "#2c3e50", fontSize: "1.5rem", fontWeight: 700, borderBottom: "2px solid #e9ecef", paddingBottom: "15px" }}>
              Risk Details - {selectedRisk.riskId}
            </h2>

            <div className="srp-modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                <h4 style={{ margin: "0 0 12px", color: "#2c3e50", fontWeight: 600 }}>Risk Information</h4>
                <div style={{ fontSize: "14px", lineHeight: 1.8, color: "#495057" }}>
                  <p><strong>Risk Type:</strong> {selectedRisk.riskType}</p>
                  <p><strong>Department:</strong> {selectedRisk.department}</p>
                  <p><strong>Asset Type:</strong> {selectedRisk.assetType}</p>
                  <p><strong>Asset:</strong> {selectedRisk.location}</p>
                  <p><strong>Threat:</strong> {selectedRisk.threat}</p>
                  <p><strong>Vulnerability:</strong> {selectedRisk.vulnerability}</p>
                  <p><strong>Date:</strong> {formatDate(selectedRisk.date)}</p>
                </div>
              </div>
              <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                <h4 style={{ margin: "0 0 12px", color: "#2c3e50", fontWeight: 600 }}>Risk Scoring</h4>
                <div style={{ fontSize: "14px", lineHeight: 1.8, color: "#495057" }}>
                  <p><strong>Confidentiality:</strong> {selectedRisk.confidentiality}</p>
                  <p><strong>Integrity:</strong> {selectedRisk.integrity}</p>
                  <p><strong>Availability:</strong> {selectedRisk.availability}</p>
                  <p><strong>Impact:</strong> {Math.max(parseInt(selectedRisk.confidentiality) || 0, parseInt(selectedRisk.integrity) || 0, parseInt(selectedRisk.availability) || 0)}</p>
                  <p><strong>Likelihood:</strong> {selectedRisk.probability}</p>
                  <p><strong>Current Risk Score:</strong> <span style={{ fontWeight: 700, color: "#e74c3c" }}>{calculateRiskScore(selectedRisk)}</span></p>
                  <p><strong>Current Risk Level:</strong> <span style={{ fontWeight: 700, ...getRiskLevelColor(calculateRiskLevel(selectedRisk)), padding: "4px 8px", borderRadius: "4px", display: "inline-block" }}>{calculateRiskLevel(selectedRisk)}</span></p>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef", marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 12px", color: "#2c3e50", fontWeight: 600 }}>Description</h4>
              <p style={{ margin: 0, color: "#495057", lineHeight: 1.6, fontSize: "14px" }}>{selectedRisk.riskDescription || "No description provided"}</p>
            </div>

            <div className="srp-modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                <h4 style={{ margin: "0 0 12px", color: "#2c3e50", fontWeight: 600 }}>Treatment Plan</h4>
                <div style={{ fontSize: "14px", lineHeight: 1.8, color: "#495057" }}>
                  <p><strong>Treatment Strategy:</strong> {selectedRisk.treatmentStrategy}</p>
                  <p><strong>Response:</strong> {selectedRisk.riskResponse}</p>
                  <p style={{ marginBottom: "4px" }}><strong>Control Reference:</strong></p>
                  {resolving ? (
                    <p style={{ color: "#3498db", fontSize: "12px" }}>Resolving controls…</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                      {(Array.isArray(selectedRisk.controlReference)
                        ? selectedRisk.controlReference
                        : String(selectedRisk.controlReference || "").split(",").map((s) => s.trim()).filter(Boolean)
                      ).map((id) => {
                        const resolved = resolvedControls[id];
                        return (
                          <span key={id} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: resolved ? "#e3f2fd" : "#f1f1f1", border: `1px solid ${resolved ? "#90caf9" : "#ccc"}`, borderRadius: "6px", padding: "3px 8px", fontSize: "12px", lineHeight: 1.4 }}>
                            <span style={{ fontWeight: 700, color: "#1565c0" }}>{resolved ? resolved.controlCode : id}</span>
                            {resolved && <span style={{ fontSize: "10px", color: "#546e7a" }}>{resolved.frameworkCode}</span>}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <p><strong>Number of Days:</strong> {selectedRisk.numberOfDays}</p>
                </div>
              </div>
              <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                <h4 style={{ margin: "0 0 12px", color: "#2c3e50", fontWeight: 600 }}>Residual Risk</h4>
                <div style={{ fontSize: "14px", lineHeight: 1.8, color: "#495057" }}>
                  <p><strong>Likelihood After Treatment:</strong> {selectedRisk.likelihoodAfterTreatment}</p>
                  <p><strong>Impact After Treatment:</strong> {selectedRisk.impactAfterTreatment}</p>
                  <p><strong>Risk Owner:</strong> {selectedRisk.riskOwner}</p>
                  <p><strong>Status:</strong> {selectedRisk.status}</p>
                </div>
              </div>
            </div>

            {selectedRisk.date && (
              <div style={{ padding: "16px", background: "rgba(155,89,182,0.1)", borderRadius: "8px", border: "1px solid rgba(155,89,182,0.3)", marginBottom: "20px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#8e44ad", fontWeight: 600 }}>⏱️ {getTaskAssignmentText(selectedRisk)}</p>
              </div>
            )}

            {selectedRisk.controlReference && (
              <div style={{ padding: "16px", background: "rgba(230,126,34,0.06)", borderRadius: "8px", border: "1px solid rgba(230,126,34,0.3)", marginBottom: "20px" }}>
                <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#d35400", fontWeight: 600 }}>Controls Applied</p>
                {resolving ? (
                  <p style={{ margin: 0, fontSize: "12px", color: "#3498db" }}>Loading control details…</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {(Array.isArray(selectedRisk.controlReference)
                      ? selectedRisk.controlReference
                      : String(selectedRisk.controlReference || "").split(",").map((s) => s.trim()).filter(Boolean)
                    ).map((id) => {
                      const resolved = resolvedControls[id];
                      return (
                        <div key={id} style={{ background: resolved ? "white" : "#f8f8f8", border: `1px solid ${resolved ? "#e67e22" : "#ddd"}`, borderRadius: "8px", padding: "6px 12px", display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: "80px" }}>
                          <span style={{ fontWeight: 700, fontSize: "13px", color: "#d35400" }}>{resolved ? resolved.controlCode : id}</span>
                          {resolved && <span style={{ fontSize: "10px", color: "white", fontWeight: 600, background: "#667eea", borderRadius: "4px", padding: "1px 5px", marginTop: "3px" }}>{resolved.frameworkCode}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "20px", borderTop: "1px solid #e9ecef", flexWrap: "wrap" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 24px", background: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }} onMouseEnter={(e) => { e.target.style.background = "#5a6268"; }} onMouseLeave={(e) => { e.target.style.background = "#6c757d"; }}>Close</button>
              <button onClick={() => { setShowModal(false); handleEditRisk(selectedRisk.riskId); }} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }} onMouseEnter={(e) => { e.target.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; }}>Edit Risk</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "fixed", bottom: "70px", left: "80px", zIndex: 100 }}>
        <button
          onClick={() => { logClick("Add New Risk FAB", MODULES.RISK, { url: "/risk-assessment/saved" }); router.push("/risk-assessment/add"); }}
          style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg,#27ae60,#2ecc71)", color: "white", border: "none", fontSize: "28px", lineHeight: 1, cursor: "pointer", boxShadow: "0 4px 15px rgba(39,174,96,0.35)", transition: "all 0.25s ease", display: "flex", alignItems: "center", justifyContent: "center" }}
          title="Add New Risk Assessment"
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >+</button>
      </div>

      <div style={{ position: "fixed", bottom: "70px", right: "30px", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
        {generatingSoA && soaProgress.total > 0 && (
          <div style={{ background: "white", borderRadius: "10px", padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", minWidth: "210px", border: "1px solid #e8ecf0" }}>
            <div style={{ fontSize: "12px", color: "#475569", marginBottom: "6px", fontWeight: 600 }}>Generating SoA… {soaProgress.current}/{soaProgress.total}</div>
            <div style={{ background: "#e9ecef", borderRadius: "4px", overflow: "hidden", height: "5px" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#8e44ad,#9b59b6)", width: `${(soaProgress.current / soaProgress.total) * 100}%`, transition: "width 0.3s ease" }} />
            </div>
          </div>
        )}
        <button
          onClick={handleGenerateSoA}
          disabled={generatingSoA}
          style={{ padding: "11px 22px", borderRadius: "50px", background: generatingSoA ? "#adb5bd" : "linear-gradient(135deg,#8e44ad,#9b59b6)", color: "white", border: "none", fontSize: "14px", fontWeight: 700, cursor: generatingSoA ? "not-allowed" : "pointer", boxShadow: "0 4px 15px rgba(155,89,182,0.3)", transition: "all 0.25s ease", display: "inline-flex", alignItems: "center", gap: 6 }}
          title="Generate Statement of Applicability"
          onMouseEnter={(e) => { if (!generatingSoA) { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(155,89,182,0.4)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(155,89,182,0.3)"; }}
        >
          {generatingSoA ? "⏳ Generating…" : "📄 Generate SoA"}
        </button>
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @media (max-width: 768px) { .srp-modal-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
};

export default SavedRisksPage;