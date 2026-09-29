import Link from 'next/link';
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Shield, Globe, FileText, CheckCircle2,
         Building2, Users, ExternalLink, Calendar, Lock } from "lucide-react";
import { motion } from "framer-motion";

const BASE_URL = "https://api.calvant.com/trust-service";

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
      padding: "14px 20px", borderBottom: "1px solid #f1f5f9",
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

const PublicTrustCentrePage = () => {
  const [tc, setTc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    // const hostname = `trust.consultantsfactory.com`
    fetch(`${BASE_URL}/api/trust-centre/public/by-domain?domain=${hostname}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setTc)
      .catch(() => setError("Trust Centre not found for this domain."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, border: "3px solid #e2e8f0",
        borderTop: "3px solid #3b82f6", borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <p style={{ color: "#64748b", fontWeight: 500 }}>Loading Trust Centre…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !tc) return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
      background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    }}>
      <Shield size={48} color="#94a3b8" />
      <h2 style={{ color: "#1e293b", margin: 0 }}>Trust Centre Not Found</h2>
      <p style={{ color: "#64748b", margin: 0 }}>{error}</p>
    </div>
  );

  return (
    <div style={{
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)",
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center",
              justifyContent: "center", overflow: "hidden",
            }}>
              <Image
                src={`${BASE_URL}/api/trust-centre/logo/${tc.organization}`}
                alt="logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h1 style={{
                  margin: 0, color: "white", fontWeight: 800,
                  fontSize: "clamp(18px, 3vw, 26px)",
                }}>
                  {tc.companyName || "Trust Centre"}
                </h1>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px",
                  borderRadius: 20, background: "#22c55e", color: "white",
                }}>
                  LIVE
                </span>
              </div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                Security & Compliance Overview
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CONTENT */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "28px 24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 20,
      }}>
        {tc.overview && (
          <SectionCard title="Overview" icon={Shield}
            iconColor="linear-gradient(135deg,#3b82f6,#1d4ed8)" delay={0.1}>
            <p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
              {tc.overview}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
              {tc.privacyPolicyLink && (
                <Link href={tc.privacyPolicyLink} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 5,
                    color: "#3b82f6", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  <ExternalLink size={13} /> Privacy Policy
                </Link>
              )}
              {tc.tosLink && (
                <Link href={tc.tosLink} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 5,
                    color: "#3b82f6", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  <ExternalLink size={13} /> Terms of Service
                </Link>
              )}
            </div>
          </SectionCard>
        )}

        {tc.compliances?.length > 0 && (
          <SectionCard title="Compliance Certifications" icon={CheckCircle2}
            iconColor="linear-gradient(135deg,#10b981,#059669)" delay={0.15}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {tc.compliances.map((c) => {
                const col = getComplianceColor(c);
                return (
                  <div key={c} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 20,
                    background: col.bg, color: col.text,
                    border: `1px solid ${col.border}`,
                    fontWeight: 700, fontSize: 12,
                  }}>
                    <CheckCircle2 size={12} /> {c}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

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
                  <Building2 size={12} color="#94a3b8" /> {entry.companyName}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {tc.policies?.length > 0 && (
          <SectionCard title="Policy Documents" icon={FileText}
            iconColor="linear-gradient(135deg,#8b5cf6,#7c3aed)" delay={0.25}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tc.policies.map((p) => (
                <div key={p.name} style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 10,
                  background: "#faf5ff", border: "1px solid #ede9fe",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={15} color="#8b5cf6" />
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>
                      {p.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5,
                    fontSize: 11, color: "#94a3b8" }}>
                    <Lock size={11} /> Login to download
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{
        background: "white", borderTop: "1px solid #e2e8f0",
        padding: "16px 24px", textAlign: "center", marginTop: 8,
      }}>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 12, fontWeight: 500 }}>
          © {new Date().getFullYear()} · Powered by{" "}
          <Link href="https://calvant.com" target="_blank" rel="noreferrer"
            style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
            CalVant
          </Link>
        </p>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PublicTrustCentrePage;
