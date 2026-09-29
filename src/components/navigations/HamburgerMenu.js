import Image from "next/image";
// import React, { useState, useEffect } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import {
//   Home,
//   FolderKanban,
//   FileText,
//   ClipboardCheck,
//   CheckSquare,
//   CloudDownload,
//   LogOut,
//   Menu,
//   X,
// } from "lucide-react";
// import UserProfile from "./UserProfile";
// import Maindashboard_profile from "../maindashboard_profile";

// /* ─────────────────────────────────────────────
//    Custom hooks
// ───────────────────────────────────────────── */
// const useMediaQuery = (query) => {
//   const [matches, setMatches] = useState(
//     () => typeof window !== "undefined" && window.matchMedia(query).matches,
//   );
//   useEffect(() => {
//     const media = window.matchMedia(query);
//     const listener = (e) => setMatches(e.matches);
//     media.addEventListener("change", listener);
//     return () => media.removeEventListener("change", listener);
//   }, [query]);
//   return matches;
// };

// /** Returns the fixed navbar height so page content can be offset correctly */
// export const useNavbarHeight = () => {
//   const isLg = useMediaQuery("(min-width: 1024px)");
//   return isLg ? 72 : 64;
// };

// /* ─────────────────────────────────────────────
//    Nav link definitions
// ───────────────────────────────────────────── */
// const NAV_ITEMS = [
//   { icon: Home, label: "Home", path: "/" },
//   { icon: FolderKanban, label: "Risk Management", path: "/risk-assessment/" },
//   { icon: FileText, label: "Documentation", path: "/documentation" },
//   { icon: ClipboardCheck, label: "Gap Assessment", path: "/gap-assessment" },
//   { icon: CheckSquare, label: "Task Management", path: "/task-management" },
//   { icon: CloudDownload, label: "Compliances", path: "/integrations" },
// ];

// /* ─────────────────────────────────────────────
//    Main component
// ───────────────────────────────────────────── */
// const HamburgerMenu = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const router = useRouter();
//   const pathname = usePathname();

//   const rawUser = sessionStorage.getItem("user");
//   const user = rawUser ? JSON.parse(rawUser) : null;

//   const isHomePage = pathname === "/";

//   const closeMenu = () => setIsOpen(false);
//   const toggleMenu = () => setIsOpen((prev) => !prev);

//   const handleNavigation = (path) => {
//     router.push(path);
//     closeMenu();
//   };

//   const handleLogout = () => {
//     sessionStorage.clear();
//     router.push("/login");
//     closeMenu();
//   };

//   /* Lock body scroll while drawer is open */
//   useEffect(() => {
//     document.body.style.overflow = isOpen ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isOpen]);

//   return (
//     <>
//       {/* ── Fixed Top Navbar ── */}
//       <header
//         className="
//           fixed top-0 left-0 right-0 z-[1000]
//           h-14 sm:h-16 md:h-16 lg:h-[72px]
//           bg-white/95 backdrop-blur-xl
//           shadow-[0_8px_32px_rgba(0,0,0,0.08)]
//           flex items-center justify-between
//           px-3 sm:px-5 md:px-8 lg:px-10
//         "
//       >
//         <div  className="flex items-center gap-3 sm:gap-4">
//           {/* Hamburger toggle — always visible */}
//           <button
//             onClick={toggleMenu}
//              aria-label={isOpen ? "Close menu" : "Open menu"}
//       className="relative z-[9999] flex items-center justify-center
//         w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
//         rounded-xl sm:rounded-[11px] md:rounded-[13px]
//         bg-gradient-to-br from-[#667eea] to-[#764ba2]
//         shadow-[0_6px_20px_rgba(102,126,234,0.35)]
//         text-white transition-all duration-300
//         hover:scale-105 active:scale-95"
//           >
//             {isOpen ? (
//               <X size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" />
//             ) : (
//               <Menu
//                 size={16}
//                 className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5"
//               />
//             )}
//           </button>

//           {/* Brand / Logo */}
//           <div
//             className="
//           flex items-center gap-2 sm:gap-3
//           px-2.5 sm:px-3.5 md:px-4 lg:px-[18px]
//           py-1.5 sm:py-2 md:py-2.5
//           rounded-xl sm:rounded-2xl
//           bg-white
//           shadow-sm
//         "
//           >
//             <Image
//               src="/favicon.png"
//               alt="CalVant Logo"
//               className="
//               w-7 h-7
//               sm:w-8 sm:h-8
//               md:w-9 md:h-9
//               lg:w-[42px] lg:h-[42px]
//               object-contain rounded-lg sm:rounded-[9px] bg-white p-1 sm:p-1.5
//             "
//             />
//             <span
//               className="
//             text-sm sm:text-base md:text-lg lg:text-xl
//             font-bold tracking-wide leading-none flex
//           "
//             >
//               <span className="text-gray-500">Cal</span>
//               <span className="text-[#1e6091] ml-0.5">Vant</span>
//             </span>
//           </div>
//         </div>
//         {/* User profile — top-right */}
//         {user && (
//           <div className="flex-shrink-0">
//             {isHomePage ? (
//               <Maindashboard_profile user={user} />
//             ) : (
//               <UserProfile user={user} handleLogout={handleLogout} />
//             )}
//           </div>
//         )}
//       </header>

//       {/* ── Backdrop ── */}
//       <div
//         onClick={closeMenu}
//         aria-hidden="true"
//         className={`
//           fixed inset-0 z-[998]
//           bg-black/50 backdrop-blur-[6px]
//           transition-opacity duration-300
//           ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
//         `}
//       />

//       {/* ── Slide-in Drawer ── */}
//       <nav
//         aria-label="Main navigation"
//         className={`
//           fixed top-0 left-0 z-[999]
//           h-full
//           w-[260px] xs:w-[280px] sm:w-[300px] md:w-[320px]
//           bg-white
//           shadow-[4px_0_24px_rgba(0,0,0,0.12)]
//           flex flex-col
//           overflow-y-auto overflow-x-hidden
//           transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
//           ${isOpen ? "translate-x-0" : "-translate-x-full"}
//         `}
//       >
//         {/* Drawer header */}
//         <div
//           className="
//           flex items-center justify-between
//           px-4 sm:px-5 md:px-6
//           py-3 sm:py-4
//           bg-[#007bff]
//           flex-shrink-0
//         "
//         >
//           <span
//             className="
//             text-white font-bold
//             text-base sm:text-lg md:text-xl
//             tracking-wide
//           "
//           >
//             CalVant
//           </span>
//           <button
//             onClick={closeMenu}
//             aria-label="Close navigation"
//             className="
//               text-white/90 hover:text-white
//               transition-colors duration-200
//               p-0.5 rounded
//               hover:bg-white/20
//             "
//           >
//             <X size={20} className="sm:w-6 sm:h-6" />
//           </button>
//         </div>

//         {/* Nav items */}
//         <div className="flex flex-col flex-1 pt-3 sm:pt-3 pb-3">
//           {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
//             <DrawerNavItem
//               key={path}
//               icon={
//                 <Icon
//                   size={16}
//                   className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 flex-shrink-0"
//                 />
//               }
//               label={label}
//               active={pathname === path}
//               onClick={() => handleNavigation(path)}
//             />
//           ))}
//         </div>

//         {/* User info + logout */}
//         {user && (
//           <div
//             className="
//             flex-shrink-0
//             px-3 sm:px-4 md:px-5
//             py-3 sm:py-4
//             border-t border-gray-100
//             bg-gray-50/60
//           "
//           >
//             <p
//               className="
//               text-[#007bff] font-semibold
//               text-xs sm:text-sm md:text-[15px]
//               leading-snug mb-2 sm:mb-3
//               truncate
//             "
//             >
//               {user.name},{" "}
//               <span className="font-normal text-gray-500">
//                 {user.department?.name ?? user.role}
//               </span>
//             </p>
//             <button
//               onClick={handleLogout}
//               className="
//                 flex items-center gap-1.5 sm:gap-2
//                 px-3 sm:px-4 md:px-5
//                 py-1.5 sm:py-2
//                 text-xs sm:text-sm font-semibold
//                 text-white bg-[#e74c3c]
//                 rounded-full
//                 shadow-[0_3px_10px_rgba(231,76,60,0.35)]
//                 transition-all duration-200
//                 hover:bg-[#c0392b] hover:shadow-[0_4px_14px_rgba(192,57,43,0.45)]
//                 active:scale-95
//               "
//             >
//               <LogOut size={14} className="sm:w-4 sm:h-4" />
//               Logout
//             </button>
//           </div>
//         )}
//       </nav>
//     </>
//   );
// };

// /* ─────────────────────────────────────────────
//    Drawer nav item
// ───────────────────────────────────────────── */
// const DrawerNavItem = ({ icon, label, active, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`
//       w-full text-left
//       flex items-center gap-2.5 sm:gap-3 md:gap-4
//       px-4 sm:px-5 md:px-6
//       py-3 sm:py-3.5 md:py-4
//       border-b border-gray-100
//       text-sm sm:text-[20px] md:text-base font-medium
//       transition-all duration-200
//       group
//       ${
//         active
//           ? "bg-blue-50 text-[#007bff] border-l-[3px] border-l-[#007bff]"
//           : "text-gray-700 hover:bg-gray-50 hover:text-[#007bff]"
//       }
//     `}
//   >
//     <span
//       className={`
//       transition-colors duration-200
//       ${active ? "text-[#007bff]" : "text-gray-400 group-hover:text-[#667eea]"}
//     `}
//     >
//       {icon}
//     </span>
//     <span className="truncate">{label}</span>
//   </button>
// );

// /* ─────────────────────────────────────────────
//    Horizontal nav item (desktop expansion)
// ───────────────────────────────────────────── */
// export const HorizontalNavItem = ({ icon, label, onClick }) => {
//   const [hovered, setHovered] = useState(false);

//   return (
//     <button
//       onClick={onClick}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       className={`
//         flex items-center gap-2
//         px-3 md:px-4 lg:px-[18px]
//         py-2.5 md:py-3
//         rounded-xl md:rounded-[14px]
//         cursor-pointer whitespace-nowrap
//         transition-all duration-300
//         text-sm md:text-[15px] font-semibold
//         ${
//           hovered
//             ? "bg-[rgba(102,126,234,0.12)] shadow-[0_10px_30px_rgba(102,126,234,0.2)] -translate-y-0.5"
//             : "bg-transparent"
//         }
//       `}
//     >
//       <span
//         className={`
//         text-[#667eea] flex items-center
//         transition-transform duration-300
//         ${hovered ? "scale-110" : "scale-100"}
//       `}
//       >
//         {icon}
//       </span>
//       <span
//         className={`
//         overflow-hidden transition-all duration-300
//         text-slate-700
//         ${hovered ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"}
//       `}
//       >
//         {label}
//       </span>
//     </button>
//   );
// };

// /* ─────────────────────────────────────────────
//    Mobile MenuItem (kept for backward compat)
// ───────────────────────────────────────────── */
// export const MenuItem = ({ icon, label, onClick }) => (
//   <button
//     onClick={onClick}
//     className="
//       w-full text-left
//       flex items-center
//       px-4 sm:px-5 py-3.5 sm:py-4
//       mb-1.5 sm:mb-2
//       bg-white/70 rounded-xl sm:rounded-2xl
//       border border-transparent
//       text-[#1e293b] font-medium
//       text-sm sm:text-[15px]
//       transition-all duration-300
//       hover:bg-[rgba(102,126,234,0.1)]
//       hover:translate-x-2
//       hover:border-[rgba(102,126,234,0.3)]
//       hover:shadow-[0_4px_20px_rgba(102,126,234,0.15)]
//       group
//     "
//   >
//     <span className="mr-3 sm:mr-4 text-[#667eea] min-w-[18px] sm:min-w-[20px] flex items-center">
//       {icon}
//     </span>
//     {label}
//   </button>
// );

// export default HamburgerMenu;

