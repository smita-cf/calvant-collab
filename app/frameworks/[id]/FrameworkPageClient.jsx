//C:\Users\ak192\Downloads\CalVant-Next-master (3)\CalVant-Next-master\app\frameworks\[id]\FrameworkPageClient.jsx

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
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
  UserCircle,
} from "lucide-react";
import "./framework-page.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useIsMobile } from "@/hooks/useIsMobile";

// ── Icon resolver ─────────────────────────────────────────────────────────────
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
  AlertTriangle,
  Database,
  Server,
  BarChart,
  TrendingUp,
  Award,
  Star,
  Zap,
};

const DynamicIcon = ({ name, size = 24 }) => {
  const Icon = ICON_MAP[name] || Shield;
  return <Icon size={size} />;
};

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// `framework` arrives pre-fetched from the server component — no loading state,
// no client-side axios call, no spinner. The page is fully formed HTML on
// first paint.
export default function FrameworkPageClient({ framework }) {
  const isMobile = useIsMobile();
  const storedUser = getStoredUser();
  const isLoggedIn = !!storedUser;

  const goTo = (path) => {
    window.location.href = path;
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const pc = framework.pageContent;

  // This branch should rarely render now — the server component redirects
  // before getting here when pageContent is missing and a static page exists.
  // It's kept as a safety net for frameworks with neither.
  if (!pc) {
    return (
      <div className="fw-coming-soon">
        <div className="fw-coming-badge">
          {framework.label || framework.name}
        </div>
        <h2>Page coming soon</h2>
        <p>
          We're working on the <strong>{framework.name}</strong> page. Check
          back soon.
        </p>
        <Link href="/">← Back to home</Link>
      </div>
    );
  }

  return (
    <div className="fw-root" style={{ "--fw-accent": "#6366f1" }}>
      <SiteHeader />

      {/* ── HERO ── */}
      <section className="fw-hero">
        <div className="fw-hero-inner">
          <div className="fw-hero-content">
            {pc.heroBadgeText && (
              <div className="fw-badge">{pc.heroBadgeText}</div>
            )}
            <h2 className="fw-hero-title">
              {pc.heroTitle}{" "}
              {pc.heroTitleHighlight && (
                <span className="fw-highlight">{pc.heroTitleHighlight}</span>
              )}
            </h2>
            {pc.heroDescription && (
              <p className="fw-hero-desc">{pc.heroDescription}</p>
            )}

            <div className="fw-hero-cta">
              {!isLoggedIn && pc.heroPrimaryCtaText && (
                <button
                  className="fw-btn-primary"
                  onClick={() => goTo("/demo")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8 5v14l11-7z" />
                  </svg>
                  {pc.heroPrimaryCtaText}
                </button>
              )}
              {pc.heroScrollTarget && (
                <button
                  className="fw-btn-secondary"
                  onClick={() => scrollTo(`fw-${pc.heroScrollTarget}`)}
                >
                  Learn more
                </button>
              )}
            </div>

            {pc.heroStats && pc.heroStats.length > 0 && (
              <div className="fw-hero-stats">
                {pc.heroStats.map((stat, i) => (
                  <div key={i} className="fw-stat">
                    <span className="fw-stat-value">{stat.value}</span>
                    <span className="fw-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right side visual - Dashboard 3D Rotating Sphere */}
          <div className="fw-hero-visual">
            <div className="hero-sphere">
              <div className="hero-sphere-inner" />
              <div className="hero-sphere-badge">
                <div className="hero-sphere-title">
                  {framework.label || framework.code}
                </div>
                <div className="hero-sphere-sub">
                  {framework.sub || framework.type || "Compliance Standard"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW ── */}
      {(pc.overviewTitle || pc.overviewCards?.length > 0) && (
        <section id="fw-overview" className="fw-section">
          <div className="fw-section-header">
            {pc.overviewTitle && <h2>{pc.overviewTitle}</h2>}
            {pc.overviewDescription && <p>{pc.overviewDescription}</p>}
          </div>
          {pc.overviewCards?.length > 0 && (
            <div className="fw-card-grid fw-card-grid-3">
              {pc.overviewCards.map((card, i) => (
                <div key={i} className="fw-card">
                  <div className="fw-card-icon">
                    <DynamicIcon name={card.icon} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── CLAUSES ── */}
      {(pc.clausesTitle || pc.clauseCards?.length > 0) && (
        <section id="fw-clauses" className="fw-section fw-section-alt">
          <div className="fw-section-header">
            {pc.clausesTitle && <h2>{pc.clausesTitle}</h2>}
            {pc.clausesDescription && <p>{pc.clausesDescription}</p>}
          </div>
          {pc.clauseCards?.length > 0 && (
            <div className="fw-card-grid fw-card-grid-3">
              {pc.clauseCards.map((card, i) => (
                <div key={i} className="fw-clause-card">
                  {card.clauseLabel && (
                    <span className="fw-clause-label">{card.clauseLabel}</span>
                  )}
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  {card.bulletPoints?.length > 0 && (
                    <ul>
                      {card.bulletPoints.map((bp, j) => (
                        <li key={j}>{bp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── CONTROLS / DOMAINS ── */}
      {(pc.controlsTitle || pc.domainCards?.length > 0) && (
        <section id="fw-controls" className="fw-section">
          <div className="fw-section-header">
            {pc.controlsTitle && <h2>{pc.controlsTitle}</h2>}
            {pc.controlsDescription && <p>{pc.controlsDescription}</p>}
          </div>
          {pc.domainCards?.length > 0 && (
            <div className="fw-card-grid fw-card-grid-auto">
              {pc.domainCards.map((card, i) => (
                <div key={i} className="fw-domain-card">
                  <h4>{card.domainTitle}</h4>
                  <p>{card.domainDescription}</p>
                  {card.controls?.length > 0 && (
                    <ul>
                      {card.controls.map((c, j) => (
                        <li key={j}>{c}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── BENEFITS ── */}
      {(pc.benefitsTitle || pc.benefitCards?.length > 0) && (
        <section id="fw-benefits" className="fw-section fw-section-alt">
          <div className="fw-section-header">
            {pc.benefitsTitle && <h2>{pc.benefitsTitle}</h2>}
            {pc.benefitsDescription && <p>{pc.benefitsDescription}</p>}
          </div>
          {pc.benefitCards?.length > 0 && (
            <div className="fw-card-grid fw-card-grid-3">
              {pc.benefitCards.map((card, i) => (
                <div key={i} className="fw-benefit-card">
                  <div className="fw-benefit-icon">
                    <DynamicIcon name={card.icon} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── STEPS ── */}
      {(pc.stepsTitle || pc.stepCards?.length > 0) && (
        <section id="fw-steps" className="fw-section">
          <div className="fw-section-header">
            {pc.stepsTitle && <h2>{pc.stepsTitle}</h2>}
            {pc.stepsDescription && <p>{pc.stepsDescription}</p>}
          </div>
          {pc.stepCards?.length > 0 && (
            <div className="fw-card-grid fw-card-grid-3">
              {pc.stepCards.map((card, i) => (
                <div key={i} className="fw-step-card">
                  <div className="fw-step-num">{card.stepNumber}</div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  {card.bulletPoints?.length > 0 && (
                    <ul>
                      {card.bulletPoints.map((bp, j) => (
                        <li key={j}>{bp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── CTA ── */}
      {(pc.ctaTitle || pc.ctaDescription) && (
        <section className="fw-section">
          <div className="fw-cta-box">
            {pc.ctaTitle && <h2>{pc.ctaTitle}</h2>}
            {pc.ctaDescription && <p>{pc.ctaDescription}</p>}
            <div className="fw-cta-btns">
              {!isLoggedIn && (
                <button
                  className="fw-btn-primary"
                  onClick={() => goTo("/demo")}
                >
                  Get a demo
                </button>
              )}
              <button
                className="fw-btn-secondary"
                onClick={() => goTo("/demo")}
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
