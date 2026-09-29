"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  UserCircle2,
  BrainCircuit,
  BarChart3,
  RefreshCw,
  Building2,
  Shield,
  Scale,
  TrendingDown,
  Recycle,
  Handshake,
  Eye,
  GitBranch,
  Cpu,
  AlertTriangle,
  CheckSquare,
  Users,
} from "lucide-react";
import "./ISO_42001.css";
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
const ISO_42001 = () => {
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
    <div className="iso-page-root ai-theme">
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

      {/* HERO */}
      <section className="iso-hero ai-hero">
        <div className="iso-hero-inner">
          <div className="iso-hero-content">
            <div className="iso-hero-badge ai-badge">
              ISO 42001 · Artificial Intelligence Management System
            </div>

            <h1 className="iso-hero-title">
              Govern AI responsibly with a certified <span>AIMS framework</span>.
            </h1>

            <p className="iso-hero-description">
              CalVant helps you implement ISO 42001 — the world's first international standard
              for AI management — with mapped controls, risk-based governance, and clear
              accountability across your AI lifecycle.
            </p>

            <div className="iso-hero-cta">
              {(() => {
                return !storedUser ? (
                  <button type="button" className="iso-hero-primary ai-primary" onClick={() => goTo("/demo")}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                    Get a live ISO 42001 demo
                  </button>
                ) : null;
              })()}
              <button type="button" className="iso-hero-secondary" onClick={() => handleScrollTo("ai-overview")}>
                View framework overview
              </button>
            </div>

            <div className="iso-hero-stats">
              <div className="iso-stat-item iso-stat-item-main">
                <span className="iso-stat-main-label">ISO 42001</span>
                <span className="iso-stat-main-value ai-accent">82%</span>
                <span className="iso-stat-main-sub">COMPLIANCE</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">38</span>
                <span className="iso-stat-label">Controls</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">9</span>
                <span className="iso-stat-label">Clauses</span>
              </div>
              <div className="iso-stat-item">
                <span className="iso-stat-number">2</span>
                <span className="iso-stat-label">Annexes</span>
              </div>
            </div>
          </div>

          {/* AI ORBIT VISUAL */}
          <div className="iso-hero-visual">
            <div className="iso-orbit-container ai-orbit">
              <div className="iso-orbit-background">
                <div className="iso-orbit-ring iso-orbit-ring-1 ai-ring" />
                <div className="iso-orbit-ring iso-orbit-ring-2 ai-ring" />
                <div className="iso-orbit-ring iso-orbit-ring-3 ai-ring" />
                <div className="iso-orbit-particle iso-orbit-p1 ai-particle" />
                <div className="iso-orbit-particle iso-orbit-p2 ai-particle" />
                <div className="iso-orbit-particle iso-orbit-p3 ai-particle" />
              </div>

              <div className="iso-orbit-card iso-orbit-card-main">
                <div className="iso-orbit-main-title">AI Governance check</div>
                <div className="iso-orbit-main-gauge">
                  <div className="iso-orbit-main-circle ai-circle"><span>96%</span></div>
                  <p>AI systems monitored · 38 controls active</p>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-readiness">
                <div className="iso-orbit-card-label">AI Readiness</div>
                <div className="iso-orbit-readiness-meter">
                  <div className="iso-orbit-readiness-arc ai-arc" />
                  <div className="iso-orbit-readiness-needle" />
                  <div className="iso-orbit-readiness-value">97.8%</div>
                  <div className="iso-orbit-readiness-sub">AIMS readiness</div>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-badge">
                <div className="iso-orbit-badge ai-badge-card">
                  <span className="iso-orbit-badge-top">ISO</span>
                  <span className="iso-orbit-badge-bottom">42001</span>
                </div>
              </div>

              <div className="iso-orbit-card iso-orbit-card-controls">
                <div className="iso-orbit-controls-title">AI Controls</div>
                <div className="iso-orbit-controls-bars">
                  <div className="iso-orbit-bar iso-orbit-bar-ok"><span className="iso-orbit-bar-label">30 Passing</span></div>
                  <div className="iso-orbit-bar iso-orbit-bar-warn"><span className="iso-orbit-bar-label">5 Critical</span></div>
                  <div className="iso-orbit-bar iso-orbit-bar-fail"><span className="iso-orbit-bar-label">3 Failing</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section id="ai-overview" className="iso-section">
        <div className="iso-section-header">
          <h2>What is ISO 42001?</h2>
          <p>
            ISO/IEC 42001:2023 is the world's first international standard for establishing,
            implementing, maintaining and continually improving an Artificial Intelligence
            Management System (AIMS).
          </p>
        </div>

        <div className="iso-overview-grid">
          <div className="iso-overview-card ai-card">
            <div className="iso-card-icon ai-icon"><BrainCircuit size={32} /></div>
            <h3>AI-specific governance</h3>
            <p>Define scope, context, and objectives for AI systems. Establish policies and
              controls proportionate to the risks AI introduces to your organization and society.</p>
          </div>
          <div className="iso-overview-card ai-card">
            <div className="iso-card-icon ai-icon"><BarChart3 size={32} /></div>
            <h3>Risk-based AI decision-making</h3>
            <p>Identify AI-specific threats such as bias, opacity, and misuse. Evaluate
              risks across the AI lifecycle and select proportionate treatment options.</p>
          </div>
          <div className="iso-overview-card ai-card">
            <div className="iso-card-icon ai-icon"><RefreshCw size={32} /></div>
            <h3>Continuous improvement loop</h3>
            <p>Use audits, monitoring, incidents and metrics to drive corrective actions
              and keep AI controls effective as models and environments evolve.</p>
          </div>
        </div>
      </section>

      {/* CLAUSES */}
      <section id="ai-clauses" className="iso-section">
        <div className="iso-section-header">
          <h2>Core ISO 42001 clauses</h2>
          <p>
            Clauses 4–10 mirror the High Level Structure (HLS) approach used by ISO 27001,
            making integration straightforward for organizations already certified or working
            toward ISO 27001.
          </p>
        </div>

        <div className="iso-clauses-container">
          <div className="iso-clause-grid">
            <div className="iso-clause-card ai-clause">
              <span className="iso-clause-number ai-number">Clause 4</span>
              <h3>Context of the organization</h3>
              <p>Understand internal and external issues, interested parties, and the scope of your AIMS.</p>
              <ul>
                <li>Define which AI systems fall within scope.</li>
                <li>Understand AI-related legal and societal expectations.</li>
                <li>Align AI objectives with organizational strategy.</li>
              </ul>
            </div>

            <div className="iso-clause-card ai-clause">
              <span className="iso-clause-number ai-number">Clause 5</span>
              <h3>Leadership and commitment</h3>
              <p>Ensure top management is visibly accountable for responsible AI use.</p>
              <ul>
                <li>Assign AI governance roles and authorities.</li>
                <li>Establish an AI policy aligned with values.</li>
                <li>Integrate AI governance into organizational processes.</li>
              </ul>
            </div>

            <div className="iso-clause-card ai-clause">
              <span className="iso-clause-number ai-number">Clause 6</span>
              <h3>Planning and risk management</h3>
              <p>Address AI-specific risks and define measurable AI governance objectives.</p>
              <ul>
                <li>Conduct AI impact assessments.</li>
                <li>Develop risk treatment plans for AI systems.</li>
                <li>Plan how objectives will be achieved and measured.</li>
              </ul>
            </div>

            <div className="iso-clause-card ai-clause">
              <span className="iso-clause-number ai-number">Clause 7</span>
              <h3>Support</h3>
              <p>Provide resources, competence, awareness and documented information for AI governance.</p>
              <ul>
                <li>Build AI literacy across the organization.</li>
                <li>Maintain documentation of AI system design decisions.</li>
                <li>Communicate AI policies to relevant stakeholders.</li>
              </ul>
            </div>

            <div className="iso-clause-card ai-clause">
              <span className="iso-clause-number ai-number">Clause 8</span>
              <h3>Operational planning and control</h3>
              <p>Plan, implement and control processes needed to meet AI governance requirements.</p>
              <ul>
                <li>Manage AI system development and deployment.</li>
                <li>Control third-party AI providers and data processors.</li>
                <li>Maintain records of AI decisions and their rationale.</li>
              </ul>
            </div>

            <div className="iso-clause-card ai-clause">
              <span className="iso-clause-number ai-number">Clauses 9 & 10</span>
              <h3>Performance evaluation & improvement</h3>
              <p>Measure AIMS performance, run internal audits, and drive continual improvement.</p>
              <ul>
                <li>Monitor AI system KPIs and fairness metrics.</li>
                <li>Conduct regular management reviews of AI governance.</li>
                <li>Implement corrective actions for AI incidents.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section id="ai-controls" className="iso-section">
        <div className="iso-section-header">
          <h2>Annex A & B controls</h2>
          <p>ISO 42001 provides two annexes of controls: Annex A for organizations developing or using AI, and Annex B for organizations providing data or other resources for AI systems.</p>
        </div>

        <div className="iso-annex-box-wrapper">
          <div className="iso-annex-intro ai-annex-intro">
            <h3>Purpose-built AI controls</h3>
            <p>Unlike general IT security frameworks, ISO 42001 controls address the unique challenges of AI: bias, explainability, data provenance, and model drift — making it the definitive standard for trustworthy AI.</p>
          </div>
        </div>

        <div className="iso-domains-grid">
          <div className="iso-domain-card ai-domain">
            <h4 className="iso-domain-title">AI policy & governance</h4>
            <p className="iso-domain-desc">Organizational policies and governance structures for responsible AI development and deployment.</p>
            <ul className="iso-domain-controls">
              <li>AI use policy and acceptable use guidelines</li>
              <li>Roles, responsibilities and accountability</li>
              <li>AI procurement and vendor governance</li>
              <li>Stakeholder engagement and communication</li>
            </ul>
          </div>

          <div className="iso-domain-card ai-domain">
            <h4 className="iso-domain-title">AI risk & impact assessment</h4>
            <p className="iso-domain-desc">Systematic evaluation of risks introduced by AI systems across their lifecycle.</p>
            <ul className="iso-domain-controls">
              <li>AI risk assessment methodology</li>
              <li>AI impact assessment for high-risk systems</li>
              <li>Bias and fairness evaluation</li>
              <li>Societal and ethical risk considerations</li>
            </ul>
          </div>

          <div className="iso-domain-card ai-domain">
            <h4 className="iso-domain-title">AI system lifecycle</h4>
            <p className="iso-domain-desc">Controls that govern how AI systems are designed, trained, tested, deployed and retired.</p>
            <ul className="iso-domain-controls">
              <li>Data quality and data governance</li>
              <li>Model development and validation practices</li>
              <li>Testing, evaluation and performance monitoring</li>
              <li>Decommissioning and model retirement</li>
            </ul>
          </div>

          <div className="iso-domain-card ai-domain">
            <h4 className="iso-domain-title">Transparency & explainability</h4>
            <p className="iso-domain-desc">Measures that ensure AI decisions can be understood, explained and challenged by affected parties.</p>
            <ul className="iso-domain-controls">
              <li>Explainability requirements by risk level</li>
              <li>Documentation of model decision logic</li>
              <li>User and subject information rights</li>
              <li>Human oversight and intervention mechanisms</li>
            </ul>
          </div>

          <div className="iso-domain-card ai-domain">
            <h4 className="iso-domain-title">Security & robustness</h4>
            <p className="iso-domain-desc">Controls ensuring AI systems are secure against adversarial attacks and operate reliably.</p>
            <ul className="iso-domain-controls">
              <li>Adversarial attack detection and prevention</li>
              <li>Model robustness testing</li>
              <li>Data poisoning and integrity controls</li>
              <li>Incident response for AI failures</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="ai-benefits" className="iso-section">
        <div className="iso-section-header">
          <h2>Business impact of ISO 42001</h2>
          <p>Beyond certification, a well-run AIMS helps you deploy AI confidently, build stakeholder trust and meet emerging AI regulations.</p>
        </div>

        <div className="iso-benefits-grid">
          <div className="iso-benefit-card ai-benefit">
            <div className="iso-benefit-icon ai-benefit-icon"><Building2 size={32} /></div>
            <h3>Meet AI regulation requirements</h3>
            <p>ISO 42001 aligns with the EU AI Act, NIST AI RMF, and emerging national AI governance frameworks — simplifying multi-jurisdictional compliance.</p>
          </div>
          <div className="iso-benefit-card ai-benefit">
            <div className="iso-benefit-icon ai-benefit-icon"><Shield size={32} /></div>
            <h3>Demonstrate trustworthy AI</h3>
            <p>Certification proves your AI systems are governed systematically — not just promised. Build confidence with customers, regulators and partners.</p>
          </div>
          <div className="iso-benefit-card ai-benefit">
            <div className="iso-benefit-icon ai-benefit-icon"><Scale size={32} /></div>
            <h3>Manage AI-specific risks</h3>
            <p>Address bias, opacity, hallucination and misuse through structured risk assessment and treatment — before they cause harm or reputational damage.</p>
          </div>
          <div className="iso-benefit-card ai-benefit">
            <div className="iso-benefit-icon ai-benefit-icon"><Eye size={32} /></div>
            <h3>Improve AI transparency</h3>
            <p>Explainability and human oversight controls ensure affected individuals and stakeholders can understand and challenge AI-driven decisions.</p>
          </div>
          <div className="iso-benefit-card ai-benefit">
            <div className="iso-benefit-icon ai-benefit-icon"><GitBranch size={32} /></div>
            <h3>Integrate with existing ISMS</h3>
            <p>ISO 42001 shares the High Level Structure with ISO 27001, allowing you to integrate both management systems efficiently with minimal duplication.</p>
          </div>
          <div className="iso-benefit-card ai-benefit">
            <div className="iso-benefit-icon ai-benefit-icon"><Handshake size={32} /></div>
            <h3>Align AI stakeholders</h3>
            <p>A documented AIMS clarifies responsibilities for data scientists, developers, legal, and executives — reducing AI governance gaps and overlaps.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="iso-section">
        <div className="iso-cta-section ai-cta">
          <h2>Ready to make ISO 42001 your AI governance advantage?</h2>
          <p>See how CalVant helps you build a modern AIMS, govern AI systems responsibly and stay ahead of emerging regulations.</p>
          <div className="iso-cta-buttons">
            {(() => {
              return !storedUser ? (
                <button type="button" className="iso-cta-btn iso-cta-btn-primary ai-cta-primary" onClick={() => goTo("/demo")}>Get a demo</button>
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
            <p>A modern compliance and security operations platform designed to help teams operationalize ISO 42001 and adjacent frameworks.</p>
          </div>
          <div className="iso-footer-section">
            <h4>Frameworks</h4>
            <ul>
              <li><Link href="/iso-27001">ISO 27001</Link></li>
              <li><Link href="/iso-27701">ISO 27701</Link></li>
              <li><Link href="/iso-42001">ISO 42001</Link></li>
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
          © {new Date().getFullYear()} CalVant · ISO 42001 · Made in India
        </div>
      </footer>
    </div>
  );
};

export default ISO_42001;

