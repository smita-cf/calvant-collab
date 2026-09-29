"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FRAMEWORK_CONFIG } from "../../context/frameworkService";
import { hasRenderablePage } from "@/utils/frameworkStaticRoutes";
import SiteHeader from "@/components/SiteHeader";
import {
  ShieldCheck,
  FileText,
  Activity,
  LogIn,
  UserCircle2,
  Lock,
  LogOut,
  TrendingUp,
  CheckCircle,
  Users,
  Zap,
  BarChart3,
  ToolCase,
  BookCheck,
  ChevronDown,
  ClipboardCheck,
  FilePen,
  ClockAlert,
  Section,
  AlignCenter,
} from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import SprintoReplica from "./SprintoReplica";
import { useIsMobile } from "@/hooks/useIsMobile";

// ============================================
// MEDIA QUERY HOOK FOR RESPONSIVE DESIGN
// ============================================
const useMediaQuery = () => {
  const isMobile = useIsMobile();
  const isSmallMobile = useIsMobile(480);

  return { isMobile, isSmallMobile };
};

// ============================================
// HERO SECTION COMPONENT
// ============================================
const Hero3DEarth = ({ isLoggedIn, user }) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className={`hero-section ${mounted ? "hero-loaded" : ""}`}>
      <div className="hero-inner">
        <div className="hero-text">
          <h1 className="hero-title">
            CalVant Approach for Unified Digital Compliance Intelligence
          </h1>
          <p className="hero-description">
            A unified digital compliance platform designed for mid-market SMBs
            to manage the entire compliance lifecycle across ISO 27001, ISO
            27701, ISO 42001, KSA PDPL, SOC 2, and other global regulatory
            frameworks.
            <span className="spacer" />
          </p>

          <p className="hero-description">
            Built as a structured, software-driven platform, it operationalizes
            information security, data privacy, and AI governance through
            integrated digital compliance, continuous control monitoring, and
            centralized audit management.
          </p>

          <p className="hero-description">
            Streamline your compliance journey with real-time visibility, clear
            accountability, and continuous monitoring — all within a single
            unified framework.
          </p>
          <p className="hero-description">
            “You no longer prepare for audits. You see your readiness every
            day.”
          </p>
          <div className="hero-cta-row">
            {isLoggedIn ? (
              <button
                className="hero-cta-primary"
                onClick={() => router.push("/risk-assessment")}
              >
                Go to Risk Dashboard
              </button>
            ) : (
              <>
                <button
                  className="hero-cta-primary"
                  onClick={() => router.push("/pricing")}
                >
                  Get 14 Days Free Trial
                </button>
                <button
                  className="hero-cta-secondary"
                  onClick={() => router.push("/demo")}
                >
                  <LogIn size={16} />
                  Get a Demo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-sphere">
          <div className="hero-sphere-inner"></div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// CORE CARDS COMPONENT
// ============================================
const CoreCards = ({ isLoggedIn, router }) => {
  const cards = [
    {
      title: "Risk Assessment",
      description:
        "Identifies, evaluates and prioritizes risks, ensuring continuous tracking across assets, vendors and business units.",
      icon: ShieldCheck,
      size: 26,
      route: isLoggedIn ? "/risk-assessment" : "/login",
    },
    {
      title: "Documentation Management",
      description:
        "Centralized document management system ensures policies, procedure and evidences remain up to date and protected from unintended changes.",
      icon: FileText,
      size: 26,
      route: isLoggedIn ? "/documentation" : "/login",
    },
    {
      title: "Gap Assessment",
      description:
        "Evaluate your controls against ISO and other standards, highlight gaps and guide implementation with a clear roadmap.",
      icon: Activity,
      size: 26,
      route: isLoggedIn ? "/gap-assessment" : "/login",
    },
    {
      title: "Task Management",
      description:
        "From assignments to completion, ensure every compliance task is visible, tracked and  done on right time.",
      icon: Activity,
      size: 26,
      route: isLoggedIn ? "/task-management" : "/login",
    },
  ];

  const handleCardClick = (route) => {
    router.push(route);
  };

  return (
    <section className="corecards-section">
      <div className="corecards-header">
        <h1>CalVant</h1>
        <h3>Your Digital Compliance Powerhouse</h3>
        <p>Choosing your right framework starts with a conversation.</p>
      </div>
      <div className="corecards-header">
        <h2>Our Core Verticals</h2>
        <p>
          The process of compliance management begins with understanding risk,
          documenting controls and closing compliance gaps.
          <br />
          CalVant aligns all four in one unified approach.
        </p>
      </div>{" "}
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <button
          className="hero-cta-primary"
          onClick={() => router.push("/login")}
        >
          Get Started
        </button>
      </div>
      <div className="corecards-grid">
        {cards.map((card, idx) => (
          <div
            key={card.title}
            className={`corecard corecard-${idx}`}
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(card.route)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleCardClick(card.route);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="corecard-icon">
              <card.icon size={card.size} />
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ============================================
// SPLIT EARTH SECTION COMPONENT
// ============================================
const SplitEarthSection = ({ isLoggedIn, router }) => (
  <section className="split-section">
    <div className="split-text">
      <h2>Keep Your Organization Continuously Compliant</h2>
      <p>
        CalVant continuously monitors your cloud, infrastructure, and business
        processes, automatically mapping controls across compliance frameworks
        such as ISO 27001, ISO 27701, ISO 42001, KSA PDPL, SOC 2, and more. Stay
        on top of what’s implemented, what’s drifting, and where your risks lie
        all in real time.
      </p>
      <ul>
        <li>
          Automated control mapping and evidence recommendations across multiple
          frameworks
        </li>
        <li> Real-time compliance posture snapshots for complete visibility</li>
        <li>
          Scenario-based views for audits, board reporting, and incident
          response
        </li>
      </ul>
    </div>
    <div className="split-visual">
      <div className="split-sphere">
        <div className="split-sphere-inner"></div>
      </div>
      <div className="split-orbit-ring"></div>
    </div>
    {!isLoggedIn && (
      <div
        style={{ textAlign: "center", marginTop: "30px", gridColumn: "1 / -1" }}
      >
        <button
          className="hero-cta-secondary"
          onClick={() => router.push("/demo")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
          }}
        >
          <LogIn size={16} />
          Get a Demo
        </button>
      </div>
    )}
  </section>
);

// ============================================
// ROTATING FEATURES COMPONENT
// ============================================
const RotatingFeatures = ({ isLoggedIn, router }) => {
  return (
    <section className="rot-pro-section flex justify-center">
      <SprintoReplica />
      {!isLoggedIn && (
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            width: "100%",
            position: "absolute",
            bottom: "20px",
          }}
        >
          <button
            className="hero-cta-secondary"
            onClick={() => router.push("/demo")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
            }}
          >
            <LogIn size={16} />
            Get a Demo
          </button>
        </div>
      )}
    </section>
  );
};

// ============================================
// WHY CalVant COMPONENT
// ============================================
const WhyCalVant = ({ isLoggedIn, router }) => {
  const pillars = [
    {
      title: "Built for Enterprise-Grade Compliance",
      icon: ShieldCheck,
      size: 24,
      desc: "CalVant offers an integrated platform that supports your team at every step, from capturing evidence to gaining meaningful insights.",
    },
    {
      title: "Automated Evidence Collection",
      icon: TrendingUp,
      size: 24,
      desc: "The incorporation of automated ticketing systems with cloud services enables instant collection of relevant logs, screenshots and documents, along with employee approvals.",
    },
    {
      title: "Framework Mapping",
      icon: Zap,
      size: 24,
      desc: "Multiple regulatory standards and controls frameworks can be managed and monitored in one location, thus avoiding the duplication of work.",
    },
    {
      title: "Role-Based Access Control",
      icon: BarChart3,
      size: 24,
      desc: "Auditors, executives and  engineers should have role-based access to ensure they can access only the information required for their responsibilities while protecting sensitive data.",
    },
    {
      title: "Compliance Dashboards",
      icon: ToolCase,
      size: 24,
      desc: "Within the enterprise, have a monitoring and visualisation of real-time compliance status across all departments, teams and regions.",
    },
    {
      title: "Audit Trail Logs",
      icon: BookCheck,
      size: 24,
      desc: "Our processes are fully documented and audited, thereby ensuring that every phase of production can be traced. Every action is recorded so that full accountability can be guaranteed.",
    },
    {
      title: "Secure Cloud Architecture",
      icon: BookCheck,
      size: 24,
      desc: "Using AWS, data is encrypted and segmented to safeguard it from malicious attacks and unauthorized access and  has been fitted with hardened security controls.",
    },
    {
      title: "Actionable AI Insights",
      icon: BookCheck,
      size: 24,
      desc: "Intelligent analysis of your company's control maturity, risk exposure and incident trends provides you with recommendations for improvement.",
    },
    {
      title: "Continuous Compliance Monitoring",
      icon: BookCheck,
      size: 24,
      desc: "Receive real-time alerts and proactive recommendations to ensure your compliance controls remain effective, while your ISMS, PIMS and AIMS continuously evolve with emerging risks.",
    },
  ];

  return (
    <section className="why-section">
      <div className="why-header">
        <h2>Why CalVant ?</h2>
        <p>
          Four core pillars that make compliance faster, smarter and
          continuously audit-ready.
        </p>
      </div>
      <div className="why-grid">
        {pillars.map((p, idx) => (
          <div key={p.title} className={`why-card why-card-${idx}`}>
            <div className="why-icon">
              <p.icon size={p.size} />
            </div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
      {!isLoggedIn && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            className="hero-cta-secondary"
            onClick={() => router.push("/demo")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
            }}
          >
            <LogIn size={16} />
            Get a Demo
          </button>
        </div>
      )}
    </section>
    // <section className="MUltiple">

    // </section>
  );
};

const MultipleSection = ({ isLoggedIn, router }) => {
  return (
    <section className="MUltiple">
      <h1 style={{ textAlign: "center", fontSize: "30px" }}>
        Multiple frameworks. One platform.
        <br />
        No duplication, no confusion
        <br />
        Just streamlined compliance.
      </h1>
    </section>
  );
};

// ============================================
// EXTRA FEATURES COMPONENT
// ============================================
const ExtraFeaturesLongScroll = ({ isLoggedIn, router }) => {
  const items = [
    {
      title: "Automated Evidence Collection",
      desc: "Connect cloud providers and ticketing tools to auto-pull screenshots, logs and  approvals.",
    },
    {
      title: "Unified Control Mapping",
      desc: "One control library mapped across multiple metrics, so you never fall apart.",
    },
    {
      title: "Role-Based Access Control",
      desc: "Give auditors, executives and  engineers tailored views without exposing sensitive data.",
    },
    {
      title: "Compliance Dashboards",
      desc: "See real-time coverage, residual risk and  exceptions in a single pane of glass.",
    },
    {
      title: "Audit Trail Logs",
      desc: "Immutable timelines for every change, ready for regulators and internal reviews.",
    },
    {
      title: "Secure Cloud Architecture",
      desc: "Built for AWS with encryption, segmentation and  hardened services.",
    },
    {
      title: "AI-Driven Recommendations",
      desc: "Let CalVant surface next-best actions based on your controls and incidents.",
    },
    {
      title: "Seamless Collaboration",
      desc: "Enable your security, IT and  compliance teams to work together effortlessly share evidence, assign tasks and  resolve issues in one platform",
    },
  ];

  return (
    <section className="extra-section">
      <div className="extra-inner">
        <h2>Built for Enterprise-Grade Compliance</h2>
        <p>
          From evidence collection to actionable insights, all in real time.
          CalVant automates data gathering across distributed systems, delivers
          live dashboards for C-suite visibility and generates audit-ready
          reports that stand up to rigorous external reviews. Designed for
          global teams, it supports multi-site deployments while enforcing
          consistent controls across ISO 27001, ISO 27701, ISO 42001, SOC 2 and
          other leading compliance frameworks.
        </p>

        <div className="extra-grid">
          {items.map((item, idx) => (
            <div key={item.title} className={`extra-card extra-card-${idx}`}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
        {!isLoggedIn && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              className="hero-cta-secondary"
              onClick={() => router.push("/demo")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
              }}
            >
              <LogIn size={16} />
              Get a Demo
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================
// RESPONSIVE HEADER DROPDOWN COMPONENT
// ============================================
const HeaderDropdown = ({ label, options }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isMobile } = useMediaQuery();

  const handleNavigate = (route) => {
    setOpen(false);
    router.push(route);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Hide on mobile
  if (isMobile) return null;

  return (
    <div
      className="header-dropdown"
      ref={dropdownRef}
      style={{ position: "relative" }}
    >
      <button
        className="header-dropdown-trigger"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          background: "transparent",
          border: "1px solid rgba(148, 163, 184, 0.35)",
          borderRadius: "8px",
          color: "#e5e7eb",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.25s ease",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(15, 23, 42, 0.9)";
          e.target.style.borderColor = "#4f46e5";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
          e.target.style.borderColor = "rgba(148, 163, 184, 0.35)";
        }}
      >
        <span>{label}</span>
        <ChevronDown
          size={16}
          style={{
            transition: "transform 0.25s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "8px",
            background: "rgba(15, 23, 42, 0.98)",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            borderRadius: "8px",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.9)",
            zIndex: 1000,
            minWidth: "180px",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleNavigate(opt.route)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                color: "#e5e7eb",
                fontSize: "14px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(79, 70, 229, 0.2)";
                e.target.style.color = "#4f46e5";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#e5e7eb";
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [frameworkNavOptions, setFrameworkNavOptions] = useState([]); // ADD THIS

  // ADD THIS — fetch frameworks for the nav dropdown (public, no auth)
  useEffect(() => {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.calvant.com";
    fetch(`${API_BASE}/framework/api/frameworks`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setFrameworkNavOptions(
          data
            .filter((fw) => fw.label && hasRenderablePage(fw))
            .map((fw) => ({ label: fw.label, route: `/frameworks/${fw.id}` })),
        );
      })
      .catch(() => {}); // fail silently — nav just won't show dropdown items
  }, []);

  // existing useEffect for user
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const { isMobile } = useMediaQuery();
  const [counters, setCounters] = useState({
    companies: 0,
    risks: 0,
    compliance: 0,
  });
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" }); // or "smooth"
  }, []);

  useEffect(() => {
    let interval;
    if (counters.companies < 500) {
      interval = setInterval(() => {
        setCounters((prev) => ({
          ...prev,
          companies: Math.min(prev.companies + 10, 500),
          risks: Math.min(prev.risks + 100, 50000),
          compliance: Math.min(prev.compliance + 1, 99),
        }));
      }, 20);
    }
    return () => clearInterval(interval);
  }, [counters]);

  // ============================================
  // LOGGED-IN USER VIEW
  // ============================================
  if (user) {
    return (
      <div className="dashboard-signed-in">
        <main className="dashboard-main">
          <Hero3DEarth isLoggedIn={true} user={user} />
          <CoreCards isLoggedIn={true} router={router} />
          <SplitEarthSection isLoggedIn={true} router={router} />
          <RotatingFeatures isLoggedIn={true} router={router} />
          <WhyCalVant isLoggedIn={true} router={router} />

          <section className="dashboard-tiles-section">
            <h3 className="dashboard-section-title">Core Modules</h3>
            <div className="dashboard-tiles-grid">
              {[
                {
                  label: "Risk Management",
                  route: "/risk-assessment",
                  description:
                    "Identify, analyze and  mitigate organizational risks before they impact your business.",
                  icon: ShieldCheck,
                  color: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-50",
                  iconColor: "text-blue-600",
                },
                {
                  label: "Documentation",
                  route: "/documentation",
                  description:
                    "Maintain audit-ready documentation and ensure compliance with industry standards.",
                  icon: FileText,
                  color: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-50",
                  iconColor: "text-purple-600",
                },
                {
                  label: "Gap Assessment",
                  route: "/gap-assessment",
                  description:
                    "Evaluate compliance gaps and get actionable insights for your organization.",
                  icon: Activity,
                  color: "from-cyan-500 to-cyan-600",
                  bgColor: "bg-cyan-50",
                  iconColor: "text-cyan-600",
                },
              ].map(
                ({
                  label,
                  route,
                  description,
                  icon: Icon,
                  color,
                  bgColor,
                  iconColor,
                }) => (
                  <div
                    key={label}
                    className="dashboard-tile"
                    onClick={() => router.push(route)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === "Enter" && router.push(route)}
                  >
                    <div className={`dashboard-tile-icon-wrapper ${bgColor}`}>
                      <Icon className={`w-12 h-12 ${iconColor}`} />
                    </div>
                    <h3 className="dashboard-tile-title">{label}</h3>
                    <p className="dashboard-tile-description">{description}</p>
                    <div
                      className={`dashboard-tile-accent bg-gradient-to-r ${color}`}
                    />
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="dashboard-features-section">
            <div className="dashboard-features-header">
              <h3 className="dashboard-section-title">Powerful Features</h3>
              <p className="dashboard-features-subtitle">
                Everything you need to manage risk and compliance at enterprise
                scale
              </p>
            </div>
            <div className="dashboard-features-grid">
              {[
                {
                  title: "Continuous Risk Monitoring",
                  description:
                    "Track vulnerabilities and security events in real-time across your entire infrastructure.",
                  icon: TrendingUp,
                },
                {
                  title: "Automated Compliance Checks",
                  description:
                    "Stay audit-ready with automated control mapping and evidence collection.",
                  icon: CheckCircle,
                },
                {
                  title: "Intelligent Analytics",
                  description:
                    "AI-powered insights help you identify trends, predict risks and  make data-driven decisions.",
                  icon: BarChart3,
                },
                {
                  title: "Team Collaboration Hub",
                  description:
                    "Assign tasks, track progress and  collaborate seamlessly with your security team.",
                  icon: Users,
                },
                {
                  title: "Custom Reporting",
                  description:
                    "Generate executive reports with actionable insights for stakeholders.",
                  icon: FileText,
                },
                {
                  title: "Enterprise-Grade Security",
                  description:
                    "Bank-level encryption and compliance with ISO 27001 and  GDPR standards.",
                  icon: ShieldCheck,
                },
              ].map((feature, idx) => (
                <div key={idx} className="dashboard-feature-card">
                  <div className="dashboard-feature-icon">
                    <feature.icon size={24} />
                  </div>
                  <h4 className="dashboard-feature-title">{feature.title}</h4>
                  <p className="dashboard-feature-description">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-metrics-section">
            <h3 className="dashboard-section-title">Our Impact</h3>
            <div className="dashboard-metrics-grid">
              <div className="dashboard-metric-card">
                <div className="dashboard-metric-value">
                  {counters.companies}
                </div>
                <div className="dashboard-metric-label">
                  Organizations Protected
                </div>
                <div className="dashboard-metric-bar">
                  <div
                    className="dashboard-metric-fill"
                    style={{ width: `${(counters.companies / 500) * 100}%` }}
                  />
                </div>
              </div>
              <div className="dashboard-metric-card">
                <div className="dashboard-metric-value">
                  {counters.risks.toLocaleString()}
                </div>
                <div className="dashboard-metric-label">
                  Risks Identified & Mitigated
                </div>
                <div className="dashboard-metric-bar">
                  <div
                    className="dashboard-metric-fill"
                    style={{ width: `${(counters.risks / 50000) * 100}%` }}
                  />
                </div>
              </div>
              <div className="dashboard-metric-card">
                <div className="dashboard-metric-value">
                  {counters.compliance}%
                </div>
                <div className="dashboard-metric-label">
                  Average Compliance Improvement
                </div>
                <div className="dashboard-metric-bar">
                  <div
                    className="dashboard-metric-fill"
                    style={{ width: `${counters.compliance}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-integrations-section">
            <h3 className="dashboard-section-title">Integrations You Love</h3>
            <p className="dashboard-section-subtitle">
              CalVant works seamlessly with 100+ enterprise tools
            </p>
            <div className="dashboard-integrations-grid">
              {[
                "AWS",
                "Azure",
                "Google Cloud",
                "ServiceNow",
                "Okta",
                "Slack",
              ].map((name, idx) => (
                <div key={idx} className="dashboard-integration-card">
                  <div className="dashboard-integration-logo">{name}</div>
                  <div className="dashboard-integration-name">{name}</div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="dashboard-footer">
          <div className="dashboard-footer-content">
            <div className="dashboard-footer-section">
              <h4>CalVant</h4>
              <p>Enterprise Risk & Compliance Management Platform</p>
            </div>
            <div className="dashboard-footer-section">
              <h4>Product</h4>
              <ul>
                <li>
                  <Link href="/risk-assessment" className="footer-link">
                    Risk Management
                  </Link>
                </li>
                <li>
                  <Link href="/compliances">Compliance</Link>
                </li>
                <li>
                  <Link href="/gap-assessment">Gap Assessment</Link>
                </li>
              </ul>
            </div>
            <div className="dashboard-footer-section">
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
            <div className="dashboard-footer-section">
              <h4>Legal</h4>
              <ul>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
                <li>
                  <Link href="/security">Security</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="dashboard-footer-bottom">
            © {new Date().getFullYear()} CalVant. All rights reserved. Made in
            India
          </div>
        </footer>

        {showChangePassword && (
          <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
        )}
      </div>
    );
  }

  // ============================================
  // GUEST USER VIEW
  // ============================================
  return (
    <div className="dashboard-guest">
      <SiteHeader />

      <main className="dashboard-main">
        <Hero3DEarth isLoggedIn={false} user={null} />
        <CoreCards isLoggedIn={false} router={router} />
        <SplitEarthSection isLoggedIn={false} router={router} />
        <RotatingFeatures isLoggedIn={false} router={router} />
        <WhyCalVant isLoggedIn={false} router={router} />
        <MultipleSection isLoggedIn={false} router={router} />
        <ExtraFeaturesLongScroll isLoggedIn={false} router={router} />

        {/* <section className="dashboard-guest-modules">
          <h3 className="dashboard-section-title">Explore Key Modules</h3>
          <div className="dashboard-tiles-grid">
            {[
              {
                label: "Risk Management",
                description:
                  "Identify, analyze and  mitigate organizational risks before they impact your business.",
                icon: ShieldCheck,
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                label: "Documentation",
                description:
                  "Maintain audit-ready documentation and ensure compliance with industry standards.",
                icon: FileText,
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50",
                iconColor: "text-purple-600",
              },
              {
                label: "Gap Assessment",
                description:
                  "Evaluate compliance gaps and get actionable insights for your organization.",
                icon: Activity,
                color: "from-cyan-500 to-cyan-600",
                bgColor: "bg-cyan-50",
                iconColor: "text-cyan-600",
              },
            ].map(
              ({
                label,
                description,
                icon: Icon,
                color,
                bgColor,
                iconColor,
              }) => (
                <div
                  key={label}
                  className="dashboard-tile dashboard-tile-disabled"
                >
                  <div className={`dashboard-tile-icon-wrapper ${bgColor}`}>
                    <Icon className={`w-12 h-12 ${iconColor}`} />
                  </div>
                  <h3 className="dashboard-tile-title">{label}</h3>
                  <p className="dashboard-tile-description">{description}</p>
                  <div
                    className={`dashboard-tile-accent bg-gradient-to-r ${color}`}
                  />
                </div>
              )
            )}
          </div>
        </section> */}
        <section className="dashboard-guest-modules">
          <h3 className="dashboard-section-title">Explore Key Modules</h3>
          <div className="dashboard-tiles-grid">
            {[
              {
                label: "Risk",
                description:
                  "Identify, analyze and  mitigate organizational risks before they impact your business.",
                icon: ShieldCheck,
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                iconColor: "text-blue-600",
                route: "/risk-assessment",
              },
              {
                label: "Policy",
                description:
                  "Maintain audit-ready documentation and ensure compliance with industry standards.",
                icon: FileText,
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50",
                iconColor: "text-purple-600",
                route: "/documentation",
              },
              {
                label: "Audit",
                description:
                  "Evaluate compliance gaps and get actionable insights for your organization.",
                icon: Activity,
                color: "from-cyan-500 to-cyan-600",
                bgColor: "bg-cyan-50",
                iconColor: "text-cyan-600",
                route: "/gap-assessment",
              },
              {
                label: "Task",
                description:
                  "From assignments to completion, ensure every compliance task is visible, tracked and  done on right time.",
                icon: ClipboardCheck,
                color: "from-cyan-500 to-cyan-600",
                bgColor: "bg-cyan-50",
                iconColor: "text-cyan-600",
                route: "/task-management",
              },
            ].map(
              ({
                label,
                description,
                icon: Icon,
                color,
                bgColor,
                iconColor,
                route,
              }) => (
                <div
                  key={label}
                  className="dashboard-tile"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/login")}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") router.push("/login");
                  }}
                >
                  <div className={`dashboard-tile-icon-wrapper ${bgColor}`}>
                    <Icon className={`w-12 h-12 ${iconColor}`} />
                  </div>
                  <h3 className="dashboard-tile-title">{label}</h3>
                  <p className="dashboard-tile-description">{description}</p>
                  <div
                    className={`dashboard-tile-accent bg-gradient-to-r ${color}`}
                  />
                </div>
              ),
            )}
          </div>
        </section>

        <section className="dashboard-features-section">
          <div className="dashboard-features-header">
            <h3 className="dashboard-section-title">Powerful Features</h3>
            <p className="dashboard-features-subtitle">
              Everything you need to manage risk and compliance at enterprise
              scale
            </p>
          </div>
          <div className="dashboard-features-grid">
            {[
              {
                title: "Continuous Risk Monitoring",
                description:
                  "Track vulnerabilities and security events in real-time across your entire infrastructure.",
                icon: TrendingUp,
              },
              {
                title: "Automated Compliance Checks",
                description:
                  "Stay audit-ready with automated control mapping and evidence collection.",
                icon: CheckCircle,
              },
              {
                title: "Intelligent Analytics",
                description:
                  "AI-powered insights help you identify trends, predict risks and  make data-driven decisions.",
                icon: BarChart3,
              },
              {
                title: "Team Collaboration Hub",
                description:
                  "Assign tasks, track progress and  collaborate seamlessly with your security team.",
                icon: Users,
              },
              {
                title: "Custom Reporting",
                description:
                  "Generate executive reports with actionable insights for stakeholders.",
                icon: FileText,
              },
              {
                title: "Enterprise-Grade Security",
                description:
                  "Built with strong encryption, secure architecture and  aligned with global security and compliance frameworks",
                icon: ShieldCheck,
              },
              {
                title: "Policy & Documentation Management",
                description:
                  "Centralize policies, procedures, and evidence in a single platform to support audits across ISO 27001, ISO 27701, ISO 42001, KSA PDPL, SOC 2, and other global compliance frameworks.",
                icon: FilePen,
              },
              {
                title: "Real-Time Audit Alerts",
                description:
                  "Receive instant notifications for control deviations, upcoming audits, or compliance gaps to stay always prepared.",
                icon: ClockAlert,
              },
            ].map((feature, idx) => (
              <div key={idx} className="dashboard-feature-card">
                <div className="dashboard-feature-icon">
                  <feature.icon size={24} />
                </div>
                <h4 className="dashboard-feature-title">{feature.title}</h4>
                <p className="dashboard-feature-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section style={{ position: "center" }}>
          <h1 style={{ textAlign: "center", fontSize: "30px" }}>
            Know your risks, track your controls and stay ahead of gaps.
            <br></br>
            With CalVant, you act before risks turn into real problems.
          </h1>
        </section>

        <section className="dashboard-metrics-section">
          <h3 className="dashboard-section-title">Our Impact</h3>
          <div className="dashboard-metrics-grid">
            <div className="dashboard-metric-card">
              <div className="dashboard-metric-value">{counters.companies}</div>
              <div className="dashboard-metric-label">
                Organizations Protected
              </div>
              <div className="dashboard-metric-bar">
                <div
                  className="dashboard-metric-fill"
                  style={{ width: `${(counters.companies / 500) * 100}%` }}
                />
              </div>
            </div>
            <div className="dashboard-metric-card">
              <div className="dashboard-metric-value">
                {counters.risks.toLocaleString()}
              </div>
              <div className="dashboard-metric-label">
                Risks Identified & Mitigated
              </div>
              <div className="dashboard-metric-bar">
                <div
                  className="dashboard-metric-fill"
                  style={{ width: `${(counters.risks / 50000) * 100}%` }}
                />
              </div>
            </div>
            <div className="dashboard-metric-card">
              <div className="dashboard-metric-value">
                {counters.compliance}%
              </div>
              <div className="dashboard-metric-label">
                Average Compliance Improvement
              </div>
              <div className="dashboard-metric-bar">
                <div
                  className="dashboard-metric-fill"
                  style={{ width: `${counters.compliance}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-integrations-section">
          <h3 className="dashboard-section-title">Integrations You Love</h3>
          <p className="dashboard-section-subtitle">
            CalVant works seamlessly with 100+ enterprise tools
          </p>
          <div className="dashboard-integrations-grid">
            {[
              "AWS",
              "Azure",
              "Google Cloud",
              "ServiceNow",
              "Okta",
              "Slack",
            ].map((name, idx) => (
              <div key={idx} className="dashboard-integration-card">
                <div className="dashboard-integration-logo">{name}</div>
                <div className="dashboard-integration-name">{name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-testimonials-section">
          <h3 className="dashboard-section-title">What Our Customers Say</h3>
          <div className="dashboard-testimonials-grid">
            {[
              {
                name: "Sarah Johnson",
                role: "CISO, Fortune 500 Tech",
                quote:
                  "CalVant transformed our compliance process. We reduced audit time by 70%.",
              },
              {
                name: "Michael Chen",
                role: "Risk Manager, Financial Services",
                quote:
                  "The real-time monitoring capabilities are exceptional. We catch potential risks before they become issues.",
              },
              {
                name: "Emily Rodriguez",
                role: "Compliance Officer, Healthcare",
                quote:
                  "CalVant made ISO 27001 compliance effortless. The automated checks save us countless hours.",
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="dashboard-testimonial-card">
                <div className="dashboard-testimonial-stars">★★★★★</div>
                <p className="dashboard-testimonial-quote">
                  "{testimonial.quote}"
                </p>
                <div className="dashboard-testimonial-author">
                  <div className="dashboard-testimonial-avatar">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="dashboard-testimonial-name">
                      {testimonial.name}
                    </div>
                    <div className="dashboard-testimonial-role">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-faq-section">
          <h3 className="dashboard-section-title">
            Frequently Asked Questions
          </h3>
          <div className="dashboard-faq-grid">
            {[
              {
                question: "How long does it take to implement CalVant?",
                answer:
                  "Most organizations are up and running within 2-4 weeks. Our onboarding team provides full support.",
              },
              {
                question: "Is CalVant compliant with industry standards?",
                answer:
                  "Yes!  ISO 27001 compliant, GDPR ready and  supports HIPAA,  and CIS frameworks.",
              },
              {
                question: "Can CalVant integrate with our existing tools?",
                answer:
                  "Absolutely. CalVant integrates with 100+ enterprise tools including AWS, Azure, ServiceNow, Okta and  Slack.",
              },
              {
                question: "What kind of support do you offer?",
                answer:
                  "We provide 24/7 enterprise support, dedicated account managers and  regular training sessions.",
              },
              {
                question: "How is pricing structured?",
                answer:
                  "Pricing is based on the number of assets monitored and features used. Contact our sales team for a custom quote.",
              },
              {
                question: "How do I get started with CalVant?",
                answer:
                  "You can get started by contacting our team for a demo. We’ll help you identify the right compliance frameworks and set up your compliance journey.",
              },
              {
                question: "Does CalVant provide real-time monitoring?",
                answer:
                  "Absolutely. CalVant continuously monitors your systems and controls, helping you detect gaps, track risks and  stay compliant at all times.",
              },
              {
                question: "Which compliance frameworks does CalVant support?",
                answer:
                  "CalVant supports multiple global frameworks including ISO 27001, ISO 27701 (privacy), ISO 42001 (AI Management), SOC 2 and KSA PDPL can be extended to additional standards based on your business needs.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className={`dashboard-faq-item ${
                  expandedFaq === idx ? "expanded" : ""
                }`}
              >
                <button
                  className="dashboard-faq-question"
                  onClick={() =>
                    setExpandedFaq(expandedFaq === idx ? null : idx)
                  }
                >
                  <span>{faq.question}</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
                {expandedFaq === idx && (
                  <div className="dashboard-faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-trust-section">
          <h4 className="dashboard-trust-title">Enterprise-Grade Trust</h4>
          <p className="dashboard-trust-subtitle">
            Trusted by the world's leading security teams
          </p>
          <div className="dashboard-trust-badges">
            {/* <span className="dashboard-trust-badge">🔐 SOC 2 Type II</span> */}
            <span className="dashboard-trust-badge">📋 ISO 27001</span>
            <span className="dashboard-trust-badge">🌍 ISO 27701</span>
            <span className="dashboard-trust-badge">🏥 ISO 42001</span>
            <span className="dashboard-trust-badge">🏛️ SOC 2</span>
            <span className="dashboard-trust-badge">📋 KSA PDPL</span>
            {/* <span className="dashboard-trust-badge">✅ CIS Frameworks</span> */}
          </div>
        </section>

        <section className="dashboard-final-cta">
          <h3 className="dashboard-cta-title">
            Ready to Transform Your Compliance?
          </h3>
          <p className="dashboard-cta-subtitle">
            Join 500+ organizations managing risk smarter with CalVant
          </p>
          <div className="dashboard-cta-buttons">
            <button
              onClick={() => router.push("/login")}
              className="dashboard-cta-primary"
            >
              Get Started Today
            </button>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <div className="dashboard-footer-content">
          <div className="dashboard-footer-section">
            <h4>CalVant</h4>
            <p>Enterprise Risk & Compliance Management Platform</p>
          </div>
          <div className="dashboard-footer-section">
            <h4>Product</h4>
            <ul>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/risk-assessment">Risk Management</Link>
              </li>
              <li>
                <Link href="/compliances">Compliance</Link>
              </li>
              <li>
                <Link href="/gap-assessment">Gap Assessment</Link>
              </li>
            </ul>
          </div>
          <div className="dashboard-footer-section">
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
            </ul>
          </div>
          <div className="dashboard-footer-section">
            <h4>Legal</h4>
            <ul>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/security">Security</Link>
              </li>
            </ul>
          </div>
          <div className="dashboard-footer-section">
            <h4>Resources</h4>
            <ul>
              <li>
                <Link href="/blog">Blogs</Link>
              </li>
              <li>
                <Link href="/datasheet">Datasheet</Link>
              </li>
              <li>
                <Link href="   ">Whitepaper</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="dashboard-footer-bottom">
          © {new Date().getFullYear()} CalVant. All rights reserved. Made in
          India
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
