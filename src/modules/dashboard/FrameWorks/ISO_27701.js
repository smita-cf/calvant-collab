"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import "./ISO_27001.css";
import "./ISO_27701.css";
import {
  UserCircle2,
  Puzzle,
  User,
  Scale,
  Shield,
  Globe,
  Handshake,
  FileText,
  Settings,
  Rocket,
} from "lucide-react";
import "./Procedures.css";
import { useIsMobile } from "@/hooks/useIsMobile";
// Move this OUTSIDE the component (top of file, after imports)
const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const ISO_27701 = () => {
  const isMobile = useIsMobile();
  const [storedUser, setStoredUser] = useState(null); // ← state, not render-time read

  useEffect(() => {
    setStoredUser(getStoredUser()); // ← browser only
  }, []);

  const isUserLoggedIn = !!storedUser;

  // DELETE these two lines that were previously in the component body:
  // const storedUser = getStoredUser();
  // const isUserLoggedIn = !!storedUser;

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const goTo = (path) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="iso-page-root iso27701-page-root">
      {/* HEADER & NAVBAR */}
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
      <section className="iso-hero iso27701-hero">
        <div className="iso-hero-inner">
          <div className="iso-hero-content">
            <div className="iso-hero-badge">
              ISO 27701 · Privacy Information Management System
            </div>
            <h1 className="iso-hero-title">
              Extend your ISMS into a{" "}
              <span>Privacy Information Management System</span>.
            </h1>
            <p className="iso-hero-description">
              CalVant combines ISO 27001 and ISO 27701 so you can manage
              security and privacy together—covering personal data, data
              subjects, and regulators in one integrated program.
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
                  Get an ISO 27701 demo
                </button>
              )}
              <button
                type="button"
                className="iso-hero-secondary"
                onClick={() => handleScrollTo("pims-overview")}
              >
                See how PIMS works
              </button>
            </div>

            <div className="iso-hero-stats">
              <div className="iso-stat-item iso-stat-item-main">
                <span className="iso-stat-main-label">ISO 27701</span>
                <span className="iso-stat-main-value">72%</span>
                <span className="iso-stat-main-sub">PRIVACY READINESS</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">40+</span>
                <span className="iso-stat-label">PII controls</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">2</span>
                <span className="iso-stat-label">Key roles</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">1</span>
                <span className="iso-stat-label">Unified PIMS</span>
              </div>
            </div>
          </div>

          <div className="iso-hero-visual">
            <div className="iso-orbit-container iso27701-orbit">
              <div className="iso-orbit-background">
                <div className="iso-orbit-ring iso-orbit-ring-1" />
                <div className="iso-orbit-ring iso-orbit-ring-2" />
                <div className="iso-orbit-ring iso-orbit-ring-3" />
                <div className="iso-orbit-particle iso-orbit-p1" />
                <div className="iso-orbit-particle iso-orbit-p2" />
                <div className="iso-orbit-particle iso-orbit-p3" />
              </div>

              <div className="iso-orbit-card iso-orbit-card-main">
                <div className="iso-orbit-main-title">Privacy posture</div>
                <div className="iso-orbit-main-gauge">
                  <div className="iso-orbit-main-circle">
                    <span>92%</span>
                  </div>
                  <p>
                    PII processing mapped across systems, vendors and regions
                    with live status.
                  </p>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-readiness">
                <div className="iso-orbit-card-label">PIMS readiness</div>
                <div className="iso-orbit-readiness-meter">
                  <div className="iso-orbit-readiness-arc" />
                  <div className="iso-orbit-readiness-needle" />
                </div>
                <div className="iso-orbit-readiness-value">99.2</div>
                <div className="iso-orbit-readiness-sub">
                  ISO 27701 alignment
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-badge">
                <div className="iso-orbit-badge">
                  <span className="iso-orbit-badge-top">ISO</span>
                  <span className="iso-orbit-badge-bottom">27701</span>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-controls">
                <div className="iso-orbit-controls-title">Privacy controls</div>
                <div className="iso-orbit-controls-bars">
                  <div className="iso-orbit-bar iso-orbit-bar-ok">
                    <span className="iso-orbit-bar-label">32 Implemented</span>
                  </div>
                  <div className="iso-orbit-bar iso-orbit-bar-warn">
                    <span className="iso-orbit-bar-label">6 In progress</span>
                  </div>
                  <div className="iso-orbit-bar iso-orbit-bar-fail">
                    <span className="iso-orbit-bar-label">2 Gaps to close</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section id="pims-overview" className="iso-section">
        <div className="iso-section-header">
          <h2>What is ISO 27701?</h2>
          <p>
            ISO/IEC 27701 extends ISO 27001 and ISO 27002 with additional
            requirements and guidance for a Privacy Information Management
            System (PIMS) focused on processing personally identifiable
            information (PII).
          </p>
        </div>

        <div className="iso-overview-grid">
          <div className="iso-overview-card">
            <div className="iso-card-icon">
              <Puzzle size={24} />
            </div>
            <h3>Extension to ISO 27001</h3>
            <p>
              ISO 27701 is not a standalone standard; it builds on your existing
              ISMS to add privacy‑specific controls, documentation and roles for
              controllers and processors.
            </p>
          </div>

          <div className="iso-overview-card">
            <div className="iso-card-icon">
              <User size={24} />
            </div>
            <h3>Focus on personal data</h3>
            <p>
              It defines how organizations identify PII, data subjects and
              processing purposes, then manage privacy risks across the data
              lifecycle from collection to deletion.
            </p>
          </div>

          <div className="iso-overview-card">
            <div className="iso-card-icon">
              <Scale size={24} />
            </div>
            <h3>Supports global privacy laws</h3>
            <p>
              A robust PIMS helps demonstrate accountability against privacy
              regulations such as GDPR and similar laws, without being tied to a
              single jurisdiction.
            </p>
          </div>
        </div>
      </section>

      {/* PIMS CLAUSES / ROLES */}
      <section id="pims-clauses" className="iso-section">
        <div className="iso-section-header">
          <h2>PIMS‑specific requirements</h2>
          <p>
            ISO 27701 tailors the ISMS to privacy by adding requirements around
            PII processing context, roles, and risk management for controllers
            and processors.
          </p>
        </div>

        <div className="iso-clauses-container">
          <div className="iso-clause-grid">
            <div className="iso-clause-card">
              <span className="iso-clause-number">PIMS context</span>
              <h3>Define your PII environment</h3>
              <p>
                Understand which systems, locations, partners and data subjects
                are in scope for your PIMS on top of the ISMS scope.
              </p>
              <ul>
                <li>
                  Identify PII types, data subjects and processing purposes.
                </li>
                <li>
                  Map PII flows between controllers, processors and
                  sub‑processors.
                </li>
                <li>
                  Align PIMS boundaries with your legal and contractual
                  obligations.
                </li>
              </ul>
            </div>

            <div className="iso-clause-card">
              <span className="iso-clause-number">
                Roles & responsibilities
              </span>
              <h3>Controller and processor focus</h3>
              <p>
                Clarify whether you act as a PII controller, processor, or both
                in different processing activities.
              </p>
              <ul>
                <li>
                  Assign accountability for privacy within leadership and
                  operational teams.
                </li>
                <li>
                  Define responsibilities for PII controllers versus processors
                  in contracts.
                </li>
                <li>
                  Ensure sub‑processors operate under equivalent privacy
                  requirements.
                </li>
              </ul>
            </div>

            <div className="iso-clause-card">
              <span className="iso-clause-number">Privacy risk</span>
              <h3>Risk to individuals, not only assets</h3>
              <p>
                Extend risk assessments to consider impacts on data subjects,
                not just the organization, when PII is misused or disclosed.
              </p>
              <ul>
                <li>
                  Evaluate likelihood and harm from loss of confidentiality,
                  integrity or availability of PII.
                </li>
                <li>
                  Prioritize controls that mitigate risks to individuals' rights
                  and freedoms.
                </li>
                <li>
                  Link privacy risks to DPIAs or similar assessments where
                  required.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY CONTROLS THEMES */}
      <section id="pims-controls" className="iso-section">
        <div className="iso-section-header">
          <h2>Key ISO 27701 privacy controls</h2>
          <p>
            ISO 27701 adds controller‑ and processor‑oriented controls that sit
            alongside your Annex A controls, turning your ISMS into a combined
            security and privacy management system.
          </p>
        </div>

        <div className="iso-domains-grid">
          <div className="iso-domain-card">
            <h4 className="iso-domain-title">PII governance</h4>
            <p className="iso-domain-desc">
              Policies, roles and documentation that describe how personal data
              is handled and why it is processed.
            </p>
            <ul className="iso-domain-controls">
              <li>Document lawful bases and purposes for processing.</li>
              <li>Maintain records of processing activities (RoPA).</li>
              <li>Define retention, archival and deletion rules for PII.</li>
              <li>Set up privacy impact assessment criteria and process.</li>
            </ul>
          </div>

          <div className="iso-domain-card">
            <h4 className="iso-domain-title">Data subject rights</h4>
            <p className="iso-domain-desc">
              Operational procedures to respond to individuals exercising their
              privacy rights.
            </p>
            <ul className="iso-domain-controls">
              <li>
                Handle access, rectification, deletion and portability requests
                within defined timelines.
              </li>
              <li>Verify identity and record decisions for each request.</li>
              <li>
                Communicate outcomes and reasons clearly to data subjects.
              </li>
            </ul>
          </div>

          <div className="iso-domain-card">
            <h4 className="iso-domain-title">Privacy by design & default</h4>
            <p className="iso-domain-desc">
              Integrate privacy considerations into products, services and
              changes from the start.
            </p>
            <ul className="iso-domain-controls">
              <li>
                Include privacy criteria in design, development and change
                management.
              </li>
              <li>
                Minimize PII collected, used and retained to what is necessary.
              </li>
              <li>
                Enable configuration choices that respect user expectations by
                default.
              </li>
            </ul>
          </div>

          <div className="iso-domain-card">
            <h4 className="iso-domain-title">Processor management</h4>
            <p className="iso-domain-desc">
              Controls for organizations processing PII on behalf of
              controllers.
            </p>
            <ul className="iso-domain-controls">
              <li>Ensure contracts clearly define processing instructions.</li>
              <li>Support audits and information requests from controllers.</li>
              <li>
                Notify controllers promptly about breaches or incidents
                involving PII.
              </li>
            </ul>
          </div>

          <div className="iso-domain-card">
            <h4 className="iso-domain-title">Incident & breach response</h4>
            <p className="iso-domain-desc">
              Privacy‑focused detection and response processes aligned with
              legal reporting duties.
            </p>
            <ul className="iso-domain-controls">
              <li>
                Classify incidents that involve PII and assess risk to
                individuals.
              </li>
              <li>
                Coordinate notifications to authorities, customers and data
                subjects when required.
              </li>
              <li>
                Feed lessons learned back into your PIMS and security controls.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="pims-benefits" className="iso-section">
        <div className="iso-section-header">
          <h2>Why add ISO 27701 to ISO 27001?</h2>
          <p>
            Together, ISO 27001 and ISO 27701 create a unified system for
            managing security and privacy risks using shared governance,
            controls and evidence.
          </p>
        </div>

        <div className="iso-benefits-grid">
          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <Shield size={24} />
            </div>
            <h3>Security + privacy assurance</h3>
            <p>
              Show customers and regulators that you protect both information
              assets and personal data under a single, certified management
              system.
            </p>
          </div>

          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <Globe size={24} />
            </div>
            <h3>Support multiple laws at once</h3>
            <p>
              ISO 27701 provides a neutral framework that can be mapped to GDPR
              and other privacy laws, avoiding one‑off, region‑specific privacy
              projects.
            </p>
          </div>

          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <Handshake size={24} />
            </div>
            <h3>Clarify controller–processor duties</h3>
            <p>
              Reduce ambiguity in contracts and relationships by aligning on
              clear roles, responsibilities and reporting obligations for PII
              processing.
            </p>
          </div>

          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <FileText size={24} />
            </div>
            <h3>Stronger evidence for audits</h3>
            <p>
              Use combined ISMS/PIMS documentation, risk registers and activity
              logs as proof of accountability during privacy or security
              reviews.
            </p>
          </div>

          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <Settings size={24} />
            </div>
            <h3>Reuse controls and tooling</h3>
            <p>
              Many technical and organizational controls serve both ISO 27001
              and 27701, so you can reuse monitoring, training, and vendor
              management workflows.
            </p>
          </div>

          <div className="iso-benefit-card">
            <div className="iso-benefit-icon">
              <Rocket size={24} />
            </div>
            <h3>Speed up enterprise privacy reviews</h3>
            <p>
              A certified PIMS reduces the time security and legal teams spend
              on privacy questionnaires and due‑diligence exercises.
            </p>
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION JOURNEY */}
      <section className="iso-section">
        <div className="iso-section-header">
          <h2>Your ISO 27701 rollout plan</h2>
          <p>
            CalVant layers PIMS capabilities on top of your existing ISO 27001
            program so you can move from security‑only to security‑and‑privacy
            without starting from scratch.
          </p>
        </div>

        <div className="iso-implementation-container">
          <div className="iso-steps-grid">
            <div className="iso-step-card">
              <div className="iso-step-number">1</div>
              <h3>Assess your ISMS baseline</h3>
              <p>
                Confirm ISO 27001 scope, risks and Annex A controls, then
                identify where privacy comes into play.
              </p>
              <ul>
                <li>Review existing assets and processing activities.</li>
                <li>Identify systems that store or process PII.</li>
                <li>Highlight overlaps with security controls and policies.</li>
              </ul>
            </div>

            <div className="iso-step-card">
              <div className="iso-step-number">2</div>
              <h3>Define PIMS scope and roles</h3>
              <p>
                Determine which products, regions and business units fall under
                your PIMS and who acts as controller or processor.
              </p>
              <ul>
                <li>Document PII categories and data subjects.</li>
                <li>Assign privacy owners in legal, security and product.</li>
                <li>
                  Align processor and sub‑processor responsibilities in
                  contracts.
                </li>
              </ul>
            </div>

            <div className="iso-step-card">
              <div className="iso-step-number">3</div>
              <h3>Map PII and privacy risks</h3>
              <p>
                Extend risk assessments to consider harms to individuals and
                regulators when PII is mishandled.
              </p>
              <ul>
                <li>Run DPIAs for high‑risk processing where appropriate.</li>
                <li>Score risks using privacy‑specific impact criteria.</li>
                <li>Link controls and safeguards to each identified risk.</li>
              </ul>
            </div>

            <div className="iso-step-card">
              <div className="iso-step-number">4</div>
              <h3>Implement ISO 27701 controls</h3>
              <p>
                Roll out controller and processor controls across governance,
                data subject rights, and supplier management.
              </p>
              <ul>
                <li>Update policies, notices and records of processing.</li>
                <li>Embed DSAR, consent and retention workflows in tools.</li>
                <li>
                  Enforce privacy requirements in vendor onboarding and reviews.
                </li>
              </ul>
            </div>

            <div className="iso-step-card">
              <div className="iso-step-number">5</div>
              <h3>Operate, monitor and improve PIMS</h3>
              <p>
                Measure how well privacy processes are working and integrate
                them with existing ISMS monitoring and reviews.
              </p>
              <ul>
                <li>Track DSARs, breaches and PII‑related incidents.</li>
                <li>
                  Include privacy metrics in management reviews and board
                  updates.
                </li>
                <li>Continuously refine controls as laws and risks evolve.</li>
              </ul>
            </div>

            <div className="iso-step-card">
              <div className="iso-step-number">6</div>
              <h3>Prepare for integrated audits</h3>
              <p>
                Work with certification bodies that can assess ISO 27001 and ISO
                27701 together for a combined audit experience.
              </p>
              <ul>
                <li>Package shared ISMS/PIMS evidence in one place.</li>
                <li>
                  Address non‑conformities and observations across both
                  standards.
                </li>
                <li>Leverage certification to accelerate customer trust.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="iso-section">
        <div className="iso-cta-section">
          <h2>See ISO 27001 and 27701 running together</h2>
          <p>
            Connect your stack to CalVant and manage security and privacy
            evidence from a single cockpit—ready for auditors, customers and
            regulators.
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
              One platform to operationalize ISO 27001 and ISO 27701 together,
              unifying information security and privacy compliance.
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
              {/* <li><Link href="/soc-2">SOC 2</Link></li> */}
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
          © {new Date().getFullYear()} CalVant · ISO 27701 · Made in India
        </div>
      </footer>
    </div>
  );
};

export default ISO_27701;
