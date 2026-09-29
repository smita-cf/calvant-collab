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
import "./DPDPA.css";
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

const DPDPA = () => {
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
    <div className="iso-page-root dpdpa-theme">
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
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("dpdpa-overview")}>Overview</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("dpdpa-principles")}>Principles</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("dpdpa-obligations")}>Obligations</button></li>
              <li><button type="button" className="iso-nav-link iso-nav-link-btn" onClick={() => handleScrollTo("dpdpa-benefits")}>Benefits</button></li>
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
      <section className="iso-hero dpdpa-hero">
        <div className="iso-hero-inner">
          <div className="iso-hero-content">
            <div className="iso-hero-badge dpdpa-badge">
              India DPDPA · Digital Personal Data Protection Act · भारत
            </div>

            <h1 className="iso-hero-title">
              Achieve full compliance with the <span>India Digital Personal Data Protection Act</span>.
            </h1>

            <p className="iso-hero-description">
              CalVant helps organizations operating in India or processing Indian citizens' data implement
              and maintain DPDPA compliance — enforced by the Data Protection Board of India —
              with mapped controls, consent management, data principal rights and continuous monitoring.
            </p>

            <div className="iso-hero-cta">
              {(() => {
  
                return !storedUser ? (
                  <button type="button" className="iso-hero-primary dpdpa-primary" onClick={() => goTo("/demo")}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                    Get a live DPDPA demo
                  </button>
                ) : null;
              })()}
              <button type="button" className="iso-hero-secondary" onClick={() => handleScrollTo("dpdpa-overview")}>
                View framework overview
              </button>
            </div>

            <div className="iso-hero-stats">
              <div className="iso-stat-item iso-stat-item-main">
                <span className="iso-stat-main-label">DPDPA</span>
                <span className="iso-stat-main-value dpdpa-accent">77%</span>
                <span className="iso-stat-main-sub">COMPLIANCE</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">7</span>
                <span className="iso-stat-label">Chapters</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">7</span>
                <span className="iso-stat-label">Data Rights</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">₹250Cr</span>
                <span className="iso-stat-label">Max Fine</span>
              </div>
            </div>
          </div>

          {/* DPDPA ORBIT VISUAL */}
          <div className="iso-hero-visual">
            <div className="iso-orbit-container dpdpa-orbit">
              <div className="iso-orbit-background">
                <div className="iso-orbit-ring iso-orbit-ring-1 dpdpa-ring" />
                <div className="iso-orbit-ring iso-orbit-ring-2 dpdpa-ring" />
                <div className="iso-orbit-ring iso-orbit-ring-3 dpdpa-ring" />
                <div className="iso-orbit-particle iso-orbit-p1 dpdpa-particle" />
                <div className="iso-orbit-particle iso-orbit-p2 dpdpa-particle" />
                <div className="iso-orbit-particle iso-orbit-p3 dpdpa-particle" />
              </div>

              <div className="iso-orbit-card iso-orbit-card-main">
                <div className="iso-orbit-main-title">DPDPA Compliance</div>
                <div className="iso-orbit-main-gauge">
                  <div className="iso-orbit-main-circle dpdpa-circle"><span>85%</span></div>
                  <p>7 data rights · 7 chapters covered</p>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-readiness">
                <div className="iso-orbit-card-label">DPDPA Readiness</div>
                <div className="iso-orbit-readiness-meter">
                  <div className="iso-orbit-readiness-arc dpdpa-arc" />
                  <div className="iso-orbit-readiness-needle" />
                  <div className="iso-orbit-readiness-value">92.7%</div>
                  <div className="iso-orbit-readiness-sub">India DPDPA readiness</div>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-badge">
                <div className="iso-orbit-badge dpdpa-badge-card">
                  <span className="iso-orbit-badge-top">IND</span>
                  <span className="iso-orbit-badge-bottom">DPDPA</span>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-controls">
                <div className="iso-orbit-controls-title">Obligations</div>
                <div className="iso-orbit-controls-bars">
                  <div className="iso-orbit-bar iso-orbit-bar-ok"><span className="iso-orbit-bar-label">38 Met</span></div>
                  <div className="iso-orbit-bar iso-orbit-bar-warn"><span className="iso-orbit-bar-label">7 Partial</span></div>
                  <div className="iso-orbit-bar iso-orbit-bar-fail"><span className="iso-orbit-bar-label">5 Gaps</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section id="dpdpa-overview" className="iso-section">
        <div className="iso-section-header">
          <h2>What is India's DPDPA?</h2>
          <p>
            The Digital Personal Data Protection Act 2023 (DPDPA) is India's comprehensive data privacy
            legislation, enforced by the Data Protection Board of India. It governs the processing of
            digital personal data of individuals in India — and applies to organizations outside India
            that process Indian citizens' data to offer goods or services to them.
          </p>
        </div>

        <div className="iso-overview-grid">
          <div className="iso-overview-card dpdpa-card">
            <div className="iso-card-icon dpdpa-icon"><Globe size={32} /></div>
            <h3>Extraterritorial scope</h3>
            <p>The DPDPA applies to any organization processing digital personal data of Indian data
              principals — including companies headquartered outside India that offer services to Indian users.</p>
          </div>
          <div className="iso-overview-card dpdpa-card">
            <div className="iso-card-icon dpdpa-icon"><Users size={32} /></div>
            <h3>Data principal rights</h3>
            <p>Indian citizens (data principals) hold seven enforceable rights — including access, correction,
              erasure and grievance redressal. Fiduciaries must provide clear mechanisms to fulfill these rights.</p>
          </div>
          <div className="iso-overview-card dpdpa-card">
            <div className="iso-card-icon dpdpa-icon"><AlertTriangle size={32} /></div>
            <h3>Substantial penalties</h3>
            <p>Non-compliance can result in fines of up to ₹250 crore (approximately USD 30M) for significant
              data breaches, with tiered penalties across different types of violations.</p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section id="dpdpa-principles" className="iso-section">
        <div className="iso-section-header">
          <h2>Core DPDPA principles</h2>
          <p>
            The DPDPA is built on internationally recognized data protection principles adapted for India's
            digital economy, with a unique emphasis on consent-led processing and data fiduciary obligations.
          </p>
        </div>

        <div className="iso-clauses-container">
          <div className="iso-clause-grid">
            <div className="iso-clause-card dpdpa-clause">
              <span className="iso-clause-number dpdpa-number">Section 4</span>
              <h3>Consent-based processing</h3>
              <p>Personal data may only be processed with the free, specific, informed, unconditional and unambiguous consent of the data principal — or for certain legitimate uses.</p>
              <ul>
                <li>Obtain consent through a clear notice in plain language.</li>
                <li>Provide an itemized list of data being collected and its purpose.</li>
                <li>Maintain consent records and mechanisms for withdrawal.</li>
              </ul>
            </div>

            <div className="iso-clause-card dpdpa-clause">
              <span className="iso-clause-number dpdpa-number">Section 5</span>
              <h3>Purpose and collection limitation</h3>
              <p>Personal data may only be processed for the lawful purpose for which consent was given and must not exceed what is necessary for that purpose.</p>
              <ul>
                <li>Specify the exact purpose clearly in the consent notice.</li>
                <li>Prohibit processing for any purpose not stated to the data principal.</li>
                <li>Review data collection scope against stated purposes regularly.</li>
              </ul>
            </div>

            <div className="iso-clause-card dpdpa-clause">
              <span className="iso-clause-number dpdpa-number">Section 6</span>
              <h3>Notice and transparency</h3>
              <p>Data fiduciaries must provide a clear and accessible notice before or during consent, explaining processing activities in plain language.</p>
              <ul>
                <li>Issue notices in English or any Eighth Schedule language.</li>
                <li>Enable data principals to access the consent notice at any time.</li>
                <li>Update notices when processing activities materially change.</li>
              </ul>
            </div>

            <div className="iso-clause-card dpdpa-clause">
              <span className="iso-clause-number dpdpa-number">Section 8(3)</span>
              <h3>Data accuracy and completeness</h3>
              <p>Data fiduciaries must ensure personal data processed is accurate and complete, particularly where it is used to make decisions that affect data principals.</p>
              <ul>
                <li>Implement data quality controls and validation at collection.</li>
                <li>Enable data principals to correct inaccurate or incomplete data.</li>
                <li>Maintain audit records for data correction activities.</li>
              </ul>
            </div>

            <div className="iso-clause-card dpdpa-clause">
              <span className="iso-clause-number dpdpa-number">Section 8(7)</span>
              <h3>Storage limitation and erasure</h3>
              <p>Personal data must be erased once the purpose for which it was collected is met and no legal retention requirement applies.</p>
              <ul>
                <li>Define and enforce retention periods per data category.</li>
                <li>Implement automated data erasure workflows post-purpose fulfillment.</li>
                <li>Require processors to erase data on instruction of the fiduciary.</li>
              </ul>
            </div>

            <div className="iso-clause-card dpdpa-clause">
              <span className="iso-clause-number dpdpa-number">Section 8(1) & 8(5)</span>
              <h3>Security safeguards and accountability</h3>
              <p>Data fiduciaries must implement reasonable security safeguards to prevent personal data breaches and are accountable for processors acting on their behalf.</p>
              <ul>
                <li>Implement technical and organizational security measures.</li>
                <li>Appoint a Data Protection Officer (DPO) for Significant Data Fiduciaries.</li>
                <li>Conduct periodic audits via an independent Data Auditor where required.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OBLIGATIONS */}
      <section id="dpdpa-obligations" className="iso-section">
        <div className="iso-section-header">
          <h2>Key DPDPA obligations</h2>
          <p>Organizations classified as Data Fiduciaries — including Significant Data Fiduciaries — must implement these obligations to avoid enforcement by the Data Protection Board of India.</p>
        </div>

        <div className="iso-annex-box-wrapper">
          <div className="iso-annex-intro dpdpa-annex-intro">
            <h3>Significant Data Fiduciaries face enhanced obligations</h3>
            <p>The Central Government may classify certain Data Fiduciaries as Significant Data Fiduciaries (SDFs) based on volume and sensitivity of data processed, risk to data principals and national security. SDFs must appoint a DPO based in India, engage an independent Data Auditor, conduct Data Protection Impact Assessments and comply with additional Central Government rules.</p>
          </div>
        </div>

        <div className="iso-domains-grid">
          <div className="iso-domain-card dpdpa-domain">
            <h4 className="iso-domain-title">Consent management</h4>
            <p className="iso-domain-desc">Every processing activity must be grounded in valid consent or a specified legitimate use defined under the Act.</p>
            <ul className="iso-domain-controls">
              <li>Deliver a clear, plain-language consent notice before processing</li>
              <li>Obtain explicit, itemized consent for each processing purpose</li>
              <li>Enable data principals to withdraw consent easily at any time</li>
              <li>Honor withdrawal requests and cease processing without undue delay</li>
            </ul>
          </div>

          <div className="iso-domain-card dpdpa-domain">
            <h4 className="iso-domain-title">Data principal rights (Sections 11–14)</h4>
            <p className="iso-domain-desc">Data principals hold seven rights that fiduciaries must acknowledge and fulfill within prescribed timeframes.</p>
            <ul className="iso-domain-controls">
              <li>Right to access — summary of data processed and processing activities</li>
              <li>Right to correction, completion and erasure of personal data</li>
              <li>Right to grievance redressal through a clear, accessible mechanism</li>
              <li>Right to nominate a nominee to exercise rights in case of death or incapacity</li>
            </ul>
          </div>

          <div className="iso-domain-card dpdpa-domain">
            <h4 className="iso-domain-title">Cross-border data transfers</h4>
            <p className="iso-domain-desc">Transferring personal data outside India is permitted except to countries notified by the Central Government as restricted.</p>
            <ul className="iso-domain-controls">
              <li>Map all cross-border data flows involving Indian personal data</li>
              <li>Monitor the Central Government's list of restricted countries</li>
              <li>Implement contractual safeguards with overseas data processors</li>
              <li>Ensure overseas processors comply with DPDPA obligations by contract</li>
            </ul>
          </div>

          <div className="iso-domain-card dpdpa-domain">
            <h4 className="iso-domain-title">Breach notification (Section 8(6))</h4>
            <p className="iso-domain-desc">Personal data breaches must be reported to the Data Protection Board and affected data principals as prescribed by Central Government rules.</p>
            <ul className="iso-domain-controls">
              <li>Notify the Data Protection Board upon discovery of a personal data breach</li>
              <li>Notify affected data principals of the breach and its likely impact</li>
              <li>Maintain a breach register and conduct post-incident root cause analysis</li>
              <li>Implement preventive measures to avoid recurrence</li>
            </ul>
          </div>

          <div className="iso-domain-card dpdpa-domain">
            <h4 className="iso-domain-title">Children's data — Section 9</h4>
            <p className="iso-domain-desc">Processing personal data of children (under 18) requires verifiable parental consent and prohibits harmful or tracking-based processing.</p>
            <ul className="iso-domain-controls">
              <li>Implement age verification mechanisms before processing children's data</li>
              <li>Obtain verifiable parental or guardian consent for users under 18</li>
              <li>Prohibit behavioural monitoring and targeted advertising to children</li>
              <li>Exempt certain fiduciaries under Central Government rules where applicable</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="dpdpa-benefits" className="iso-section">
        <div className="iso-section-header">
          <h2>Business impact of DPDPA compliance</h2>
          <p>DPDPA compliance is a strategic imperative for organizations serving India's 1.4 billion citizens — one of the world's fastest-growing digital economies and consumer markets.</p>
        </div>

        <div className="iso-benefits-grid">
          <div className="iso-benefit-card dpdpa-benefit">
            <div className="iso-benefit-icon dpdpa-benefit-icon"><Building2 size={32} /></div>
            <h3>Operate in India's digital economy</h3>
            <p>Processing personal data of Indian citizens requires DPDPA compliance. A robust program signals readiness to serve India's massive and rapidly expanding digital consumer base.</p>
          </div>
          <div className="iso-benefit-card dpdpa-benefit">
            <div className="iso-benefit-icon dpdpa-benefit-icon"><Shield size={32} /></div>
            <h3>Avoid substantial penalties</h3>
            <p>Fines of up to ₹250 crore for significant data breaches — combined with enforcement by the Data Protection Board — make proactive compliance the clear commercial choice.</p>
          </div>
          <div className="iso-benefit-card dpdpa-benefit">
            <div className="iso-benefit-icon dpdpa-benefit-icon"><Scale size={32} /></div>
            <h3>Align with global privacy standards</h3>
            <p>DPDPA obligations are closely aligned with GDPR principles, enabling organizations to build a unified global privacy program that satisfies multiple jurisdictions simultaneously.</p>
          </div>
          <div className="iso-benefit-card dpdpa-benefit">
            <div className="iso-benefit-icon dpdpa-benefit-icon"><Globe size={32} /></div>
            <h3>Enable cross-border data flows</h3>
            <p>Establishing compliant cross-border transfer mechanisms ensures uninterrupted data flows between Indian operations and global systems, cloud providers and business partners.</p>
          </div>
          <div className="iso-benefit-card dpdpa-benefit">
            <div className="iso-benefit-icon dpdpa-benefit-icon"><Eye size={32} /></div>
            <h3>Build trust with Indian consumers</h3>
            <p>Demonstrable DPDPA compliance builds confidence with India's digitally aware consumers — especially in sectors like fintech, healthtech, e-commerce and SaaS.</p>
          </div>
          <div className="iso-benefit-card dpdpa-benefit">
            <div className="iso-benefit-icon dpdpa-benefit-icon"><Handshake size={32} /></div>
            <h3>Strengthen data governance maturity</h3>
            <p>DPDPA drives formalization of consent management, data inventories and accountability structures — improving operational governance across the organization.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="iso-section">
        <div className="iso-cta-section dpdpa-cta">
          <h2>Ready to achieve DPDPA compliance and operate confidently in India's digital market?</h2>
          <p>See how CalVant maps DPDPA obligations to actionable controls, automates consent and data principal request workflows, and keeps you continuously compliant.</p>
          <div className="iso-cta-buttons">
            {(() => {

              return !storedUser ? (
                <button type="button" className="iso-cta-btn iso-cta-btn-primary dpdpa-cta-primary" onClick={() => goTo("/demo")}>Get a demo</button>
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
            <p>A modern compliance and security operations platform designed to help teams achieve DPDPA compliance and adjacent privacy frameworks.</p>
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
          © {new Date().getFullYear()} CalVant · DPDPA · Made in India
        </div>
      </footer>
    </div>
  );
};

export default DPDPA;


