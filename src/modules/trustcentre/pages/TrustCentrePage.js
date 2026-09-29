import Link from 'next/link';
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { motion } from "framer-motion";
import {
  Shield, Globe, FileText, CheckCircle2,
  Download, Building2, Users, RefreshCw,
  ExternalLink, Calendar, Lock, ChevronRight,
} from "lucide-react";
import trustCentreService from "../service/TrustCentreService";

// ── Helpers ───────────────────────────────────────────────────────────────────

const getUser  = () => JSON.parse(sessionStorage.getItem("user")  || "null");
const getToken = () => sessionStorage.getItem("token") || "";

const canDownloadPolicies = (roles = []) =>
  roles.some((r) => ["root", "super_admin", "auditor", "audit_manager"].includes(r));

// ── Compliance badge colours ──────────────────────────────────────────────────
const COMPLIANCE_COLORS = {
  SOC2:     { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  ISO27001: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  ISO:      { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  HIPAA:    { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
  GDPR:     { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  PCI:      { bg: "#fefce8", text: "#a16207", border: "#fef08a" },
  DEFAULT:  { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" },
};

const getComplianceColor = (label = "") => {
  const upper = label.toUpperCase();
  const key = Object.keys(COMPLIANCE_COLORS).find((k) => upper.includes(k));
  return COMPLIANCE_COLORS[key] || COMPLIANCE_COLORS.DEFAULT;
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 16px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: color, display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={15} color="white" />
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "white", lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
        {label}
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, iconColor, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    style={{
      background: "white", borderRadius: 16,
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      border: "1px solid #f1f5f9", overflow: "hidden",
    }}
  >
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "14px 20px",
      borderBottom: "1px solid #f1f5f9",
      background: "linear-gradient(to right, #fafbfc, #ffffff)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: iconColor, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={16} color="white" />
      </div>
      <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{title}</span>
    </div>
    <div style={{ padding: "16px 20px" }}>{children}</div>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const TrustCentrePage = () => {
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
  const token    = getToken();
  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role || ""];
  const canDownload = isPrivilegedRole || canDownloadPolicies(userRoles);

  const [tc,      setTc]      = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [downloading, setDownloading] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !user) router.push("/login");
  }, [mounted, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trustCentreService.getInternalView(token);
      if (!data) throw new Error("No data");
      setTc(data);
    } catch (e) {
      setError("Trust Centre is not available yet.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (policyName) => {
    setDownloading(policyName);
    try {
      const blob = await trustCentreService.downloadPolicy(
        policyName, effectiveOrgId, token
      );
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = policyName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!mounted || !user || loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid #e2e8f0",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{ color: "#64748b", fontWeight: 500, fontSize: 15 }}>
          Loading Trust Centre…
        </p>
      </div>
    );
  }

  // ── Not published / error ───────────────────────────────────────────────────
  if (error || !tc) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16, padding: 24,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Shield size={30} color="#94a3b8" />
        </div>
        <h2 style={{ margin: 0, color: "#1e293b", fontWeight: 700, fontSize: 20 }}>
          Trust Centre Not Available
        </h2>
        <p style={{ margin: 0, color: "#64748b", textAlign: "center", maxWidth: 360, fontSize: 14 }}>
          Your organisation's Trust Centre hasn't been published yet.
          Contact your administrator for more information.
        </p>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "10px 24px", borderRadius: 8, border: "none",
            background: "#3b82f6", color: "white",
            fontWeight: 600, cursor: "pointer", fontSize: 14,
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const org = effectiveOrgId;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>

      {/* ── HERO HEADER ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)",
          padding: "32px 24px",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Background blobs */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: "30%",
          width: 150, height: 150, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Top row */}
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Logo */}
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center",
                justifyContent: "center", overflow: "hidden", flexShrink: 0,
              }}>
                <Image
                  src={trustCentreService.getLogoUrl(org)}
                  alt="logo"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
                  }}
                />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h1 style={{
                    margin: 0, color: "white", fontWeight: 800,
                    fontSize: "clamp(18px, 3vw, 26px)", lineHeight: 1.2,
                  }}>
                    {tc.companyName || "Trust Centre"}
                  </h1>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px",
                    borderRadius: 20, background: "#22c55e",
                    color: "white", letterSpacing: "0.04em",
                  }}>
                    LIVE
                  </span>
                </div>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                  Security & Compliance Overview
                </p>
              </div>
            </div>

            {/* Refresh */}
            <motion.button
              onClick={load}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{
                padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.1)", color: "white",
                cursor: "pointer", display: "flex", alignItems: "center",
                gap: 6, fontSize: 13, fontWeight: 600, backdropFilter: "blur(10px)",
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </motion.button>
          </div>

          {/* Stat pills */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 10,
          }}>
            {tc.foundedYear && (
              <StatPill
                icon={Calendar}
                label="Founded"
                value={tc.foundedYear}
                color="linear-gradient(135deg,#6366f1,#4f46e5)"
              />
            )}
            {tc.compliances?.length > 0 && (
              <StatPill
                icon={CheckCircle2}
                label="Certifications"
                value={tc.compliances.length}
                color="linear-gradient(135deg,#10b981,#059669)"
              />
            )}
            {tc.trustedBy?.length > 0 && (
              <StatPill
                icon={Users}
                label="Trusted By"
                value={tc.trustedBy.length}
                color="linear-gradient(135deg,#f59e0b,#d97706)"
              />
            )}
            {tc.subProcessors?.length > 0 && (
              <StatPill
                icon={Building2}
                label="Sub-Processors"
                value={tc.subProcessors.length}
                color="linear-gradient(135deg,#ec4899,#db2777)"
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "28px 24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 20,
      }}>

        {/* Overview */}
        {tc.overview && (
          <SectionCard title="Overview" icon={Shield}
            iconColor="linear-gradient(135deg,#3b82f6,#1d4ed8)" delay={0.1}>
            <p style={{
              margin: 0, color: "#475569", fontSize: 14,
              lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>
              {tc.overview}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
              {tc.privacyPolicyLink && (
                <Link href={tc.privacyPolicyLink} target="_blank" rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    color: "#3b82f6", fontSize: 13, fontWeight: 600,
                    textDecoration: "none",
                  }}>
                  <ExternalLink size={13} />
                  Privacy Policy
                </Link>
              )}
              {tc.tosLink && (
                <Link href={tc.tosLink} target="_blank" rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    color: "#3b82f6", fontSize: 13, fontWeight: 600,
                    textDecoration: "none",
                  }}>
                  <ExternalLink size={13} />
                  Terms of Service
                </Link>
              )}
              {tc.domain && (
                <Link href={`https://${tc.domain}`} target="_blank" rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    color: "#3b82f6", fontSize: 13, fontWeight: 600,
                    textDecoration: "none",
                  }}>
                  <Globe size={13} />
                  {tc.domain}
                </Link>
              )}
            </div>
          </SectionCard>
        )}

        {/* Compliance Certifications */}
        {tc.compliances?.length > 0 && (
          <SectionCard title="Compliance Certifications" icon={CheckCircle2}
            iconColor="linear-gradient(135deg,#10b981,#059669)" delay={0.15}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {tc.compliances.map((c) => {
                const col = getComplianceColor(c);
                return (
                  <motion.div
                    key={c}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 14px", borderRadius: 20,
                      background: col.bg, color: col.text,
                      border: `1px solid ${col.border}`,
                      fontWeight: 700, fontSize: 12,
                    }}
                  >
                    <CheckCircle2 size={12} />
                    {c}
                  </motion.div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Trusted By */}
        {tc.trustedBy?.length > 0 && (
          <SectionCard title="Trusted By" icon={Users}
            iconColor="linear-gradient(135deg,#f59e0b,#d97706)" delay={0.2}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tc.trustedBy.map((entry) => (
                <div key={entry.companyName} style={{
                  padding: "6px 14px", borderRadius: 20,
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  fontSize: 13, fontWeight: 600, color: "#374151",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Building2 size={12} color="#94a3b8" />
                  {entry.companyName}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Sub-Processors */}
        {tc.subProcessors?.length > 0 && (
          <SectionCard title="Sub-Processors" icon={Building2}
            iconColor="linear-gradient(135deg,#ec4899,#db2777)" delay={0.25}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tc.subProcessors.map((sp) => (
                <motion.div
                  key={sp.name}
                  whileHover={{ x: 3 }}
                  style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 10,
                    background: "#f8fafc", border: "1px solid #f1f5f9",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 13,
                      color: "#1e293b", marginBottom: 2,
                    }}>
                      {sp.name}
                    </div>
                    {sp.purpose && (
                      <div style={{
                        fontSize: 12, color: "#64748b",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {sp.purpose}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {sp.location && (
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 10,
                        background: "#eff6ff", color: "#1d4ed8",
                        fontWeight: 600, border: "1px solid #bfdbfe",
                      }}>
                        {sp.location}
                      </span>
                    )}
                    {sp.website && (
                      <Link href={sp.website} target="_blank" rel="noreferrer"
                        style={{ color: "#3b82f6", display: "flex" }}>
                        <ExternalLink size={13} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Policies */}
        {tc.policies?.length > 0 && (
          <SectionCard title="Policy Documents" icon={FileText}
            iconColor="linear-gradient(135deg,#8b5cf6,#7c3aed)" delay={0.3}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tc.policies.map((p) => (
                <motion.div
                  key={p.name}
                  whileHover={{ x: 3 }}
                  style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 10,
                    background: "#faf5ff", border: "1px solid #ede9fe",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                    <FileText size={15} color="#8b5cf6" style={{ flexShrink: 0 }} />
                    <span style={{
                      fontWeight: 600, fontSize: 13, color: "#1e293b",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {p.name}
                    </span>
                    {p.contentType && (
                      <span style={{
                        fontSize: 10, padding: "1px 7px", borderRadius: 10,
                        background: "#ede9fe", color: "#7c3aed",
                        fontWeight: 600, flexShrink: 0,
                      }}>
                        {p.contentType.split("/")[1]?.toUpperCase() || "DOC"}
                      </span>
                    )}
                  </div>

                  {canDownload ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(p.name)}
                      disabled={downloading === p.name}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 8,
                        background: downloading === p.name ? "#e2e8f0" : "#8b5cf6",
                        color: downloading === p.name ? "#94a3b8" : "white",
                        border: "none", cursor: downloading === p.name ? "default" : "pointer",
                        fontWeight: 600, fontSize: 12, flexShrink: 0,
                      }}
                    >
                      <Download size={12} />
                      {downloading === p.name ? "…" : "Download"}
                    </motion.button>
                  ) : (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontSize: 11, color: "#94a3b8",
                    }}>
                      <Lock size={11} />
                      Auditors only
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {!canDownload && (
              <div style={{
                marginTop: 12, padding: "8px 12px", borderRadius: 8,
                background: "#fffbeb", border: "1px solid #fde68a",
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "#92400e",
              }}>
                <Lock size={12} />
                Policy downloads are available to auditors and administrators only.
              </div>
            )}
          </SectionCard>
        )}

      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{
        background: "white", borderTop: "1px solid #e2e8f0",
        padding: "16px 24px", textAlign: "center",
        marginTop: 8,
      }}>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 12, fontWeight: 500 }}>
          © {new Date().getFullYear()} CalVant · Trust Centre · Read-only view
        </p>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TrustCentrePage;
