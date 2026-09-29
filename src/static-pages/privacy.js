"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Shield,
  Lock,
  Eye,
  Users,
  Database,
  AlertCircle,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Server,
  Zap,
  Globe,
  Clock,
} from "lucide-react";
import "./privacy.css";
import { useIsMobile } from "@/hooks/useIsMobile";

const PrivacyPage = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn] = useState(!!sessionStorage.getItem("user"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const isMobile = useIsMobile();

  
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "collection", label: "Data Collection" },
    { id: "usage", label: "How We Use" },
    { id: "security", label: "Security" },
    { id: "rights", label: "Your Rights" },
  ];

  const sections = [
    {
      id: "collection",
      title: "1. Information We Collect",
      icon: Database,
      description:
        "We collect information to provide you with the best compliance management experience.",
      items: [
        {
          title: "Account Information",
          description:
            "Name, email, password, company details, job title, and organizational structure",
        },
        {
          title: "Usage Data",
          description:
            "Pages visited, features used, interactions logged, time spent, and user behavior patterns",
        },
        {
          title: "Device Information",
          description:
            "IP address, browser type, operating system, device type, and technical specifications",
        },
        {
          title: "Compliance Documents",
          description:
            "Policies, procedures, assessment data, audit reports, and compliance documents you upload",
        },
        {
          title: "Communication",
          description:
            "Messages, support tickets, feedback provided, and customer service interactions",
        },
        {
          title: "Payment Information",
          description:
            "Billing details, transaction history (processed securely via payment gateways)",
        },
      ],
    },
    {
      id: "usage",
      title: "2. How We Use Your Information",
      icon: Eye,
      description:
        "Your data is used exclusively to enhance your compliance journey.",
      items: [
        {
          title: "Service Delivery",
          description: "Provide, maintain, and improve our compliance platform",
        },
        {
          title: "Transactions",
          description: "Process transactions and send related information",
        },
        {
          title: "Support",
          description:
            "Respond to inquiries and provide dedicated customer support",
        },
        {
          title: "Analytics",
          description:
            "Monitor and analyze usage trends for continuous service improvement",
        },
        {
          title: "Security",
          description:
            "Detect and prevent fraudulent transactions and illegal activities",
        },
        {
          title: "Personalization",
          description: "Personalize your experience and recommend features",
        },
        {
          title: "Compliance",
          description: "Meet legal obligations and regulatory requirements",
        },
        {
          title: "Communications",
          description: "Send product updates and security notices",
        },
      ],
    },
    {
      id: "security",
      title: "3. Data Security & Protection",
      icon: Lock,
      description:
        "We implement military-grade security measures to protect your sensitive data.",
      items: [
        {
          title: "Encryption in Transit",
          description: "End-to-end TLS 1.3 encryption for all data transfers",
        },
        {
          title: "Encryption at Rest",
          description: "256-bit AES encryption for all stored data",
        },
        {
          title: "Infrastructure",
          description: "ISO 27001 certified,",
        },
        {
          title: "Access Control",
          description:
            "Role-based access control with multi-factor authentication",
        },
        {
          title: "Monitoring",
          description:
            "24/7 security monitoring and automated threat detection",
        },
        {
          title: "Audits",
          description:
            "Regular security audits and penetration testing by third parties",
        },
        {
          title: "Backups",
          description:
            "Automated daily backups with geo-redundant disaster recovery",
        },
        {
          title: "Updates",
          description: "Regular security patches and vulnerability management",
        },
      ],
    },
    {
      id: "sharing",
      title: "4. Information Sharing",
      icon: Users,
      description:
        "We never sell your data. Information is shared only when necessary and with your knowledge.",
      items: [
        {
          title: "Service Providers",
          description:
            "AWS (hosting), Stripe/Razorpay (payments), SendGrid (email), monitored under data processing agreements",
        },
        {
          title: "Legal Compliance",
          description:
            "Only when required by law, court orders, or regulatory investigations",
        },
        {
          title: "Business Transfers",
          description:
            "In case of merger, acquisition, bankruptcy (with prior notification)",
        },
        {
          title: "Your Explicit Consent",
          description:
            "Only for purposes you have explicitly approved in writing",
        },
        {
          title: "Aggregate Data",
          description:
            "Anonymous, aggregated data may be used for industry research and reports",
        },
      ],
    },
    {
      id: "rights",
      title: "5. Your Privacy Rights",
      icon: CheckCircle2,
      description:
        "Under GDPR, CCPA, POPIA, and other privacy laws, you have these rights.",
      items: [
        {
          title: "Right to Access",
          description:
            "Request a copy of all your personal data we hold (within 30 days)",
        },
        {
          title: "Right to Correction",
          description: "Update or correct inaccurate or incomplete information",
        },
        {
          title: "Right to Deletion",
          description:
            "Request deletion of your data (right to be forgotten) with exceptions",
        },
        {
          title: "Right to Portability",
          description:
            "Export your data in a structured, machine-readable format",
        },
        {
          title: "Right to Object",
          description: "Object to specific processing of your personal data",
        },
        {
          title: "Right to Withdraw Consent",
          description:
            "Withdraw consent for marketing communications at any time",
        },
      ],
    },
  ];

  const faqs = [
    {
      question: "How long do you retain my data?",
      answer:
        "We retain your data for as long as your account is active. After account deletion, we retain only legally required data for 7 years for tax/compliance purposes. Backup data is deleted within 90 days.",
    },
    {
      question: "Is my data transferred outside India?",
      answer:
        "Data is primarily stored in India (AWS Mumbai region). Some service providers may process data in EU/US under adequate safeguards and Data Processing Agreements complying with GDPR.",
    },
    {
      question: "Do you use cookies?",
      answer:
        "Yes, we use essential cookies for functionality and analytics cookies to improve your experience. You can control cookies in your browser settings, though this may affect platform usability.",
    },
    {
      question: "What happens if there's a data breach?",
      answer:
        "We'll notify affected users within 72 hours as required by law, provide details of the breach, and offer support. We maintain cyber insurance and incident response procedures.",
    },
    {
      question: "Can I request my data?",
      answer:
        "Yes! Submit a Data Subject Access Request to privacy@calvant.com. We'll provide your data within 30 days in a portable format at no cost.",
    },
    {
      question: "How do you handle GDPR compliance?",
      answer:
        "We're GDPR compliant with Data Processing Agreements for all customers. EU users have additional rights including data export and deletion. We have a Data Protection Officer available for questions.",
    },
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className={`privacy-page ${mounted ? "privacy-mounted" : ""}`}>
      {/* HEADER */}
      <header className="privacy-header">
        <div className="privacy-header-content">
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

          <nav className="privacy-header-nav">
            <li>
              <Link href="/" className="privacy-nav-link">
                Home
              </Link>
            </li>
            {!isLoggedIn && (
              <li>
                <Link
                  href="/login"
                  className="privacy-nav-link privacy-nav-link-cta"
                >
                  Login
                </Link>
              </li>
            )}
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="privacy-hero-section">
        <div className="privacy-hero-background">
          <div className="privacy-hero-blob"></div>
          <div className="privacy-hero-blob privacy-hero-blob-2"></div>
        </div>
        <div className="privacy-hero-content">
          <div className="privacy-hero-badge">
            <Lock size={16} />
            <span>Your Privacy Matters</span>
          </div>
          <h1 className="privacy-hero-title">Privacy & Data Protection</h1>
          <p className="privacy-hero-subtitle">
            We're transparent about how we collect, use, and protect your data.
            Your privacy is not a feature—it's a commitment.
          </p>
          <p className="privacy-last-updated">Last updated: January 7, 2026</p>
        </div>
      </section>

      {/* NAVIGATION TABS */}
      <section className="privacy-nav-tabs">
        <div className="privacy-nav-tabs-content">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`privacy-nav-tab ${
                activeSection === item.id ? "privacy-active" : ""
              }`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* OVERVIEW SECTION */}
      <section id="overview" className="privacy-overview-section">
        <div className="privacy-section-container">
          <div className="privacy-overview-header">
            <h2 className="privacy-section-title">Privacy Overview</h2>
            <p className="privacy-section-subtitle">
              CalVant is committed to protecting your privacy and ensuring
              transparency in how we handle your data.
            </p>
          </div>

          <div className="privacy-overview-grid">
            <div className="privacy-overview-card">
              <div className="privacy-overview-icon">
                <Lock size={32} />
              </div>
              <h3>Secure by Default</h3>
              <p>
                256-bit AES encryption and ISO 27001 certified infrastructure
                protect your data at all times.
              </p>
            </div>
            <div className="privacy-overview-card">
              <div className="privacy-overview-icon">
                <Eye size={32} />
              </div>
              <h3>Transparent Practices</h3>
              <p>
                We clearly explain what data we collect, why we collect it, and
                how we use it.
              </p>
            </div>
            <div className="privacy-overview-card">
              <div className="privacy-overview-icon">
                <CheckCircle2 size={32} />
              </div>
              <h3>Your Control</h3>
              <p>
                You have full rights to access, correct, delete, or export your
                personal data anytime.
              </p>
            </div>
            <div className="privacy-overview-card">
              <div className="privacy-overview-icon">
                <Globe size={32} />
              </div>
              <h3>Compliant Globally</h3>
              <p>
                GDPR, CCPA, POPIA, and other privacy laws are fully respected in
                our operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT SECTIONS */}
      <section className="privacy-content-section">
        <div className="privacy-section-container">
          {sections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div
                key={section.id}
                id={section.id}
                className="privacy-content-block"
              >
                <div className="privacy-content-header">
                  <div className="privacy-content-icon">
                    <SectionIcon size={36} />
                  </div>
                  <div>
                    <h2 className="privacy-content-title">{section.title}</h2>
                    <p className="privacy-content-description">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="privacy-items-grid">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="privacy-item-card">
                      <div className="privacy-item-header">
                        <CheckCircle2 size={20} className="privacy-item-icon" />
                        <h4>{item.title}</h4>
                      </div>
                      <p>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* COOKIES SECTION */}
      <section className="privacy-cookies-section">
        <div className="privacy-section-container">
          <h2 className="privacy-section-title">Cookies & Tracking</h2>
          <div className="privacy-cookies-grid">
            <div className="privacy-cookie-card">
              <h3>Essential Cookies</h3>
              <p>
                Required for platform functionality, security, and user
                authentication. Cannot be disabled.
              </p>
            </div>
            <div className="privacy-cookie-card">
              <h3>Analytics Cookies</h3>
              <p>
                Help us understand how you use CalVant to improve features and
                user experience.
              </p>
            </div>
            <div className="privacy-cookie-card">
              <h3>Marketing Cookies</h3>
              <p>
                Used for personalized content and marketing (you can opt-out
                anytime in settings).
              </p>
            </div>
            <div className="privacy-cookie-card">
              <h3>Third-Party Cookies</h3>
              <p>
                From trusted partners like Google Analytics. We don't control
                these but ensure compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DATA BREACH PROTOCOL */}
      <section className="privacy-security-section">
        <div className="privacy-section-container">
          <h2 className="privacy-section-title">Security Commitments</h2>
          <div className="privacy-security-grid">
            <div className="privacy-security-card">
              <Server size={28} />
              <h3>Infrastructure</h3>
              <ul>
                <li>AWS Mumbai Region (India)</li>
                {/* <li>SOC 2 Type II Certified</li> */}
                <li>99.99% Uptime SLA</li>
              </ul>
            </div>
            <div className="privacy-security-card">
              <Zap size={28} />
              <h3>Data Protection</h3>
              <ul>
                <li>256-bit AES Encryption</li>
                <li>TLS 1.3 in Transit</li>
                <li>Auto-Backups (Daily)</li>
              </ul>
            </div>
            <div className="privacy-security-card">
              <Shield size={28} />
              <h3>Compliance</h3>
              <ul>
                <li>ISO 27001 Certified</li>
                <li>GDPR Compliant</li>
                <li>CCPA Ready</li>
              </ul>
            </div>
            <div className="privacy-security-card">
              <AlertCircle size={28} />
              <h3>Incident Response</h3>
              <ul>
                <li>72-Hour Notification</li>
                <li>Breach Investigation</li>
                <li>Cyber Insurance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="privacy-faq-section">
        <div className="privacy-section-container">
          <h2 className="privacy-section-title">Frequently Asked Questions</h2>
          <div className="privacy-faq-grid">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`privacy-faq-item ${
                  expandedFaq === idx ? "privacy-expanded" : ""
                }`}
              >
                <button
                  className="privacy-faq-question"
                  onClick={() =>
                    setExpandedFaq(expandedFaq === idx ? null : idx)
                  }
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={20} />
                </button>
                {expandedFaq === idx && (
                  <div className="privacy-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="privacy-cta-section">
        <div className="privacy-cta-content">
          <h2 className="privacy-cta-title">Your Privacy, Our Priority</h2>
          <p className="privacy-cta-subtitle">
            Have questions about your data? Our privacy team is ready to help.
            Contact us anytime.
          </p>
          <div className="privacy-cta-buttons">
            <Link
              href="mailto:privacy@calvant.com"
              className="privacy-cta-primary"
            >
              Request Data Access
              <ArrowRight size={18} />
            </Link>
            <Link
              href="mailto:privacy@calvant.com"
              className="privacy-cta-secondary"
            >
              Contact Privacy Team
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="privacy-contact-section">
        <div className="privacy-section-container">
          <h2 className="privacy-section-title">Get in Touch</h2>
          <div className="privacy-contact-grid">
            <div className="privacy-contact-card">
              <Mail size={28} />
              <h3>Email</h3>
              <Link href="mailto:privacy@calvant.com">privacy@calvant.com</Link>
            </div>
            <div className="privacy-contact-card">
              <Phone size={28} />
              <h3>Phone</h3>
              <Link href="tel:+918800000000">+91 8800 000 000</Link>
            </div>
            <div className="privacy-contact-card">
              <MapPin size={28} />
              <h3>Office</h3>
              <p>Bangalore, India</p>
            </div>
            <div className="privacy-contact-card">
              <Clock size={28} />
              <h3>Response Time</h3>
              <p>24-48 Hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="privacy-footer">
        <div className="privacy-footer-content">
          <div className="privacy-footer-section">
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
          <div className="privacy-footer-section">
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
          <div className="privacy-footer-section">
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
          <div className="privacy-footer-section">
            <h4>Follow Us</h4>
            <ul>
              <li>
                <Link href="https://linkedin.com" target="_blank" rel="noreferrer">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="https://twitter.com" target="_blank" rel="noreferrer">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="https://github.com" target="_blank" rel="noreferrer">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="mailto:support@calvant.com">Support</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="privacy-footer-bottom">
          © {new Date().getFullYear()} CalVant. All rights reserved. Made in
          India 🇮🇳
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;


