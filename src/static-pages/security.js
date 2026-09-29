"use client";
import Image from "next/image";
// C:\CalVant_frontend-1\src\static-pages\security.js
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Shield,
  Lock,
  Key,
  FileText,
  Database,
  AlertCircle,
  Server,
  Globe,
  Zap,
  CheckCircle,
  ShieldCheck,
  Award,
  Activity,
  Users,
  BarChart3,
  TrendingUp,
  Menu,
  X,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import "./security.css";
import { useIsMobile } from "@/hooks/useIsMobile";

const SecurityPage = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn] = useState(!!sessionStorage.getItem("user"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  
  useEffect(() => {
    setMounted(true);
  }, []);

  const securityFeatures = [
    {
      icon: Shield,
      title: "End-to-End Encryption",
      desc: "All data encrypted in transit using TLS 1.3 and at rest with AES-256.",
    },
    {
      icon: ShieldCheck,
      title: "ISO 27001 Certified",
      desc: "Our infrastructure meets international information security standards.",
    },
    {
      icon: Key,
      title: "Multi-Factor Authentication",
      desc: "Secure login with MFA options: authenticator apps, SMS, hardware keys.",
    },
    {
      icon: FileText,
      title: "Audit Logs",
      desc: "Complete audit trail of all user actions for compliance and security.",
    },
    {
      icon: Database,
      title: "Regular Backups",
      desc: "Automated daily backups with geo-redundancy across multiple regions.",
    },
    {
      icon: AlertCircle,
      title: "Incident Response",
      desc: "24/7 security monitoring with rapid response protocols in place.",
    },
  ];

  const standards = [
    {
      name: "ISO 27001",
      desc: "Information Security Management",
      icon: ShieldCheck,
    },
    { name: "ISO 27701", desc: "Privacy Information Management", icon: Lock },
    // {
    //   name: "SOC 2 Type II",
    //   desc: "Service Organization Controls",
    //   icon: Award,
    // },
    { name: "GDPR", desc: "General Data Protection Regulation", icon: Shield },
    { name: "CCPA", desc: "California Consumer Privacy Act", icon: Users },
    {
      name: "PCI DSS",
      desc: "Payment Card Industry Data Security",
      icon: Server,
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className={`security-page ${mounted ? "mounted" : ""}`}>
      {/* HEADER */}
      <header className="security-header">
        <div className="security-header-content">
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
          <nav className="security-header-nav">
            <button
              className="security-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu
                size={20}
                className={!mobileMenuOpen ? "block" : "hidden"}
              />
              <X size={20} className={mobileMenuOpen ? "block" : "hidden"} />
            </button>
            <ul
              className={`security-nav-links ${
                mobileMenuOpen ? "mobile-open" : ""
              }`}
            >
              <Link href="/" className="about-nav-link">
                {" "}
                Home{" "}
              </Link>

              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="security-nav-link security-nav-link-cta"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="security-hero-section">
        <div className="security-hero-content">
          <div className="security-hero-badge">
            <span>Trust & Protection</span>
          </div>
          <h1 className="security-hero-title">Enterprise-Grade Security</h1>
          <p className="security-hero-subtitle">
            CalVant protects your compliance data with military-grade
            encryption, continuous monitoring, and ISO 27001 certified
            infrastructure trusted by Fortune 500 companies.
          </p>
          <div className="security-hero-stats">
            <div className="security-stat-item">
              <div className="security-stat-value">99.99%</div>
              <span>Uptime SLA</span>
            </div>
            <div className="security-stat-item">
              <div className="security-stat-value">0</div>
              <span>Breaches (5 years)</span>
            </div>
            <div className="security-stat-item">
              <div className="security-stat-value">AES-256</div>
              <span>Encryption Standard</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY FEATURES */}
      <section className="security-features-section">
        <div className="security-section-header">
          <h2 className="security-section-title">Core Security Features</h2>
          <p className="security-section-subtitle">
            Multi-layered defense protecting your most sensitive compliance data
            24/7
          </p>
        </div>
        <div className="security-features-grid">
          {securityFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="security-feature-card">
                <div className="security-card-icon">
                  <Icon size={32} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMPLIANCE STANDARDS */}
      <section className="security-standards-section">
        <div className="security-section-header">
          <h2 className="security-section-title">
            Global Compliance Certifications
          </h2>
          <p className="security-section-subtitle">
            Third-party verified compliance with international security
            standards
          </p>
        </div>
        <div className="security-standards-grid">
          {standards.map((standard, idx) => {
            const Icon = standard.icon;
            return (
              <div key={idx} className="security-standard-card">
                <div className="security-standard-icon">
                  <Icon size={24} />
                </div>
                <h4>{standard.name}</h4>
                <p>{standard.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* INFRASTRUCTURE */}
      <section className="security-infrastructure-section">
        <div className="security-section-header">
          <h2 className="security-section-title">
            Secure Cloud Infrastructure
          </h2>
          <p className="security-section-subtitle">
            Built on AWS with enterprise-grade security controls at every layer
          </p>
        </div>
        <div className="security-infrastructure-grid">
          <div className="security-infra-card">
            <div className="security-infra-icon">
              <Globe size={24} />
            </div>
            <h4>Global Data Centers</h4>
            <p>
              Multi-region AWS deployment with data residency compliance across
              EU, US, APAC
            </p>
          </div>
          <div className="security-infra-card">
            <div className="security-infra-icon">
              <Shield size={24} />
            </div>
            <h4>Network Security</h4>
            <p>AWS Shield DDoS protection, WAF, NACLs, and VPC isolation</p>
          </div>
          <div className="security-infra-card">
            <div className="security-infra-icon">
              <Database size={24} />
            </div>
            <h4>Database Security</h4>
            <p>
              MongoDB Atlas with encryption, RBAC, automated backups, and audit
              logging
            </p>
          </div>
          <div className="security-infra-card">
            <div className="security-infra-icon">
              <Zap size={24} />
            </div>
            <h4>API Security</h4>
            <p>
              OAuth 2.0, JWT tokens, rate limiting, and API gateway protections
            </p>
          </div>
          <div className="security-infra-card">
            <div className="security-infra-icon">
              <Activity size={24} />
            </div>
            <h4>Monitoring</h4>
          </div>
          <div className="security-infra-card">
            <div className="security-infra-icon">
              <CheckCircle size={24} />
            </div>
            <h4>Penetration Testing</h4>
            <p>
              Quarterly external pentests and continuous vulnerability scanning
            </p>
          </div>
        </div>
      </section>

      {/* INCIDENT RESPONSE */}
      <section className="security-incident-section">
        <div className="security-section-header">
          <h2 className="security-section-title">24/7 Incident Response</h2>
          <p className="security-section-subtitle">
            Proven incident response methodology with dedicated security
            operations center
          </p>
        </div>
        <div className="security-incident-grid">
          {[
            {
              number: "01",
              title: "Detection",
              desc: "Real-time threat detection with SIEM and anomaly detection",
            },
            {
              number: "02",
              title: "Assessment",
              desc: "Rapid incident triage and scope determination within 15 minutes",
            },
            {
              number: "03",
              title: "Containment",
              desc: "Immediate threat isolation and forensic preservation",
            },
            {
              number: "04",
              title: "Eradication",
              desc: "Complete threat removal and system hardening",
            },
            {
              number: "05",
              title: "Recovery",
              desc: "Controlled restoration with validation testing",
            },
            {
              number: "06",
              title: "Lessons Learned",
              desc: "Post-incident analysis and preventive measures",
            },
          ].map((step, idx) => (
            <div key={idx} className="security-incident-card">
              <span className="security-number">{step.number}</span>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="security-trust-section">
        <h3 className="security-trust-title">Enterprise Trust Indicators</h3>
        <p className="security-trust-subtitle">
          Security leaders choose CalVant for compliance confidence
        </p>
        <div className="security-trust-badges">
          {/* <span className="security-trust-badge">SOC 2 Type II</span> */}
          <span className="security-trust-badge">ISO 27001</span>
          <span className="security-trust-badge">GDPR Compliant</span>
          <span className="security-trust-badge">AWS Well-Architected</span>
          <span className="security-trust-badge">Penetration Tested</span>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="security-cta-section">
        <div className="security-cta-content">
          <h2 className="security-cta-title">
            Ready to Secure Your Compliance?
          </h2>
          <p className="security-cta-subtitle">
            Schedule a security consultation with our compliance experts today
          </p>
          <div className="security-cta-buttons">
            <Link
              href="mailto:security@calvant.com"
              className="security-cta-primary"
            >
              Contact Security Team
              <ArrowRight size={18} />
            </Link>

            {!isLoggedIn && (
              <Link href="/demo" className="security-cta-secondary">
                Request Demo
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="security-footer">
        <div className="security-footer-content">
          <div className="security-footer-section">
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
          <div className="security-footer-section">
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
            </ul>
          </div>
          <div className="security-footer-section">
            <h4>Legal</h4>
            <ul>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/security">Security</Link>
              </li>
            </ul>
          </div>
          <div className="security-footer-section">
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
        <div className="security-footer-bottom">
          © {new Date().getFullYear()} CalVant. All rights reserved. Made in
          India 🇮🇳
        </div>
      </footer>
    </div>
  );
};

export default SecurityPage;


