"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserCircle2,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  Building2,
  Shield,
  Scale,
  TrendingDown,
  Recycle,
  Handshake,
} from "lucide-react";
import "./ISO_27001.css";
import "./Procedures.css";
import { useIsMobile } from "@/hooks/useIsMobile";
// Safe sessionStorage helper — window doesn't exist during SSR
const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const ISO_27001 = () => {
  const isMobile = useIsMobile();
  const [storedUser, setStoredUser] = useState(null); // ← not read at render time
  useEffect(() => {
    setStoredUser(getStoredUser()); // ← only runs in browser
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);
  const isUserLoggedIn = !!storedUser;
  
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const goTo = (path) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  };


  return (
    <div className="iso-page-root procedures-theme">
      {/* HEADER
          - className: procedures-header → iso-header  (matches your CSS)
          - <img> kept as plain img (SVGs don't need next/image optimisation)
          - logo height 210px → 44px to match production
          - <a href="/"> → <Link href="/"> wrapped in <li>
      */}

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
              onClick={() => { if (typeof window !== "undefined") window.location.href = "/"; }}
            />
          </div>

          <nav className="iso-header-nav">
            <ul className="iso-nav-links">
              <a href="/" className="iso-nav-link">
                Home
              </a>

              <li>
                <button
                  type="button"
                  className="iso-nav-link iso-nav-link-btn"
                  onClick={() => handleScrollTo("iso-overview")}
                >
                  Overview
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="iso-nav-link iso-nav-link-btn"
                  onClick={() => handleScrollTo("iso-clauses")}
                >
                  Clauses
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="iso-nav-link iso-nav-link-btn"
                  onClick={() => handleScrollTo("iso-annex-a")}
                >
                  Annex A
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="iso-nav-link iso-nav-link-btn"
                  onClick={() => handleScrollTo("iso-benefits")}
                >
                  Benefits
                </button>
              </li>
            </ul>

            {/* AUTO-DETECT LOGIN STATUS – UNCHANGED */}
            {(() => {
              const isUserLoggedIn = !!storedUser;

              return isUserLoggedIn && storedUser ? (
                <div className="iso-user-card">
                  <UserCircle2 size={20} className="iso-user-icon" />
                  <div className="iso-user-info">
                    <span className="iso-user-name">
                      {storedUser.name || "User"}
                    </span>
                    <span className="iso-user-role">
                      {storedUser.department?.name || "Consultant"}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="iso-btn iso-btn-secondary"
                  onClick={() => goTo("/login")}
                >
                  Login
                </button>
              );
            })()}
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="iso-hero">
        <div className="iso-hero-inner">
          <div className="iso-hero-content">
            <div className="iso-hero-badge">
              ISO 27001 · Information Security Management System
            </div>

            <h1 className="iso-hero-title">
              Turn ISO 27001 into a living{" "}
              <span>information security program</span>.
            </h1>

            <p className="iso-hero-description">
              CalVant helps you implement and maintain an ISO 27001-aligned ISMS
              with mapped controls, continuous evidence collection, and clear
              accountability across your organization.
            </p>

            <div className="iso-hero-cta">
              {!isUserLoggedIn && (
                <button
                  type="button"
                  className="iso-hero-primary"
                  onClick={() => goTo("/demo")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8 5v14l11-7z" />
                  </svg>
                  Get a live ISO 27001 demo
                </button>
              )}
              <button
                type="button"
                className="iso-hero-secondary"
                onClick={() => handleScrollTo("iso-overview")}
              >
                View framework overview
              </button>
            </div>

            <div className="iso-hero-stats">
              <div className="iso-stat-item iso-stat-item-main">
                <span className="iso-stat-main-label">ISO 27001</span>
                <span className="iso-stat-main-value">75%</span>
                <span className="iso-stat-main-sub">COMPLIANCE</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">93</span>
                <span className="iso-stat-label">Controls</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">4</span>
                <span className="iso-stat-label">Themes</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">10</span>
                <span className="iso-stat-label">Clauses</span>
              </div>
            </div>
          </div>

          {/* 3D ISO ORBIT ILLUSTRATION */}
          <div className="iso-hero-visual">
            <div className="iso-orbit-container">
              <div className="iso-orbit-background">
                <div className="iso-orbit-ring iso-orbit-ring-1" />
                <div className="iso-orbit-ring iso-orbit-ring-2" />
                <div className="iso-orbit-ring iso-orbit-ring-3" />
                <div className="iso-orbit-particle iso-orbit-p1" />
                <div className="iso-orbit-particle iso-orbit-p2" />
                <div className="iso-orbit-particle iso-orbit-p3" />
              </div>

              <div className="iso-orbit-card iso-orbit-card-main">
                <div className="iso-orbit-main-title">Compliance check</div>
                <div className="iso-orbit-main-gauge">
                  <div className="iso-orbit-main-circle">
                    <span>98%</span>
                  </div>
                  <p>All systems synced · 93 controls monitored</p>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-readiness">
                <div className="iso-orbit-card-label">Readiness check</div>
                <div className="iso-orbit-readiness-meter">
                  <div className="iso-orbit-readiness-arc" />
                  <div className="iso-orbit-readiness-needle" />
                  <div className="iso-orbit-readiness-value">99.2%</div>
                  <div className="iso-orbit-readiness-sub">ISO readiness</div>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-badge">
                <div className="iso-orbit-badge">
                  <span className="iso-orbit-badge-top">ISO</span>
                  <span className="iso-orbit-badge-bottom">27001</span>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-controls">
                <div className="iso-orbit-controls-title">Controls</div>
                <div className="iso-orbit-controls-bars">
                  <div className="iso-orbit-bar iso-orbit-bar-ok">
                    <span className="iso-orbit-bar-label">26 Passing</span>
                  </div>
                  <div className="iso-orbit-bar iso-orbit-bar-warn">
                    <span className="iso-orbit-bar-label">3 Critical</span>
                  </div>
                  <div className="iso-orbit-bar iso-orbit-bar-fail">
                    <span className="iso-orbit-bar-label">1 Failing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section id="iso-overview" className="iso-section">
        <div className="iso-section-header">
          <h2>What is ISO 27001?</h2>
          <p>
            ISO/IEC 27001 is the leading international standard for
            establishing, implementing, maintaining and continually improving an
            Information Security Management System (ISMS).
          </p>
        </div>

        <div className="iso-overview-grid">
          <div className="iso-overview-card">
            <div className="iso-card-icon">
              <ShieldCheck size={32} />
            </div>
            <h3>Structured ISMS framework</h3>
            <p>
              Define scope, context, and objectives. Establish policies,
              procedures and controls that are proportionate to your
              organization's risk profile.
            </p>
          </div>
          <div className="iso-overview-card">
            <div className="iso-card-icon">
              <BarChart3 size={32} />
            </div>
            <h3>Risk‑based decision‑making</h3>
            <p>
              Identify threats, vulnerabilities and impacts; evaluate risks; and
              select treatment options that balance security with business
              goals.
            </p>
          </div>
          <div className="iso-overview-card">
            <div className="iso-card-icon">
              <RefreshCw size={32} />
            </div>
            <h3>Continuous improvement loop</h3>
            <p>
              Use audits, monitoring, incidents and metrics to drive corrective
              actions and keep controls effective as your environment changes.
            </p>
          </div>
        </div>
      </section>

      {/* CLAUSES */}
      <section id="iso-clauses" className="iso-section">
        <div className="iso-section-header">
          <h2>Core ISO 27001 clauses</h2>
          <p>
            Clauses 4–10 form the backbone of your ISMS. They define how
            security is embedded in your organization, not just which controls
            you implement.
          </p>
        </div>

        <div className="iso-clauses-container">
          <div className="iso-clause-grid">
            <div className="iso-clause-card">
              <span className="iso-clause-number">Clause 4</span>
              <h3>Context of the organization</h3>
              <p>
                Understand internal and external issues, interested parties, and
                the scope of your ISMS.
              </p>
              <ul>
                <li>Define ISMS boundaries and applicability.</li>
                <li>Align security objectives with business goals.</li>
                <li>Identify regulatory, contractual and stakeholder needs.</li>
              </ul>
            </div>
            <div className="iso-clause-card">
              <span className="iso-clause-number">Clause 5</span>
              <h3>Leadership and commitment</h3>
              <p>
                Ensure top management is visibly accountable for information
                security and the ISMS.
              </p>
              <ul>
                <li>Assign roles, responsibilities and authorities.</li>
                <li>Integrate security into organizational processes.</li>
                <li>Provide resources and remove blockers.</li>
              </ul>
            </div>
            <div className="iso-clause-card">
              <span className="iso-clause-number">Clause 6</span>
              <h3>Planning and risk management</h3>
              <p>
                Address risks and opportunities for the ISMS and define
                measurable information security objectives.
              </p>
              <ul>
                <li>Maintain a documented risk assessment methodology.</li>
                <li>Develop risk treatment plans and SoA.</li>
                <li>Plan how objectives will be achieved and measured.</li>
              </ul>
            </div>
            <div className="iso-clause-card">
              <span className="iso-clause-number">Clause 7</span>
              <h3>Support</h3>
              <p>
                Provide the resources, competence, awareness, communication and
                documented information your ISMS needs.
              </p>
              <ul>
                <li>Define ISMS roles, skills and training needs.</li>
                <li>Run security awareness and communication programs.</li>
                <li>Control creation, updates and retention of documents.</li>
              </ul>
            </div>
            <div className="iso-clause-card">
              <span className="iso-clause-number">Clause 8</span>
              <h3>Operational planning and control</h3>
              <p>
                Plan, implement and control the processes needed to meet
                information security requirements.
              </p>
              <ul>
                <li>Operate risk treatment plans and Annex A controls.</li>
                <li>Manage outsourced processes and suppliers.</li>
                <li>Document operational procedures where needed.</li>
              </ul>
            </div>
            <div className="iso-clause-card">
              <span className="iso-clause-number">Clauses 9 & 10</span>
              <h3>Performance evaluation & improvement</h3>
              <p>
                Measure ISMS performance, run internal audits and management
                reviews, and drive continual improvement.
              </p>
              <ul>
                <li>Monitor KPIs, incidents and non‑conformities.</li>
                <li>Conduct regular management reviews.</li>
                <li>Implement corrective actions and track outcomes.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ANNEX A */}
      <section id="iso-annex-a" className="iso-section">
        <div className="iso-section-header">
          <h2>Annex A controls – modernized</h2>
          <p>
            The 2022 revision of ISO 27001 organizes information security
            controls into four high-level themes.
          </p>
        </div>

        <div className="iso-annex-box-wrapper">
          <div className="iso-annex-intro">
            <h3>From 14 domains to 4 themes</h3>
            <p>
              ISO/IEC 27001:2022 consolidates the original 114 controls into 93
              updated controls grouped under organizational, people, physical
              and technological themes.
            </p>
          </div>
        </div>

        <div className="iso-domains-grid">
          <div className="iso-domain-card">
            <h4 className="iso-domain-title">Organizational controls</h4>
            <p className="iso-domain-desc">
              Policies, governance and processes that define how information
              security is managed across the organization.
            </p>
            <ul className="iso-domain-controls">
              <li>Information security policies and roles</li>
              <li>Supplier relationships and third‑party risk</li>
              <li>Risk assessment and treatment methodology</li>
              <li>Project and change management requirements</li>
            </ul>
          </div>
          <div className="iso-domain-card">
            <h4 className="iso-domain-title">People controls</h4>
            <p className="iso-domain-desc">
              Controls that ensure employees and contractors understand and
              fulfill their security responsibilities.
            </p>
            <ul className="iso-domain-controls">
              <li>Background screening and onboarding</li>
              <li>Security awareness, training and guidance</li>
              <li>Disciplinary processes and off‑boarding</li>
              <li>Segregation of duties and access reviews</li>
            </ul>
          </div>
          <div className="iso-domain-card">
            <h4 className="iso-domain-title">Physical controls</h4>
            <p className="iso-domain-desc">
              Measures that protect facilities, equipment and physical media
              from unauthorized access or damage.
            </p>
            <ul className="iso-domain-controls">
              <li>Secure areas and access management</li>
              <li>Equipment placement and protection</li>
              <li>Clear desk and clear screen practices</li>
              <li>Secure disposal of media and assets</li>
            </ul>
          </div>
          <div className="iso-domain-card">
            <h4 className="iso-domain-title">Technological controls</h4>
            <p className="iso-domain-desc">
              Controls that govern how systems are designed, configured,
              monitored and protected.
            </p>
            <ul className="iso-domain-controls">
              <li>Identity and access management</li>
              <li>Network, application and endpoint security</li>
              <li>Cryptography and key management</li>
              <li>Logging, monitoring and backup strategies</li>
            </ul>
          </div>
          <div className="iso-domain-card">
            <h4 className="iso-domain-title">New & updated controls</h4>
            <p className="iso-domain-desc">
              The 2022 update introduces several new controls that address
              modern technology and threat trends.
            </p>
            <ul className="iso-domain-controls">
              <li>Threat intelligence and secure coding practices</li>
              <li>Data masking and data leakage prevention</li>
              <li>Configuration management and monitoring</li>
              <li>Cloud services and information deletion</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="iso-benefits" className="iso-section">
        <div className="iso-section-header">
          <h2>Business impact of ISO 27001</h2>
          <p>
            Beyond certification, a well‑run ISMS helps you reduce risk, build
            customer trust and enable faster growth.
          </p>
        </div>

        <div className="iso-benefits-grid">
          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <Building2 size={32} />
            </div>
            <h3>Win enterprise deals</h3>
            <p>
              Many large customers require ISO 27001 certification as a minimum
              bar for onboarding vendors that handle sensitive data.
            </p>
          </div>
          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <Shield size={32} />
            </div>
            <h3>Demonstrate robust security</h3>
            <p>
              A certified ISMS proves that your security program is systematic,
              repeatable and externally assessed—not just based on promises.
            </p>
          </div>
          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <Scale size={32} />
            </div>
            <h3>Support regulatory compliance</h3>
            <p>
              ISO 27001 controls align with many regulatory expectations and can
              support GDPR, HIPAA and other compliance journeys.
            </p>
          </div>
          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <TrendingDown size={32} />
            </div>
            <h3>Reduce incident impact</h3>
            <p>
              Strong risk assessment, monitoring and incident response help you
              detect and contain security events faster.
            </p>
          </div>
          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <Recycle size={32} />
            </div>
            <h3>Keep security current</h3>
            <p>
              Recurring internal audits, reviews and improvements prevent your
              security posture from becoming outdated or ad‑hoc.
            </p>
          </div>
          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <Handshake size={32} />
            </div>
            <h3>Align stakeholders</h3>
            <p>
              A documented ISMS clarifies responsibilities for leadership, IT,
              DevOps, HR, legal and vendors, reducing gaps and overlaps.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="iso-section">
        <div className="iso-cta-section">
          <h2>Ready to make ISO 27001 your growth advantage?</h2>
          <p>
            See how CalVant helps you build a modern ISMS, stay continuously
            compliant and close security‑sensitive deals faster.
          </p>
          <div className="iso-cta-buttons">
            {!isUserLoggedIn && (
              <button
                type="button"
                className="iso-cta-btn iso-cta-btn-primary"
                onClick={() => goTo("/demo")}
              >
                Get a demo
              </button>
            )}
            <button
              type="button"
              className="iso-cta-btn iso-cta-btn-secondary"
              onClick={() => goTo("/demo")}
            >
              Talk to an expert
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="iso-footer">
        <div className="iso-footer-content">
          <div className="iso-footer-section">
            <h4>CalVant</h4>
            <p>
              A modern compliance and security operations platform designed to
              help teams operationalize ISO 27001 and adjacent frameworks.
            </p>
          </div>
          <div className="iso-footer-section">
            <h4>Frameworks</h4>
            <ul>
              <li>
                <Link href="/iso-27001">ISO 27001</Link>
              </li>
              <li>
                <Link href="/iso-27701">ISO 27701</Link>
              </li>
            </ul>
          </div>
          <div className="iso-footer-section">
            <h4>Product</h4>
            <ul>
              <li><Link href="/blog">Blog</Link></li>
              <li>
                <Link href="/policies">Policy templates</Link>
              </li>
            </ul>
          </div>
          <div className="iso-footer-section">
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

        <div className="iso-footer-bottom">
          © {new Date().getFullYear()} CalVant · ISO 27001 · Made in India
        </div>
      </footer>
    </div>
  );
};

export default ISO_27001;
