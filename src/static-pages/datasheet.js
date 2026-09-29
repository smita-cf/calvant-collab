// //C:\Users\ak192\Downloads\calvant-frontend-2-cv_nextjs4\calvant-frontend-2-cv_nextjs4\src\static-pages\datasheet.js


// "use client";
// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   FileText,
//   Shield,
//   Lock,
//   Globe,
//   Users,
//   BarChart3,
//   ArrowRight,
//   Download,
//   ExternalLink,
// } from "lucide-react";

// import "./datasheet.css";
// import { useIsMobile } from "@/hooks/useIsMobile";

// /* ============================================================
//    DATASHEET CONFIG
//    To add a new datasheet:
//    1. Add the PDF to /public/datasheets/your-file.pdf
//    2. Add the thumbnail screenshot to /public/datasheets/thumbnails/your-thumb.png
//    3. Add a new entry to this array
//    ============================================================ */
// const DATASHEETS = [
//   {
//     id: 1,
//     title: "ISO 27701 – PIMS Datasheet",
//     subtitle: "Privacy Information Management Systems",
//  description:
//       "ISO 27701 requires organizations to make privacy a living, operational function. Calvant transforms that requirement into a structured, automated, and self-sustaining Privacy Information Management System.",
    
//     icon: Lock,
//     badge: "PIMS",
//     badgeColor: "#a78bfa",
//     badgeBg: "rgba(167,139,250,0.12)",
//     thumbnail: "/datasheets/thumbnails/pims-thumb.png",
//     pdf: "/datasheets/pims.pdf",
//     tags: ["Privacy", "GDPR", "CCPA", "PII"],
//   },
//   {
//     id: 2,
//     title: "System and Organization Controls",
//     subtitle: "SOC 2 Readiness Without the Operational Chaost",
//     description:
//       "Calvant replacesstressfulauditseasons withpermanent, automated compliance — giving cloud-hosted businesses, SaaS providers, and fintechs continuous SOC 2 readiness built into daily operations.",
//     icon: Shield,
//     badge: "SOC",
//     badgeColor: "#34d399",
//     badgeBg: "rgba(52,211,153,0.12)",
//     thumbnail: "/datasheets/thumbnails/soc2-thumb.png",
//     pdf: "/datasheets/soc2.pdf",
//     tags: ["Security", "Availbility", "Confidentiality", "privacy"], 
//   },
//   {
//     id: 3,
//     title: "GDPR Data Privacy & Protection",
//     subtitle: "GDPR Readiness Made Practical with Calvant",
//     description:
//       "A structured, automated approach to achieving and sustaining General Data Protection Regulation compliance without the chaos of spreadsheets, siloed teams, or reactive consultants.",
//     icon: BarChart3,
//     badge: "GDPR",
//     badgeColor: "#60a5fa",
//     badgeBg: "rgba(96,165,250,0.12)",
//     thumbnail: "/datasheets/thumbnails/gdpr-thumb.png",
//     pdf: "/datasheets/gdpr.pdf",
//     tags: ["GDPR", "Governance", "Risk", "Ethics"],
//   },
//   {
//     id: 4,
//     title: "Artificial Intelligence Management System",
//     subtitle: "Strengthen AI Trust, Governance & Compliance with Calvant",
//     description:
//       "A unified AIMS platform that enables organizations to achieve and sustain ISO/IEC 42001 certification without the challenges of manual and fragmented governance.",
//     icon: FileText,
//     badge: "AIMS",
//     badgeColor: "#f59e0b",
//     badgeBg: "rgba(245,158,11,0.12)",
//     thumbnail: "/datasheets/thumbnails/aims-thumb.png",
//     pdf: "/datasheets/aims.pdf",
//     tags: ["AIMS", "Trust", "Audit", "Cloud"],
//   },
//   {
//     id: 5,
//     title: " Information security management System",
//     subtitle: "The Mid-Market Journey to ISO 27001 Readiness",
//     description:
//       "centralized and scalable approach to achieving and sustaining ISO 27001 readiness across growing teams, complex infrastructure, and multi-department operations — through continuous monitoring, automated workflows, and connected compliance visibility without fragmented tools or reactive audit preparation.",
//     icon: Globe,
//     badge: "ISMS",
//     badgeColor: "#f87171",
//     badgeBg: "rgba(248,113,113,0.12)",
//     thumbnail: "/datasheets/thumbnails/isms-thumb.png",
//     pdf: "/datasheets/isms.pdf",
//     tags: ["ISMS", "Privacy", "governance", "Audit"],
//   },
//   {
//     id: 6,
//     title: "ISO 27001 Information security management System",
//     subtitle: "TISO 27001 Compliance for Growing Businesses",
//     description:
//       "A streamlined and scalable approach to achieving and maintaining ISO 27001 compliance through continuous monitoring, automated workflows, and centralized visibility — without overwhelming lean teams with spreadsheets, manual evidence collection, or reactive audit preparation.",
//     icon: Users,
//     badge: "ISMS",
//     badgeColor: "#fb923c",
//     badgeBg: "rgba(251,146,60,0.12)",
//     thumbnail: "/datasheets/thumbnails/isms2-thumb.png",
//     pdf: "/datasheets/isms2.pdf",
//     tags: ["TPRM", "Vendor", "Risk", "Compliance"],
//   },
// ];

// /* ── Thumbnail with fallback ─────────────────────────────────────────────── */
// const DatasheetThumbnail = ({ src, alt, icon: Icon, badgeColor }) => {
//   const [imgError, setImgError] = useState(false);

//   if (imgError) {
//     return (
//       <div className="ds-card-thumb ds-card-thumb--fallback">
//         <div className="ds-thumb-fallback-icon" style={{ color: badgeColor }}>
//           <Icon size={56} strokeWidth={1} />
//         </div>
//         <div className="ds-thumb-fallback-lines">
//           <div className="ds-thumb-line ds-thumb-line--long" />
//           <div className="ds-thumb-line ds-thumb-line--medium" />
//           <div className="ds-thumb-line ds-thumb-line--short" />
//           <div className="ds-thumb-line ds-thumb-line--medium" />
//           <div className="ds-thumb-line ds-thumb-line--long" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="ds-card-thumb">
//       <img
//         src={src}
//         alt={alt}
//         className="ds-thumb-img"
//         onError={() => setImgError(true)}
//         loading="lazy"
//       />
//     </div>
//   );
// };

// /* ── Main Component ──────────────────────────────────────────────────────── */
// const DatasheetPage = () => {
//   const [mounted, setMounted] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const isMobile = useIsMobile();
//   const router = useRouter();

  
//   useEffect(() => {
//     setMounted(true);
//     if (typeof window !== "undefined") {
//       setIsLoggedIn(!!sessionStorage.getItem("user"));
//     }
//   }, []);

//   const handleOpenPdf = (pdf, title) => {
//     // Open PDF in a new tab
//     window.open(pdf, "_blank", "noopener,noreferrer");
//   };

//   return (
//     <div className={`ds-page ${mounted ? "ds-mounted" : ""}`}>

//       {/* ── Header ── */}
//       <header className="ds-header">
//         <div className="ds-header-inner">
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               flex: "10px 0 auto",
//             }}
//           >
//             <Image
//               src="/CalVant Logo.svg"
//               alt="CalVant"
//               width={180}
//               height={60}
//               style={{
//                 height: isMobile ? "30px" : "60px",
//                 width: "auto",
//                 transform: isMobile ? "scale(3.9)" : "scale(2.9)",
//                 transformOrigin: "center",
//                 cursor: "pointer",
//                 transition: "transform 0.25s ease",
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.transform = "scale(3.7)";
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.transform = "scale(3.5)";
//               }}
//               onClick={() => router.push("/")}
//             />
//           </div>
//           <nav className="ds-nav">
//             <ul className="ds-nav-links">
//               <li><Link href="/" className="ds-nav-link">Home</Link></li>
//               <li><Link href="/about" className="ds-nav-link">About</Link></li>
//               <li><Link href="/blog" className="ds-nav-link">Blog</Link></li>
//               {!isLoggedIn && (
//                 <li>
//                   <Link href="/login" className="ds-nav-link ds-nav-cta">
//                     Login
//                   </Link>
//                 </li>
//               )}
//             </ul>
//           </nav>
//         </div>
//       </header>

//       {/* ── Hero ── */}
//       <section className="ds-hero">
//         <div className="ds-hero-orb ds-hero-orb-1" />
//         <div className="ds-hero-orb ds-hero-orb-2" />
//         <div className="ds-hero-inner">
//           <div className="ds-hero-badge">
//             <FileText size={13} />
//             <span>Resources</span>
//           </div>
//           <h1 className="ds-hero-title">
//             Product <span>Datasheets</span>
//           </h1>
//           <p className="ds-hero-subtitle">
//             Explore Calvant's compliance framework datasheets. Each document covers
//             platform capabilities, implementation approach, and how we solve real
//             compliance challenges for your industry.
//           </p>
//           <div className="ds-hero-stats">
//             <div className="ds-stat">
//               <span className="ds-stat-value">6+</span>
//               <span className="ds-stat-label">Frameworks Covered</span>
//             </div>
//             <div className="ds-stat">
//               <span className="ds-stat-value">PDF</span>
//               <span className="ds-stat-label">Downloadable Format</span>
//             </div>
//             <div className="ds-stat">
//               <span className="ds-stat-value">Free</span>
//               <span className="ds-stat-label">No Registration</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Grid ── */}
//       <section className="ds-grid-section">
//         <div className="ds-container">
//           <div className="ds-section-header">
//             <h2 className="ds-section-title">All Datasheets</h2>
//             <p className="ds-section-subtitle">
//               Click any title or the view button to open the full datasheet PDF in a new tab.
//             </p>
//           </div>

//           <div className="ds-grid">
//             {DATASHEETS.map((sheet, idx) => {
//               const Icon = sheet.icon;
//               return (
//                 <article
//                   key={sheet.id}
//                   className="ds-card"
//                   style={{ animationDelay: `${idx * 60}ms` }}
//                 >
//                   {/* Thumbnail */}
//                   <DatasheetThumbnail
//                     src={sheet.thumbnail}
//                     alt={`${sheet.title} preview`}
//                     icon={Icon}
//                     badgeColor={sheet.badgeColor}
//                   />

//                   {/* Content */}
//                   <div className="ds-card-content">
//                     {/* Badge */}
//                     <span
//                       className="ds-card-badge"
//                       style={{ color: sheet.badgeColor, background: sheet.badgeBg }}
//                     >
//                       <Icon size={11} />
//                       {sheet.badge}
//                     </span>

//                     {/* Title — clickable → opens PDF */}
//                     <button
//                       className="ds-card-title"
//                       onClick={() => handleOpenPdf(sheet.pdf, sheet.title)}
//                       title={`Open ${sheet.title} PDF`}
//                     >
//                       {sheet.title}
//                     </button>

//                     <p className="ds-card-subtitle">{sheet.subtitle}</p>
//                     <p className="ds-card-desc">{sheet.description}</p>

//                     {/* Tags */}
//                     <div className="ds-card-tags">
//                       {sheet.tags.map((tag) => (
//                         <span key={tag} className="ds-tag">{tag}</span>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Footer */}
//                   <div className="ds-card-footer">
//                     <button
//                       className="ds-btn-view"
//                       onClick={() => handleOpenPdf(sheet.pdf, sheet.title)}
//                     >
//                       <ExternalLink size={15} />
//                       View Datasheet
//                     </button>
//                     <a
//                       href={sheet.pdf}
//                       download
//                       className="ds-btn-download"
//                       title="Download PDF"
//                     >
//                       <Download size={15} />
//                     </a>
//                   </div>
//                 </article>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* ── CTA ── */}
//       <section className="ds-cta-section">
//         <div className="ds-container">
//           <div className="ds-cta-inner">
//             <h2 className="ds-cta-title">Ready to Start Your Compliance Journey?</h2>
//             <p className="ds-cta-subtitle">
//               Join 500+ organizations managing compliance smarter with Calvant.
//             </p>
//             {!isLoggedIn && (
//               <div className="ds-cta-buttons">
//                 <Link href="/login" className="ds-cta-primary">
//                   Get Started Today
//                   <ArrowRight size={18} />
//                 </Link>
//                 <Link href="/demo" className="ds-cta-secondary">
//                   Request Demo
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* ── Footer ── */}
//       <footer className="ds-footer">
//         <div className="ds-footer-content">
//           <div className="ds-footer-section">
//             <h4>Product</h4>
//             <ul>
//               <li><Link href="/iso-27001">ISO 27001</Link></li>
//               <li><Link href="/iso-27701">ISO 27701</Link></li>
//               <li><Link href="/risk-assessment">Risk Management</Link></li>
//               <li><Link href="/documentation">Documentation</Link></li>
//             </ul>
//           </div>
//           <div className="ds-footer-section">
//             <h4>Company</h4>
//             <ul>
//               <li><Link href="/about">About Us</Link></li>
//               <li><Link href="/careers">Careers</Link></li>
//               <li><Link href="/blog">Blog</Link></li>
//               <li><Link href="/demo">Contact</Link></li>
//             </ul>
//           </div>
//           <div className="ds-footer-section">
//             <h4>Resources</h4>
//             <ul>
//               <li><Link href="/datasheet">Datasheets</Link></li>
//               <li><Link href="/security">Security</Link></li>
//               <li><Link href="/privacy">Privacy Policy</Link></li>
//               <li><Link href="/terms">Terms of Service</Link></li>
//             </ul>
//           </div>
//           <div className="ds-footer-section">
//             <h4>Contact</h4>
//             <ul>
//               <li><Link href="mailto:sales@consultantsfactory.com">sales@consultantsfactory.com</Link></li>
//               <li><Link href="mailto:support@calvant.com">support@calvant.com</Link></li>
//               <li><Link href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</Link></li>
//               <li><Link href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</Link></li>
//             </ul>
//           </div>
//         </div>
//         <div className="ds-footer-bottom">
//           © {new Date().getFullYear()} CalVant. All rights reserved. Made in India 🇮🇳
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default DatasheetPage;


//C:\Users\ak192\Downloads\calvant-frontend-2-cv_nextjs4\calvant-frontend-2-cv_nextjs4\src\static-pages\datasheet.js

"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Shield,
  Lock,
  Globe,
  Users,
  BarChart3,
  ArrowRight,
  Download,
  ExternalLink,
} from "lucide-react";

import "./datasheet.css";
import { useIsMobile } from "@/hooks/useIsMobile";

/* ============================================================
   ICON MAP
   Backend stores iconName as a string (e.g. "Lock", "Shield") -
   we can't persist a React component reference in Mongo, so we
   resolve the name to a real lucide-react component here.
   To support a new icon: add it to this map, then admins can
   pick it by name in the admin panel without a frontend deploy.
   ============================================================ */
const ICON_MAP = { FileText, Shield, Lock, Globe, Users, BarChart3 };
const resolveIcon = (iconName) => ICON_MAP[iconName] || FileText;

const API_BASE = `${process.env.NEXT_PUBLIC_CFTB}/blog-service` || "https://api.calvant.com/blog-service";

/* ── Thumbnail with fallback ─────────────────────────────────────────────── */
const DatasheetThumbnail = ({ src, alt, icon: Icon, badgeColor }) => {
  const [imgError, setImgError] = useState(!src);

  if (imgError) {
    return (
      <div className="ds-card-thumb ds-card-thumb--fallback">
        <div className="ds-thumb-fallback-icon" style={{ color: badgeColor }}>
          <Icon size={56} strokeWidth={1} />
        </div>
        <div className="ds-thumb-fallback-lines">
          <div className="ds-thumb-line ds-thumb-line--long" />
          <div className="ds-thumb-line ds-thumb-line--medium" />
          <div className="ds-thumb-line ds-thumb-line--short" />
          <div className="ds-thumb-line ds-thumb-line--medium" />
          <div className="ds-thumb-line ds-thumb-line--long" />
        </div>
      </div>
    );
  }

  return (
    <div className="ds-card-thumb">
      <img
        src={src}
        alt={alt}
        className="ds-thumb-img"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </div>
  );
};

/* ── Skeleton card shown while the fetch is in flight ────────────────────── */
const DatasheetCardSkeleton = () => (
  <article className="ds-card ds-card--skeleton">
    <div className="ds-card-thumb ds-card-thumb--fallback" />
    <div className="ds-card-content">
      <div className="ds-thumb-line ds-thumb-line--short" style={{ width: 60, height: 18 }} />
      <div className="ds-thumb-line ds-thumb-line--long" style={{ height: 20, marginTop: 12 }} />
      <div className="ds-thumb-line ds-thumb-line--medium" style={{ marginTop: 8 }} />
    </div>
  </article>
);

/* ── Main Component ──────────────────────────────────────────────────────── */
const DatasheetPage = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [datasheets, setDatasheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!sessionStorage.getItem("user"));
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/datasheets`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setDatasheets(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Presigned S3 URLs expire, so we refetch a fresh one right before opening
  // rather than trusting the URL fetched when the page first loaded.
  const handleOpenPdf = async (sheet) => {
    try {
      const res = await fetch(`${API_BASE}/api/datasheets/${sheet.id}`);
      const fresh = await res.json();
      const url = fresh?.pdfUrl || sheet.pdfUrl;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      window.open(sheet.pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={`ds-page ${mounted ? "ds-mounted" : ""}`}>

      {/* ── Header ── */}
      <header className="ds-header">
        <div className="ds-header-inner">
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
          <nav className="ds-nav">
            <ul className="ds-nav-links">
              <li><Link href="/" className="ds-nav-link">Home</Link></li>
              <li><Link href="/about" className="ds-nav-link">About</Link></li>
              <li><Link href="/blog" className="ds-nav-link">Blog</Link></li>
              {!isLoggedIn && (
                <li>
                  <Link href="/login" className="ds-nav-link ds-nav-cta">
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="ds-hero">
        <div className="ds-hero-orb ds-hero-orb-1" />
        <div className="ds-hero-orb ds-hero-orb-2" />
        <div className="ds-hero-inner">
          <div className="ds-hero-badge">
            <FileText size={13} />
            <span>Resources</span>
          </div>
          <h1 className="ds-hero-title">
            Product <span>Datasheets</span>
          </h1>
          <p className="ds-hero-subtitle">
            Explore Calvant's compliance framework datasheets. Each document covers
            platform capabilities, implementation approach, and how we solve real
            compliance challenges for your industry.
          </p>
          <div className="ds-hero-stats">
            <div className="ds-stat">
              <span className="ds-stat-value">{datasheets.length || "6+"}</span>
              <span className="ds-stat-label">Frameworks Covered</span>
            </div>
            <div className="ds-stat">
              <span className="ds-stat-value">PDF</span>
              <span className="ds-stat-label">Downloadable Format</span>
            </div>
            <div className="ds-stat">
              <span className="ds-stat-value">Free</span>
              <span className="ds-stat-label">No Registration</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="ds-grid-section">
        <div className="ds-container">
          <div className="ds-section-header">
            <h2 className="ds-section-title">All Datasheets</h2>
            <p className="ds-section-subtitle">
              Click any title or the view button to open the full datasheet PDF in a new tab.
            </p>
          </div>

          <div className="ds-grid">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => <DatasheetCardSkeleton key={i} />)}

            {!loading && error && (
              <p className="ds-section-subtitle">
                Couldn't load datasheets right now. Please try again shortly.
              </p>
            )}

            {!loading && !error && datasheets.length === 0 && (
              <p className="ds-section-subtitle">No datasheets published yet.</p>
            )}

            {!loading &&
              !error &&
              datasheets.map((sheet, idx) => {
                const Icon = resolveIcon(sheet.iconName);
                return (
                  <article
                    key={sheet.id}
                    className="ds-card"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {/* Thumbnail */}
                    <DatasheetThumbnail
                      src={sheet.thumbnailUrl}
                      alt={`${sheet.title} preview`}
                      icon={Icon}
                      badgeColor={sheet.badgeColor}
                    />

                    {/* Content */}
                    <div className="ds-card-content">
                      {/* Badge */}
                      <span
                        className="ds-card-badge"
                        style={{ color: sheet.badgeColor, background: sheet.badgeBg }}
                      >
                        <Icon size={11} />
                        {sheet.badgeLabel}
                      </span>

                      {/* Title — clickable → opens PDF */}
                      <button
                        className="ds-card-title"
                        onClick={() => handleOpenPdf(sheet)}
                        title={`Open ${sheet.title} PDF`}
                      >
                        {sheet.title}
                      </button>

                      <p className="ds-card-subtitle">{sheet.subtitle}</p>
                      <p className="ds-card-desc">{sheet.description}</p>

                      {/* Tags */}
                      <div className="ds-card-tags">
                        {(sheet.tags || []).map((tag) => (
                          <span key={tag} className="ds-tag">{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="ds-card-footer">
                      <button
                        className="ds-btn-view"
                        onClick={() => handleOpenPdf(sheet)}
                      >
                        <ExternalLink size={15} />
                        View Datasheet
                     </button>
                      <a
                        href={sheet.pdfUrl}
                        download
                        className="ds-btn-download"
                        title="Download PDF"
                      >
                        <Download size={15} />
                      </a>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ds-cta-section">
        <div className="ds-container">
          <div className="ds-cta-inner">
            <h2 className="ds-cta-title">Ready to Start Your Compliance Journey?</h2>
            <p className="ds-cta-subtitle">
              Join 500+ organizations managing compliance smarter with Calvant.
            </p>
            {!isLoggedIn && (
              <div className="ds-cta-buttons">
                <Link href="/login" className="ds-cta-primary">
                  Get Started Today
                  <ArrowRight size={18} />
                </Link>
                <Link href="/demo" className="ds-cta-secondary">
                  Request Demo
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ds-footer">
        <div className="ds-footer-content">
          <div className="ds-footer-section">
            <h4>Product</h4>
            <ul>
              <li><Link href="/iso-27001">ISO 27001</Link></li>
              <li><Link href="/iso-27701">ISO 27701</Link></li>
              <li><Link href="/risk-assessment">Risk Management</Link></li>
              <li><Link href="/documentation">Documentation</Link></li>
            </ul>
          </div>
          <div className="ds-footer-section">
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/collaboration">Collaboration</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/demo">Contact</Link></li>
            </ul>
          </div>
          <div className="ds-footer-section">
            <h4>Resources</h4>
            <ul>
              <li><Link href="/datasheet">Datasheets</Link></li>
              <li><Link href="/security">Security</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="ds-footer-section">
            <h4>Contact</h4>
            <ul>
              <li><Link href="mailto:sales@consultantsfactory.com">sales@consultantsfactory.com</Link></li>
              <li><Link href="mailto:support@calvant.com">support@calvant.com</Link></li>
              <li><Link href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</Link></li>
              <li><Link href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</Link></li>
            </ul>
          </div>
        </div>
        <div className="ds-footer-bottom">
          © {new Date().getFullYear()} CalVant. All rights reserved. Made in India 🇮🇳
        </div>
      </footer>
    </div>
  );
};

export default DatasheetPage;