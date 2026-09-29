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
import "./KSA_PDPL.css";
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

const KSA_PDPL = () => {
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
    <div className="iso-page-root pdpl-theme">
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
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("pdpl-overview")}>Overview</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("pdpl-principles")}>Principles</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("pdpl-obligations")}>Obligations</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("pdpl-benefits")}>Benefits</button></li>
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
      <section className="iso-hero pdpl-hero">
        <div className="iso-hero-inner">
          <div className="iso-hero-content">
            <div className="iso-hero-badge pdpl-badge">
              KSA PDPL · Personal Data Protection Law · المملكة العربية السعودية
            </div>

            <h1 className="iso-hero-title">
              Achieve full compliance with the <span>KSA Personal Data Protection Law</span>.
            </h1>

            <p className="iso-hero-description">
              CalVant helps organizations operating in Saudi Arabia implement and maintain
              compliance with the PDPL — enforced by the Saudi Data & AI Authority (SDAIA) —
              with mapped controls, data subject rights management, and continuous monitoring.
            </p>

            <div className="iso-hero-cta">
              {(() => {
  
                return !storedUser ? (
                  <button type="button" className="iso-hero-primary pdpl-primary" onClick={() => goTo("/demo")}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                    Get a live KSA PDPL demo
                  </button>
                ) : null;
              })()}
              <button type="button" className="iso-hero-secondary" onClick={() => handleScrollTo("pdpl-overview")}>
                View framework overview
              </button>
            </div>

            <div className="iso-hero-stats">
              <div className="iso-stat-item iso-stat-item-main">
                <span className="iso-stat-main-label">KSA PDPL</span>
                <span className="iso-stat-main-value pdpl-accent">79%</span>
                <span className="iso-stat-main-sub">COMPLIANCE</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">9</span>
                <span className="iso-stat-label">Chapters</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">6</span>
                <span className="iso-stat-label">Data Rights</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">SAR 5M</span>
                <span className="iso-stat-label">Max Fine</span>
              </div>
            </div>
          </div>

          {/* PDPL ORBIT VISUAL */}
          <div className="iso-hero-visual">
            <div className="iso-orbit-container pdpl-orbit">
              <div className="iso-orbit-background">
                <div className="iso-orbit-ring iso-orbit-ring-1 pdpl-ring" />
                <div className="iso-orbit-ring iso-orbit-ring-2 pdpl-ring" />
                <div className="iso-orbit-ring iso-orbit-ring-3 pdpl-ring" />
                <div className="iso-orbit-particle iso-orbit-p1 pdpl-particle" />
                <div className="iso-orbit-particle iso-orbit-p2 pdpl-particle" />
                <div className="iso-orbit-particle iso-orbit-p3 pdpl-particle" />
              </div>

              <div className="iso-orbit-card iso-orbit-card-main">
                <div className="iso-orbit-main-title">PDPL Compliance</div>
                <div className="iso-orbit-main-gauge">
                  <div className="iso-orbit-main-circle pdpl-circle"><span>91%</span></div>
                  <p>6 data rights · 9 chapters covered</p>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-readiness">
                <div className="iso-orbit-card-label">PDPL Readiness</div>
                <div className="iso-orbit-readiness-meter">
                  <div className="iso-orbit-readiness-arc pdpl-arc" />
                  <div className="iso-orbit-readiness-needle" />
                  <div className="iso-orbit-readiness-value">96.4%</div>
                  <div className="iso-orbit-readiness-sub">KSA PDPL readiness</div>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-badge">
                <div className="iso-orbit-badge pdpl-badge-card">
                  <span className="iso-orbit-badge-top">KSA</span>
                  <span className="iso-orbit-badge-bottom">PDPL</span>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-controls">
                <div className="iso-orbit-controls-title">Obligations</div>
                <div className="iso-orbit-controls-bars">
                  <div className="iso-orbit-bar iso-orbit-bar-ok"><span className="iso-orbit-bar-label">42 Met</span></div>
                  <div className="iso-orbit-bar iso-orbit-bar-warn"><span className="iso-orbit-bar-label">6 Partial</span></div>
                  <div className="iso-orbit-bar iso-orbit-bar-fail"><span className="iso-orbit-bar-label">4 Gaps</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section id="pdpl-overview" className="iso-section">
        <div className="iso-section-header">
          <h2>What is the KSA PDPL?</h2>
          <p>
            The Personal Data Protection Law (PDPL) is Saudi Arabia's comprehensive data privacy
            regulation, enforced by SDAIA. It governs the collection, processing, storage and
            transfer of personal data of individuals in the Kingdom — applicable to all organizations
            processing Saudi residents' data, regardless of where they are headquartered.
          </p>
        </div>

        <div className="iso-overview-grid">
          <div className="iso-overview-card pdpl-card">
            <div className="iso-card-icon pdpl-icon"><Globe size={32} /></div>
            <h3>Extraterritorial reach</h3>
            <p>The PDPL applies to any organization that processes personal data of individuals
              located in Saudi Arabia — including companies headquartered outside the Kingdom.</p>
          </div>
          <div className="iso-overview-card pdpl-card">
            <div className="iso-card-icon pdpl-icon"><Users size={32} /></div>
            <h3>Data subject rights</h3>
            <p>Individuals have the right to access, correct, delete and port their data. Organizations
              must provide clear mechanisms to fulfill these rights within defined timeframes.</p>
          </div>
          <div className="iso-overview-card pdpl-card">
            <div className="iso-card-icon pdpl-icon"><AlertTriangle size={32} /></div>
            <h3>Significant penalties</h3>
            <p>Non-compliance can result in fines up to SAR 5 million (approximately USD 1.3M)
              for violations, with criminal penalties for serious breaches involving sensitive data.</p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section id="pdpl-principles" className="iso-section">
        <div className="iso-section-header">
          <h2>Core PDPL principles</h2>
          <p>
            The PDPL is built on internationally recognized data protection principles, adapted
            for the Saudi legal and cultural context and enforced by SDAIA.
          </p>
        </div>

        <div className="iso-clauses-container">
          <div className="iso-clause-grid">
            <div className="iso-clause-card pdpl-clause">
              <span className="iso-clause-number pdpl-number">Principle 1</span>
              <h3>Lawfulness and consent</h3>
              <p>Personal data must be processed on a lawful basis, including explicit consent, contractual necessity or legitimate interest.</p>
              <ul>
                <li>Obtain clear, informed consent before processing.</li>
                <li>Maintain consent records and withdrawal mechanisms.</li>
                <li>Document the legal basis for each processing activity.</li>
              </ul>
            </div>

            <div className="iso-clause-card pdpl-clause">
              <span className="iso-clause-number pdpl-number">Principle 2</span>
              <h3>Purpose limitation</h3>
              <p>Data must be collected for specified, explicit and legitimate purposes and not processed in ways incompatible with those purposes.</p>
              <ul>
                <li>Define and document the purpose of each data collection.</li>
                <li>Prohibit processing beyond the stated purpose.</li>
                <li>Review purpose alignment when using data for new activities.</li>
              </ul>
            </div>

            <div className="iso-clause-card pdpl-clause">
              <span className="iso-clause-number pdpl-number">Principle 3</span>
              <h3>Data minimization</h3>
              <p>Only collect and process personal data that is adequate, relevant and limited to what is necessary for the stated purpose.</p>
              <ul>
                <li>Conduct data minimization reviews at collection points.</li>
                <li>Remove redundant or excessive data fields.</li>
                <li>Apply retention schedules and deletion procedures.</li>
              </ul>
            </div>

            <div className="iso-clause-card pdpl-clause">
              <span className="iso-clause-number pdpl-number">Principle 4</span>
              <h3>Accuracy</h3>
              <p>Personal data must be accurate and kept up to date. Inaccurate data must be erased or rectified without delay.</p>
              <ul>
                <li>Implement data quality controls and validation.</li>
                <li>Provide individuals with mechanisms to update their data.</li>
                <li>Maintain audit logs for data correction activities.</li>
              </ul>
            </div>

            <div className="iso-clause-card pdpl-clause">
              <span className="iso-clause-number pdpl-number">Principle 5</span>
              <h3>Security and confidentiality</h3>
              <p>Appropriate technical and organizational measures must protect personal data against unauthorized access, loss or destruction.</p>
              <ul>
                <li>Implement encryption, access controls and monitoring.</li>
                <li>Conduct regular security assessments.</li>
                <li>Maintain incident response and breach notification procedures.</li>
              </ul>
            </div>

            <div className="iso-clause-card pdpl-clause">
              <span className="iso-clause-number pdpl-number">Principle 6</span>
              <h3>Accountability</h3>
              <p>Controllers are responsible for and must demonstrate compliance with all PDPL principles.</p>
              <ul>
                <li>Appoint a Data Protection Officer (DPO) where required.</li>
                <li>Maintain records of processing activities (RoPA).</li>
                <li>Conduct Data Protection Impact Assessments (DPIAs).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OBLIGATIONS */}
      <section id="pdpl-obligations" className="iso-section">
        <div className="iso-section-header">
          <h2>Key PDPL obligations</h2>
          <p>Organizations processing personal data of Saudi residents must implement these obligations to avoid regulatory action.</p>
        </div>

        <div className="iso-annex-box-wrapper">
          <div className="iso-annex-intro pdpl-annex-intro">
            <h3>Sensitive data categories require heightened protection</h3>
            <p>The PDPL defines special categories of sensitive personal data — including health data, financial data, religious beliefs, biometric data and location data — that require explicit consent and additional safeguards beyond those required for ordinary personal data.</p>
          </div>
        </div>

        <div className="iso-domains-grid">
          <div className="iso-domain-card pdpl-domain">
            <h4 className="iso-domain-title">Privacy notice & transparency</h4>
            <p className="iso-domain-desc">Individuals must be informed about how their data is collected, used and shared.</p>
            <ul className="iso-domain-controls">
              <li>Publish a clear, accessible privacy notice</li>
              <li>Disclose third-party data sharing arrangements</li>
              <li>Inform individuals of their rights under PDPL</li>
              <li>Notify individuals of material changes to processing</li>
            </ul>
          </div>

          <div className="iso-domain-card pdpl-domain">
            <h4 className="iso-domain-title">Data subject rights</h4>
            <p className="iso-domain-desc">Individuals have six core rights that organizations must have processes to fulfill.</p>
            <ul className="iso-domain-controls">
              <li>Right to access — obtain a copy of their data</li>
              <li>Right to correction — update inaccurate data</li>
              <li>Right to erasure — request deletion of their data</li>
              <li>Right to data portability and objection</li>
            </ul>
          </div>

          <div className="iso-domain-card pdpl-domain">
            <h4 className="iso-domain-title">Cross-border data transfers</h4>
            <p className="iso-domain-desc">Transferring personal data outside Saudi Arabia requires specific safeguards and SDAIA approval for certain transfers.</p>
            <ul className="iso-domain-controls">
              <li>Map all cross-border data flows</li>
              <li>Implement approved transfer mechanisms</li>
              <li>Assess recipient country data protection adequacy</li>
              <li>Obtain SDAIA approval where required</li>
            </ul>
          </div>

          <div className="iso-domain-card pdpl-domain">
            <h4 className="iso-domain-title">Breach notification</h4>
            <p className="iso-domain-desc">Security incidents affecting personal data must be reported to SDAIA and affected individuals within defined timeframes.</p>
            <ul className="iso-domain-controls">
              <li>72-hour notification to SDAIA for high-risk breaches</li>
              <li>Prompt notification to affected data subjects</li>
              <li>Maintain breach investigation and response records</li>
              <li>Implement preventive measures post-breach</li>
            </ul>
          </div>

          <div className="iso-domain-card pdpl-domain">
            <h4 className="iso-domain-title">Processor & vendor management</h4>
            <p className="iso-domain-desc">Organizations remain accountable for personal data processed by third-party processors on their behalf.</p>
            <ul className="iso-domain-controls">
              <li>Data processing agreements with all processors</li>
              <li>Vendor due diligence and security assessments</li>
              <li>Monitoring of processor compliance obligations</li>
              <li>Processor audit rights and contractual protections</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="pdpl-benefits" className="iso-section">
        <div className="iso-section-header">
          <h2>Business impact of KSA PDPL compliance</h2>
          <p>PDPL compliance is not just a legal obligation — it is a competitive advantage for organizations operating in one of the fastest-growing economies in the Middle East.</p>
        </div>

        <div className="iso-benefits-grid">
          <div className="iso-benefit-card pdpl-benefit">
            <div className="iso-benefit-icon pdpl-benefit-icon"><Building2 size={32} /></div>
            <h3>Access the Saudi market</h3>
            <p>Operating in Saudi Arabia or handling Saudi residents' data requires PDPL compliance. A strong program demonstrates readiness to operate in the Kingdom's digital economy.</p>
          </div>
          <div className="iso-benefit-card pdpl-benefit">
            <div className="iso-benefit-icon pdpl-benefit-icon"><Shield size={32} /></div>
            <h3>Avoid significant penalties</h3>
            <p>Fines up to SAR 5 million and criminal liability for senior officials make proactive compliance far less costly than enforcement action by SDAIA.</p>
          </div>
          <div className="iso-benefit-card pdpl-benefit">
            <div className="iso-benefit-icon pdpl-benefit-icon"><Scale size={32} /></div>
            <h3>Align with global privacy standards</h3>
            <p>PDPL obligations closely parallel GDPR, enabling organizations to build a unified global privacy program that satisfies multiple jurisdictions simultaneously.</p>
          </div>
          <div className="iso-benefit-card pdpl-benefit">
            <div className="iso-benefit-icon pdpl-benefit-icon"><Globe size={32} /></div>
            <h3>Enable cross-border data flows</h3>
            <p>Establishing compliant cross-border transfer mechanisms ensures uninterrupted data flows between Saudi operations and global systems or partners.</p>
          </div>
          <div className="iso-benefit-card pdpl-benefit">
            <div className="iso-benefit-icon pdpl-benefit-icon"><Eye size={32} /></div>
            <h3>Build customer trust</h3>
            <p>Demonstrable PDPL compliance builds confidence with Saudi consumers and business partners — especially in sectors like financial services, healthcare and e-commerce.</p>
          </div>
          <div className="iso-benefit-card pdpl-benefit">
            <div className="iso-benefit-icon pdpl-benefit-icon"><Handshake size={32} /></div>
            <h3>Strengthen organizational governance</h3>
            <p>PDPL drives formalization of data governance — clarifying ownership, processing records and accountability structures across the organization.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="iso-section">
        <div className="iso-cta-section pdpl-cta">
          <h2>Ready to achieve KSA PDPL compliance and operate confidently in Saudi Arabia?</h2>
          <p>See how CalVant maps PDPL obligations to actionable controls, automates data subject request workflows and keeps you continuously compliant.</p>
          <div className="iso-cta-buttons">
            {(() => {

              return !storedUser ? (
                <button type="button" className="iso-cta-btn iso-cta-btn-primary pdpl-cta-primary" onClick={() => goTo("/demo")}>Get a demo</button>
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
            <p>A modern compliance and security operations platform designed to help teams achieve KSA PDPL compliance and adjacent privacy frameworks.</p>
          </div>
          <div className="iso-footer-section">
            <h4>Frameworks</h4>
            <ul>
              <li><Link href="/iso-27001">ISO 27001</Link></li>
              <li><Link href="/iso-27701">ISO 27701</Link></li>
              <li><Link href="/iso-42001">ISO 42001</Link></li>
              <li><Link href="/soc-2">SOC 2</Link></li>
              <li><Link href="/ksa-pdpl">KSA PDPL</Link></li>
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
          © {new Date().getFullYear()} CalVant · KSA PDPL · Made in India
        </div>
      </footer>
    </div>
  );
};

export default KSA_PDPL;

