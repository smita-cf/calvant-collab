"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { 
  Download, ShieldCheck, Lock, Database, Shield, AlertCircle, Zap, Activity,
  Network, Cloud, HardDrive, Users, Building2, BarChart3, CheckCircle, Briefcase,
  Settings, FileText, Globe, Server, UserCircle2, ChevronRight, Zap as ZapIcon,
  TrendingUp, Lock as LockIcon
} from 'lucide-react';
import styles from './Policies.module.css';
import { useIsMobile } from "@/hooks/useIsMobile";
import './Procedures.css'

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const storedUser = getStoredUser();

const PoliciesPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [expandedBenefit, setExpandedBenefit] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const isMobile = useIsMobile();
  const isUserLoggedIn = !!storedUser;

  
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
  // Force scroll to absolute top
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  setTimeout(() => window.scrollTo(0, 0), 0);
  setMounted(true);
}, []);


  const policies = [
    // CORE & GOVERNANCE (5)
    { id: 1, title: 'Information Security Policy', desc: 'Defines principles and rules on information security management while ensuring protection of sensitive data.', icon: ShieldCheck, category: 'core', color: 'from-blue-500 to-blue-600', fileName: 'Information_Security_Policy.pdf' },
    { id: 2, title: 'ISMS Scope Document', desc: 'Defines boundaries and extent of ISMS for ISO 27001 certification audit preparation.', icon: Globe, category: 'core', color: 'from-blue-400 to-blue-500', fileName: 'ISMS_Scope_Document.pdf' },
    { id: 3, title: 'ISMS Manual Template', desc: 'Framework to design, implement, manage, and maintain effective ISMS implementation.', icon: FileText, category: 'core', color: 'from-blue-300 to-blue-400', fileName: 'ISMS_Manual_Template.pdf' },
    { id: 4, title: 'Security Roles & Responsibilities', desc: 'Ensures security accountability, risk management, and security-conscious culture.', icon: Users, category: 'core', color: 'from-blue-600 to-blue-700', fileName: 'Security_Roles_Responsibilities.pdf' },
    { id: 5, title: 'Code of Business Conduct', desc: 'Guides employees on behavior, communication norms, and positive work environment.', icon: ShieldCheck, category: 'core', color: 'from-blue-400 to-blue-600', fileName: 'Code_of_Business_Conduct.pdf' },

    // ACCESS & IDENTITY (3)
    { id: 6, title: 'Access Control Policy', desc: 'Ensures only authorized personnel have access and appropriate permissions to critical data and systems.', icon: Lock, category: 'access', color: 'from-emerald-500 to-emerald-600', fileName: 'Access_Control_Policy.pdf' },
    { id: 7, title: 'Encryption Policy', desc: 'Framework ensuring encryption requirements are met for safeguarding all data types.', icon: Lock, category: 'access', color: 'from-emerald-400 to-emerald-500', fileName: 'Encryption_Policy.pdf' },
    { id: 8, title: 'Acceptable Usage Policy', desc: 'Regulates appropriate use of digital assets and company information systems.', icon: Globe, category: 'access', color: 'from-emerald-600 to-emerald-700', fileName: 'Acceptable_Usage_Policy.pdf' },

    // DATA PROTECTION (4)
    { id: 9, title: 'Data Classification Policy', desc: 'Provides framework to categorize data based on sensitivity, importance, and criticality levels.', icon: Database, category: 'data', color: 'from-purple-500 to-purple-600', fileName: 'Data_Classification_Policy.pdf' },
    { id: 10, title: 'Data Protection Policy', desc: 'Safeguards customer sensitive data and privacy while staying compliant with data protection regulations.', icon: Shield, category: 'data', color: 'from-purple-400 to-purple-500', fileName: 'Data_Protection_Policy.pdf' },
    { id: 11, title: 'Data Retention Policy', desc: 'Guidelines for data storage, processing, management, and compliant disposal practices.', icon: FileText, category: 'data', color: 'from-purple-600 to-purple-700', fileName: 'Data_Retention_Policy.pdf' },
    { id: 12, title: 'Media Disposal Policy', desc: 'Guidelines for disposal of physical/electronic media containing sensitive information.', icon: HardDrive, category: 'data', color: 'from-purple-700 to-purple-800', fileName: 'Media_Disposal_Policy.pdf' },

    // INCIDENT & RESPONSE (2)
    { id: 13, title: 'Incident Management Policy', desc: 'Framework to identify, respond, and resolve security incidents as fast as possible.', icon: AlertCircle, category: 'incident', color: 'from-orange-500 to-orange-600', fileName: 'Incident_Management_Policy.pdf' },
    { id: 14, title: 'Data Breach Notification Policy', desc: 'Framework to identify data breach, notify authorities, and report relevant information timely.', icon: AlertCircle, category: 'incident', color: 'from-red-500 to-red-600', fileName: 'Data_Breach_Notification_Policy.pdf' },

    // OPERATIONS (5)
    { id: 15, title: 'Operations Security Policy', desc: 'Safeguards sensitive information during threats, vulnerabilities, change management, and disruptions.', icon: Activity, category: 'operations', color: 'from-sky-500 to-sky-600', fileName: 'Operations_Security_Policy.pdf' },
    { id: 16, title: 'Network Security Policy', desc: 'Guidelines on network protection, prevention of security incidents, and safeguarding sensitive information.', icon: Network, category: 'operations', color: 'from-sky-400 to-sky-500', fileName: 'Network_Security_Policy.pdf' },
    { id: 17, title: 'Patch Management Policy', desc: 'Ensures systems, software, and applications stay updated with latest security patches.', icon: Settings, category: 'operations', color: 'from-sky-600 to-sky-700', fileName: 'Patch_Management_Policy.pdf' },
    { id: 18, title: 'Business Continuity Policy', desc: 'Minimizes downtime and restores business operations after security incidents or disruptions.', icon: Zap, category: 'operations', color: 'from-sky-700 to-sky-800', fileName: 'Business_Continuity_Policy.pdf' },
    { id: 19, title: 'Asset Management Policy', desc: 'Optimizes resources, ensures security compliance, and minimizes data theft risks.', icon: Database, category: 'operations', color: 'from-sky-500 to-sky-600', fileName: 'Asset_Management_Policy.pdf' },

    // HUMAN RESOURCES (1)
    { id: 20, title: 'HR Security Policy', desc: 'Manages HR lifecycle ensuring only authorized personnel have access to information systems.', icon: Users, category: 'hr', color: 'from-pink-500 to-pink-600', fileName: 'HR_Security_Policy.pdf' },

    // RISK MANAGEMENT (2)
    { id: 21, title: 'Risk Assessment Policy', desc: 'Actively identifies, assesses, mitigates, and remediates security risks continuously.', icon: BarChart3, category: 'risk', color: 'from-rose-500 to-rose-600', fileName: 'Risk_Assessment_Policy.pdf' },
    { id: 22, title: 'Compliance Policy', desc: 'Manages compliance with legal, regulatory standards and data protection requirements.', icon: CheckCircle, category: 'risk', color: 'from-rose-400 to-rose-500', fileName: 'Compliance_Policy.pdf' },

    // CLOUD & INFRASTRUCTURE (2)
    { id: 23, title: 'Cloud Security Policy', desc: 'Comprehensive guidelines for secure cloud operations, configurations, and data protection measures.', icon: Cloud, category: 'cloud', color: 'from-slate-500 to-slate-600', fileName: 'Cloud_Security_Policy.pdf' },
    { id: 24, title: 'Endpoint Security Policy', desc: 'Secures critical endpoint systems and minimizes security concerns across all devices.', icon: HardDrive, category: 'cloud', color: 'from-slate-400 to-slate-500', fileName: 'Endpoint_Security_Policy.pdf' },

    // COMPLIANCE (4)
    { id: 25, title: 'Physical & Environmental Security', desc: 'Guidelines minimizing unauthorized access to physical spaces and production environments.', icon: Building2, category: 'compliance', color: 'from-violet-500 to-violet-600', fileName: 'Physical_Environmental_Security.pdf' },
    { id: 26, title: 'Vendor Management Policy', desc: 'Structured approach managing vendor relationships while mitigating third-party risks.', icon: Briefcase, category: 'compliance', color: 'from-violet-400 to-violet-500', fileName: 'Vendor_Management_Policy.pdf' },
    { id: 27, title: 'Software Development Lifecycle', desc: 'Guides teams implementing secure development activities and procedures throughout SDLC.', icon: Settings, category: 'compliance', color: 'from-violet-600 to-violet-700', fileName: 'Software_Development_Lifecycle.pdf' },
    { id: 28, title: 'System Acquisition Policy', desc: 'Integrates security considerations into all phases of system acquisition and development.', icon: Server, category: 'compliance', color: 'from-violet-700 to-violet-800', fileName: 'System_Acquisition_Policy.pdf' },
  ];

  const overviewItems = [
    {
      icon: ShieldCheck,
      title: 'Risk Management Foundation',
      desc: 'Policies define how your organization proactively identifies, assesses, and manages information security risks across all operations.'
    },
    {
      icon: CheckCircle,
      title: 'ISO 27001 Compliance',
      desc: 'Every template is mapped to ISO 27001 clauses and Annex A controls, ensuring audit-ready documentation from day one.'
    },
    {
      icon: Users,
      title: 'Employee Accountability',
      desc: 'Clear roles, responsibilities, and expectations help create a security-conscious culture throughout your organization.'
    },
    {
      icon: TrendingUp,
      title: 'Business Resilience',
      desc: 'Implement controls that protect your assets, minimize downtime, and ensure business continuity during security incidents.'
    }
  ];

  const benefits = [
    {
      icon: LockIcon,
      title: 'Enhanced Data Protection',
      shortDesc: 'Protect confidential information',
      fullDesc: 'Well-crafted policies outline necessary measures to safeguard sensitive data. They define roles and responsibilities while minimizing risks of data leakage, unauthorized access, and regulatory penalties. Legally binding agreements with external parties ensure confidentiality.'
    },
    {
      icon: Globe,
      title: 'Regulatory Compliance',
      shortDesc: 'Meet global standards',
      fullDesc: 'Avoid costly regulatory fines and penalties by demonstrating compliance with GDPR, HIPAA, and other frameworks. Our policies integrate with multiple compliance requirements, reducing the need for one-off, region-specific documentation projects.'
    },
    {
      icon: TrendingUp,
      title: 'Accelerated Sales Growth',
      shortDesc: 'Reduce RFIs & shorten deals',
      fullDesc: 'Streamline your sales process by reducing extensive security documentation requests (RFIs). Showcase your compliance with ISO 27001 to shorten negotiation times, close deals faster, and unlock new market opportunities.'
    },
    {
      icon: ShieldCheck,
      title: 'Cost Efficiency & Risk Reduction',
      shortDesc: 'Prevent costly breaches',
      fullDesc: 'Save significant time and money by preventing security breaches through proactive risk management. Implement structured controls that reduce incident likelihood, operational downtime, and associated financial losses.'
    },
    {
      icon: Users,
      title: 'Organizational Alignment',
      shortDesc: 'Unified security culture',
      fullDesc: 'Establish clear communication of security expectations across all levels. Cross-functional involvement in policy development ensures buy-in from IT, HR, legal, and operations teams.'
    },
    {
      icon: CheckCircle,
      title: 'Audit Readiness',
      shortDesc: 'Always audit-prepared',
      fullDesc: 'All templates are auditor-approved and include evidence mapping. Real-time tracking ensures you\'re never caught off guard during ISO 27001 certification audits.'
    }
  ];

  const categoryInfo = {
    all: { name: 'All Policies', count: 28, color: '#3b82f6' },
    core: { name: 'Core & Governance', count: 5, color: '#3b82f6', desc: 'Foundation policies covering information security principles and governance framework' },
    access: { name: 'Access & Identity', count: 3, color: '#10b981', desc: 'Controls for authentication, authorization, and user access management' },
    data: { name: 'Data Protection', count: 4, color: '#8b5cf6', desc: 'Policies safeguarding data throughout its lifecycle - collection to disposal' },
    incident: { name: 'Incident & Response', count: 2, color: '#f59e0b', desc: 'Detection, response, and recovery procedures for security incidents' },
    operations: { name: 'Operations', count: 5, color: '#0ea5e9', desc: 'Operational security controls and system management procedures' },
    hr: { name: 'Human Resources', count: 1, color: '#ec4899', desc: 'HR security policies for employee access and lifecycle management' },
    risk: { name: 'Risk Management', count: 2, color: '#f43f5e', desc: 'Risk assessment, treatment, and continuous monitoring' },
    cloud: { name: 'Cloud & Infrastructure', count: 2, color: '#64748b', desc: 'Secure cloud operations and infrastructure management' },
    compliance: { name: 'Compliance', count: 4, color: '#a855f7', desc: 'Regulatory compliance and governance frameworks' }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = ['all', 'core', 'access', 'data', 'incident', 'operations', 'hr', 'risk', 'cloud', 'compliance'];

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || policy.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (policy) => {
    if (!isUserLoggedIn) {
      router.push("/login");
      return;
    }

    setDownloadingId(policy.id);

        setTimeout(() => {
      const pdfContent = generatePdfContent(policy);

      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = policy.fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setDownloadingId(null);

      console.log(`✅ Downloaded: ${policy.title}`);
    }, 500);
  };
  const generatePdfContent = (policy) => {
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 500
>>
stream
BT
/F1 24 Tf
50 750 Td
(CalVant - ISO 27001 Policy Template) Tj
0 -50 Td
/F1 14 Tf
(${policy.title}) Tj
0 -30 Td
/F1 12 Tf
(Policy ID: ${policy.id}) Tj
0 -20 Td
(Category: ${policy.category.toUpperCase()}) Tj
0 -30 Td
/F1 10 Tf
(${policy.desc}) Tj
0 -40 Td
(Generated: ${new Date().toLocaleString()}) Tj
0 -20 Td
(Status: Ready for Implementation) Tj
0 -40 Td
(Confidential - For Internal Use Only) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000281 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
930
%%EOF`;
  };

  const getColorGradient = (colorStr) => {
    const colors = {
      'from-blue-500 to-blue-600': '#3b82f6,#1d4ed8',
      'from-blue-400 to-blue-500': '#60a5fa,#3b82f6',
      'from-blue-300 to-blue-400': '#93c5fd,#60a5fa',
      'from-blue-600 to-blue-700': '#1d4ed8,#1e40af',
      'from-emerald-500 to-emerald-600': '#10b981,#047857',
      'from-emerald-400 to-emerald-500': '#34d399,#10b981',
      'from-emerald-600 to-emerald-700': '#047857,#065f46',
      'from-purple-500 to-purple-600': '#8b5cf6,#7c3aed',
      'from-purple-400 to-purple-500': '#a78bfa,#8b5cf6',
      'from-purple-600 to-purple-700': '#7c3aed,#6d28d9',
      'from-purple-700 to-purple-800': '#6d28d9,#581c87',
      'from-orange-500 to-orange-600': '#f59e0b,#d97706',
      'from-orange-400 to-orange-500': '#fb923c,#f59e0b',
      'from-red-500 to-red-600': '#ef4444,#dc2626',
      'from-sky-500 to-sky-600': '#0ea5e9,#0284c7',
      'from-sky-400 to-sky-500': '#38bdf8,#0ea5e9',
      'from-sky-600 to-sky-700': '#0284c7,#0369a1',
      'from-sky-700 to-sky-800': '#0369a1,#075985',
      'from-slate-500 to-slate-600': '#64748b,#475569',
      'from-slate-400 to-slate-500': '#78909c,#64748b',
      'from-pink-500 to-pink-600': '#ec4899,#db2777',
      'from-rose-500 to-rose-600': '#f43f5e,#e11d48',
      'from-rose-400 to-rose-500': '#fb7185,#f43f5e',
      'from-violet-500 to-violet-600': '#a855f7,#9333ea',
      'from-violet-400 to-violet-500': '#c084fc,#a855f7',
      'from-violet-600 to-violet-700': '#9333ea,#7e22ce',
      'from-violet-700 to-violet-800': '#7e22ce,#6b21a8',
    };
    return colors[colorStr] || '#3b82f6,#1d4ed8';
  };

  return (
    <div className={`${styles.policiesPage} ${mounted ? styles.mounted : ''}`}>
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

          <nav className={styles.headerNav}>
            <ul className={styles.navLinks}>
              <Link href="/" className={styles.navLink}>Home</Link>
              <li>
                <button className={styles.navLink} onClick={() => handleScrollTo("policies-overview")}>
                  Overview
                </button>
              </li>
              <li>
                <button className={styles.navLink} onClick={() => handleScrollTo("policies-categories")}>
                  Categories
                </button>
              </li>
              <li>
                <button className={styles.navLink} onClick={() => handleScrollTo("policies-grid")}>
                  Policies
                </button>
              </li>
              <li>
                <button className={styles.navLink} onClick={() => handleScrollTo("benefits-section")}>
                  Benefits
                </button>
              </li>
            </ul>

            {(() => {
              const isUserLoggedIn = !!storedUser;
              return isUserLoggedIn && storedUser ? (
                <div className={styles.userCard}>
                  <UserCircle2 size={20} className={styles.userIcon} />
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{storedUser.name || "User"}</span>
                    <span className={styles.userRole}>{storedUser.department?.name || "Compliance Officer"}</span>
                  </div>
                </div>
              ) : (
                <button className={styles.btnSecondary} onClick={() => router.push("/login")}>
                  Login
                </button>
              );
            })()}
          </nav>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>ISO 27001 Ready</div>
          <h1 className={styles.heroTitle}>Policy Templates Library</h1>
          <p className={styles.heroSubtitle}>
            Download 28+ FREE, customizable, auditor-approved policy templates for CalVant ISMS implementation
          </p>
          <div className={styles.heroStats}>
            <div className={styles.statItem}><span className={styles.statValue}>28+</span>Policies</div>
            <div className={styles.statItem}><span className={styles.statValue}>10</span>Categories</div>
            <div className={styles.statItem}><span className={styles.statValue}>93</span>Controls</div>
          </div>
        </div>
      </section>

      <section id="policies-overview" className={styles.overviewSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Policy Templates Matter</h2>
          <p className={styles.sectionSubtitle}>Strong policies are the foundation of a robust Information Security Management System (ISMS).</p>
        </div>
        <div className={styles.overviewGrid}>
          {overviewItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={styles.overviewCard}>
                <div className={styles.overviewIcon}><Icon size={32} /></div>
                <h3 className={styles.overviewCardTitle}>{item.title}</h3>
                <p className={styles.overviewCardDesc}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="policies-categories" className={styles.categoriesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>10 Policy Categories</h2>
          <p className={styles.sectionSubtitle}>Our comprehensive templates are organized into 10 key categories covering all aspects of information security.</p>
        </div>
        <div className={styles.categoriesGrid}>
          {categories.filter(cat => cat !== 'all').map(cat => {
            const info = categoryInfo[cat];
            return (
              <div key={cat} className={styles.categoryCard} onClick={() => { setActiveCategory(cat); handleScrollTo("policies-grid"); }}>
                <div className={styles.categoryHeader} style={{ borderTopColor: info.color }}>
                  <h3 className={styles.categoryHeaderTitle}>{info.name}</h3>
                  <span className={styles.categoryCount}>{info.count}</span>
                </div>
                <p className={styles.categoryDesc}>{info.desc}</p>
                <div className={styles.categoryFooter}>
                  <span className={styles.categoryFooterText}>Explore {info.count} policy/policies</span>
                  <ChevronRight size={20} className={styles.categoryFooterIcon} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.filtersSection}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search policies (Access Control, Incident, Cloud...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={styles.searchInput}
          />
          {searchTerm && <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>×</button>}
        </div>
        <div className={styles.categoryFilters}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${activeCategory === cat ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'All Policies' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section id="policies-grid" className={styles.policiesGrid}>
        <div className={styles.resultsCount}>{filteredPolicies.length} policies available</div>
        <div className={styles.gridContainer}>
          {filteredPolicies.map((policy) => {
            const [color1, color2] = getColorGradient(policy.color).split(',');
            const isDownloading = downloadingId === policy.id;
            return (
              <div
                key={policy.id}
                className={`${styles.policyCard} ${hoveredCard === policy.id ? styles.hovered : ''}`}
                data-category={policy.category} 
                onMouseEnter={() => setHoveredCard(policy.id)}
                onMouseLeave={() => setHoveredCard(null)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.policyIcon} style={{background: `linear-gradient(135deg, ${color1}, ${color2})`}}>
                  <policy.icon className={styles.policyIconSvg} size={40} />
                </div>
                <h3 className={styles.policyTitle}>{policy.title}</h3>
                <p className={styles.policyDesc}>{policy.desc}</p>
                <div className={styles.policyFooter}>
                  <span className={styles.categoryBadge}>{policy.category.toUpperCase()}</span>
                  {/* <button
                    className={styles.downloadButton}
                    onClick={() => handleDownload(policy)}
                    disabled={isDownloading}
                    title="Click to download policy"
                  >
                    <Download className={`${styles.downloadIcon} ${isDownloading ? styles.downloading : ''}`} size={20} />
                    {isDownloading && <span className={styles.downloadText}>Downloading...</span>}
                  </button> */}


                 <button
                  className={styles.downloadButton}
                  onClick={() => handleDownload(policy)}
                  disabled={!isUserLoggedIn || isDownloading}
                  title={
                    !isUserLoggedIn
                      ? "Login required to download"
                      : "Download policy"
                  }
                >
                  <Download size={20} />
                  {isDownloading && <span>Downloading...</span>}
                </button>


                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="benefits-section" className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Key Benefits of Policy Implementation</h2>
          <p className={styles.sectionSubtitle}>Implementing comprehensive policies with CalVant delivers immediate and long-term value.</p>
        </div>
        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className={`${styles.benefitCard} ${expandedBenefit === idx ? styles.expanded : ''}`}
                onClick={() => setExpandedBenefit(expandedBenefit === idx ? null : idx)}>
                <div className={styles.benefitHeader}>
                  <div className={styles.benefitIcon}><Icon size={24} /></div>
                  <h3 className={styles.benefitCardTitle}>{benefit.title}</h3>
                </div>
                <div className={styles.benefitContent}>
                  <p className={styles.shortDesc}>{benefit.shortDesc}</p>
                  {expandedBenefit === idx && <p className={styles.fullDesc}>{benefit.fullDesc}</p>}
                </div>
                <div className={styles.benefitToggle}>
                  <span>{expandedBenefit === idx ? 'Read less' : 'Read more'}</span>
                  <ChevronRight size={18} className={`${styles.benefitToggleSvg} ${expandedBenefit === idx ? styles.rotated : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaContentTitle}>Ready for ISO 27001 Certification?</h2>
          <p className={styles.ctaContentDesc}>Implement these templates in CalVant for automated tracking and audit-ready evidence.</p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaPrimary} onClick={() => router.push('/dashboard')}>
              Start Policy Implementation
            </button>
            <button className={styles.ctaSecondary}>Contact Sales</button>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>CalVant</h4>
            <p>Enterprise Risk & Compliance Management Platform</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Product</h4>
            <ul>
              <li><Link href="/risk-assessment">Risk Management</Link></li>
              <li><Link href="/compliances">Compliance</Link></li>
              <li><Link href="/gap-assessment">Gap Assessment</Link></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/careers">Careers</Link></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Legal</h4>
            <ul>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/security">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          © {new Date().getFullYear()} CalVant. All rights reserved. Made in India
        </div>
      </footer>
    </div>
  );
};

export default PoliciesPage;



