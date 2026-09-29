// // src/components/SiteHeader.jsx
// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import Image from "next/image";
// import { useRouter, usePathname } from "next/navigation";
// import { LogIn, ChevronDown } from "lucide-react";
// import { useIsMobile } from "@/hooks/useIsMobile";
// import {
//   resolveStaticRoute,
//   hasRenderablePage,
// } from "@/utils/frameworkStaticRoutes";
// import "@/modules/dashboard/Dashboard.css";

// const FALLBACK_FRAMEWORKS = [
//   { label: "ISO 27001", route: "/iso-27001" },
//   { label: "ISO 27701", route: "/iso-27701" },
//   { label: "ISO 42001", route: "/iso-42001" },
//   { label: "SOC 2", route: "/soc-2" },
//   { label: "GDPR", route: "/gdpr" },
//   { label: "DPDPA", route: "/dpdpa" },
//   { label: "KSA PDPL", route: "/ksa-pdpl" },
// ];

// /**
//  * Guest-facing header — exact replica of Dashboard.js header & framework dropdown
//  */
// export default function SiteHeader({ showPricing, showFramework }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const isMobile = useIsMobile();
//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const [frameworkNavOptions, setFrameworkNavOptions] =
//     useState(FALLBACK_FRAMEWORKS);

//   // Fetch frameworks dynamically from API (exact same logic as Dashboard.js)
//   useEffect(() => {
//     const API_BASE =
//       process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.calvant.com";
//     fetch(`${API_BASE}/framework/api/frameworks`)
//       .then((res) => (res.ok ? res.json() : []))
//       .then((data) => {
//         if (Array.isArray(data) && data.length > 0) {
//           const opts = data
//             .filter((fw) => fw.label && hasRenderablePage(fw))
//             .map((fw) => ({
//               label: fw.label,
//               route: resolveStaticRoute(fw) || `/frameworks/${fw.id}`,
//             }));
//           if (opts.length > 0) {
//             setFrameworkNavOptions(opts);
//           }
//         }
//       })
//       .catch(() => {});
//   }, []);

//   // Close dropdown on click outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     };
//     if (open) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [open]);

//   // On pricing page (or when showFramework is requested), show the Frameworks dropdown instead of Pricing button
//   const isPricingPage =
//     pathname === "/pricing" || showFramework === true || showPricing === false;

//   return (
//     <header
//       className="dashboard-header"
//       style={{ padding: isMobile ? "10px 12px" : "16px 24px" }}
//     >
//       <div
//         className="dashboard-header-content"
//         style={{
//           maxWidth: "1280px",
//           margin: "0 auto",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           gap: isMobile ? "8px" : "24px",
//           position: "relative",
//           zIndex: 1,
//         }}
//       >
//         {/* LOGO */}
//         <div
//           style={{ display: "flex", alignItems: "center", flex: "10px 0 auto" }}
//         >
//           <Image
//             src="/CalVant Logo.svg"
//             alt="CalVant"
//             width={180}
//             height={60}
//             style={{
//               height: isMobile ? "30px" : "60px",
//               width: "auto",
//               transform: isMobile ? "scale(3.9)" : "scale(2.9)",
//               transformOrigin: "center",
//               cursor: "pointer",
//               transition: "transform 0.25s ease",
//             }}
//             onClick={() => router.push("/")}
//           />
//         </div>

//         {/* HEADER NAV RIGHT */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: isMobile ? "8px" : "18px",
//           }}
//         >
//           {!isMobile && (
//             <>
//               {/* HOME BUTTON (Hidden on Main Dashboard page `/`) */}
//               {pathname !== "/" && (
//                 <button
//                   onClick={() => router.push("/")}
//                   style={{
//                     background: "transparent",
//                     border: "none",
//                     color: "#cbd5e1",
//                     fontSize: "13px",
//                     fontWeight: "500",
//                     letterSpacing: "0.01em",
//                     cursor: "pointer",
//                     transition: "color 0.2s ease",
//                     padding: "6px 8px",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.color = "#ffffff";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.color = "#cbd5e1";
//                   }}
//                 >
//                   Home
//                 </button>
//               )}

//               {/* FRAMEWORKS DROPDOWN */}
//               <div
//                 className="header-dropdown"
//                 ref={dropdownRef}
//                 style={{ position: "relative" }}
//               >
//                 <button
//                   className="site-header-dropdown-trigger"
//                   onClick={() => setOpen((prev) => !prev)}
//                   style={{
//                     display: "inline-flex",
//                     alignItems: "center",
//                     gap: "5px",
//                     background: "transparent",
//                     border: "none",
//                     boxShadow: "none",
//                     outline: "none",
//                     borderRadius: "0px",
//                     color:
//                       open ||
//                       pathname.includes("framework") ||
//                       pathname.includes("iso") ||
//                       pathname.includes("gdpr") ||
//                       pathname.includes("soc") ||
//                       pathname.includes("pdpl")
//                         ? "#ffffff"
//                         : "#cbd5e1",
//                     fontSize: "13px",
//                     fontWeight: "500",
//                     letterSpacing: "0.01em",
//                     cursor: "pointer",
//                     transition: "color 0.2s ease",
//                     whiteSpace: "nowrap",
//                     padding: "6px 8px",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.color = "#ffffff";
//                     e.currentTarget.style.background = "transparent";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.color = open ? "#ffffff" : "#cbd5e1";
//                     e.currentTarget.style.background = "transparent";
//                   }}
//                 >
//                   <span>Frameworks</span>
//                   <ChevronDown
//                     size={14}
//                     style={{
//                       transition: "transform 0.25s ease",
//                       transform: open ? "rotate(180deg)" : "rotate(0deg)",
//                     }}
//                   />
//                 </button>

//                 {open && (
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: "100%",
//                       left: 0,
//                       marginTop: "8px",
//                       background: "rgba(15, 23, 42, 0.95)",
//                       backdropFilter: "blur(16px)",
//                       WebkitBackdropFilter: "blur(16px)",
//                       border: "1px solid rgba(148, 163, 184, 0.2)",
//                       borderRadius: "12px",
//                       boxShadow: "0 16px 36px rgba(0, 0, 0, 0.4)",
//                       zIndex: 1000,
//                       minWidth: "180px",
//                       padding: "6px",
//                     }}
//                   >
//                     {frameworkNavOptions.map((opt) => (
//                       <button
//                         key={opt.label}
//                         onClick={() => {
//                           setOpen(false);
//                           router.push(opt.route);
//                         }}
//                         style={{
//                           display: "block",
//                           width: "100%",
//                           padding: "8px 12px",
//                           background: "transparent",
//                           border: "none",
//                           borderRadius: "6px",
//                           color: "#e2e8f0",
//                           fontSize: "13px",
//                           fontWeight: "500",
//                           textAlign: "left",
//                           cursor: "pointer",
//                           transition: "all 0.15s ease",
//                         }}
//                         onMouseEnter={(e) => {
//                           e.target.style.background = "rgba(79, 70, 229, 0.15)";
//                           e.target.style.color = "#818cf8";
//                         }}
//                         onMouseLeave={(e) => {
//                           e.target.style.background = "transparent";
//                           e.target.style.color = "#e2e8f0";
//                         }}
//                       >
//                         {opt.label}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* PRICING BUTTON (Hidden only on Pricing page `/pricing`) */}
//               {pathname !== "/pricing" && (
//                 <button
//                   onClick={() => router.push("/pricing")}
//                   style={{
//                     background: "transparent",
//                     border: "none",
//                     color: pathname === "/pricing" ? "#ffffff" : "#cbd5e1",
//                     fontSize: "13px",
//                     fontWeight: pathname === "/pricing" ? "600" : "500",
//                     letterSpacing: "0.01em",
//                     cursor: "pointer",
//                     transition: "color 0.2s ease",
//                     padding: "6px 8px",
//                     whiteSpace: "nowrap",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.color = "#ffffff";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.color =
//                       pathname === "/pricing" ? "#ffffff" : "#cbd5e1";
//                   }}
//                 >
//                   Pricing
//                 </button>
//               )}
//             </>
//           )}

//           {/* VIBRANT LOGIN PILL BUTTON (Matching Screenshot 1:1) */}
//           <button
//             onClick={() => router.push("/login")}
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: "7px",
//               padding: isMobile ? "6px 14px" : "8px 20px",
//               background: "linear-gradient(135deg, #4f46e5, #6366f1)",
//               border: "none",
//               borderRadius: "9999px",
//               color: "#ffffff",
//               fontSize: isMobile ? "12px" : "13px",
//               fontWeight: "600",
//               cursor: "pointer",
//               boxShadow: "0 4px 16px rgba(99, 102, 241, 0.45)",
//               transition: "all 0.25s ease",
//               whiteSpace: "nowrap",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background =
//                 "linear-gradient(135deg, #4338ca, #4f46e5)";
//               e.currentTarget.style.transform = "translateY(-1px)";
//               e.currentTarget.style.boxShadow =
//                 "0 6px 20px rgba(99, 102, 241, 0.6)";
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background =
//                 "linear-gradient(135deg, #4f46e5, #6366f1)";
//               e.currentTarget.style.transform = "translateY(0)";
//               e.currentTarget.style.boxShadow =
//                 "0 4px 16px rgba(99, 102, 241, 0.45)";
//             }}
//           >
//             <LogIn size={isMobile ? 13 : 15} />
//             <span>Login</span>
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }


// src/components/SiteHeader.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LogIn, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  resolveStaticRoute,
  hasRenderablePage,
} from "@/utils/frameworkStaticRoutes";
import "@/modules/dashboard/Dashboard.css";

const FALLBACK_FRAMEWORKS = [
  { label: "ISO 27001", route: "/iso-27001" },
  { label: "ISO 27701", route: "/iso-27701" },
  { label: "ISO 42001", route: "/iso-42001" },
  { label: "SOC 2", route: "/soc-2" },
  { label: "GDPR", route: "/gdpr" },
  { label: "DPDPA", route: "/dpdpa" },
  { label: "KSA PDPL", route: "/ksa-pdpl" },
];

/**
 * Guest-facing header — exact replica of Dashboard.js header & framework dropdown
 */
export default function SiteHeader({ showPricing, showFramework }) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [frameworkNavOptions, setFrameworkNavOptions] =
    useState(FALLBACK_FRAMEWORKS);

  // Fetch frameworks dynamically from API (exact same logic as Dashboard.js)
  useEffect(() => {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.calvant.com";
    fetch(`${API_BASE}/framework/api/frameworks`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const opts = data
            .filter((fw) => fw.label && hasRenderablePage(fw))
            .map((fw) => ({
              label: fw.label,
              route: resolveStaticRoute(fw) || `/frameworks/${fw.id}`,
            }));
          if (opts.length > 0) {
            setFrameworkNavOptions(opts);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on click outside
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

  // On pricing page (or when showFramework is requested), show the Frameworks dropdown instead of Pricing button
  const isPricingPage =
    pathname === "/pricing" || showFramework === true || showPricing === false;

  return (
    <header
      className="dashboard-header"
      style={{ padding: isMobile ? "10px 12px" : "16px 24px" }}
    >
      <div
        className="dashboard-header-content"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: isMobile ? "8px" : "24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* LOGO */}
        <div
          style={{ display: "flex", alignItems: "center", flex: "10px 0 auto" }}
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
            onClick={() => router.push("/")}
          />
        </div>

        {/* HEADER NAV RIGHT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "8px" : "18px",
          }}
        >
          {!isMobile && (
            <>
              {/* HOME BUTTON (Hidden on Main Dashboard page `/`) */}
              {pathname !== "/" && (
                <button
                  onClick={() => router.push("/")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#cbd5e1",
                    fontSize: "13px",
                    fontWeight: "500",
                    letterSpacing: "0.01em",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                    padding: "6px 8px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#cbd5e1";
                  }}
                >
                  Home
                </button>
              )}

              {/* FRAMEWORKS DROPDOWN */}
              <div
                className="header-dropdown"
                ref={dropdownRef}
                style={{ position: "relative" }}
              >
                <button
                  className="site-header-dropdown-trigger"
                  onClick={() => setOpen((prev) => !prev)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                    outline: "none",
                    borderRadius: "0px",
                    color:
                      open ||
                      pathname.includes("framework") ||
                      pathname.includes("iso") ||
                      pathname.includes("gdpr") ||
                      pathname.includes("soc") ||
                      pathname.includes("pdpl")
                        ? "#ffffff"
                        : "#cbd5e1",
                    fontSize: "13px",
                    fontWeight: "500",
                    letterSpacing: "0.01em",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                    whiteSpace: "nowrap",
                    padding: "6px 8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.background = "transparent";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = open ? "#ffffff" : "#cbd5e1";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span>Frameworks</span>
                  <ChevronDown
                    size={14}
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
                      background: "rgba(15, 23, 42, 0.95)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "12px",
                      boxShadow: "0 16px 36px rgba(0, 0, 0, 0.4)",
                      zIndex: 1000,
                      minWidth: "180px",
                      padding: "6px",
                    }}
                  >
                    {frameworkNavOptions.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setOpen(false);
                          router.push(opt.route);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 12px",
                          background: "transparent",
                          border: "none",
                          borderRadius: "6px",
                          color: "#e2e8f0",
                          fontSize: "13px",
                          fontWeight: "500",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "rgba(79, 70, 229, 0.15)";
                          e.target.style.color = "#818cf8";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.color = "#e2e8f0";
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PRICING BUTTON (Hidden only on Pricing page `/pricing`) */}
              {pathname !== "/pricing" && (
                <button
                  onClick={() => router.push("/pricing")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: pathname === "/pricing" ? "#ffffff" : "#cbd5e1",
                    fontSize: "13px",
                    fontWeight: pathname === "/pricing" ? "600" : "500",
                    letterSpacing: "0.01em",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                    padding: "6px 8px",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color =
                      pathname === "/pricing" ? "#ffffff" : "#cbd5e1";
                  }}
                >
                  Pricing
                </button>
              )}
            </>
          )}

          {/* VIBRANT LOGIN PILL BUTTON (Hidden only on Login page `/login`) */}
          {pathname !== "/login" && (
            <button
              onClick={() => router.push("/login")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: isMobile ? "6px 14px" : "8px 20px",
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                border: "none",
                borderRadius: "9999px",
                color: "#ffffff",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.45)",
                transition: "all 0.25s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #4338ca, #4f46e5)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(99, 102, 241, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #4f46e5, #6366f1)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(99, 102, 241, 0.45)";
              }}
            >
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}