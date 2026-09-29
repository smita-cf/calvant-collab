"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  FileText,
  Shield,
  Users,
  Lock,
  Key,
  Database,
  Activity,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  ArrowRight,
  Globe,
  Mail,
  BarChart3,
} from "lucide-react";
import "./terms.css";
import { useIsMobile } from "@/hooks/useIsMobile";

const TermsPage = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn] = useState(!!sessionStorage.getItem("user"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  
  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className={`terms-page ${mounted ? "mounted" : ""}`}>
      {/* HEADER - EXACT ABOUT PATTERN */}
      <header className="terms-header">
        <div className="terms-header-content">
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
          <nav className="terms-header-nav">
            <button
              className="terms-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu
                size={20}
                className={!mobileMenuOpen ? "block" : "hidden"}
              />
              <X size={20} className={mobileMenuOpen ? "block" : "hidden"} />
            </button>
            <ul
              className={`terms-nav-links ${
                mobileMenuOpen ? "mobile-open" : ""
              }`}
            >
              <li>
                <button
                  className="terms-nav-link"
                  onClick={() => scrollToSection("acceptance")}
                >
                  Acceptance
                </button>
              </li>
              <li>
                <button
                  className="terms-nav-link"
                  onClick={() => scrollToSection("services")}
                >
                  Services
                </button>
              </li>

              <Link href="/" className="about-nav-link">
                {" "}
                Home{" "}
              </Link>

              {!isLoggedIn && (
                <li>
                  <Link
                    href="/login"
                    className="terms-nav-link terms-nav-link-cta"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="terms-hero-section">
        <div className="terms-hero-content">
          <div className="terms-hero-badge">
            <span>Legal Agreement</span>
          </div>
          <h1 className="terms-hero-title">Terms of Service</h1>
          <p className="terms-hero-subtitle">
            Last updated: January 7, 2026. Please read these terms carefully
            before using CalVant.
          </p>
        </div>
      </section>

      {/* TABLE OF CONTENTS */}
      <section className="terms-toc-section">
        <div className="terms-toc-container">
          <h3 className="terms-toc-title">Quick Navigation</h3>
          <div className="terms-toc-list">
            <Link
              href="#acceptance"
              className="terms-toc-link"
              onClick={() => scrollToSection("acceptance")}
            >
              1. Acceptance of Terms
            </Link>
            <Link
              href="#services"
              className="terms-toc-link"
              onClick={() => scrollToSection("services")}
            >
              2. Description of Services
            </Link>
            <Link
              href="#accounts"
              className="terms-toc-link"
              onClick={() => scrollToSection("accounts")}
            >
              3. User Accounts & Security
            </Link>
            <Link
              href="#usage"
              className="terms-toc-link"
              onClick={() => scrollToSection("usage")}
            >
              4. Acceptable Use Policy
            </Link>
            <Link
              href="#payments"
              className="terms-toc-link"
              onClick={() => scrollToSection("payments")}
            >
              5. Payments & Billing
            </Link>
            <Link
              href="#ip"
              className="terms-toc-link"
              onClick={() => scrollToSection("ip")}
            >
              6. Intellectual Property
            </Link>
            <Link
              href="#data"
              className="terms-toc-link"
              onClick={() => scrollToSection("data")}
            >
              7. Data Ownership & Privacy
            </Link>
            <Link
              href="#limitation"
              className="terms-toc-link"
              onClick={() => scrollToSection("limitation")}
            >
              8. Limitation of Liability
            </Link>
            <Link
              href="#warranty"
              className="terms-toc-link"
              onClick={() => scrollToSection("warranty")}
            >
              9. Warranties & Disclaimers
            </Link>
            <Link
              href="#termination"
              className="terms-toc-link"
              onClick={() => scrollToSection("termination")}
            >
              10. Termination
            </Link>
            <Link
              href="#governing"
              className="terms-toc-link"
              onClick={() => scrollToSection("governing")}
            >
              11. Governing Law
            </Link>
            <Link
              href="#contact"
              className="terms-toc-link"
              onClick={() => scrollToSection("contact")}
            >
              12. Contact Information
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="terms-content-section">
        <div className="terms-content-container">
          {/* 1. ACCEPTANCE */}
          <section id="acceptance" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <FileText size={28} />
                1. Acceptance of Terms
              </h2>
            </div>
            <div className="terms-section-content">
              <p>
                By accessing or using CalVant (the "Service"), you agree to be
                bound by these Terms of Service ("Terms"), our{" "}
                <Link href="/privacy">Privacy Policy</Link>, and all applicable laws
                and regulations.
              </p>
              <p>
                If you do not agree with any part of these Terms, you must not
                use the Service.
              </p>
              <div className="terms-highlight-box">
                <h4>Who Can Use CalVant:</h4>
                <ul>
                  <li>Users 18 years or older</li>
                  <li>Entities with legal authority to enter contracts</li>
                  <li>Compliance with all applicable export/import laws</li>
                  <li>Users not subject to sanctions or trade restrictions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. SERVICES */}
          <section id="services" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <Shield size={28} />
                2. Description of Services
              </h2>
            </div>
            <div className="terms-section-content">
              <p>
                CalVant provides a SaaS compliance management platform for ISO
                27001, ISO 27701, and related security frameworks. Our platform
                includes:
              </p>
              <div className="terms-services-grid">
                <div className="terms-service-item">
                  <div className="terms-service-icon">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h5>Policy Management</h5>
                    <p>
                      Document creation, version control, approval workflows,
                      and distribution tracking
                    </p>
                  </div>
                </div>
                <div className="terms-service-item">
                  <div className="terms-service-icon">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h5>Risk Assessment</h5>
                    <p>
                      Automated risk identification, analysis, treatment
                      planning, and monitoring
                    </p>
                  </div>
                </div>
                <div className="terms-service-item">
                  <div className="terms-service-icon">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h5>Continuous Monitoring</h5>
                    <p>
                      Real-time compliance status, control effectiveness, and
                      audit trail logging
                    </p>
                  </div>
                </div>
              </div>
              <p>
                <strong>Service Levels:</strong> We target 99.9% uptime
                excluding scheduled maintenance occurring during off-peak hours
                with advance notice.
              </p>
            </div>
          </section>

          {/* 3. ACCOUNTS */}
          <section id="accounts" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <Users size={28} />
                3. User Accounts & Security
              </h2>
            </div>
            <div className="terms-section-content">
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and all activities under your account.
              </p>
              <div className="terms-responsibility-grid">
                <div className="terms-responsibility-card">
                  <Lock size={24} />
                  <h5>Your Responsibilities</h5>
                  <ul>
                    <li>Secure password management (minimum 12 characters)</li>
                    <li>Enable MFA where available</li>
                    <li>Monitor account activity regularly</li>
                    <li>Report unauthorized access immediately</li>
                  </ul>
                </div>
                <div className="terms-responsibility-card">
                  <Key size={24} />
                  <h5>Our Security Controls</h5>
                  <ul>
                    <li>OAuth 2.0 & JWT token authentication</li>
                    <li>Role-based access control (RBAC)</li>
                    <li>Comprehensive audit logging (all actions)</li>
                    <li>Session management with auto-logout</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 4. ACCEPTABLE USE */}
          <section id="usage" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <AlertCircle size={28} />
                4. Acceptable Use Policy
              </h2>
            </div>
            <div className="terms-section-content">
              <p>
                You agree NOT to use CalVant for the following prohibited
                activities:
              </p>
              <div className="terms-warning-grid">
                <div className="terms-warning-card">
                  <h5>🚫 Security Violations</h5>
                  <ul>
                    <li>Hacking or unauthorized access attempts</li>
                    <li>Malware, virus, or worm distribution</li>
                    <li>DDoS attacks or resource exhaustion</li>
                    <li>Reverse engineering or code decompilation</li>
                  </ul>
                </div>
                <div className="terms-warning-card">
                  <h5>⚖️ Illegal Activities</h5>
                  <ul>
                    <li>Fraud, phishing, or social engineering</li>
                    <li>Copyright or trademark infringement</li>
                    <li>Violating export/import control laws</li>
                    <li>Money laundering or sanctions evasion</li>
                  </ul>
                </div>
                <div className="terms-warning-card">
                  <h5>💢 Abusive Behavior</h5>
                  <ul>
                    <li>Spam, harassment, or threats</li>
                    <li>Account sharing or credential trading</li>
                    <li>Automated scraping or data harvesting</li>
                    <li>Service disruption attempts</li>
                  </ul>
                </div>
              </div>
              <div className="terms-warning-banner">
                <AlertCircle size={24} />
                <div>
                  <strong>Enforcement:</strong> Violations result in immediate
                  account suspension, data deletion, and potential criminal
                  prosecution.
                </div>
              </div>
            </div>
          </section>

          {/* 5. PAYMENTS */}
          <section id="payments" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <Database size={28} />
                5. Payments & Billing
              </h2>
            </div>
            <div className="terms-section-content">
              <p>
                All subscription fees are non-refundable except as required by
                law. Billing is processed via Stripe securely.
              </p>
              <div className="terms-billing-table">
                <table>
                  <thead>
                    <tr>
                      <th>Plan Type</th>
                      <th>Billing Cycle</th>
                      <th>Payment Terms</th>
                      <th>Cancellation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Starter</td>
                      <td>Monthly</td>
                      <td>Net 0 (immediate)</td>
                      <td>Anytime</td>
                    </tr>
                    <tr>
                      <td>Professional</td>
                      <td>Monthly/Annual</td>
                      <td>Net 0 (immediate)</td>
                      <td>30 days notice</td>
                    </tr>
                    <tr>
                      <td>Enterprise</td>
                      <td>Annual</td>
                      <td>Net 30 invoice</td>
                      <td>90 days notice</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                <strong>Late Payments:</strong> Accounts 60+ days overdue incur
                1.5% monthly interest and may be suspended. Legal collection
                fees are your responsibility.
              </p>
            </div>
          </section>

          {/* 6. IP */}
          <section id="ip" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <Shield size={28} />
                6. Intellectual Property
              </h2>
            </div>
            <div className="terms-section-content">
              <p>
                <strong>CalVant IP:</strong> All platform content, design,
                functionality, code, documentation, and branding are owned by
                CalVant or licensed partners. You receive a limited,
                non-exclusive, non-transferable license to use the platform.
              </p>
              <p>
                <strong>User Content:</strong> You retain ownership of documents
                you upload. By uploading content, you grant CalVant a worldwide
                license to process, store, and use it for service delivery. We
                never share your content without explicit consent.
              </p>
              <div className="terms-restriction-list">
                <h5>Restrictions on Use:</h5>
                <ul>
                  <li>Cannot copy, modify, or create derivatives</li>
                  <li>Cannot distribute or share access credentials</li>
                  <li>Cannot extract or reverse engineer algorithms</li>
                  <li>Cannot use platform to build competing products</li>
                  <li>Cannot frame or embed the platform without permission</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. DATA */}
          <section id="data" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <Database size={28} />
                7. Data Ownership & Privacy
              </h2>
            </div>
            <div className="terms-section-content">
              <p>
                You retain ownership of your data. CalVant processes your data
                per our <Link href="/privacy">Privacy Policy</Link> and Data
                Processing Agreement (DPA).
              </p>
              <div className="terms-data-grid">
                <div className="terms-data-card">
                  <h5>Data Protection</h5>
                  <ul>
                    <li>AES-256 encryption at rest</li>
                    <li>TLS 1.3 encryption in transit</li>
                    <li>ISO 27001 certified infrastructure</li>
                    <li>GDPR & CCPA compliant processing</li>
                  </ul>
                </div>
                <div className="terms-data-card">
                  <h5>Data Rights</h5>
                  <ul>
                    <li>Right to access your data anytime</li>
                    <li>Right to export data in standard formats</li>
                    <li>Right to deletion upon termination</li>
                    <li>Right to sub-processor approval</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 8. LIABILITY */}
          <section id="limitation" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <Activity size={28} />
                8. Limitation of Liability
              </h2>
            </div>
            <div className="terms-section-content">
              <p>
                <strong>Maximum Liability:</strong> CalVant's total liability is
                limited to fees paid in the past 12 months. This applies to all
                claims regardless of form of action.
              </p>
              <div className="terms-liability-box">
                <h5>Excluded Damages:</h5>
                <p>
                  CalVant is NOT liable for indirect, incidental, special,
                  consequential, or punitive damages including:
                </p>
                <ul>
                  <li>Loss of profits, revenue, or business opportunities</li>
                  <li>Loss of data or information</li>
                  <li>Business interruption</li>
                  <li>Damage to reputation</li>
                </ul>
              </div>
              <p>
                <em>
                  Note: Some jurisdictions do not allow these limitations, so
                  they may not apply to you.
                </em>
              </p>
            </div>
          </section>

          {/* 9. WARRANTY */}
          <section id="warranty" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <CheckCircle size={28} />
                9. Warranties & Disclaimers
              </h2>
            </div>
            <div className="terms-section-content">
              <p>
                <strong>AS-IS Provision:</strong> CalVant is provided "AS IS"
                without warranties of any kind, express or implied.
              </p>
              <div className="terms-warranty-list">
                <h5>Disclaimer of Warranties:</h5>
                <p>CalVant disclaims:</p>
                <ul>
                  <li>Fitness for a particular purpose</li>
                  <li>Merchantability or title</li>
                  <li>Non-infringement of third-party rights</li>
                  <li>Uninterrupted or error-free service</li>
                  <li>Security against all threats</li>
                </ul>
              </div>
              <p>
                <strong>User Responsibility:</strong> You are responsible for
                backup and disaster recovery of your data. We provide tools but
                not guarantees.
              </p>
            </div>
          </section>

          {/* 10. TERMINATION */}
          <section id="termination" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <AlertCircle size={28} />
                10. Termination
              </h2>
            </div>
            <div className="terms-section-content">
              <div className="terms-termination-grid">
                <div className="terms-termination-card">
                  <h5>Termination by You</h5>
                  <ul>
                    <li>Cancel anytime via account settings</li>
                    <li>30 days notice for annual plans</li>
                    <li>Data retained 30 days after cancellation</li>
                    <li>No refunds for partial months</li>
                  </ul>
                </div>
                <div className="terms-termination-card">
                  <h5>Termination by CalVant</h5>
                  <p>Immediate termination without refund if you:</p>
                  <ul>
                    <li>Violate these Terms</li>
                    <li>Engage in illegal activities</li>
                    <li>Fail to pay 60+ days overdue</li>
                    <li>Pose security or legal risk</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 11. GOVERNING LAW */}
          <section id="governing" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <Globe size={28} />
                11. Governing Law & Jurisdiction
              </h2>
            </div>
            <div className="terms-section-content">
              <p>
                These Terms are governed by the laws of India, specifically West
                Bengal, without regard to conflicts of law.
              </p>
              <p>
                <strong>Dispute Resolution:</strong>
              </p>
              <ul>
                <li>Both parties attempt good-faith negotiation first</li>
                <li>Unresolved disputes subject to arbitration in Kolkata</li>
                <li>Indian Arbitration and Conciliation Act, 1996 applies</li>
                <li>Single arbitrator appointed jointly</li>
                <li>Language: English</li>
              </ul>
            </div>
          </section>

          {/* 12. CONTACT */}
          <section id="contact" className="terms-section">
            <div className="terms-section-header">
              <h2 className="terms-section-title">
                <Mail size={28} />
                12. Contact Information
              </h2>
            </div>
            <div className="terms-section-content">
              <p>Questions about these Terms? Contact us:</p>
              <div className="terms-contact-cards">
                <div className="terms-contact-card">
                  <h5>Legal Questions</h5>
                  <p>
                    <Link href="mailto:legal@calvant.com">legal@calvant.com</Link>
                  </p>
                </div>
                <div className="terms-contact-card">
                  <h5>Support & Technical</h5>
                  <p>
                    <Link href="mailto:support@calvant.com">support@calvant.com</Link>
                  </p>
                  <p>
                    <Link href="tel:+918800000000">+91 8800 000 000</Link>
                  </p>
                </div>
                <div className="terms-contact-card">
                  <h5>Compliance & Security</h5>
                  <p>
                    <Link href="mailto:security@calvant.com">
                      security@calvant.com
                    </Link>
                  </p>
                </div>
              </div>
              <p>
                <strong>Last Updated:</strong> January 7, 2026. CalVant reserves
                the right to modify these Terms at any time. Changes become
                effective immediately upon posting.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* CTA */}
      <section className="terms-cta-section">
        <div className="terms-cta-content">
          <h2 className="terms-cta-title">Ready to Transform Compliance?</h2>
          <p className="terms-cta-subtitle">
            By using CalVant, you agree to these terms and conditions.
          </p>
          <div className="terms-cta-buttons">
            {!isLoggedIn && (
              <Link href="/login" className="terms-cta-primary">
                Get Started
                <ArrowRight size={18} />
              </Link>
            )}

            <Link href="/" className="terms-cta-secondary">
              Back Home
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER - EXACT ABOUT COPY */}
      <footer className="terms-footer">
        <div className="terms-footer-content">
          <div className="terms-footer-section">
            <h4>Product</h4>
            <ul>
              <li>
                <Link href="/iso-27001">ISO 27001</Link>
              </li>
              <li>
                <Link href="/iso-27701">ISO 27701</Link>
              </li>
              <li>
                <Link href="/risk-assessment">Risk Management</Link>
              </li>
              <li>
                <Link href="/documentation">Documentation</Link>
              </li>
            </ul>
          </div>
          <div className="terms-footer-section">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/careers">Careers</Link>
              </li>
              <li>
                <Link href="/collaboration">Collaboration</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/demo">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="terms-footer-section">
            <h4>Legal</h4>
            <ul>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/security">Security</Link>
              </li>
            </ul>
          </div>
          <div className="terms-footer-section">
            <h4>Support</h4>
            <ul>
              <li>
                <Link href="mailto:support@calvant.com">support@calvant.com</Link>
              </li>
              <li>
                <Link href="tel:+918800000000">+91 8800 000 000</Link>
              </li>
              <li>
                <Link href="https://linkedin.com" target="_blank" rel="noreferrer">
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="terms-footer-bottom">
          © {new Date().getFullYear()} CalVant. All rights reserved. Made in
          India 🇮🇳
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;


