// C:\Users\ak192\Downloads\CalVant-Next-master (3)\CalVant-Next-master\src\modules\documentation\pages\Archived.js

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import documentationService from "../services/documentationService";
import { FileText,  Trash2, Archive, Search, ArrowUpDown, ArrowUp, ArrowDown  } from "lucide-react";
import Modal from "../../../components/navigations/Modal";
import { captureActivity, ACTIONS } from "../../../services/activities";

const DOC_API = `${process.env.NEXT_PUBLIC_SP || ""}/doc-service/api/documents`;

async function permanentlyDeleteDocument(id) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${DOC_API}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ comment: "Permanently deleted from archive" }),
  });
  if (!res.ok) throw new Error("Permanent delete failed");
}

// ── Sort arrow header ─────────────────────────────────────────────────────
const SortTh = ({ label, sortKey, current, onSort }) => {
  const isActive = current.key === sortKey;
  const isAsc = isActive && current.dir === "asc";
  const isDesc = isActive && current.dir === "desc";
  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        padding: "12px 14px",
        textAlign: "center",
        borderBottom: "2px solid #e6e6e6",
        fontWeight: 600,
        whiteSpace: "nowrap",
        cursor: "pointer",
        userSelect: "none",
        background: isActive ? "#fff7ed" : "#f8f9fa",
        transition: "background 0.15s",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 2px 0 #e6e6e6",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
        <span>{label}</span>
        {isAsc ? (
          <ArrowUp size={13} style={{ color: "#f59e0b" }} />
        ) : isDesc ? (
          <ArrowDown size={13} style={{ color: "#f59e0b" }} />
        ) : (
          <ArrowUpDown size={13} style={{ color: "#bbb" }} />
        )}
      </div>
    </th>
  );
};

// ── Static sticky header ──────────────────────────────────────────────────
const StaticTh = ({ children }) => (
  <th
    style={{
      padding: "12px 14px",
      textAlign: "center",
      borderBottom: "2px solid #e6e6e6",
      fontWeight: 600,
      whiteSpace: "nowrap",
      background: "#f8f9fa",
      position: "sticky",
      top: 0,
      zIndex: 10,
      boxShadow: "0 2px 0 #e6e6e6",
    }}
  >
    {children}
  </th>
);

// ── StatCard Component ──────────────────────────────────────────────────────
const StatCard = ({ value, label, index, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: active ? "#eff6ff" : "white",
      border: active ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
      borderRadius: 12, padding: "16px",
      display: "flex", flexDirection: "column", gap: 4,
      boxShadow: active ? "0 4px 12px rgba(59,130,246,0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease-in-out",
      transform: active ? "translateY(-2px)" : "none",
      animation: `fadeUp 0.3s ease ${0.1 + index * 0.05}s both`,
      position: "relative", overflow: "hidden",
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "#cbd5e1";
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        e.currentTarget.style.borderColor = "#e2e8f0";
      }
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: 24, fontWeight: 800, color: active ? "#1d4ed8" : "#1e293b", letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </span>
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#3b82f6" : "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const Archived = () => {
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

  const [allDocs, setAllDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "archivedAt", dir: "desc" });

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    docId: null,
    docName: "",
  });
  const [infoModal, setInfoModal] = useState({ open: false, title: "", message: "" });
  const [working, setWorking] = useState({});

  // ── Load archived documents ─────────────────────────────────────────────
  const loadArchived = useCallback(async () => {
    setLoading(true);
    try {
      const docs = (await documentationService.getDocuments()) || [];
      const archived = docs.filter(
        (d) => d.organization === effectiveOrgId && d.deleted === true
      );
      setAllDocs(archived);
    } catch (err) {
      console.error("Archived load error:", err);
      setAllDocs([]);
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId]);

  useEffect(() => {
    captureActivity({
      action: ACTIONS.PAGE_LOAD,
      item: [{ detail: "Documentation · Viewed Archived Policies" }],
      url: "/documentation/archived",
    });
    loadArchived();
  }, [loadArchived]);

  // ── Sort handler ────────────────────────────────────────────────────────
  const handleSort = useCallback((key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  }, []);

  // ── Filtered + sorted list ──────────────────────────────────────────────
  const filteredDocs = useMemo(() => {
    let list = [...allDocs];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (d) =>
          (d.name || "").toLowerCase().includes(q) ||
          (d.uploaderName || "").toLowerCase().includes(q) ||
          (d.departmentName || "").toLowerCase().includes(q) ||
          (d.deleteComment || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA, valB;
      switch (sort.key) {
        case "name":
          valA = (a.name || "").toLowerCase();
          valB = (b.name || "").toLowerCase();
          break;
        case "uploaderName":
          valA = (a.uploaderName || "").toLowerCase();
          valB = (b.uploaderName || "").toLowerCase();
          break;
        case "version":
          valA = a.version ?? 0;
          valB = b.version ?? 0;
          break;
        case "archivedAt": {
          const da = a.deletedAt || a.archivedAt || a.updatedAt || a.createdAt;
          const db = b.deletedAt || b.archivedAt || b.updatedAt || b.createdAt;
          valA = da ? new Date(da).getTime() : 0;
          valB = db ? new Date(db).getTime() : 0;
          break;
        }
        case "createdAt":
          valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        default:
          return 0;
      }
      if (typeof valA === "string") {
        return sort.dir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sort.dir === "asc" ? valA - valB : valB - valA;
    });

    return list;
  }, [allDocs, search, sort]);

  // ── Permanent delete ─────────────────────────────────────────────────────
  const handlePermanentDelete = async () => {
    const { docId, docName } = confirmModal;
    setConfirmModal({ open: false });
    setWorking((p) => ({ ...p, [docId]: true }));
    try {
      await permanentlyDeleteDocument(docId);
      captureActivity({
        action: ACTIONS.DELETE,
        item: `Documentation · Permanently deleted archived policy '${docName}'`,
        url: "/documentation/archived",
      });
      setAllDocs((prev) => prev.filter((d) => d.id !== docId));
      setInfoModal({
        open: true,
        title: "Deleted",
        message: `"${docName}" has been permanently deleted and cannot be recovered.`,
      });
    } catch (err) {
      console.error("Permanent delete error:", err);
      setInfoModal({
        open: true,
        title: "Delete Failed",
        message: "Could not permanently delete the policy. Please try again.",
      });
    } finally {
      setWorking((p) => ({ ...p, [docId]: false }));
    }
  };

  const fmt = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "4px 2px 6px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .arch-table-wrapper {
          width: 100%; overflow-x: auto;
          max-height: 72vh; overflow-y: auto;
        }
        .arch-table {
          width: 100%; border-collapse: collapse;
          min-width: 900px; background: transparent;
        }
        .arch-table tbody tr:hover td { background: #f8fafc !important; }
        .arch-table tbody tr { transition: background 0.15s; }
      `}</style>

      {/* ── Back button ── */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => router.push("/documentation")}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg,#3b82f6,#2563eb)",
            color: "white", border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.35)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* ── Header card ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(241,245,249,0.8)", borderRadius: 14,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          padding: "18px 24px 16px", marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              }}
            >
              <Archive size={22} color="white" strokeWidth={2} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                Archived Policies
              </h1>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b", fontWeight: 400 }}>
                Policies archived from the MLD are stored here.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => router.push("/documentation/mld")}
              style={{
                padding: "10px 20px", borderRadius: 10,
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                border: "none", color: "white", fontWeight: 600, fontSize: 13,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; }}
            >
              Go to Policies (MLD)
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {/* !loading && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 14, marginBottom: 18,
          }}
        >
          <StatCard
            value={allDocs.length}
            label="Total Archived"
            index={0}
            active={false}
          />
          <StatCard
            value={filteredDocs.length}
            label="Shown"
            index={1}
            active={false}
          />
        </section>
      ) */}

      {/* ── Filter / Toolbar ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(241,245,249,0.8)", borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: "8px 16px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8,
          flexWrap: "wrap", overflow: "visible",
          position: "relative", zIndex: 100,
        }}
      >
        <div style={{ position: "relative", flex: "1 1 180px", maxWidth: 320 }}>
          <Search
            size={13}
            color="#94a3b8"
            style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          />
          <input
            type="text"
            placeholder="Search by name, submitter, department or reason…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "7px 10px 7px 30px",
              border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13,
              outline: "none", background: "#f8fafc", boxSizing: "border-box",
              transition: "all 0.2s", color: "#1e293b",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
          {filteredDocs.length} of {allDocs.length} archived
        </span>
      </div>

      {/* ── Table card ── */}
      <div style={{
        background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)",
        borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid rgba(241,245,249,0.8)",
        overflow: "hidden", marginBottom: 16,
      }}>
          <div className="arch-table-wrapper">
          <table className="arch-table">
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <StaticTh>#</StaticTh>
                <SortTh label="Policy Name"     sortKey="name"         current={sort} onSort={handleSort} />
                <SortTh label="CalVant Version" sortKey="version"      current={sort} onSort={handleSort} />
                <SortTh label="Submitted By"    sortKey="uploaderName" current={sort} onSort={handleSort} />
                <StaticTh>Department</StaticTh>
                <SortTh label="Uploaded On"     sortKey="createdAt"    current={sort} onSort={handleSort} />
                <StaticTh>Reason (Remarks)</StaticTh>
                <StaticTh>Actions</StaticTh>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid #64748b",
                        borderTop: "2px solid transparent",
                        animation: "spin 0.8s linear infinite",
                        marginRight: 8,
                        verticalAlign: "middle",
                      }}
                    />
                    Loading archived policies…
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <Archive
                      size={48}
                      style={{ color: "#d1d5db", marginBottom: "12px", display: "block", margin: "0 auto 12px" }}
                    />
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#9ca3af", margin: "0 0 4px" }}>
                      {search.trim() ? "No results match your search" : "No Archived Policies"}
                    </p>
                    <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
                      {search.trim()
                        ? "Try a different search term."
                        : "Policies you archive from the MLD will appear here."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => {
                  const isWorking = !!working[doc.id];
                  const archivedDate = doc.deletedAt || doc.archivedAt || doc.updatedAt;

                  return (
                    <tr
                      key={doc.id}
                      style={{
                        borderBottom: "1px solid #f1f1f1",
                        backgroundColor: "#fafafa",
                        borderLeft: "4px solid #64748b",
                        transition: "background 0.15s",
                      }}
                    >
                      {/* # */}
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "center",
                          color: "#9ca3af",
                          fontSize: "13px",
                          verticalAlign: "middle",
                        }}
                      >
                        {idx + 1}
                      </td>

                      {/* Policy Name */}
                      <td style={{ padding: "12px 14px", verticalAlign: "middle", maxWidth: "200px", minWidth: "120px" }}>
                        <span
                          title={doc.name}
                          style={{
                            fontWeight: 600,
                            color: "#374151",
                            fontSize: "13px",
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "180px",
                          }}
                        >
                          {doc.name || "—"}
                        </span>
                        {doc.soaId && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              background: "#d1fae5",
                              color: "#065f46",
                              border: "1px solid #6ee7b7",
                              padding: "1px 6px",
                              borderRadius: "8px",
                              marginTop: "3px",
                              display: "inline-block",
                            }}
                          >
                            SoA: {doc.soaId}
                          </span>
                        )}
                      </td>

                      {/* CalVant Version */}
                      <td style={{ padding: "12px 14px", textAlign: "center", verticalAlign: "middle" }}>
                        {doc.version != null ? (
                          <span
                            style={{
                              background: "#f0f4ff",
                              color: "#3b5bdb",
                              border: "1px solid #c5d4fb",
                              borderRadius: "6px",
                              padding: "2px 8px",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            v{doc.version}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Submitted By */}
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          color: "#374151",
                          fontSize: "13px",
                        }}
                      >
                        {doc.uploaderName || "—"}
                      </td>

                      {/* Department */}
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          color: "#6b7280",
                          fontSize: "13px",
                        }}
                      >
                        {doc.departmentName || "—"}
                      </td>

                      {/* Uploaded On */}
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          color: "#6b7280",
                          fontSize: "13px",
                        }}
                      >
                        {fmt(doc.createdAt)}
                      </td>

                      {/* Reason */}
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          maxWidth: "200px",
                        }}
                      >
                        {doc.deleteComment ? (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              fontStyle: "italic",
                              display: "block",
                              wordBreak: "break-word",
                            }}
                          >
                            "{doc.deleteComment}"
                          </span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#d1d5db" }}>—</span>
                        )}
                      </td>

                      {/* Actions — Delete Forever only */}
                      <td style={{ padding: "12px 14px", textAlign: "center", verticalAlign: "middle" }}>
                        <button
                          disabled={isWorking}
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              docId: doc.id,
                              docName: doc.name || String(doc.id),
                            })
                          }
                          title="Permanently delete"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            border: "none",
                            background: isWorking ? "#e5e7eb" : "#ef4444",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: isWorking ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            margin: "0 auto",
                          }}
                        >
                          {isWorking ? (
                            <span
                              style={{
                                display: "inline-block",
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                border: "2px solid #fff",
                                borderTop: "2px solid transparent",
                                animation: "spin 0.8s linear infinite",
                              }}
                            />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Delete Forever
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confirm Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={confirmModal.open}
        title="⚠️ Permanently Delete Policy"
        showCancel
        onClose={() => setConfirmModal({ open: false })}
        onConfirm={handlePermanentDelete}
        message={
          <div style={{ fontSize: "14px", color: "#374151" }}>
            <p style={{ marginBottom: "8px" }}>
              Permanently delete <strong>"{confirmModal.docName}"</strong>?
            </p>
            <p style={{ fontSize: "12px", color: "#ef4444", fontWeight: 600, margin: 0 }}>
              ⚠️ This action cannot be undone. The file and all its version history will be permanently removed.
            </p>
          </div>
        }
      />

      {/* ── Info Modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={infoModal.open}
        title={infoModal.title}
        showCancel={false}
        onClose={() => setInfoModal({ open: false })}
        onConfirm={() => setInfoModal({ open: false })}
        message={<p style={{ fontSize: "14px", color: "#374151" }}>{infoModal.message}</p>}
      />

      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "white",
          color: "#9ca3af",
          padding: "12px",
          textAlign: "center",
          fontSize: "13px",
          zIndex: 700,
          borderTop: "1px solid #f1f1f1",
        }}
      >
        © {new Date().getFullYear()} CalVant. All rights reserved.
      </footer>
    </div>
  );
};

export default Archived;
