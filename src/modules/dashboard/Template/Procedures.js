"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Target,
  TrendingUp,
  CheckCircle2,
  Shield,
  AlertCircle,
  FileText,
  Search,
  Users,
  Settings,
  Mail,
  Wrench,
  BarChart3,
  Building2,
  Lock,
  Smartphone,
  Zap,
  Users2,
  Rocket,
  DollarSign,
  Award,
  UserCircle2,
} from "lucide-react";
import "./Procedures.css";
import { useIsMobile } from "@/hooks/useIsMobile";

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const storedUser = getStoredUser();

const ProceduresPage = () => {
  const isMobile = useIsMobile();

  
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const goTo = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" }); // or "smooth"
  }, []);

  return (
    <div className="procedures-page-root policies-theme">
      {/* HEADER & NAVBAR - EXACT ISO STYLE */}
      <header className="procedures-header">
        <div className="procedures-header-content">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: "10px 0 auto",
            }}
          >
            <Image
              src="/CalVant Logo.svg"
              alt="CalVant"
              width={180}
              height={60}
              style={{
                height: isMobile ? "30px" : "60px",
                width: "auto",
                transform: isMobile ? "scale(3.9)" : "scale(2.9)",
                transformOrigin: "center",
                cursor: "pointer",
                transition: "transform 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(3.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(3.5)";
              }}
              onClick={() => (window.location.href = "/")}
            />
          </div>

          <nav className="procedures-header-nav">
            <ul className="procedures-nav-links">
              <Link
                href="/"
                className="procedures-nav-link procedures-nav-link-btn"
              >
                Home
              </Link>
              <li>
                <button
                  type="button"
                  className="procedures-nav-link procedures-nav-link-btn"
                  onClick={() => handleScrollTo("procedures-overview")}
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="procedures-nav-link procedures-nav-link-btn"
                  onClick={() => handleScrollTo("procedures-categories")}
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="procedures-nav-link procedures-nav-link-btn"
                  onClick={() => handleScrollTo("procedures-workflows")}
                >
                  Workflows
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="procedures-nav-link procedures-nav-link-btn"
                  onClick={() => handleScrollTo("procedures-benefits")}
                >
                  Benefits
                </button>
              </li>
            </ul>

            {/* 🔥 AUTO-DETECT LOGIN STATUS */}
            {(() => {

              const isUserLoggedIn = !!storedUser;

              return isUserLoggedIn && storedUser ? (
                <div className="procedures-user-card">
                  <UserCircle2 size={20} className="procedures-user-icon" />
                  <div className="procedures-user-info">
                    <span className="procedures-user-name">
                      {storedUser.name || "User"}
                    </span>
                    <span className="procedures-user-role">
                      {storedUser.department?.name || "Compliance Officer"}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="procedures-btn procedures-btn-secondary"
                  onClick={() => goTo("/login")}
                >
                  Login
                </button>
              );
            })()}
          </nav>
        </div>
      </header>

      {/* HERO SECTION - MATCHES POLICY LAYOUT */}
      <section className="hero-section procedures-hero">
        <div className="hero-content procedures-hero-inner">
          <div className="procedures-hero-content">
            <div className="hero-badge procedures-hero-badge">
              ISO 27001 & 27701 Ready
            </div>
            <h1 className="hero-title procedures-hero-title">
              Operational <span>Procedures Library</span>
            </h1>
            <p className="hero-subtitle procedures-hero-description">
              45+ battle-tested procedures for risk assessment, control
              implementation, evidence collection, and continuous compliance
              monitoring. Auditor-approved and implementation-ready.
            </p>

            <div className="hero-cta procedures-hero-cta">
              {(() => {

                const isUserLoggedIn = !!storedUser;
                return !isUserLoggedIn ? (
                  <button
                    type="button"
                    className="cta-primary procedures-hero-primary"
                    onClick={() => goTo("/demo")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M8 5v14l11-7z" />
                    </svg>
                    See Procedures in Action
                  </button>
                ) : null;
              })()}
              <button
                type="button"
                className="cta-secondary procedures-hero-secondary"
                onClick={() => handleScrollTo("procedures-overview")}
              >
                Explore Library
              </button>
            </div>

            {/* STATS ROW (TEXT) */}
            <div className="hero-stats">
              <div className="stat-item stat-item-main">
                <span className="stat-main-label">PROCEDURES</span>
                <span className="stat-main-value">87%</span>
                <span className="stat-main-sub">OPERATIONALIZED</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">45+</span>
                <span className="stat-label">PROCEDURES</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">12</span>
                <span className="stat-label">CATEGORIES</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">156</span>
                <span className="stat-label">STEPS</span>
              </div>
            </div>
          </div>

          {/* SMALL CIRCLE GAUGE ON RIGHT */}
          <div className="hero-gauge">
            <div className="procedures-gauge">
              <svg viewBox="0 0 300 300" className="gauge-svg">
                <defs>
                  <linearGradient
                    id="procGaugeBg"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="rgba(15, 23, 42, 0.3)" />
                    <stop offset="100%" stopColor="rgba(79, 70, 229, 0.1)" />
                  </linearGradient>
                  <linearGradient
                    id="procGaugeFill"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <circle
                  cx="150"
                  cy="150"
                  r="130"
                  fill="none"
                  stroke="url(#procGaugeBg)"
                  strokeWidth="20"
                  strokeLinecap="round"
                  className="gauge-bg"
                />
                <circle
                  cx="150"
                  cy="150"
                  r="130"
                  fill="none"
                  stroke="url(#procGaugeFill)"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray="816 816"
                  className="gauge-progress"
                  style={{ strokeDashoffset: 204 }} // 75% complete
                />
              </svg>

              {/* CENTER CONTENT INSIDE CIRCLE */}
              <div className="gauge-center">
                <div className="gauge-center-badge">PROCEDURES</div>
                <div className="gauge-center-value">87%</div>
                <div className="gauge-center-label">Operationalized</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW SECTION */}
      <section
        id="procedures-overview"
        className="procedures-section procedures-grid"
      >
        <div className="procedures-section-header">
          <h2>Why Procedures Matter</h2>
          <p>
            Procedures turn compliance frameworks into repeatable, measurable
            operations. They bridge the gap between high-level controls and
            daily execution, ensuring your ISO 27001/27701 program delivers real
            security outcomes.
          </p>
        </div>

        <div className="procedures-overview-grid grid-container">
          <div
            className="procedures-overview-card policy-card"
            data-category="overview"
          >
            <div className="procedures-card-icon policy-icon">
              <Target size={24} />
            </div>
            <h3 className="policy-title">Repeatable Operations</h3>
            <p className="policy-desc">
              Standardized workflows eliminate guesswork and ensure consistent
              execution across teams, locations, and time periods.
            </p>
            <div className="policy-footer">
              <span className="category-badge overview">REPEATABLE</span>
            </div>
          </div>

          <div
            className="procedures-overview-card policy-card"
            data-category="overview"
          >
            <div className="procedures-card-icon policy-icon">
              <TrendingUp size={24} />
            </div>
            <h3 className="policy-title">Measurable Performance</h3>
            <p className="policy-desc">
              Defined steps with clear success criteria enable objective
              measurement of control effectiveness and team performance.
            </p>
            <div className="policy-footer">
              <span className="category-badge overview">MEASURABLE</span>
            </div>
          </div>

          <div
            className="procedures-overview-card policy-card"
            data-category="overview"
          >
            <div className="procedures-card-icon policy-icon">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="policy-title">Audit-Ready Evidence</h3>
            <p className="policy-desc">
              Documented procedures with timestamps, approvals, and outcomes
              provide auditors with complete evidence chains.
            </p>
            <div className="policy-footer">
              <span className="category-badge overview">AUDIT-READY</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section
        id="procedures-categories"
        className="procedures-section procedures-grid"
      >
        <div className="procedures-section-header">
          <h2>12 Procedure Categories</h2>
          <p>
            Comprehensive coverage across all ISO 27001 clauses and Annex A
            domains, plus privacy-specific procedures for ISO 27701.
          </p>
        </div>

        <div className="procedures-categories-grid grid-container">
          <div
            className="procedures-category-card policy-card"
            data-category="access"
          >
            <div className="procedures-category-icon policy-icon">
              <Shield size={24} />
            </div>
            <h4 className="policy-title">Access Management</h4>
            <p className="policy-desc">
              User provisioning, reviews, privileged access, MFA enforcement
            </p>
            <div className="policy-footer">
              <span className="category-badge access">ACCESS</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="incident"
          >
            <div className="procedures-category-icon policy-icon">
              <AlertCircle size={24} />
            </div>
            <h4 className="policy-title">Incident Response</h4>
            <p className="policy-desc">
              Breach detection, containment, notification, post-mortem analysis
            </p>
            <div className="policy-footer">
              <span className="category-badge incident">INCIDENT</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="risk"
          >
            <div className="procedures-category-icon policy-icon">
              <FileText size={24} />
            </div>
            <h4 className="policy-title">Risk Assessment</h4>
            <p className="policy-desc">
              Threat modeling, vulnerability scanning, risk treatment planning
            </p>
            <div className="policy-footer">
              <span className="category-badge risk">RISK</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="evidence"
          >
            <div className="procedures-category-icon policy-icon">
              <Search size={24} />
            </div>
            <h4 className="policy-title">Evidence Collection</h4>
            <p className="policy-desc">
              Screenshot capture, log collection, control testing automation
            </p>
            <div className="policy-footer">
              <span className="category-badge evidence">EVIDENCE</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="vendor"
          >
            <div className="procedures-category-icon policy-icon">
              <Users size={24} />
            </div>
            <h4 className="policy-title">Third Party Risk</h4>
            <p className="policy-desc">
              Vendor onboarding, assessment, continuous monitoring
            </p>
            <div className="policy-footer">
              <span className="category-badge vendor">VENDOR</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="change"
          >
            <div className="procedures-category-icon policy-icon">
              <Settings size={24} />
            </div>
            <h4 className="policy-title">Change Management</h4>
            <p className="policy-desc">
              Configuration changes, emergency changes, rollback procedures
            </p>
            <div className="policy-footer">
              <span className="category-badge change">CHANGE</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="privacy"
          >
            <div className="procedures-category-icon policy-icon">
              <Mail size={24} />
            </div>
            <h4 className="policy-title">Data Subject Requests</h4>
            <p className="policy-desc">
              DSAR handling, consent withdrawal, data portability
            </p>
            <div className="policy-footer">
              <span className="category-badge privacy">PRIVACY</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="patch"
          >
            <div className="procedures-category-icon policy-icon">
              <Wrench size={24} />
            </div>
            <h4 className="policy-title">Patch Management</h4>
            <p className="policy-desc">
              Vulnerability prioritization, testing, deployment
            </p>
            <div className="policy-footer">
              <span className="category-badge patch">PATCH</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="audit"
          >
            <div className="procedures-category-icon policy-icon">
              <BarChart3 size={24} />
            </div>
            <h4 className="policy-title">Internal Audit</h4>
            <p className="policy-desc">
              Control sampling, interview guides, finding documentation
            </p>
            <div className="policy-footer">
              <span className="category-badge audit">AUDIT</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="hr"
          >
            <div className="procedures-category-icon policy-icon">
              <Building2 size={24} />
            </div>
            <h4 className="policy-title">Onboarding/Offboarding</h4>
            <p className="policy-desc">
              New hire security training, access cleanup, device wipe
            </p>
            <div className="policy-footer">
              <span className="category-badge hr">HR</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="crypto"
          >
            <div className="procedures-category-icon policy-icon">
              <Lock size={24} />
            </div>
            <h4 className="policy-title">Encryption Management</h4>
            <p className="policy-desc">
              Key rotation, certificate management, crypto inventory
            </p>
            <div className="policy-footer">
              <span className="category-badge crypto">CRYPTO</span>
            </div>
          </div>
          <div
            className="procedures-category-card policy-card"
            data-category="endpoint"
          >
            <div className="procedures-category-icon policy-icon">
              <Smartphone size={24} />
            </div>
            <h4 className="policy-title">Endpoint Security</h4>
            <p className="policy-desc">
              AV deployment, disk encryption, remote wipe procedures
            </p>
            <div className="policy-footer">
              <span className="category-badge endpoint">ENDPOINT</span>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOWS SECTION */}
      <section
        id="procedures-workflows"
        className="procedures-section procedures-workflows-section procedures-grid"
      >
        <div className="procedures-section-header">
          <h2>Sample Implementation Workflows</h2>
          <p>
            Each procedure follows CalVant's standardized format: Purpose →
            Scope → Roles → Steps → Evidence → Metrics → Escalation.
          </p>
        </div>

        <div className="procedures-workflow-container grid-container">
          <div
            className="procedures-workflow-card policy-card"
            data-category="access"
          >
            <h4 className="policy-title">Quarterly Access Review Procedure</h4>
            <div className="workflow-steps policy-desc">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Export user accounts</strong> from IAM systems
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Manager validation</strong> of current role
                  requirements
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Automated cleanup</strong> of stale accounts &
                  permissions
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <strong>Evidence package</strong> with audit trail
                </div>
              </div>
            </div>
            <div className="workflow-metrics policy-footer">
              <span className="category-badge access">
                Target: 95% completion rate
              </span>
              <span className="category-badge access">
                Evidence: 100% automated
              </span>
            </div>
          </div>

          <div
            className="procedures-workflow-card policy-card"
            data-category="patch"
          >
            <h4 className="policy-title">Critical Vulnerability Patching</h4>
            <div className="workflow-steps policy-desc">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>CVSS 9.0+ detection</strong> via vuln scanner
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>48hr patch window</strong> assignment
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Regression testing</strong> & rollback plan
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <strong>Verification scan</strong> & documentation
                </div>
              </div>
            </div>
            <div className="workflow-metrics policy-footer">
              <span className="category-badge patch">
                Target: 48hr remediation
              </span>
              <span className="category-badge patch">
                Evidence: Scan before/after
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section
        id="procedures-benefits"
        className="procedures-section procedures-grid"
      >
        <div className="procedures-section-header">
          <h2>Business Impact</h2>
          <p>
            Procedures don't just check compliance boxes—they drive operational
            excellence and competitive advantage.
          </p>
        </div>

        <div className="procedures-benefits-grid grid-container">
          <div
            className="procedures-benefit-card policy-card"
            data-category="audit"
          >
            <div className="procedures-benefit-icon policy-icon">
              <Zap size={24} />
            </div>
            <h3 className="policy-title">60% Faster Audits</h3>
            <p className="policy-desc">
              Pre-defined evidence collection eliminates 80% of auditor
              back-and-forth.
            </p>
          </div>
          <div
            className="procedures-benefit-card policy-card"
            data-category="risk"
          >
            <div className="procedures-benefit-icon policy-icon">
              <TrendingUp size={24} />
            </div>
            <h3 className="policy-title">45% Risk Reduction</h3>
            <p className="policy-desc">
              Standardized execution catches gaps that ad-hoc processes miss.
            </p>
          </div>
          <div
            className="procedures-benefit-card policy-card"
            data-category="team"
          >
            <div className="procedures-benefit-icon policy-icon">
              <Users2 size={24} />
            </div>
            <h3 className="policy-title">Team Alignment</h3>
            <p className="policy-desc">
              Clear roles and escalation paths eliminate finger-pointing during
              incidents.
            </p>
          </div>
          <div
            className="procedures-benefit-card policy-card"
            data-category="scale"
          >
            <div className="procedures-benefit-icon policy-icon">
              <Rocket size={24} />
            </div>
            <h3 className="policy-title">Scale Confidently</h3>
            <p className="policy-desc">
              Documented procedures enable rapid team growth without quality
              degradation.
            </p>
          </div>
          <div
            className="procedures-benefit-card policy-card"
            data-category="roi"
          >
            <div className="procedures-benefit-icon policy-icon">
              <DollarSign size={24} />
            </div>
            <h3 className="policy-title">ROI Multiplier</h3>
            <p className="policy-desc">
              Each procedure serves multiple frameworks (ISO, GDPR)
              simultaneously.
            </p>
          </div>
          <div
            className="procedures-benefit-card policy-card"
            data-category="cert"
          >
            <div className="procedures-benefit-icon policy-icon">
              <Award size={24} />
            </div>
            <h3 className="policy-title">Certification Success</h3>
            <p className="policy-desc">
              98% first-time pass rate for customers using our procedures
              library.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="procedures-section cta-section">
        <div className="procedures-cta-section cta-content">
          <h2>Ready to Operationalize Compliance?</h2>
          <p>
            Import these procedures into CalVant and start collecting evidence
            automatically. From implementation to audit-ready in weeks, not
            months.
          </p>
          <div className="procedures-cta-buttons cta-buttons">
            {(() => {
              const isUserLoggedIn = !!storedUser;
              return !isUserLoggedIn ? (
                <button
                  type="button"
                  className="procedures-cta-btn procedures-cta-btn-primary cta-primary"
                  onClick={() => goTo("/demo")}
                >
                  Start with Procedures
                </button>
              ) : null;
            })()}
            <button
              type="button"
              className="procedures-cta-btn procedures-cta-btn-secondary cta-secondary"
              onClick={() => goTo("/demo")}
            >
              Talk to Expert
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="procedures-footer dashboard-footer">
        <div className="procedures-footer-content dashboard-footer-content">
          <div className="procedures-footer-section dashboard-footer-section">
            <h4>CalVant</h4>
            <p>
              Enterprise platform for operationalizing ISO 27001, ISO 27701, and
              other compliance frameworks with automated evidence collection.
            </p>
          </div>
          <div className="procedures-footer-section dashboard-footer-section">
            <h4>Frameworks</h4>
            <ul>
              <li>
                <Link href="/iso-27001">ISO 27001</Link>
              </li>
              <li>
                <Link href="/iso-27701">ISO 27701</Link>
              </li>
              <li>
                <Link href="/policies">Policy Templates</Link>
              </li>
              <li>
                <Link href="/procedures">Procedures</Link>
              </li>
            </ul>
          </div>
          <div className="procedures-footer-section dashboard-footer-section">
            <h4>Product</h4>
            <ul>
              <li>
              </li>
              <li>
                <Link href="/risk-assessment">Risk Assessment</Link>
              </li>
              <li>
                <Link href="/documentation">Documentation</Link>
              </li>
            </ul>
          </div>
          <div className="procedures-footer-section dashboard-footer-section">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/careers">Careers</Link>
              </li>

            </ul>
          </div>
        </div>
        <div className="procedures-footer-bottom dashboard-footer-bottom">
          © {new Date().getFullYear()} CalVant · Procedures Library · Made in
          India
        </div>
      </footer>
    </div>
  );
};

export default ProceduresPage;


