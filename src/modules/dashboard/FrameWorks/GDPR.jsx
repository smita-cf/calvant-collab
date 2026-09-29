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
  Globe,
  FileText,
  Users,
  Lock,
  AlertTriangle,
  Handshake,
  Eye,
  ClipboardList,
} from "lucide-react";
import "./GDPR.css";
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

const GDPR = () => {
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
    <div className="iso-page-root gdpr-theme">
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
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("gdpr-overview")}>Overview</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("gdpr-principles")}>Principles</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("gdpr-obligations")}>Obligations</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("gdpr-benefits")}>Benefits</button></li>
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
      <section className="iso-hero gdpr-hero">
        <div className="iso-hero-inner">
          <div className="iso-hero-content">
            <div className="iso-hero-badge gdpr-badge">
              EU GDPR · General Data Protection Regulation · European Union
            </div>

            <h1 className="iso-hero-title">
              Achieve full compliance with the <span>EU General Data Protection Regulation</span>.
            </h1>

            <p className="iso-hero-description">
              CalVant helps organizations operating in or serving European citizens implement and maintain
              GDPR compliance — enforced by EU Data Protection Authorities (DPAs) —
              with mapped controls, data subject rights management, and continuous monitoring.
            </p>

            <div className="iso-hero-cta">
              {(() => {
  
                return !storedUser ? (
                  <button type="button" className="iso-hero-primary gdpr-primary" onClick={() => goTo("/demo")}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                    Get a live GDPR demo
                  </button>
                ) : null;
              })()}
              <button type="button" className="iso-hero-secondary" onClick={() => handleScrollTo("gdpr-overview")}>
                View framework overview
              </button>
            </div>

            <div className="iso-hero-stats">
              <div className="iso-stat-item iso-stat-item-main">
                <span className="iso-stat-main-label">GDPR</span>
                <span className="iso-stat-main-value gdpr-accent">82%</span>
                <span className="iso-stat-main-sub">COMPLIANCE</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">99</span>
                <span className="iso-stat-label">Articles</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">8</span>
                <span className="iso-stat-label">Data Rights</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">€20M</span>
                <span className="iso-stat-label">Max Fine</span>
              </div>
            </div>
          </div>

          {/* GDPR ORBIT VISUAL */}
          <div className="iso-hero-visual">
            <div className="iso-orbit-container gdpr-orbit">
              <div className="iso-orbit-background">
                <div className="iso-orbit-ring iso-orbit-ring-1 gdpr-ring" />
                <div className="iso-orbit-ring iso-orbit-ring-2 gdpr-ring" />
                <div className="iso-orbit-ring iso-orbit-ring-3 gdpr-ring" />
                <div className="iso-orbit-particle iso-orbit-p1 gdpr-particle" />
                <div className="iso-orbit-particle iso-orbit-p2 gdpr-particle" />
                <div className="iso-orbit-particle iso-orbit-p3 gdpr-particle" />
              </div>

              <div className="iso-orbit-card iso-orbit-card-main">
                <div className="iso-orbit-main-title">GDPR Compliance</div>
                <div className="iso-orbit-main-gauge">
                  <div className="iso-orbit-main-circle gdpr-circle"><span>88%</span></div>
                  <p>8 data rights · 99 articles covered</p>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-readiness">
                <div className="iso-orbit-card-label">GDPR Readiness</div>
                <div className="iso-orbit-readiness-meter">
                  <div className="iso-orbit-readiness-arc gdpr-arc" />
                  <div className="iso-orbit-readiness-needle" />
                  <div className="iso-orbit-readiness-value">94.1%</div>
                  <div className="iso-orbit-readiness-sub">EU GDPR readiness</div>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-badge">
                <div className="iso-orbit-badge gdpr-badge-card">
                  <span className="iso-orbit-badge-top">EU</span>
                  <span className="iso-orbit-badge-bottom">GDPR</span>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-controls">
                <div className="iso-orbit-controls-title">Obligations</div>
                <div className="iso-orbit-controls-bars">
                  <div className="iso-orbit-bar iso-orbit-bar-ok"><span className="iso-orbit-bar-label">51 Met</span></div>
                  <div className="iso-orbit-bar iso-orbit-bar-warn"><span className="iso-orbit-bar-label">8 Partial</span></div>
                  <div className="iso-orbit-bar iso-orbit-bar-fail"><span className="iso-orbit-bar-label">5 Gaps</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section id="gdpr-overview" className="iso-section">
        <div className="iso-section-header">
          <h2>What is the EU GDPR?</h2>
          <p>
            The General Data Protection Regulation (GDPR) is the European Union's landmark data privacy
            law, enforced by national Data Protection Authorities (DPAs) in each member state. It governs
            the collection, processing, storage and transfer of personal data of EU residents —
            applicable to any organization that processes EU residents' data, regardless of where it is based.
          </p>
        </div>

        <div className="iso-overview-grid">
          <div className="iso-overview-card gdpr-card">
            <div className="iso-card-icon gdpr-icon"><Globe size={32} /></div>
            <h3>Extraterritorial reach</h3>
            <p>The GDPR applies to any organization worldwide that processes personal data of EU residents,
              regardless of where the organization is headquartered or its data is stored.</p>
          </div>
          <div className="iso-overview-card gdpr-card">
            <div className="iso-card-icon gdpr-icon"><Users size={32} /></div>
            <h3>Eight data subject rights</h3>
            <p>EU residents hold eight enforceable rights — including access, erasure and portability.
              Organizations must build processes to fulfill these rights within strict statutory timeframes.</p>
          </div>
          <div className="iso-overview-card gdpr-card">
            <div className="iso-card-icon gdpr-icon"><AlertTriangle size={32} /></div>
            <h3>Severe financial penalties</h3>
            <p>Non-compliance can result in fines of up to €20 million or 4% of global annual turnover —
              whichever is higher — plus reputational and operational consequences.</p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section id="gdpr-principles" className="iso-section">
        <div className="iso-section-header">
          <h2>Core GDPR principles</h2>
          <p>
            Article 5 of the GDPR sets out seven foundational principles that govern all personal data
            processing activities. Compliance with these principles is the foundation of a robust GDPR program.
          </p>
        </div>

        <div className="iso-clauses-container">
          <div className="iso-clause-grid">
            <div className="iso-clause-card gdpr-clause">
              <span className="iso-clause-number gdpr-number">Article 5(1)(a)</span>
              <h3>Lawfulness, fairness and transparency</h3>
              <p>Personal data must be processed lawfully, fairly and in a transparent manner in relation to the data subject.</p>
              <ul>
                <li>Identify and document a lawful basis for every processing activity.</li>
                <li>Maintain transparency through clear privacy notices.</li>
                <li>Ensure processing is fair and does not mislead individuals.</li>
              </ul>
            </div>

            <div className="iso-clause-card gdpr-clause">
              <span className="iso-clause-number gdpr-number">Article 5(1)(b)</span>
              <h3>Purpose limitation</h3>
              <p>Data must be collected for specified, explicit and legitimate purposes and not processed incompatibly with those purposes.</p>
              <ul>
                <li>Define and document the specific purpose of each data collection.</li>
                <li>Assess compatibility before using data for a new purpose.</li>
                <li>Obtain fresh consent where purpose has materially changed.</li>
              </ul>
            </div>

            <div className="iso-clause-card gdpr-clause">
              <span className="iso-clause-number gdpr-number">Article 5(1)(c)</span>
              <h3>Data minimisation</h3>
              <p>Personal data must be adequate, relevant and limited to what is necessary in relation to the purposes of processing.</p>
              <ul>
                <li>Conduct data minimisation reviews at collection points.</li>
                <li>Remove redundant or excessive data fields from forms and systems.</li>
                <li>Apply retention schedules and automated deletion procedures.</li>
              </ul>
            </div>

            <div className="iso-clause-card gdpr-clause">
              <span className="iso-clause-number gdpr-number">Article 5(1)(d)</span>
              <h3>Accuracy</h3>
              <p>Personal data must be accurate and, where necessary, kept up to date; inaccurate data must be erased or rectified without delay.</p>
              <ul>
                <li>Implement data quality controls and input validation.</li>
                <li>Provide individuals with mechanisms to update their data.</li>
                <li>Maintain audit logs for all data correction activities.</li>
              </ul>
            </div>

            <div className="iso-clause-card gdpr-clause">
              <span className="iso-clause-number gdpr-number">Article 5(1)(e)</span>
              <h3>Storage limitation</h3>
              <p>Personal data must be kept in a form that permits identification of data subjects for no longer than necessary for the stated purposes.</p>
              <ul>
                <li>Define and enforce data retention periods per data category.</li>
                <li>Implement automated deletion or anonymisation workflows.</li>
                <li>Conduct periodic data inventory and purge reviews.</li>
              </ul>
            </div>

            <div className="iso-clause-card gdpr-clause">
              <span className="iso-clause-number gdpr-number">Article 5(1)(f) & 5(2)</span>
              <h3>Integrity, confidentiality and accountability</h3>
              <p>Appropriate security measures must protect personal data; controllers are responsible for and must demonstrate compliance.</p>
              <ul>
                <li>Implement encryption, access controls and security monitoring.</li>
                <li>Appoint a Data Protection Officer (DPO) where required.</li>
                <li>Maintain Records of Processing Activities (RoPA) and conduct DPIAs.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OBLIGATIONS */}
      <section id="gdpr-obligations" className="iso-section">
        <div className="iso-section-header">
          <h2>Key GDPR obligations</h2>
          <p>Organizations processing EU residents' data must implement these obligations to avoid regulatory enforcement by national DPAs.</p>
        </div>

        <div className="iso-annex-box-wrapper">
          <div className="iso-annex-intro gdpr-annex-intro">
            <h3>Special categories of data require explicit consent</h3>
            <p>Article 9 of the GDPR defines special categories of sensitive personal data — including health data, genetic and biometric data, racial or ethnic origin, political opinions, religious beliefs, trade union membership and sexual orientation — that require explicit consent or another specific Article 9 condition, in addition to a lawful basis under Article 6.</p>
          </div>
        </div>

        <div className="iso-domains-grid">
          <div className="iso-domain-card gdpr-domain">
            <h4 className="iso-domain-title">Lawful basis & consent management</h4>
            <p className="iso-domain-desc">Every processing activity must rest on one of six lawful bases; consent must meet GDPR's high standard.</p>
            <ul className="iso-domain-controls">
              <li>Document the lawful basis for each processing activity in the RoPA</li>
              <li>Capture freely given, specific, informed and unambiguous consent</li>
              <li>Provide simple mechanisms to withdraw consent at any time</li>
              <li>Review and refresh lawful bases when processing changes</li>
            </ul>
          </div>

          <div className="iso-domain-card gdpr-domain">
            <h4 className="iso-domain-title">Data subject rights (Articles 15–22)</h4>
            <p className="iso-domain-desc">EU residents hold eight rights that organizations must fulfill within one calendar month of a valid request.</p>
            <ul className="iso-domain-controls">
              <li>Right of access — provide a copy of personal data held</li>
              <li>Right to rectification, erasure and restriction of processing</li>
              <li>Right to data portability and right to object</li>
              <li>Rights related to automated decision-making and profiling</li>
            </ul>
          </div>

          <div className="iso-domain-card gdpr-domain">
            <h4 className="iso-domain-title">International data transfers</h4>
            <p className="iso-domain-desc">Transferring personal data outside the European Economic Area (EEA) requires approved transfer mechanisms.</p>
            <ul className="iso-domain-controls">
              <li>Map all cross-border data flows involving EEA personal data</li>
              <li>Implement Standard Contractual Clauses (SCCs) or Binding Corporate Rules</li>
              <li>Assess adequacy decisions for the recipient country</li>
              <li>Conduct Transfer Impact Assessments (TIAs) where required</li>
            </ul>
          </div>

          <div className="iso-domain-card gdpr-domain">
            <h4 className="iso-domain-title">Breach notification (Articles 33–34)</h4>
            <p className="iso-domain-desc">Personal data breaches affecting EU residents must be reported to the supervisory authority and affected individuals within defined timeframes.</p>
            <ul className="iso-domain-controls">
              <li>72-hour notification to lead supervisory authority for reportable breaches</li>
              <li>Notification to affected data subjects without undue delay for high-risk breaches</li>
              <li>Maintain a breach register including all incidents assessed as non-reportable</li>
              <li>Implement post-incident remediation and preventive measures</li>
            </ul>
          </div>

          <div className="iso-domain-card gdpr-domain">
            <h4 className="iso-domain-title">Data Protection by Design & by Default</h4>
            <p className="iso-domain-desc">Privacy must be embedded into systems and processes from inception, not bolted on afterwards.</p>
            <ul className="iso-domain-controls">
              <li>Conduct Data Protection Impact Assessments (DPIAs) for high-risk processing</li>
              <li>Apply privacy-enhancing technologies (PETs) in system design</li>
              <li>Default settings must collect only the minimum data necessary</li>
              <li>Embed privacy reviews into the software development lifecycle (SDLC)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="gdpr-benefits" className="iso-section">
        <div className="iso-section-header">
          <h2>Business impact of GDPR compliance</h2>
          <p>GDPR compliance is not merely a legal obligation — it is a strategic asset for organizations seeking to operate across Europe and build lasting trust with consumers and partners worldwide.</p>
        </div>

        <div className="iso-benefits-grid">
          <div className="iso-benefit-card gdpr-benefit">
            <div className="iso-benefit-icon gdpr-benefit-icon"><Building2 size={32} /></div>
            <h3>Operate across the EU single market</h3>
            <p>GDPR compliance is the baseline for doing business with EU customers, partners and public sector organizations. It signals readiness to engage in Europe's digital economy.</p>
          </div>
          <div className="iso-benefit-card gdpr-benefit">
            <div className="iso-benefit-icon gdpr-benefit-icon"><Shield size={32} /></div>
            <h3>Avoid catastrophic penalties</h3>
            <p>Fines of up to €20 million or 4% of global turnover — plus enforcement investigations, remediation costs and reputational damage — make proactive compliance the clear commercial choice.</p>
          </div>
          <div className="iso-benefit-card gdpr-benefit">
            <div className="iso-benefit-icon gdpr-benefit-icon"><Scale size={32} /></div>
            <h3>Set the global privacy benchmark</h3>
            <p>GDPR is the world's most influential privacy regulation. Compliance positions organizations to satisfy CCPA, PDPL, DPDPA and other frameworks through a single unified privacy program.</p>
          </div>
          <div className="iso-benefit-card gdpr-benefit">
            <div className="iso-benefit-icon gdpr-benefit-icon"><Globe size={32} /></div>
            <h3>Enable trusted data flows</h3>
            <p>Implementing Standard Contractual Clauses and Transfer Impact Assessments ensures uninterrupted personal data flows between EU operations and global systems, partners and cloud providers.</p>
          </div>
          <div className="iso-benefit-card gdpr-benefit">
            <div className="iso-benefit-icon gdpr-benefit-icon"><Eye size={32} /></div>
            <h3>Build enduring customer trust</h3>
            <p>Demonstrable GDPR compliance builds confidence with European consumers — especially in regulated sectors including financial services, healthcare, e-commerce and SaaS.</p>
          </div>
          <div className="iso-benefit-card gdpr-benefit">
            <div className="iso-benefit-icon gdpr-benefit-icon"><Handshake size={32} /></div>
            <h3>Mature organizational data governance</h3>
            <p>GDPR requirements drive formalization of data governance — establishing clear data ownership, processing records, DPO accountability and organization-wide privacy culture.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="iso-section">
        <div className="iso-cta-section gdpr-cta">
          <h2>Ready to achieve GDPR compliance and operate confidently across Europe?</h2>
          <p>See how CalVant maps GDPR obligations to actionable controls, automates data subject request workflows and keeps you continuously compliant across all EU member states.</p>
          <div className="iso-cta-buttons">
            {(() => {

              return !storedUser ? (
                <button type="button" className="iso-cta-btn iso-cta-btn-primary gdpr-cta-primary" onClick={() => goTo("/demo")}>Get a demo</button>
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
            <p>A modern compliance and security operations platform designed to help teams achieve GDPR compliance and adjacent privacy frameworks.</p>
          </div>
          <div className="iso-footer-section">
            <h4>Frameworks</h4>
            <ul>
              <li><Link href="/iso-27001">ISO 27001</Link></li>
              <li><Link href="/iso-27701">ISO 27701</Link></li>
              <li><Link href="/iso-42001">ISO 42001</Link></li>
              <li><Link href="/soc-2">SOC 2</Link></li>
              <li><Link href="/gdpr">GDPR</Link></li>
              <li><Link href="/ksa-pdpl">KSA PDPL</Link></li>
              <li><Link href="/dpdpa">DPDPA</Link></li>
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
          © {new Date().getFullYear()} CalVant · GDPR · Made in India
        </div>
      </footer>
    </div>
  );
};

export default GDPR;


