"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  UserCircle2,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  Building2,
  Shield,
  Scale,
  Lock,
  Eye,
  Server,
  ClipboardCheck,
  Handshake,
  CheckCircle,
  FileSearch,
} from "lucide-react";
import "./SOC2.css";
import { useIsMobile } from "@/hooks/useIsMobile";
import "./Procedures.css"

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const storedUser = getStoredUser();
const SOC2 = () => {
  const isMobile = useIsMobile();

  
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const goTo = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="iso-page-root soc2-theme">
      {/* HEADER */}
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

          <nav className="iso-header-nav">
            <ul className="iso-nav-links">
              <Link href="/" className="iso-nav-link">Home</Link>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("soc2-overview")}>Overview</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("soc2-tsc")}>Trust Criteria</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("soc2-types")}>Type I vs II</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("soc2-benefits")}>Benefits</button></li>
            </ul>

            {(() => {
              return storedUser ? (
                <div className="iso-user-card">
                  <UserCircle2 size={20} className="iso-user-icon" />
                  <div className="iso-user-info">
                    <span className="iso-user-name">{storedUser.name || "User"}</span>
                    <span className="iso-user-role">{storedUser.department?.name || "Consultant"}</span>
                  </div>
                </div>
              ) : (
                <button type="button" className="iso-btn iso-btn-secondary" onClick={() => goTo("/login")}>Login</button>
              );
            })()}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="iso-hero soc2-hero">
        <div className="iso-hero-inner">
          <div className="iso-hero-content">
            <div className="iso-hero-badge soc2-badge">
              SOC 2 · System and Organization Controls
            </div>

            <h1 className="iso-hero-title">
              Prove your security posture with a <span>SOC 2 report</span>.
            </h1>

            <p className="iso-hero-description">
              CalVant helps you achieve and maintain SOC 2 compliance — the gold standard for
              cloud and SaaS security — with continuous control monitoring, automated evidence
              collection and clear audit readiness dashboards.
            </p>

            <div className="iso-hero-cta">
              {(() => {
                return !storedUser ? (
                  <button type="button" className="iso-hero-primary soc2-primary" onClick={() => goTo("/demo")}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                    Get a live SOC 2 demo
                  </button>
                ) : null;
              })()}
              <button type="button" className="iso-hero-secondary" onClick={() => handleScrollTo("soc2-overview")}>
                View framework overview
              </button>
            </div>

            <div className="iso-hero-stats">
              <div className="iso-stat-item iso-stat-item-main">
                <span className="iso-stat-main-label">SOC 2</span>
                <span className="iso-stat-main-value soc2-accent">88%</span>
                <span className="iso-stat-main-sub">COMPLIANCE</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">5</span>
                <span className="iso-stat-label">Trust Criteria</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">64</span>
                <span className="iso-stat-label">Controls</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">2</span>
                <span className="iso-stat-label">Report Types</span>
              </div>
            </div>
          </div>

          {/* SOC2 ORBIT VISUAL */}
          <div className="iso-hero-visual">
            <div className="iso-orbit-container soc2-orbit">
              <div className="iso-orbit-background">
                <div className="iso-orbit-ring iso-orbit-ring-1 soc2-ring" />
                <div className="iso-orbit-ring iso-orbit-ring-2 soc2-ring" />
                <div className="iso-orbit-ring iso-orbit-ring-3 soc2-ring" />
                <div className="iso-orbit-particle iso-orbit-p1 soc2-particle" />
                <div className="iso-orbit-particle iso-orbit-p2 soc2-particle" />
                <div className="iso-orbit-particle iso-orbit-p3 soc2-particle" />
              </div>

              <div className="iso-orbit-card iso-orbit-card-main">
                <div className="iso-orbit-main-title">SOC 2 Compliance</div>
                <div className="iso-orbit-main-gauge">
                  <div className="iso-orbit-main-circle soc2-circle"><span>94%</span></div>
                  <p>5 Trust Criteria · 64 controls active</p>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-readiness">
                <div className="iso-orbit-card-label">Audit Readiness</div>
                <div className="iso-orbit-readiness-meter">
                  <div className="iso-orbit-readiness-arc soc2-arc" />
                  <div className="iso-orbit-readiness-needle" />
                  <div className="iso-orbit-readiness-value">98.1%</div>
                  <div className="iso-orbit-readiness-sub">SOC 2 readiness</div>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-badge">
                <div className="iso-orbit-badge soc2-badge-card">
                  <span className="iso-orbit-badge-top">SOC</span>
                  <span className="iso-orbit-badge-bottom">2</span>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-controls">
                <div className="iso-orbit-controls-title">Controls</div>
                <div className="iso-orbit-controls-bars">
                  <div className="iso-orbit-bar iso-orbit-bar-ok"><span className="iso-orbit-bar-label">55 Passing</span></div>
                  <div className="iso-orbit-bar iso-orbit-bar-warn"><span className="iso-orbit-bar-label">7 Critical</span></div>
                  <div className="iso-orbit-bar iso-orbit-bar-fail"><span className="iso-orbit-bar-label">2 Failing</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section id="soc2-overview" className="iso-section">
        <div className="iso-section-header">
          <h2>What is SOC 2?</h2>
          <p>
            SOC 2 (System and Organization Controls 2) is an auditing framework developed by the
            American Institute of Certified Public Accountants (AICPA) that evaluates how
            organizations manage customer data based on five Trust Services Criteria.
          </p>
        </div>

        <div className="iso-overview-grid">
          <div className="iso-overview-card soc2-card">
            <div className="iso-card-icon soc2-icon"><ShieldCheck size={32} /></div>
            <h3>Trust Services Criteria</h3>
            <p>Evaluate your controls across Security, Availability, Processing Integrity,
              Confidentiality and Privacy — the five pillars of the SOC 2 framework.</p>
          </div>
          <div className="iso-overview-card soc2-card">
            <div className="iso-card-icon soc2-icon"><FileSearch size={32} /></div>
            <h3>Independent auditor assessment</h3>
            <p>A certified CPA firm tests your controls over a defined period (Type II) or at
              a point in time (Type I) and issues a formal attestation report.</p>
          </div>
          <div className="iso-overview-card soc2-card">
            <div className="iso-card-icon soc2-icon"><RefreshCw size={32} /></div>
            <h3>Continuous compliance posture</h3>
            <p>Use continuous monitoring, automated evidence collection and real-time dashboards
              to stay perpetually audit-ready — not just once a year.</p>
          </div>
        </div>
      </section>

      {/* TRUST SERVICES CRITERIA */}
      <section id="soc2-tsc" className="iso-section">
        <div className="iso-section-header">
          <h2>The five Trust Services Criteria</h2>
          <p>
            Security is mandatory for every SOC 2 report. The remaining four criteria are
            selected based on your services and commitments to customers.
          </p>
        </div>

        <div className="iso-clauses-container">
          <div className="iso-clause-grid">
            <div className="iso-clause-card soc2-clause soc2-clause-required">
              <span className="iso-clause-number soc2-number">CC — Required</span>
              <h3>Security (Common Criteria)</h3>
              <p>The foundation of every SOC 2 report. Addresses how the system is protected against unauthorized access, use and disclosure.</p>
              <ul>
                <li>Logical and physical access controls.</li>
                <li>System operations and monitoring.</li>
                <li>Change management and risk mitigation.</li>
              </ul>
            </div>

            <div className="iso-clause-card soc2-clause">
              <span className="iso-clause-number soc2-number">A — Optional</span>
              <h3>Availability</h3>
              <p>The system is available for operation and use as committed or agreed.</p>
              <ul>
                <li>Performance monitoring and capacity planning.</li>
                <li>Business continuity and disaster recovery.</li>
                <li>Incident response for availability events.</li>
              </ul>
            </div>

            <div className="iso-clause-card soc2-clause">
              <span className="iso-clause-number soc2-number">PI — Optional</span>
              <h3>Processing Integrity</h3>
              <p>System processing is complete, valid, accurate, timely and authorized.</p>
              <ul>
                <li>Input, processing and output controls.</li>
                <li>Error detection and correction procedures.</li>
                <li>Quality assurance for processing activities.</li>
              </ul>
            </div>

            <div className="iso-clause-card soc2-clause">
              <span className="iso-clause-number soc2-number">C — Optional</span>
              <h3>Confidentiality</h3>
              <p>Information designated as confidential is protected as committed or agreed.</p>
              <ul>
                <li>Data classification and handling procedures.</li>
                <li>Encryption in transit and at rest.</li>
                <li>Confidential data disposal and retention.</li>
              </ul>
            </div>

            <div className="iso-clause-card soc2-clause">
              <span className="iso-clause-number soc2-number">P — Optional</span>
              <h3>Privacy</h3>
              <p>Personal information is collected, used, retained, disclosed and disposed in conformance with the commitments in the privacy notice.</p>
              <ul>
                <li>Privacy notice and consent management.</li>
                <li>Data subject rights and access requests.</li>
                <li>Cross-border data transfer controls.</li>
              </ul>
            </div>

            <div className="iso-clause-card soc2-clause">
              <span className="iso-clause-number soc2-number">Evidence</span>
              <h3>Continuous evidence collection</h3>
              <p>Build an always-on evidence library that supports your annual audit and reduces last-minute scrambles.</p>
              <ul>
                <li>Automated log and screenshot collection.</li>
                <li>Policy acknowledgements and training records.</li>
                <li>Vendor assessment and access review evidence.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TYPE I vs TYPE II */}
      <section id="soc2-types" className="iso-section">
        <div className="iso-section-header">
          <h2>SOC 2 Type I vs Type II</h2>
          <p>Understanding the difference helps you choose the right report for your stage and customer demands.</p>
        </div>

        <div className="iso-annex-box-wrapper">
          <div className="iso-annex-intro soc2-annex-intro">
            <h3>Choose the right report type</h3>
            <p>Type I validates your controls are suitably designed at a point in time. Type II — the market standard — proves controls operated effectively over a minimum 6-month period, providing much stronger assurance to enterprise customers.</p>
          </div>
        </div>

        <div className="iso-domains-grid soc2-types-grid">
          <div className="iso-domain-card soc2-domain">
            <h4 className="iso-domain-title">SOC 2 Type I</h4>
            <p className="iso-domain-desc">A point-in-time assessment of whether controls are suitably designed to meet the selected Trust Services Criteria.</p>
            <ul className="iso-domain-controls">
              <li>Faster to achieve — typically 2–4 months</li>
              <li>Lower cost than Type II</li>
              <li>Good starting point for early-stage companies</li>
              <li>Does not test operating effectiveness over time</li>
            </ul>
          </div>

          <div className="iso-domain-card soc2-domain soc2-domain-highlight">
            <h4 className="iso-domain-title">SOC 2 Type II ★ Preferred</h4>
            <p className="iso-domain-desc">Tests both design and operating effectiveness over a minimum 6-month observation period — the standard enterprise customers require.</p>
            <ul className="iso-domain-controls">
              <li>Covers a defined observation period (6–12 months)</li>
              <li>Stronger assurance for enterprise buyers</li>
              <li>Required by most Fortune 500 vendor questionnaires</li>
              <li>Renewable annually to maintain trust</li>
            </ul>
          </div>

          <div className="iso-domain-card soc2-domain">
            <h4 className="iso-domain-title">Common control categories</h4>
            <p className="iso-domain-desc">Controls tested across both report types regardless of which Trust Services Criteria you select.</p>
            <ul className="iso-domain-controls">
              <li>Access provisioning and de-provisioning</li>
              <li>Encryption and key management</li>
              <li>Vulnerability management and patching</li>
              <li>Security awareness training</li>
            </ul>
          </div>

          <div className="iso-domain-card soc2-domain">
            <h4 className="iso-domain-title">Evidence CalVant automates</h4>
            <p className="iso-domain-desc">CalVant continuously collects the evidence types most commonly tested in SOC 2 audits.</p>
            <ul className="iso-domain-controls">
              <li>Access review exports and HR termination records</li>
              <li>Penetration test reports and vuln scan outputs</li>
              <li>Incident tickets and response timelines</li>
              <li>Change management logs and approval records</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="soc2-benefits" className="iso-section">
        <div className="iso-section-header">
          <h2>Business impact of SOC 2</h2>
          <p>SOC 2 is the most recognized security attestation for SaaS and cloud companies. A report opens doors and builds durable customer trust.</p>
        </div>

        <div className="iso-benefits-grid">
          <div className="iso-benefit-card soc2-benefit">
            <div className="iso-benefit-icon soc2-benefit-icon"><Building2 size={32} /></div>
            <h3>Accelerate enterprise sales</h3>
            <p>Enterprise buyers require SOC 2 Type II before onboarding new vendors. A current report eliminates the longest bottleneck in the sales cycle.</p>
          </div>
          <div className="iso-benefit-card soc2-benefit">
            <div className="iso-benefit-icon soc2-benefit-icon"><Shield size={32} /></div>
            <h3>Demonstrate verified security</h3>
            <p>Unlike self-assessments, a SOC 2 report is independently verified — giving customers, partners and investors objective assurance.</p>
          </div>
          <div className="iso-benefit-card soc2-benefit">
            <div className="iso-benefit-icon soc2-benefit-icon"><Scale size={32} /></div>
            <h3>Support regulatory alignment</h3>
            <p>SOC 2 controls overlap significantly with GDPR, HIPAA, ISO 27001 and other frameworks — reducing duplication across compliance programs.</p>
          </div>
          <div className="iso-benefit-card soc2-benefit">
            <div className="iso-benefit-icon soc2-benefit-icon"><Lock size={32} /></div>
            <h3>Strengthen security culture</h3>
            <p>The SOC 2 process drives formalization of policies, access reviews and incident response — building long-term security maturity.</p>
          </div>
          <div className="iso-benefit-card soc2-benefit">
            <div className="iso-benefit-icon soc2-benefit-icon"><CheckCircle size={32} /></div>
            <h3>Reduce vendor questionnaire burden</h3>
            <p>Share a current SOC 2 report instead of answering hundreds of individual security questionnaires from each prospective customer.</p>
          </div>
          <div className="iso-benefit-card soc2-benefit">
            <div className="iso-benefit-icon soc2-benefit-icon"><Handshake size={32} /></div>
            <h3>Align security with the business</h3>
            <p>SOC 2 creates shared accountability across engineering, IT, legal and operations — embedding security into every part of the organization.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="iso-section">
        <div className="iso-cta-section soc2-cta">
          <h2>Ready to achieve SOC 2 and win enterprise deals faster?</h2>
          <p>See how CalVant helps you collect evidence continuously, stay audit-ready and close security-sensitive deals with confidence.</p>
          <div className="iso-cta-buttons">
            {(() => {
              return !storedUser ? (
                <button type="button" className="iso-cta-btn iso-cta-btn-primary soc2-cta-primary" onClick={() => goTo("/demo")}>Get a demo</button>
              ) : null;
            })()}
            <button type="button" className="iso-cta-btn iso-cta-btn-secondary" onClick={() => goTo("/demo")}>Talk to an expert</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="iso-footer">
        <div className="iso-footer-content">
          <div className="iso-footer-section">
            <h4>CalVant</h4>
            <p>A modern compliance and security operations platform designed to help teams achieve and maintain SOC 2 and adjacent frameworks.</p>
          </div>
          <div className="iso-footer-section">
            <h4>Frameworks</h4>
            <ul>
              <li><Link href="/iso-27001">ISO 27001</Link></li>
              <li><Link href="/iso-27701">ISO 27701</Link></li>
              <li><Link href="/iso-42001">ISO 42001</Link></li>
              <li><Link href="/soc-2">SOC 2</Link></li>
            </ul>
          </div>
          <div className="iso-footer-section">
            <h4>Product</h4>
            <ul>
              <li><Link href="/policies">Policy templates</Link></li>
            </ul>
          </div>
          <div className="iso-footer-section">
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/careers">Careers</Link></li>
            </ul>
          </div>
        </div>
        <div className="iso-footer-bottom">
          © {new Date().getFullYear()} CalVant · SOC 2 · Made in India
        </div>
      </footer>
    </div>
  );
};

export default SOC2;

