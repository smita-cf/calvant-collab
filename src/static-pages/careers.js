"use client";
import Image from "next/image";
// ============================================================================
// C:\CalVant_frontend-1\src\static-pages\careers.js
// ============================================================================
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Shield,
  Code2,
  Zap,
  Users,
  FileText,
  Activity,
  CheckCircle,
  TrendingUp,
  Tool,
  BookOpen,
  ArrowRight,
  Lightbulb,
  Lock,
  Gauge,
  ChevronDown,
  Menu,
  X,
  Heart,
  Globe,
  Award,
  Briefcase,
  GraduationCap,
  Coffee,
  Rocket,
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react";
import "./careers.css";
import { useIsMobile } from "@/hooks/useIsMobile";


const CareersPage = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn] = useState(typeof window !== "undefined" && !!sessionStorage.getItem("user"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const isMobile = useIsMobile();

  
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ ADDED: scroll helper (no existing logic removed)
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  // ------------------ ADD STATS HERE ------------------
  const stats = [
    { value: "50+", label: "Team Members", icon: Users },
    { value: "15+", label: "Countries", icon: Globe },
    { value: "95%", label: "Employee Satisfaction", icon: Heart },
    { value: "4.8/5", label: "Glassdoor Rating", icon: Award },
  ];

  const positions = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Bangalore, India",
      type: "Full-time",
      salary: "₹20-28 LPA",
      icon: Code2,
      description:
        "Build beautiful, responsive UX with React, TypeScript, and modern CSS frameworks.",
      requirements: [
        "5+ years React experience",
        "TypeScript expertise",
        "UI/UX passion",
        "Git mastery",
      ],
      benefits: ["Flexible hours", "Remote options", "Conference budget"],
    },
    {
      id: 2,
      title: "DevOps Engineer",
      department: "Infrastructure",
      location: "Remote",
      type: "Full-time",
      salary: "₹18-25 LPA",
      icon: Zap,
      description:
        "Design scalable cloud infrastructure on AWS/GCP with CI/CD pipelines and Kubernetes.",
      requirements: [
        "4+ years DevOps experience",
        "AWS/GCP certified",
        "Kubernetes knowledge",
        "Terraform skills",
      ],
      benefits: ["100% remote", "Learning budget", "Team outings"],
    },
    {
      id: 3,
      title: "ISO 27001 Compliance Auditor",
      department: "Compliance",
      location: "New Delhi, India",
      type: "Full-time",
      salary: "₹16-22 LPA",
      icon: Gauge,
      description:
        "Lead compliance audits and certifications for enterprise clients globally.",
      requirements: [
        "ISO 27001 Lead Auditor",
        "10+ years experience",
        "Client management",
        "Documentation skills",
      ],
      benefits: [
        "Travel opportunities",
        "Client bonus",
        "Professional training",
      ],
    },
    {
      id: 4,
      title: "Security Researcher",
      department: "Security",
      location: "Remote",
      type: "Full-time",
      salary: "₹18-26 LPA",
      icon: Lock,
      description:
        "Research vulnerabilities, implement security improvements, and lead security initiatives.",
      requirements: [
        "5+ years security experience",
        "Penetration testing",
        "Vulnerability research",
        "OSINT skills",
      ],
      benefits: [
        "Remote flexibility",
        "Security conference budget",
        "HackerOne access",
      ],
    },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Salary",
      desc: "Market-leading compensation.",
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      desc: "Comprehensive medical coverage.",
    },
    {
      icon: GraduationCap,
      title: "Learning Budget",
      desc: "₹150k annual learning budget.",
    },
    { icon: Globe, title: "Remote Culture", desc: "Work from anywhere." },
  ];

  const cultureValues = [
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "Experiment and learn fast.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Work together across teams.",
    },
    {
      icon: TrendingUp,
      title: "Growth",
      description: "Clear career paths and mentorship.",
    },
    {
      icon: Shield,
      title: "Ownership",
      description: "Take responsibility and lead.",
    },
  ];

  return (
    <div className={`careers-page ${mounted ? "mounted" : ""}`}>
      {/* HEADER */}
      <header className="careers-header">
        <div className="careers-header-content">
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

          <nav className="careers-header-nav">
            {/* UPDATED NAVBAR */}
            <ul
              className={`careers-nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}
            >
              <li>
                <button
                  className="careers-nav-link"
                  onClick={() => scrollToSection("positions")}
                >
                  Positions
                </button>
              </li>
              <li>
                <button
                  className="careers-nav-link"
                  onClick={() => scrollToSection("culture")}
                >
                  Culture
                </button>
              </li>
              <li>
                <button
                  className="careers-nav-link"
                  onClick={() => scrollToSection("process")}
                >
                  Hiring
                </button>
              </li>
              <li>
                <button
                  className="careers-nav-link"
                  onClick={() => scrollToSection("benefits")}
                >
                  Benefits
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
                    className="careers-nav-link careers-nav-link-cta"
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
      <section className="careers-hero-section">
        <div className="careers-hero-content">
          <div className="careers-hero-badge">
            <span>Join Our Team</span>
          </div>
          <h1 className="careers-hero-title">Build the Future of Compliance</h1>
          <p className="careers-hero-subtitle">
            Join a talented team of engineers, security experts, and compliance
            specialists building enterprise-grade compliance technology.
            Competitive pay, amazing culture, and unlimited learning
            opportunities.
          </p>
          <div className="careers-hero-cta">
            <Link href="#positions" className="careers-cta-primary">
              Explore Positions
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="careers-stats-section">
        <div className="careers-stats-grid">
          {stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div key={idx} className="careers-stat-card">
                <StatIcon size={32} />
                <h3 className="careers-stat-number">{stat.value}</h3>
                <p className="careers-stat-label">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY JOIN SECTION */}
      <section className="careers-why-section">
        <div className="careers-section-header">
          <h2 className="careers-section-title">Why Join CalVant</h2>
          <p className="careers-section-subtitle">
            We're building something special. Here's what makes us different.
          </p>
        </div>
        <div className="careers-benefits-grid">
          {benefits.map((benefit, idx) => {
            const BenefitIcon = benefit.icon;
            return (
              <div key={idx} className="careers-benefit-card">
                <div className="careers-benefit-icon">
                  <BenefitIcon size={24} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* OPEN POSITIONS */}
      <section id="positions" className="careers-positions-section">
        <div className="careers-section-header">
          <h2 className="careers-section-title">Open Positions</h2>
          <p className="careers-section-subtitle">
            We're growing fast! Check out our open roles and find your next
            opportunity.
          </p>
        </div>
        <div className="careers-positions-grid">
          {positions.map((position) => {
            const PositionIcon = position.icon;
            const isExpanded = activeJobId === position.id;
            return (
              <div
                key={position.id}
                className={`careers-position-card ${isExpanded ? "expanded" : ""}`}
              >
                <div className="careers-position-header">
                  <div className="careers-position-top">
                    <div className="careers-position-icon">
                      <PositionIcon size={32} />
                    </div>
                    <div className="careers-position-info">
                      <h3 className="careers-position-title">
                        {position.title}
                      </h3>
                      <div className="careers-position-meta">
                        <span className="careers-meta-item">
                          <MapPin size={14} /> {position.location}
                        </span>
                        <span className="careers-meta-item">
                          <Clock size={14} /> {position.type}
                        </span>
                        <span className="careers-meta-item">
                          <DollarSign size={14} /> {position.salary}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="careers-position-tags">
                    <span className="careers-tag">{position.department}</span>
                  </div>
                </div>

                <p className="careers-position-desc">{position.description}</p>

                {isExpanded && (
                  <div className="careers-position-details">
                    <div className="careers-details-section">
                      <h4>Key Requirements</h4>
                      <ul className="careers-requirements-list">
                        {position.requirements.map((req, idx) => (
                          <li key={idx}>
                            <CheckCircle size={16} />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="careers-details-section">
                      <h4>What We Offer</h4>
                      <ul className="careers-benefits-list">
                        {position.benefits.map((benefit, idx) => (
                          <li key={idx}>
                            <CheckCircle size={16} />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="careers-position-footer">
                  <button
                    className="careers-expand-btn"
                    onClick={() =>
                      setActiveJobId(isExpanded ? null : position.id)
                    }
                  >
                    {isExpanded ? "Show Less" : "View Details"}
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </button>
                  {isLoggedIn ? (
                    <Link
                      href="mailto:careers@calvant.com"
                      className="careers-apply-btn"
                    >
                      Apply Now
                    </Link>
                  ) : (
                    <p className="careers-login-warning">
                      Only logged-in users can apply.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CULTURE SECTION */}
      <section className="careers-culture-section">
        <div className="careers-section-header">
          <h2 className="careers-section-title">Our Culture & Values</h2>
          <p className="careers-section-subtitle">
            We believe in innovation, collaboration, and continuous learning.
          </p>
        </div>
        <div className="careers-culture-grid">
          {cultureValues.map((value, idx) => {
            const ValueIcon = value.icon;
            return (
              <div key={idx} className="careers-culture-card">
                <div className="careers-culture-icon">
                  <ValueIcon size={32} />
                </div>
                <h4>{value.title}</h4>
                <p>{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HIRING PROCESS */}
      <section className="careers-process-section">
        <div className="careers-section-header">
          <h2 className="careers-section-title">Our Hiring Process</h2>
          <p className="careers-section-subtitle">
            Fair, transparent, and respectful. Here's what to expect.
          </p>
        </div>
        <div className="careers-process-timeline">
          <div className="careers-process-step">
            <div className="careers-process-number">1</div>
            <div className="careers-process-content">
              <h4>Application Review</h4>
              <p>We review your resume and portfolio (24-48 hours)</p>
            </div>
          </div>
          <div className="careers-process-step">
            <div className="careers-process-number">2</div>
            <div className="careers-process-content">
              <h4>Initial Screen Call</h4>
              <p>
                30-min call with our HR team to discuss your background (Week 1)
              </p>
            </div>
          </div>
          <div className="careers-process-step">
            <div className="careers-process-number">3</div>
            <div className="careers-process-content">
              <h4>Technical/Domain Assessment</h4>
              <p>Role-specific assessment or assignment (Week 2)</p>
            </div>
          </div>
          <div className="careers-process-step">
            <div className="careers-process-number">4</div>
            <div className="careers-process-content">
              <h4>Team Interviews</h4>
              <p>2-3 rounds with engineering/product team members (Week 3)</p>
            </div>
          </div>
          <div className="careers-process-step">
            <div className="careers-process-number">5</div>
            <div className="careers-process-content">
              <h4>Final Round + Offer</h4>
              <p>Leadership interview and offer discussion (Week 4)</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="careers-testimonials-section">
        <div className="careers-section-header">
          <h2 className="careers-section-title">What Our Team Says</h2>
          <p className="careers-section-subtitle">
            Hear from people who work here
          </p>
        </div>
        <div className="careers-testimonials-grid">
          <div className="careers-testimonial-card">
            <div className="careers-testimonial-stars">★★★★★</div>
            <p className="careers-testimonial-quote">
              "Best place I've worked at! The team is incredibly talented and
              supportive. Real career growth opportunities and flexible work
              culture."
            </p>
            <div className="careers-testimonial-author">
              <div className="careers-testimonial-name">,,,,,</div>
              <p className="careers-testimonial-role">
                Senior Frontend Developer
              </p>
            </div>
          </div>
          <div className="careers-testimonial-card">
            <div className="careers-testimonial-stars">★★★★★</div>
            <p className="careers-testimonial-quote">
              "Working on compliance problems that impact real organizations.
              Great mentorship and learning opportunities. Would definitely
              recommend!"
            </p>
            <div className="careers-testimonial-author">
              <div className="careers-testimonial-name">,,,,,,</div>
              <p className="careers-testimonial-role">DevOps Engineer</p>
            </div>
          </div>
          <div className="careers-testimonial-card">
            <div className="careers-testimonial-stars">★★★★★</div>
            <p className="careers-testimonial-quote">
              "The leadership truly cares about employee development. Generous
              learning budget, flexible hours, and a culture that values
              work-life balance."
            </p>
            <div className="careers-testimonial-author">
              <div className="careers-testimonial-name">.,,,,,</div>
              <p className="careers-testimonial-role">Product Manager</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="careers-final-cta-section">
        <div className="careers-cta-content">
          <h2 className="careers-cta-title">Ready to Make an Impact?</h2>
          <p className="careers-cta-subtitle">
            Join 50+ talented professionals building the future of compliance.
            Apply now or reach out if you have questions!
          </p>
          {isLoggedIn ? (
            <div className="careers-cta-buttons">
              <Link href="#positions" className="careers-cta-primary">
                View All Positions
                <ArrowRight size={18} />
              </Link>
              <Link
                href="mailto:careers@calvant.com"
                className="careers-cta-secondary"
              >
                Send Your Resume
              </Link>
            </div>
          ) : (
            <div className="careers-login-warning-box">
              <p className="careers-login-warning">
                Only logged-in users can apply or send resumes.
              </p>
              <Link href="/login" className="careers-login-link">
                Login to Continue
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="careers-footer">
        <div className="careers-footer-content">
          <div className="careers-footer-section">
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
          <div className="careers-footer-section">
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
          <div className="careers-footer-section">
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
          <div className="careers-footer-section">
            <h4>Contact</h4>
            <ul>
              <li>
                <Link href="mailto:careers@calvant.com">careers@calvant.com</Link>
              </li>
              <li>
                <Link href="mailto:support@calvant.com">support@calvant.com</Link>
              </li>
              <li>
                <Link href="tel:+918800000000">+91 8800 000 000</Link>
              </li>
              <li>
                <Link
                  href="https://www.linkedin.com/company/cf-it-risk-compliance/posts/?feedView=all"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="careers-footer-bottom">
          © {new Date().getFullYear()} CalVant. All rights reserved. Made in
          India 🇮🇳
        </div>
      </footer>
    </div>
  );
};

export default CareersPage;


