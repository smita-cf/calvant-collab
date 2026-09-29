// C:\CalVant_frontend-1\src\static-pages\about.js
"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Helmet } from "react-helmet-async";
import {
  Shield,
  Zap,
  BarChart3,
  Users,
  FileText,
  Activity,
  CheckCircle,
  TrendingUp,
  Wrench,
  BookOpen,
  ArrowRight,
  Lightbulb,
  Lock,
  Gauge,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import "./about.css";
import Link from "next/link";
import { useIsMobile } from "@/hooks/useIsMobile";
const AboutPage = () => {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  
  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!sessionStorage.getItem("user"));
  }, []);
  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (section) => {
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className={`about-page ${mounted ? "mounted" : ""}`}>
      <header className="about-header">
        <div className="about-header-content">
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
              onClick={() => router.push("/")}
            />
          </div>
          <nav className="about-header-nav">
            <ul
              className={`about-nav-links ${
                mobileMenuOpen ? "mobile-open" : ""
              }`}
            >
              <li>
                <button
                  className="about-nav-link"
                  onClick={() => {
                    scrollToSection("overview");
                    setMobileMenuOpen(false);
                  }}
                >
                  Overview
                </button>
              </li>

              <li>
                <button
                  className="about-nav-link"
                  onClick={() => {
                    scrollToSection("mission");
                    setMobileMenuOpen(false);
                  }}
                >
                  Mission
                </button>
              </li>

              <li>
                <button
                  className="about-nav-link"
                  onClick={() => {
                    scrollToSection("team");
                    setMobileMenuOpen(false);
                  }}
                >
                  Team
                </button>
              </li>

              <li>
                <button
                  className="about-nav-link"
                  onClick={() => {
                    scrollToSection("benefits");
                    setMobileMenuOpen(false);
                  }}
                >
                  Why Us
                </button>
              </li>

              <Link href="/" className="about-nav-link">
                {" "}
                Home{" "}
              </Link>

              {/* LOGIN BUTTON (only when not logged in) */}
              {!isLoggedIn && (
                <li>
                  <Link
                    href="/login"
                    className="about-nav-link about-nav-link-cta"
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

      {/* HERO SECTION */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <div className="about-hero-badge">
            <span>Our Story</span>
          </div>
          <h1 className="about-hero-title">About CalVant</h1>
          <p className="about-hero-subtitle">
            CalVant empowers organizations to achieve ISO 27001, ISO 27701, ISO
            42001, SOC2 and other compliance with modern dashboards, real-time
            monitoring, and intelligent insights. Our platform enables
            enterprises to streamline risk management, automate compliance
            workflows, and ensure audit readiness with confidence.
          </p>
          <div className="about-hero-stats">
            <div className="about-stat-item">
              <div className="about-stat-value">500+</div>
              <span>Organizations Secured</span>
            </div>
            <div className="about-stat-item">
              <div className="about-stat-value">100K+</div>
              <span>Risks Identified</span>
            </div>
            <div className="about-stat-item">
              <div className="about-stat-value">99.9%</div>
              <span>Uptime SLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW SECTION */}
      <section id="overview" className="about-overview-section">
        <div className="about-section-header">
          <h2 className="about-section-title">Who We Are</h2>
          <p className="about-section-subtitle">
            Transforming compliance from a burden into a strategic advantage
          </p>
        </div>
        <div className="about-overview-grid">
          <div className="about-overview-card">
            <div className="about-card-icon">
              <Shield size={32} />
            </div>
            <h3>ISO Certified Platform</h3>
            <p>
              Purpose-built for ISO 27001 & 27701 frameworks with pre-configured
              controls and compliance workflows tailored for enterprises.
            </p>
          </div>
          <div className="about-overview-card">
            <div className="about-card-icon">
              <Zap size={32} />
            </div>
            <h3>Lightning-Fast Deployment</h3>
            <p>
              Cloud-ready architecture with zero-config setup. Most
              organizations go live in 2-4 weeks, not months. Full onboarding
              support included.
            </p>
          </div>
          <div className="about-overview-card">
            <div className="about-card-icon">
              <BarChart3 size={32} />
            </div>
            <h3>Real-Time Intelligence</h3>
            <p>
              Live dashboards with risk metrics, compliance status, and audit
              trails. Make data-driven decisions with actionable insights.
            </p>
          </div>
          <div className="about-overview-card">
            <div className="about-card-icon">
              <Users size={32} />
            </div>
            <h3>Team Collaboration</h3>
            <p>
              Streamline workflows with task assignments, approval chains, and
              evidence management. Keep your entire security team aligned.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section id="mission" className="about-mission-section">
        <div className="about-section-header">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-section-subtitle">
            Making enterprise-grade compliance accessible to organizations of
            all sizes
          </p>
        </div>
        <div className="about-mission-grid">
          <div className="about-mission-card">
            <div className="about-mission-card-header">
              <Lightbulb size={24} />
              <h4>Simplify Compliance</h4>
            </div>
            <p>
              Compliance shouldn't require extensive manual work or expensive
              consultants. We automate the tedious parts so your team can focus
              on strategic security initiatives.
            </p>
          </div>
          <div className="about-mission-card">
            <div className="about-mission-card-header">
              <Lock size={24} />
              <h4>Protect What Matters</h4>
            </div>
            <p>
              Through continuous monitoring, automated controls, and real-time
              incident detection, we help you maintain a strong security posture
              and respond to threats instantly.
            </p>
          </div>
          <div className="about-mission-card">
            <div className="about-mission-card-header">
              <TrendingUp size={24} />
              <h4>Enable Growth</h4>
            </div>
            <p>
              Compliance isn't a roadblock—it's an enabler. CalVant accelerates
              your audit readiness so you can win customer trust and expand your
              business.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section id="team" className="about-team-section">
        <div className="about-section-header">
          <h2 className="about-section-title">Leadership Team</h2>
          <p className="about-section-subtitle">
            Security experts with 5+ years of combined compliance and security
            experience
          </p>
        </div>
        <div className="about-team-grid">
          {/* <div className="about-team-card">
            <div className="about-team-avatar">
              <Users size={32} />
            </div>
            <h3>ARGHYA BANDHYOPADHYAY</h3>
            <p className="about-team-role">PROJECT MANAGER</p>
            <p className="about-team-bio">
              ISO 27001 Lead Auditor with 15+ years driving enterprise
              compliance transformations for Fortune 500 companies.
            </p>
          </div> */}
          <div className="about-team-card">
            <div className="about-team-avatar">
              <Users size={32} />
            </div>
            <h3>AMIT KUMAR DEY</h3>
            <p className="about-team-role">CEO</p>
            <p className="about-team-bio">
              Amit is a thought leader in the Management Consulting industry. He
              drives the strategy, branding, P&amp;L, and delivery assurance for
              the Management Consulting business line at Calvant.
            </p>
          </div>
          <div className="about-team-card">
            <div className="about-team-avatar">
              <Wrench size={32} />
            </div>
            <h3>SAIKAT BASU</h3>
            <p className="about-team-role">Head of Practice: IT Advisory</p>
            <p className="about-team-bio">
              Saikat is a recognized leader in the IT Advisory space. He leads
              the IT Advisory practice for Calvant across the EMEA and North
              America regions.
            </p>
          </div>
          <div className="about-team-card">
            <div className="about-team-avatar">
              <Gauge size={32} />
            </div>
            <h3>KRISTINE ROBERTS</h3>
            <p className="about-team-role">Advisor</p>
            <p className="about-team-bio">
              Kristine is a veteran in the global IT industry. She specializes
              in program management of major IT transformation engagements. She
              guides on the go-to-market strategy of CalVant in the north
              American region.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="about-benefits-section">
        <div className="about-section-header">
          <h2 className="about-section-title">Why Choose CalVant</h2>
          <p className="about-section-subtitle">
            Trusted by security leaders at leading organizations worldwide
          </p>
        </div>
        <div className="about-benefits-grid">
          <div className="about-benefit-card">
            <div className="about-benefit-header">
              <CheckCircle size={24} />
              <h3>Readiness Across All Major Standards</h3>
            </div>
            <p>
              A complete framework with ready-to-use controls, policies, and
              procedures for ISO 27001, ISO 27701, ISO 42001, and SOC
              compliance.
            </p>
          </div>
          <div className="about-benefit-card">
            <div className="about-benefit-header">
              <FileText size={24} />
              <h3>Smart Documentation</h3>
            </div>
            <p>
              Auto-generate audit-ready reports and documentation in seconds,
              not days.
            </p>
          </div>
          <div className="about-benefit-card">
            <div className="about-benefit-header">
              <Activity size={24} />
              <h3>Continuous Monitoring</h3>
            </div>
            <p>
              Real-time risk dashboards and automated compliance checks 24/7.
            </p>
          </div>
          <div className="about-benefit-card">
            <div className="about-benefit-header">
              <Users size={24} />
              <h3>Expert Support</h3>
            </div>
            <p>
              24/7 dedicated support from compliance and security specialists.
            </p>
          </div>
          <div className="about-benefit-card">
            <div className="about-benefit-header">
              <Zap size={24} />
              <h3>Fast Implementation</h3>
            </div>
            <p>Go live in 2-4 weeks with our proven onboarding methodology.</p>
          </div>
          <div className="about-benefit-card">
            <div className="about-benefit-header">
              <BarChart3 size={24} />
              <h3>Advanced Analytics</h3>
            </div>
            <p>
              AI-powered insights to identify risks, trends, and optimization
              opportunities.
            </p>
          </div>
          <div className="about-benefit-card">
            <div className="about-benefit-header">
              <BarChart3 size={24} />
              <h3>Multi-Framework Alignment</h3>
            </div>
            <p>
              Manage multiple standards seamlessly without duplication of
              effort.
            </p>
          </div>
          <div className="about-benefit-card">
            <div className="about-benefit-header">
              <BarChart3 size={24} />
              <h3>Audit Readiness</h3>
            </div>
            <p>
              Stay prepared at all times with centralized evidence and
              up-to-date compliance status.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="about-testimonials-section">
        <div className="about-section-header">
          <h2 className="about-section-title">What Our Customers Say</h2>
          <p className="about-section-subtitle">
            Organizations achieving compliance faster with CalVant
          </p>
        </div>
        <div className="about-testimonials-grid">
          <div className="about-testimonial-card">
            <div className="about-testimonial-stars">★★★★★</div>
            <p className="about-testimonial-quote">
              "CalVant transformed our compliance process. We reduced audit
              preparation time from 3 months to just 4 weeks. The automated
              evidence collection alone saved us hundreds of hours."
            </p>
            <div className="about-testimonial-author">
              <div className="about-testimonial-name">Sarah Johnson</div>
              <p className="about-testimonial-role">CISO, Fortune 500 Tech</p>
            </div>
          </div>
          <div className="about-testimonial-card">
            <div className="about-testimonial-stars">★★★★★</div>
            <p className="about-testimonial-quote">
              "The real-time monitoring capabilities are exceptional. We catch
              control drift and potential risks before they become problems.
              This is a game-changer for risk management."
            </p>
            <div className="about-testimonial-author">
              <div className="about-testimonial-name">Michael Chen</div>
              <p className="about-testimonial-role">
                Risk Manager, Financial Services
              </p>
            </div>
          </div>
          <div className="about-testimonial-card">
            <div className="about-testimonial-stars">★★★★★</div>
            <p className="about-testimonial-quote">
              "CalVant made ISO 27001 compliance effortless. The pre-built
              templates and guided workflows reduced our implementation time
              significantly. Highly recommended for any organization pursuing
              compliance."
            </p>
            <div className="about-testimonial-author">
              <div className="about-testimonial-name">Emily Rodriguez</div>
              <p className="about-testimonial-role">
                Compliance Officer, Healthcare
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES HIGHLIGHT */}
      <section className="about-features-section">
        <div className="about-section-header">
          <h2 className="about-section-title">
            Powerful Features for Modern Teams
          </h2>
          <p className="about-section-subtitle">
            Everything you need to manage compliance at enterprise scale
          </p>
        </div>
        <div className="about-features-list">
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <BookOpen size={20} />
            </div>
            <div>
              <h4>Comprehensive Control Library</h4>
              <p>
                Pre-mapped controls across ISO 27001, ISO 27701, ISO 42001, SOC,
                and other key frameworks
              </p>
            </div>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4>Automated Compliance Checks</h4>
              <p>
                Continuous monitoring with real-time alerts for any compliance
                gaps
              </p>
            </div>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <BarChart3 size={20} />
            </div>
            <div>
              <h4>Custom Dashboards</h4>
              <p>
                Get real-time visibility into compliance status, risks, and key
                metrics
              </p>
            </div>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <FileText size={20} />
            </div>
            <div>
              <h4>Smart Reporting</h4>
              <p>
                Generate audit-ready, executive, and stakeholder-specific
                reports instantly
              </p>
            </div>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <Users size={20} />
            </div>
            <div>
              <h4>Collaboration Tools</h4>
              <p>
                Assign tasks, track progress, and manage approvals seamlessly in
                one platform
              </p>
            </div>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <Lock size={20} />
            </div>
            <div>
              <h4>Enterprise-Grade Security</h4>
              <p>
                {" "}
                Built with strong security and privacy practices, aligned with
                global standards including GDPR
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="about-trust-section">
        <h3 className="about-trust-title">Enterprise-Grade Compliance</h3>
        <p className="about-trust-subtitle">
          Trusted by security teams at leading organizations
        </p>
        <div className="about-trust-badges">
          {/* <span className="about-trust-badge">SOC 2 Type II</span> */}
          <span className="about-trust-badge">ISO 27001</span>
          <span className="about-trust-badge">ISO 27701</span>
          <span className="about-trust-badge">ISO 42001</span>
          <span className="about-trust-badge">SOC 2</span>
          <span className="about-trust-badge">GDPR Ready</span>
          <span className="about-trust-badge">HIPAA Compliant</span>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="about-cta-section">
        <div className="about-cta-content">
          <h2 className="about-cta-title">
            Ready to Transform Your Compliance?
          </h2>
          <p className="about-cta-subtitle">
            Join 500+ organizations managing risk smarter with CalVant
          </p>

          {!isLoggedIn && (
            <div className="about-cta-buttons">
              <Link href="/login" className="about-cta-primary">
                Get Started Today
                <ArrowRight size={18} />
              </Link>
              <Link href="/demo" className="about-cta-secondary">
                Request Demo
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="about-footer">
        <div className="about-footer-content">
          <div className="about-footer-section">
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
          <div className="about-footer-section">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About Us</Link>
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
          <div className="about-footer-section">
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
              <li>
                <Link href="/compliances">Compliance</Link>
              </li>
            </ul>
          </div>
          <div className="about-footer-section">
            <h4>Contact</h4>
            <ul>
              <li>
                <Link href="mailto:support@calvant.com">
                  support@calvant.com
                </Link>
              </li>
              <li>
                <Link href="tel:+918800000000">+91 8800 000 000</Link>
              </li>
              <li>
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Twitter
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="about-footer-bottom">
          © {new Date().getFullYear()} CalVant. All rights reserved. Made in
          India 🇮🇳
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
