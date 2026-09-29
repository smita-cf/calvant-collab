"use client";
import React, { useState, useEffect, useRef } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Shield,
  FileText,
  Lock,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Mail,
  Globe,
  List,
  RefreshCw,
} from "lucide-react";
import "./FooterContentPage.css";
import { useIsMobile } from "@/hooks/useIsMobile";

/* ── Page config by type ─────────────────────────────────────────────────── */
const PAGE_CONFIG = {
  privacy: {
    badge: "Data Protection",
    badgeIcon: Shield,
    titleSuffix: "Policy",
    subtitle:
      "We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.",
    heroGradient: "radial-gradient(circle at top left, #4f46e5 0%, #1d1f3b 45%, #020617 100%)",
    stats: [
      { icon: Shield, value: "100%", label: "Data Encrypted" },
      { icon: Globe, value: "GDPR", label: "Compliant" },
      { icon: Lock, value: "Zero", label: "Third-Party Sales" },
      { icon: RefreshCw, value: "72h", label: "Breach Notification" },
    ],
    highlights: [
      { icon: Shield, label: "Data Security", value: "AES-256 encryption" },
      { icon: Lock, label: "Access Control", value: "Role-based permissions" },
      { icon: Globe, label: "GDPR Ready", value: "Full compliance" },
      { icon: CheckCircle, label: "Your Rights", value: "Full data control" },
    ],
    ctaTitle: "Questions About Your Data?",
    ctaSubtitle: "Our data protection team is here to help with any privacy concerns.",
    ctaText: "Contact Privacy Team",
    ctaHref: "mailto:privacy@calvant.com",
  },
  terms: {
    badge: "Legal Agreement",
    badgeIcon: FileText,
    titleSuffix: "of Service",
    subtitle:
      "Please read these terms carefully before using CalVant. By accessing our services, you agree to be bound by these terms and conditions.",
    heroGradient: "radial-gradient(circle at top left, #4f46e5 0%, #1d1f3b 45%, #020617 100%)",
    stats: [
      { icon: FileText, value: "Clear", label: "Plain Language" },
      { icon: Globe, value: "Global", label: "Coverage" },
      { icon: CheckCircle, value: "Fair", label: "User Rights" },
      { icon: Clock, value: "30d", label: "Notice Period" },
    ],
    highlights: [
      { icon: FileText, label: "Service Use", value: "Clear guidelines" },
      { icon: CheckCircle, label: "User Rights", value: "Full protection" },
      { icon: Lock, label: "Restrictions", value: "Prohibited uses" },
      { icon: Globe, label: "Jurisdiction", value: "India courts" },
    ],
    ctaTitle: "Need Clarification?",
    ctaSubtitle: "Our legal team is available to clarify any terms or answer questions.",
    ctaText: "Contact Legal Team",
    ctaHref: "mailto:legal@calvant.com",
  },
  security: {
    badge: "Enterprise Security",
    badgeIcon: Lock,
    titleSuffix: "at CalVant",
    subtitle:
      "Security is at the core of everything we build. Discover the enterprise-grade measures we take to protect your data and infrastructure.",
    heroGradient: "radial-gradient(circle at top left, #4f46e5 0%, #1d1f3b 45%, #020617 100%)",
    stats: [
      { icon: Shield, value: "99.9%", label: "Uptime SLA" },
      { icon: Lock, value: "AES-256", label: "Encryption" },
      { icon: RefreshCw, value: "24/7", label: "Monitoring" },
      { icon: CheckCircle, value: "ISO", label: "27001 Aligned" },
    ],
    highlights: [
      { icon: Shield, label: "Infrastructure", value: "AWS / GCP secured" },
      { icon: Lock, label: "Encryption", value: "At rest & in transit" },
      { icon: RefreshCw, label: "Pen Testing", value: "Quarterly audits" },
      { icon: CheckCircle, label: "Compliance", value: "ISO 27001 aligned" },
    ],
    ctaTitle: "Found a Security Issue?",
    ctaSubtitle: "We take security seriously. Report any vulnerabilities through our responsible disclosure program.",
    ctaText: "Report Vulnerability",
    ctaHref: "mailto:security@calvant.com",
  },
};

/* ── Skeleton loader ─────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="fcp-loading">
    <div className="fcp-skel fcp-skel-h1" />
    <div className="fcp-skel fcp-skel-p fcp-skel-p.w90" />
    <div className="fcp-skel fcp-skel-p" />
    <div className="fcp-skel fcp-skel-h2" style={{ marginTop: 32 }} />
    <div className="fcp-skel fcp-skel-p" />
    <div className="fcp-skel fcp-skel-p w75" />
    <div className="fcp-skel fcp-skel-p" />
    <div className="fcp-skel fcp-skel-h2" style={{ marginTop: 32 }} />
    <div className="fcp-skel fcp-skel-p" />
    <div className="fcp-skel fcp-skel-p w90" />
    <div className="fcp-skel fcp-skel-p w75" />
  </div>
);

/* ── Table of contents extractor ─────────────────────────────────────────── */
function extractHeadings(html) {
  if (!html || typeof window === "undefined") return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  const headings = div.querySelectorAll("h2, h3");
  return Array.from(headings).map((h, i) => ({
    id: `section-${i}`,
    text: h.textContent.trim(),
    level: parseInt(h.tagName[1]),
  }));
}

/* ── Inject IDs into headings ─────────────────────────────────────────────── */
function injectHeadingIds(html) {
  if (!html) return html;
  let idx = 0;
  return html.replace(/<h([23])(.*?)>/gi, (_, level, attrs) => {
    const id = `section-${idx++}`;
    return `<h${level}${attrs} id="${id}">`;
  });
}

/* ── Helper: build initial state from prefetchedData ─────────────────────── */
function initFromPrefetched(prefetchedData) {
  if (!prefetchedData) return { content: "", title: "", updatedAt: "" };

  const rawContent = prefetchedData.content || "";
  const content = injectHeadingIds(rawContent);

  const title = prefetchedData.name || "";

  const updatedAt = prefetchedData.updated_at
    ? new Date(prefetchedData.updated_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return { content, title, updatedAt };
}

/* ── Main Component ──────────────────────────────────────────────────────── */
// ↓ Added `prefetchedData` prop — passed from the server page component
const FooterContentPage = ({ type: propType, prefetchedData }) => {
  const { type: paramType } = useParams();
  const router = useRouter();
  const type = propType || paramType;

  // ↓ Initialize state from server-fetched data if available, else empty defaults
  const init = initFromPrefetched(prefetchedData);

  const [content, setContent] = useState(init.content);
  const [title, setTitle] = useState(init.title);
  const [updatedAt, setUpdatedAt] = useState(init.updatedAt);
  // ↓ Skip loading state entirely if we already have data from the server
  const [loading, setLoading] = useState(!prefetchedData);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [headings, setHeadings] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isMobile = useIsMobile();

  const cfg = PAGE_CONFIG[type] || PAGE_CONFIG.privacy;
  const BadgeIcon = cfg.badgeIcon;
  const CtaIcon = ArrowRight;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!sessionStorage.getItem("user"));
    }
  }, []);

  // ↓ If prefetchedData was provided, extract TOC from it on mount (client-side only)
  useEffect(() => {
    if (prefetchedData && init.content) {
      setTimeout(() => {
        const extracted = extractHeadings(init.content);
        setHeadings(extracted);
        if (extracted.length > 0) setActiveSection(extracted[0].id);
      }, 100);
    }
  }, []); // runs once on mount

  useEffect(() => {
    // ↓ Skip client-side fetch entirely if server already provided data
    if (prefetchedData) return;

    const fetchContent = async () => {
      setLoading(true);
      try {
        const url = `https://api.calvant.com/footer-service/api/footer-content/type/${type}`;
        const response = await axios.get(url);
        const data = response.data;

        const rawContent = data.content || "";
        const processedContent = injectHeadingIds(rawContent);

        setContent(processedContent);
        setTitle(data.name || type.charAt(0).toUpperCase() + type.slice(1));

        if (data.updated_at) {
          setUpdatedAt(new Date(data.updated_at).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          }));
        }

        // Extract TOC after content is set
        setTimeout(() => {
          const extracted = extractHeadings(processedContent);
          setHeadings(extracted);
          if (extracted.length > 0) setActiveSection(extracted[0].id);
        }, 100);
      } catch (error) {
        console.error("Error fetching footer content:", error);
        setTitle(type.charAt(0).toUpperCase() + type.slice(1));
        setContent("<p>Document content is currently unavailable. Please try again later.</p>");
      } finally {
        setLoading(false);
      }
    };

    if (type) fetchContent();
  }, [type]); // ↓ removed prefetchedData from deps — it never changes

  // Intersection observer for active TOC item
  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0% -60% 0%" }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  const pageTitle = title
    ? `${title} ${cfg.titleSuffix || ""}`.trim()
    : `${type?.charAt(0).toUpperCase()}${type?.slice(1)} ${cfg.titleSuffix || ""}`.trim();

  return (
    <div className={`fcp-page ${mounted ? "mounted" : ""}`}>

      {/* ── Navbar ── */}
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="fcp-hero">
        <div className="fcp-hero-orb fcp-hero-orb-1" />
        <div className="fcp-hero-orb fcp-hero-orb-2" />
        <div className="fcp-hero-inner">
          <button
            className="fcp-hero-back-btn"
            onClick={() => router.back()}
            style={{ marginBottom: 24 }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="fcp-hero-badge">
            <BadgeIcon size={13} />
            {cfg.badge}
          </div>

          <h1 className="fcp-hero-title">
            {pageTitle.split(" ").length > 1 ? (
              <>
                {pageTitle.split(" ").slice(0, -1).join(" ")}{" "}
                <span>{pageTitle.split(" ").slice(-1)[0]}</span>
              </>
            ) : (
              pageTitle
            )}
          </h1>

          <p className="fcp-hero-subtitle">{cfg.subtitle}</p>

          <div className="fcp-hero-meta">
            {updatedAt && (
              <span className="fcp-hero-meta-pill">
                <Calendar size={12} /> Last updated: {updatedAt}
              </span>
            )}
            <span className="fcp-hero-meta-pill">
              <Clock size={12} /> 5 min read
            </span>
            <span className="fcp-hero-meta-pill">
              <Globe size={12} /> CalVant Platform
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="fcp-stats-bar">
        <div className="fcp-stats-bar-inner">
          {cfg.stats.map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div key={i} className="fcp-stat-item">
                <div className="fcp-stat-icon">
                  <StatIcon size={20} />
                </div>
                <div className="fcp-stat-value">{stat.value}</div>
                <div className="fcp-stat-label">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Highlight Cards ── */}
      <div style={{ background: "var(--fcp-bg)", padding: "48px 24px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="fcp-highlight-grid">
            {cfg.highlights.map((h, i) => {
              const HIcon = h.icon;
              return (
                <div key={i} className="fcp-highlight-card">
                  <div className="fcp-highlight-icon">
                    <HIcon size={22} />
                  </div>
                  <div className="fcp-highlight-label">{h.label}</div>
                  <div className="fcp-highlight-value">{h.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="fcp-layout">

        {/* Sidebar TOC */}
        <aside className="fcp-sidebar">
          <div className="fcp-toc-card">
            <div className="fcp-toc-title">
              <List size={14} /> Table of Contents
            </div>
            <ul className="fcp-toc-list">
              {headings.length > 0 ? (
                headings.map((h) => (
                  <li key={h.id} style={{ paddingLeft: h.level === 3 ? 12 : 0 }}>
                    <a
                      href={`#${h.id}`}
                      className={activeSection === h.id ? "active" : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {h.text}
                    </a>
                  </li>
                ))
              ) : (
                <li style={{ padding: "8px 10px", color: "var(--fcp-text-muted)", fontSize: 13 }}>
                  {loading ? "Loading contents…" : "No sections found"}
                </li>
              )}
            </ul>
          </div>
        </aside>

        {/* Article */}
        <article className="fcp-article">
          {updatedAt && (
            <div className="fcp-updated-badge">
              <CheckCircle size={12} /> Last updated: {updatedAt}
            </div>
          )}

          {loading ? (
            <Skeleton />
          ) : (
            <>
              <div
                className="fcp-prose"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* CTA Banner */}
              <div className="fcp-cta-section">
                <div className="fcp-cta-title">{cfg.ctaTitle}</div>
                <div className="fcp-cta-subtitle">{cfg.ctaSubtitle}</div>
                <a href={cfg.ctaHref} className="fcp-cta-btn">
                  {cfg.ctaText} <ArrowRight size={16} />
                </a>
              </div>

              {/* Related pages */}
              <div style={{ marginTop: 32 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
                  textTransform: "uppercase", color: "var(--fcp-text-muted)",
                  marginBottom: 16
                }}>
                  Related Documents
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { href: "/privacy", label: "Privacy Policy", icon: Shield },
                    { href: "/terms", label: "Terms of Service", icon: FileText },
                    { href: "/security", label: "Security", icon: Lock },
                  ]
                    .filter((r) => !r.href.includes(type))
                    .map((rel) => {
                      const RelIcon = rel.icon;
                      return (
                        <Link
                          key={rel.href}
                          href={rel.href}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 18px",
                            background: "var(--fcp-card)",
                            border: "1px solid var(--fcp-border)",
                            borderRadius: 8,
                            color: "var(--fcp-text-sec)",
                            textDecoration: "none",
                            fontSize: 14,
                            fontWeight: 500,
                            transition: "all .25s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "rgba(79,70,229,.5)";
                            e.currentTarget.style.color = "#818cf8";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--fcp-border)";
                            e.currentTarget.style.color = "var(--fcp-text-sec)";
                          }}
                        >
                          <RelIcon size={15} /> {rel.label}
                        </Link>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </article>
      </div>

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
};

export default FooterContentPage;